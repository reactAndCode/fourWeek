import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// lazy initialization inside handler

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

    // Resend API Key 및 발신자 이메일 확인 1111
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY가 설정되지 않았습니다.")
      return NextResponse.json(
        { error: "이메일 서비스 설정이 필요합니다." },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Weekly Log <onboarding@resend.dev>"
    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn("RESEND_FROM_EMAIL이 설정되지 않아 기본값을 사용합니다. 도메인을 인증하면 누구에게나 이메일을 보낼 수 있습니다.")
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const fortuneData = fortune as FortuneResult

    // HTML 이메일 템플릿 생성
    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}님의 신년운세</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f59e0b;
    }
    .header h1 {
      color: #92400e;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    .header p {
      color: #d97706;
      font-size: 16px;
      margin: 0;
    }
    .fortune-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .fortune-section h2 {
      color: #92400e;
      font-size: 20px;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .fortune-section p {
      color: #374151;
      margin: 0;
      line-height: 1.7;
    }
    .lucky-info {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .lucky-item {
      flex: 1;
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .lucky-item .label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .lucky-item .value {
      font-size: 24px;
      font-weight: bold;
      color: #92400e;
    }
    .advice {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .advice h3 {
      color: #1e40af;
      font-size: 16px;
      margin: 0 0 10px 0;
    }
    .advice p {
      color: #1e3a8a;
      margin: 0;
      line-height: 1.7;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f59e0b;
      color: #92400e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ ${name}님의 ${fortuneData.year} 운세 ✨</h1>
      <p>특별한 한 해가 될 것입니다</p>
    </div>

    <div class="fortune-section">
      <h2>🌟 종합운</h2>
      <p>${fortuneData.overall}</p>
    </div>

    <div class="fortune-section">
      <h2>💕 애정운</h2>
      <p>${fortuneData.love}</p>
    </div>

    <div class="fortune-section">
      <h2>💼 직업운</h2>
      <p>${fortuneData.career}</p>
    </div>

    <div class="fortune-section">
      <h2>💰 재물운</h2>
      <p>${fortuneData.wealth}</p>
    </div>

    <div class="fortune-section">
      <h2>🏥 건강운</h2>
      <p>${fortuneData.health}</p>
    </div>

    <div class="lucky-info">
      <div class="lucky-item">
        <div class="label">행운의 색</div>
        <div class="value">${fortuneData.luckyColor}</div>
      </div>
      <div class="lucky-item">
        <div class="label">행운의 숫자</div>
        <div class="value">${fortuneData.luckyNumber}</div>
      </div>
    </div>

    <div class="advice">
      <h3>💡 한마디 조언</h3>
      <p>${fortuneData.advice}</p>
    </div>

    <div class="footer">
      <p>Weekly Log에서 보내드립니다</p>
      <p>© 2026 Weekly Log. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    // Resend를 사용하여 이메일 전송
    console.log("이메일 전송 시도:", { email, name, from: fromEmail })

    const data = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `✨ ${name}님의 ${fortuneData.year} 신년운세`,
      html: htmlContent,
    })

    console.log("Resend 응답:", data)

    if (data.error) {
      console.error("Resend 에러:", data.error)
      return NextResponse.json(
        { error: `이메일 전송 실패: ${data.error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.data?.id,
      message: "이메일이 성공적으로 전송되었습니다."
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
