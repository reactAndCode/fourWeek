import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { documentText, question, chatHistory } = await request.json()

    if (!documentText || !documentText.trim()) {
      return NextResponse.json(
        { error: "문서 텍스트가 제공되지 않았습니다." },
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
      return NextResponse.json({
        answer: "OpenAI API 키가 설정되지 않아 AI 답변 기능을 사용할 수 없습니다.\n\n.env.local 파일에 OPENAI_API_KEY를 추가하고 서버를 재시작해주세요.\n\n문서 내용에서 키워드 검색 기능은 추후 추가 예정입니다.",
      })
    }

    const openai = new OpenAI({ apiKey })

    // 문서가 너무 길면 앞부분만 사용 (약 3000자)
    const truncatedDoc = documentText.length > 3000
      ? documentText.substring(0, 3000) + "..."
      : documentText

    // 대화 히스토리를 OpenAI 형식으로 변환
    const messages: any[] = [
      {
        role: "system",
        content: `당신은 문서 내용에 대해 질문에 답변하는 AI 어시스턴트입니다.
다음은 사용자가 업로드한 문서 내용입니다:

${truncatedDoc}

위 문서 내용을 바탕으로 사용자의 질문에 정확하고 자세하게 답변해주세요.
문서에 없는 내용은 "문서에서 해당 정보를 찾을 수 없습니다"라고 답변해주세요.`,
      },
    ]

    // 이전 대화 히스토리 추가 (최근 5개만)
    if (chatHistory && Array.isArray(chatHistory)) {
      const recentHistory = chatHistory.slice(-5)
      messages.push(...recentHistory.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })))
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
    console.log("📊 [채팅 Q&A] 토큰 사용량:", {
      입력_토큰: completion.usage?.prompt_tokens || 0,
      출력_토큰: completion.usage?.completion_tokens || 0,
      총_토큰: completion.usage?.total_tokens || 0,
      문서_길이: documentText.length,
      처리_문서_길이: truncatedDoc.length,
      질문_길이: question.length,
      대화_기록: chatHistory?.length || 0,
      모델: "gpt-3.5-turbo",
    })

    const estimatedCost = (
      (completion.usage?.prompt_tokens || 0) * 0.50 / 1000000 +
      (completion.usage?.completion_tokens || 0) * 1.50 / 1000000
    ).toFixed(6)

    console.log(`💵 예상 비용: $${estimatedCost}`)

    return NextResponse.json({
      answer,
    })
  } catch (error: any) {
    console.error("OpenAI Chat API error:", error)

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
      { error: "답변 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
