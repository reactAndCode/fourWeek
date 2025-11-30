import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

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
      // API 키가 없으면 간단한 요약 제공
      const wordCount = text.length
      const preview = text.substring(0, 200) + (text.length > 200 ? "..." : "")

      return NextResponse.json({
        summary: `문서 내용 미리보기: ${preview}\n\n(OpenAI API 키가 설정되지 않아 AI 요약을 사용할 수 없습니다)`,
        keyPoints: [
          "OpenAI API 키를 .env.local에 설정하면 AI 요약 기능을 사용할 수 있습니다",
          "현재는 문서 업로드와 질문 기능만 제한적으로 사용 가능합니다",
        ],
        wordCount,
      })
    }

    const openai = new OpenAI({ apiKey })

    // 텍스트가 너무 길면 앞부분만 사용 (약 4000자)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text

    // OpenAI API 호출 - 문서 요약
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "당신은 문서를 분석하고 요약하는 AI 어시스턴트입니다. 문서의 핵심 내용을 간결하게 요약하고, 주요 포인트를 추출해주세요.",
        },
        {
          role: "user",
          content: `다음 문서를 요약하고 주요 내용을 추출해주세요:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const summaryContent = completion.choices[0]?.message?.content || ""

    // 사용량 로깅
    console.log("📊 [문서 요약] 토큰 사용량:", {
      입력_토큰: completion.usage?.prompt_tokens || 0,
      출력_토큰: completion.usage?.completion_tokens || 0,
      총_토큰: completion.usage?.total_tokens || 0,
      원본_문자수: text.length,
      처리_문자수: truncatedText.length,
      모델: "gpt-3.5-turbo",
    })

    // 주요 포인트 추출
    const keyPointsCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "문서의 주요 포인트를 3-5개의 간결한 문장으로 추출해주세요. 각 포인트는 한 줄로 작성하고, 번호나 불릿 없이 텍스트만 작성해주세요.",
        },
        {
          role: "user",
          content: `다음 문서의 주요 포인트를 추출해주세요:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    const keyPointsContent = keyPointsCompletion.choices[0]?.message?.content || ""
    const keyPoints = keyPointsContent
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^[0-9]+\.\s*/, "").replace(/^[-•]\s*/, "").trim())
      .slice(0, 5)

    // 주요 포인트 추출 사용량 로깅
    console.log("📊 [주요 포인트] 토큰 사용량:", {
      입력_토큰: keyPointsCompletion.usage?.prompt_tokens || 0,
      출력_토큰: keyPointsCompletion.usage?.completion_tokens || 0,
      총_토큰: keyPointsCompletion.usage?.total_tokens || 0,
      모델: "gpt-3.5-turbo",
    })

    // 전체 사용량 계산
    const totalUsage = {
      총_입력_토큰: (completion.usage?.prompt_tokens || 0) + (keyPointsCompletion.usage?.prompt_tokens || 0),
      총_출력_토큰: (completion.usage?.completion_tokens || 0) + (keyPointsCompletion.usage?.completion_tokens || 0),
      총_토큰: (completion.usage?.total_tokens || 0) + (keyPointsCompletion.usage?.total_tokens || 0),
    }

    console.log("💰 [총 사용량]", totalUsage)
    console.log(`💵 예상 비용: $${(totalUsage.총_입력_토큰 * 0.50 / 1000000 + totalUsage.총_출력_토큰 * 1.50 / 1000000).toFixed(6)}`)

    return NextResponse.json({
      summary: summaryContent,
      keyPoints,
      wordCount: text.length,
    })
  } catch (error: any) {
    console.error("OpenAI API error:", error)

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
      { error: "문서 요약 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
