import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, birthDate, birthTime } = await request.json()

    if (!name || !birthDate || !birthTime) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      )
    }

    // OpenAI API Key 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY가 설정되지 않았습니다.")
      return NextResponse.json(
        { error: "OpenAI API 설정이 필요합니다." },
        { status: 500 }
      )
    }

    const birthYear = new Date(birthDate).getFullYear()
    const birthMonth = new Date(birthDate).getMonth() + 1
    const birthDay = new Date(birthDate).getDate()
    const currentYear = new Date().getFullYear()

    // 간지 계산
    const cheongan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
    const jiji = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
    const jijiAnimals = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]
    const colors = ["푸른", "푸른", "붉은", "붉은", "노란", "노란", "흰", "흰", "검은", "검은"]

    const cheonganIndex = (currentYear - 4) % 10
    const jijiIndex = (currentYear - 4) % 12
    const ganjiName = cheongan[cheonganIndex] + jiji[jijiIndex]
    const animal = jijiAnimals[jijiIndex]
    const color = colors[cheonganIndex]
    const fullName = `${ganjiName}년 ${color} ${animal}의 해`

    const prompt = `당신은 50년 경력의 전문 역술인입니다. 다음 정보를 바탕으로 ${currentYear}년 ${fullName}의 상세한 신년운세를 작성해주세요.

**개인 정보:**
- 이름: ${name}
- 생년월일: ${birthDate} (${birthYear}년 ${birthMonth}월 ${birthDay}일)
- 태어난 시각: ${birthTime}

**작성 형식:**
다음 JSON 형식으로 작성해주세요:

{
  "saju": "사주팔자 분석 (생년월일시 기반 천간지지, 음양오행 설명, 200-300자)",
  "오행분석": "오행(목화토금수) 상생상극 분석과 ${currentYear}년 운세에 미치는 영향 (200-300자)",
  "월별운세": [
    {"month": "1-2월", "content": "상세 운세 및 조언 (100-150자)"},
    {"month": "3-4월", "content": "상세 운세 및 조언 (100-150자)"},
    {"month": "5-6월", "content": "상세 운세 및 조언 (100-150자)"},
    {"month": "7-8월", "content": "상세 운세 및 조언 (100-150자)"},
    {"month": "9-10월", "content": "상세 운세 및 조언 (100-150자)"},
    {"month": "11-12월", "content": "상세 운세 및 조언 (100-150자)"}
  ],
  "특별조언": "${currentYear}년 한 해 동안 특히 주의하고 실천해야 할 구체적인 조언 (200-300자)"
}

**참고사항:**
- 전문적이면서도 따뜻하고 격려하는 어조로 작성
- 구체적이고 실용적인 조언 포함
- 긍정적이면서도 현실적인 내용
- 한국 전통 명리학 기반
- 반드시 유효한 JSON 형식으로만 응답 (다른 텍스트 포함 금지)`

    console.log("OpenAI API 호출 시작...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 50년 경력의 전문 역술인이며, 한국 전통 명리학과 사주팔자에 정통한 전문가입니다. 항상 JSON 형식으로만 응답합니다."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API 에러:", errorData)
      return NextResponse.json(
        { error: `OpenAI API 호출 실패: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("OpenAI API 응답 수신 완료")

    let content = data.choices[0].message.content

    // 마크다운 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
    content = content.trim()
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/```\s*$/, "")
    }
    content = content.trim()

    // JSON 파싱
    try {
      const detailedFortune = JSON.parse(content)
      return NextResponse.json({
        success: true,
        fortune: detailedFortune
      })
    } catch (parseError) {
      console.error("JSON 파싱 에러:", parseError)
      console.log("정리된 응답:", content)
      return NextResponse.json(
        { error: "운세 데이터 파싱 실패" },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error("상세 운세 생성 오류:", error)
    return NextResponse.json(
      { error: `상세 운세 생성 실패: ${error.message}` },
      { status: 500 }
    )
  }
}
