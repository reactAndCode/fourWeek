import { NextRequest, NextResponse } from "next/server"
import { OpenAIEmbeddings } from "@langchain/openai"
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
import OpenAI from "openai"
import path from "path"
import os from "os"
import fs from "fs/promises"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { documentId, question, chatHistory } = await request.json()

    if (!documentId || !documentId.trim()) {
      return NextResponse.json(
        { error: "문서 ID가 제공되지 않았습니다." },
        { status: 400 }
      )
    }

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "질문이 제공되지 않았습니다." },
        { status: 400 }
      )
    }

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      )
    }

    console.log("🔍 [벡터 쿼리] 검색 시작:", {
      documentId,
      질문_길이: question.length,
    })

    // 1. 벡터 스토어 로드
    const tempDir = os.tmpdir()
    const vectorDir = path.join(tempDir, "vector-stores")
    const indexPath = path.join(vectorDir, `${documentId}.json`)

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small",
    })

    let vectorStore
    try {
      // JSON 파일에서 벡터 스토어 데이터 로드
      const fileContent = await fs.readFile(indexPath, "utf-8")
      const vectorStoreData = JSON.parse(fileContent)

      // MemoryVectorStore 재구성
      vectorStore = new MemoryVectorStore(embeddings)
      vectorStore.memoryVectors = vectorStoreData.memoryVectors

      console.log("✅ [인덱스 로드] 성공:", { indexPath, 벡터_수: vectorStoreData.memoryVectors.length })
    } catch (error) {
      console.error("❌ [인덱스 로드] 실패:", error)
      return NextResponse.json(
        { error: "문서 인덱스를 찾을 수 없습니다. 문서를 다시 업로드해주세요." },
        { status: 404 }
      )
    }

    // 2. 질문과 유사한 청크 검색 (상위 4개)
    const similarDocs = await vectorStore.similaritySearch(question, 4)

    console.log("📊 [유사도 검색] 완료:", {
      검색된_청크_수: similarDocs.length,
      청크_길이들: similarDocs.map((doc) => doc.pageContent.length),
    })

    // 3. 검색된 청크를 컨텍스트로 결합
    const context = similarDocs.map((doc, idx) => `[청크 ${idx + 1}]\n${doc.pageContent}`).join("\n\n")

    console.log("📝 [컨텍스트 구성] 완료:", {
      총_컨텍스트_길이: context.length,
    })

    // 4. OpenAI로 답변 생성
    const openai = new OpenAI({ apiKey })

    const messages: any[] = [
      {
        role: "system",
        content: `당신은 문서 내용에 대해 질문에 답변하는 AI 어시스턴트입니다.
다음은 사용자의 질문과 관련된 문서의 일부입니다:

${context}

위 문서 내용을 바탕으로 사용자의 질문에 정확하고 자세하게 답변해주세요.
문서에 없는 내용은 "제공된 문서에서 해당 정보를 찾을 수 없습니다"라고 답변해주세요.
답변 시 어느 청크에서 정보를 찾았는지 언급하면 더 좋습니다.`,
      },
    ]

    // 이전 대화 히스토리 추가 (최근 3개만)
    if (chatHistory && Array.isArray(chatHistory)) {
      const recentHistory = chatHistory.slice(-3)
      messages.push(
        ...recentHistory.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        }))
      )
    }

    // 현재 질문 추가
    messages.push({
      role: "user",
      content: question,
    })

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const answer = completion.choices[0]?.message?.content || "답변을 생성할 수 없습니다."

    // 사용량 로깅
    console.log("📊 [FAISS Q&A] 토큰 사용량:", {
      입력_토큰: completion.usage?.prompt_tokens || 0,
      출력_토큰: completion.usage?.completion_tokens || 0,
      총_토큰: completion.usage?.total_tokens || 0,
      컨텍스트_길이: context.length,
      질문_길이: question.length,
      대화_기록: chatHistory?.length || 0,
      모델: "gpt-3.5-turbo",
    })

    const estimatedCost =
      ((completion.usage?.prompt_tokens || 0) * 0.5) / 1000000 +
      ((completion.usage?.completion_tokens || 0) * 1.5) / 1000000

    console.log(`💵 예상 비용: $${estimatedCost.toFixed(6)}`)

    // 임베딩 비용도 추가 (질문 임베딩)
    const queryEmbeddingCost = (Math.ceil(question.length / 4) * 0.02) / 1000000
    console.log(`💵 질문 임베딩 비용: $${queryEmbeddingCost.toFixed(6)}`)
    console.log(`💰 총 비용: $${(estimatedCost + queryEmbeddingCost).toFixed(6)}`)

    return NextResponse.json({
      answer,
      retrievedChunks: similarDocs.length,
    })
  } catch (error: any) {
    console.error("FAISS query error:", error)

    // OpenAI API 에러 처리
    if (error.status === 401) {
      return NextResponse.json(
        { error: "OpenAI API 키가 유효하지 않습니다." },
        { status: 500 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "OpenAI API 요청 한도를 초과했습니다." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `답변 생성 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    )
  }
}
