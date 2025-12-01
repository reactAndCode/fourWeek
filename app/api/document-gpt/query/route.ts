import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

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
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      )
    }

    // Supabase 클라이언트 설정
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const openai = new OpenAI({ apiKey: openaiKey })

    console.log("🔍 [벡터 쿼리] 검색 시작:", {
      documentId,
      질문_길이: question.length,
    })

    // 1. 질문을 임베딩으로 변환
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: question,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding
    const queryTokens = embeddingResponse.usage.total_tokens

    console.log("🔢 [질문 임베딩] 완료:", {
      임베딩_차원: queryEmbedding.length,
      사용_토큰: queryTokens,
    })

    // 2. Supabase에서 유사한 청크 검색 (RPC 함수 호출)
    const { data: similarChunks, error: searchError } = await supabase.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        filter_document_id: documentId,
        match_threshold: 0.7, // 유사도 임계값 (0.7 이상만)
        match_count: 4, // 상위 4개 청크
      }
    )

    if (searchError) {
      console.error("❌ [유사도 검색] 실패:", searchError)
      return NextResponse.json(
        { error: `유사도 검색에 실패했습니다: ${searchError.message}` },
        { status: 500 }
      )
    }

    if (!similarChunks || similarChunks.length === 0) {
      console.warn("⚠️ [유사도 검색] 관련 청크를 찾지 못했습니다.")
      return NextResponse.json({
        answer: "질문과 관련된 내용을 문서에서 찾지 못했습니다. 다른 방식으로 질문해보세요.",
        retrievedChunks: 0,
      })
    }

    console.log("📊 [유사도 검색] 완료:", {
      검색된_청크_수: similarChunks.length,
      유사도_점수: similarChunks.map((c: any) => c.similarity.toFixed(4)),
    })

    // 3. 검색된 청크를 컨텍스트로 결합
    const context = similarChunks
      .map((chunk: any, idx: number) => {
        return `[청크 ${idx + 1}] (유사도: ${(chunk.similarity * 100).toFixed(1)}%)\n${chunk.content}`
      })
      .join("\n\n")

    console.log("📝 [컨텍스트 구성] 완료:", {
      총_컨텍스트_길이: context.length,
    })

    // 4. OpenAI로 답변 생성
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
    console.log("📊 [벡터 Q&A] 토큰 사용량:", {
      질문_임베딩_토큰: queryTokens,
      답변_입력_토큰: completion.usage?.prompt_tokens || 0,
      답변_출력_토큰: completion.usage?.completion_tokens || 0,
      답변_총_토큰: completion.usage?.total_tokens || 0,
      컨텍스트_길이: context.length,
      질문_길이: question.length,
      대화_기록: chatHistory?.length || 0,
      모델: "gpt-3.5-turbo",
    })

    // 비용 계산
    const queryEmbeddingCost = (queryTokens * 0.10) / 1000000 // 질문 임베딩 비용
    const chatCost =
      ((completion.usage?.prompt_tokens || 0) * 0.50) / 1000000 +
      ((completion.usage?.completion_tokens || 0) * 1.50) / 1000000

    const totalCost = queryEmbeddingCost + chatCost

    console.log("💵 비용 상세:", {
      질문_임베딩: `$${queryEmbeddingCost.toFixed(6)}`,
      GPT_답변: `$${chatCost.toFixed(6)}`,
      총_비용: `$${totalCost.toFixed(6)}`,
    })

    return NextResponse.json({
      answer,
      retrievedChunks: similarChunks.length,
    })
  } catch (error: any) {
    console.error("❌ [벡터 쿼리 오류]", error)

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
