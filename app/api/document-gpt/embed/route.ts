import { NextRequest, NextResponse } from "next/server"
import { OpenAIEmbeddings } from "@langchain/openai"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory"
import { randomUUID } from "crypto"
import path from "path"
import fs from "fs/promises"
import os from "os"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "문서 텍스트가 제공되지 않았습니다." },
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

    // 문서 ID 생성
    const documentId = randomUUID()

    console.log("📄 [벡터 임베딩] 문서 처리 시작:", {
      documentId,
      원본_길이: text.length,
    })

    // 1. 텍스트 분할 (청크로 나누기)
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // 청크 크기
      chunkOverlap: 200, // 청크 간 겹침
    })

    const docs = await textSplitter.createDocuments([text])

    console.log("✂️ [텍스트 분할] 완료:", {
      총_청크_수: docs.length,
      평균_청크_길이: Math.round(text.length / docs.length),
    })

    // 2. OpenAI 임베딩 생성
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small", // 비용 효율적인 모델
    })

    // 3. 메모리 벡터 스토어 생성
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

    console.log("🔢 [임베딩 생성] 완료:", {
      벡터_차원: 1536, // text-embedding-3-small의 차원
      총_벡터_수: docs.length,
    })

    // 4. 벡터 스토어를 JSON으로 직렬화하여 파일 시스템에 저장
    const tempDir = os.tmpdir()
    const vectorDir = path.join(tempDir, "vector-stores")

    // 디렉토리가 없으면 생성
    try {
      await fs.mkdir(vectorDir, { recursive: true })
    } catch (error) {
      console.error("디렉토리 생성 실패:", error)
    }

    const indexPath = path.join(vectorDir, `${documentId}.json`)

    // 벡터 스토어 데이터를 JSON으로 저장
    const vectorStoreData = {
      memoryVectors: vectorStore.memoryVectors,
      _vectorstoreType: "memory"
    }
    await fs.writeFile(indexPath, JSON.stringify(vectorStoreData), "utf-8")

    console.log("💾 [인덱스 저장] 완료:", {
      저장_경로: indexPath,
    })

    // 임베딩 비용 계산 (대략적)
    const estimatedTokens = Math.ceil(text.length / 4) // 대략 4자 = 1토큰
    const estimatedCost = (estimatedTokens * 0.02) / 1000000 // text-embedding-3-small: $0.02 / 1M tokens

    console.log("💰 [임베딩 비용] 예상:", {
      예상_토큰: estimatedTokens,
      예상_비용: `$${estimatedCost.toFixed(6)}`,
      모델: "text-embedding-3-small",
    })

    return NextResponse.json({
      success: true,
      documentId,
      chunksCount: docs.length,
      indexPath,
    })
  } catch (error: any) {
    console.error("FAISS embedding error:", error)

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
      { error: `임베딩 생성 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    )
  }
}
