import { NextRequest, NextResponse } from "next/server"

interface FortuneResult {
  year: string
  overall: string
  love: string
  career: string
  wealth: string
  health: string
  luckyColor: string
  luckyNumber: string
  advice: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, fortune } = await request.json()

    if (!email || !name || !fortune) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      )
    }

    const fortuneData = fortune as FortuneResult

    // 이메일 전송 기능 비활성화됨
    console.log("이메일 전송 기능이 비활성화되었습니다. (요청자: ${name})")

    return NextResponse.json({
      success: true,
      message: "운세 결과가 정상적으로 처리되었습니다. (이메일 발송은 제외되었습니다.)"
    })

  } catch (error: any) {
    console.error("이메일 전송 오류:", error)
    console.error("에러 상세:", error.message, error.stack)
    return NextResponse.json(
      { error: `이메일 전송에 실패했습니다: ${error.message}` },
      { status: 500 }
    )
  }
}
