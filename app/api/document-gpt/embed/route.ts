import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { splitTextIntoChunks } from "@/lib/utils/text-splitter"

export async function POST(request: NextRequest) {
  try {
    // Windows 개발 환경에서 SSL 인증서 문제 임시 해결
    // 주의: 프로덕션에서는 제거해야 함
    if (process.env.NODE_ENV === "development") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    }

    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "문서 텍스트가 제공되지 않았습니다." },
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

    // 1. 텍스트를 청크로 분할
    const chunks = splitTextIntoChunks(text, 500, 50)
    console.log(`📄 [임베딩 생성] 총 ${chunks.length}개 청크로 분할 완료`)

    // 2. 각 청크에 대해 임베딩 생성
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`
    let totalTokens = 0
    const embeddingPromises = chunks.map(async (chunk, index) => {
      try {
        // OpenAI 임베딩 생성
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
        })

        const embedding = embeddingResponse.data[0].embedding
        totalTokens += embeddingResponse.usage.total_tokens

        // Supabase에 저장
        const { error } = await supabase.from("document_embeddings").insert({
          document_id: documentId,
          chunk_index: index,
          content: chunk,
          embedding: embedding,
        })

        if (error) {
          console.error(`❌ 청크 ${index} 저장 실패:`, error)
          throw error
        }

        console.log(`✅ 청크 ${index + 1}/${chunks.length} 임베딩 생성 및 저장 완료`)
        return { success: true, index }
      } catch (error) {
        console.error(`❌ 청크 ${index} 처리 실패:`, error)
        return { success: false, index, error }
      }
    })

    // 모든 임베딩 생성 대기
    const results = await Promise.all(embeddingPromises)
    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    console.log(`📊 [임베딩 생성 완료]`, {
      총_청크: chunks.length,
      성공: successCount,
      실패: failCount,
      총_토큰: totalTokens,
      문서ID: documentId,
    })

    // 비용 계산 (text-embedding-ada-002: $0.10 per 1M tokens)
    const estimatedCost = (totalTokens * 0.10) / 1000000
    console.log(`💵 예상 비용: $${estimatedCost.toFixed(6)}`)

    if (failCount > 0) {
      return NextResponse.json(
        {
          warning: `${failCount}개 청크 처리 실패`,
          documentId,
          totalChunks: chunks.length,
          successCount,
          failCount,
        },
        { status: 207 } // Multi-Status
      )
    }

    return NextResponse.json({
      message: "임베딩 생성 및 저장 완료",
      documentId,
      totalChunks: chunks.length,
      totalTokens,
      estimatedCost: `$${estimatedCost.toFixed(6)}`,
    })
  } catch (error: any) {
    console.error("❌ [임베딩 생성 오류]", error)

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
      { error: "임베딩 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
