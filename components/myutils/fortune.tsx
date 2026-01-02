"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Send, Mail, Sun } from "lucide-react"

interface FortuneData {
  name: string
  birthDate: string
  birthTime: string
  email: string
}

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

interface DailyFortune {
  date: string
  overall: string
  lucky: string
  caution: string
  luckyTime: string
  luckyItem: string
  advice: string
}

interface DetailedFortune {
  saju: string // 사주팔자
  오행분석: string
  월별운세: {
    month: string
    content: string
  }[]
  특별조언: string
}

export function Fortune() {
  const [formData, setFormData] = useState<FortuneData>({
    name: "윤상민",
    birthDate: "1974-08-03",
    birthTime: "13:30",
    email: "yoon.lion@gmail.com",
  })
  const [fortune, setFortune] = useState<FortuneResult | null>(null)
  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null)
  const [detailedFortune, setDetailedFortune] = useState<DetailedFortune | null>(null)
  const [loading, setLoading] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [detailedLoading, setDetailedLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const generateFortune = async () => {
    if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.email) {
      alert("모든 정보를 입력해주세요.")
      return
    }

    setLoading(true)

    // 운세 생성 (실제로는 AI API를 호출하거나 더 복잡한 로직을 사용할 수 있습니다)
    const year = new Date().getFullYear()
    const birthYear = new Date(formData.birthDate).getFullYear()
    const age = year - birthYear + 1
    const zodiac = getZodiac(birthYear)
    const birthHour = parseInt(formData.birthTime.split(":")[0])
    const currentYearInfo = getGanjiYear(year)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fortuneResult: FortuneResult = {
      year: `${year}년 (${currentYearInfo.fullName})`,
      overall: `${formData.name}님은 ${zodiac} 띠로, ${year}년에는 특별한 변화와 성장의 해가 될 것입니다. ${currentYearInfo.animal}의 기운이 강한 올해는 새로운 도전과 기회가 많이 찾아올 것이며, 과감한 결단이 좋은 결과를 가져올 것입니다.`,
      love: birthHour < 12
        ? "상반기에 좋은 인연을 만날 수 있습니다. 기존 관계는 더욱 깊어지고, 새로운 만남도 기대해볼 만합니다. 진솔한 대화가 관계를 발전시키는 열쇠가 될 것입니다."
        : "하반기에 특별한 인연이 찾아올 수 있습니다. 친구의 소개나 우연한 만남이 좋은 결과로 이어질 수 있으니 열린 마음으로 사람들을 만나보세요.",
      career: age % 3 === 0
        ? "올해는 커리어에 있어 중요한 전환점이 될 것입니다. 새로운 프로젝트나 직책 변화의 기회가 있을 수 있으며, 도전을 두려워하지 마세요. 상반기에 준비하고 하반기에 결실을 맺을 것입니다."
        : "안정적인 성장이 기대됩니다. 기존 업무에서 뛰어난 성과를 내며 인정받을 수 있습니다. 새로운 기술이나 지식을 습득하는 것이 미래를 위한 좋은 투자가 될 것입니다.",
      wealth: age % 2 === 0
        ? "금전운이 좋은 해입니다. 예상치 못한 수입이 있을 수 있으며, 투자에 신중하게 접근한다면 좋은 결과를 얻을 수 있습니다. 다만 충동구매는 자제하는 것이 좋습니다."
        : "안정적인 재물운을 보입니다. 꾸준한 저축과 계획적인 지출이 중요합니다. 하반기에 새로운 수입원이 생길 수 있으니 기회를 놓치지 마세요.",
      health: birthHour >= 6 && birthHour <= 18
        ? "전반적으로 건강한 한 해입니다. 규칙적인 운동과 충분한 휴식으로 건강을 유지하세요. 스트레스 관리에 신경 쓰면 더욱 활기찬 한 해를 보낼 수 있습니다."
        : "충분한 수면과 휴식이 중요합니다. 과로를 피하고 균형 잡힌 식사를 하세요. 요가나 명상 같은 마음의 안정을 찾는 활동이 도움이 될 것입니다.",
      luckyColor: ["빨강", "금색", "파랑", "초록", "보라"][Math.floor(Math.random() * 5)],
      luckyNumber: String(Math.floor(Math.random() * 90) + 10),
      advice: `${year}년은 ${currentYearInfo.animal}의 해답게 당당하고 자신감 있게 행동하세요. 작은 실패를 두려워하지 말고, 끊임없이 도전하며 성장하는 한 해가 되길 바랍니다. 주변 사람들과의 관계를 소중히 하고, 감사하는 마음을 잊지 마세요.`,
    }

    setFortune(fortuneResult)
    setLoading(false)
  }

  const sendEmail = async () => {
    if (!fortune) return

    setSending(true)

    try {
      const response = await fetch("/api/send-fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          fortune,
        }),
      })

      if (!response.ok) {
        throw new Error("이메일 전송 실패")
      }

      alert("운세가 이메일로 전송되었습니다!")
    } catch (error) {
      console.error("이메일 전송 오류:", error)
      alert("이메일 전송에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setSending(false)
    }
  }

  const generateDailyFortune = async () => {
    if (!formData.name || !formData.birthDate || !formData.birthTime) {
      alert("이름, 생년월일, 태어난 시각을 입력해주세요.")
      return
    }

    setDailyLoading(true)

    const today = new Date()
    const birthYear = new Date(formData.birthDate).getFullYear()
    const birthMonth = new Date(formData.birthDate).getMonth() + 1
    const birthDay = new Date(formData.birthDate).getDate()
    const birthHour = parseInt(formData.birthTime.split(":")[0])
    const todayDay = today.getDay()
    const zodiac = getZodiac(birthYear)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const dailyFortuneResult: DailyFortune = {
      date: today.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
      overall:
        todayDay % 2 === 0
          ? `${formData.name}님, 오늘은 긍정적인 에너지가 넘치는 날입니다. ${zodiac} 띠인 당신은 오늘 특히 사람들과의 관계에서 좋은 기운을 받을 것입니다. 새로운 시작이나 중요한 결정을 내리기에 좋은 날이니, 망설이지 말고 앞으로 나아가세요.`
          : `${formData.name}님, 오늘은 차분하게 자신을 돌아보는 시간을 가지면 좋습니다. ${zodiac} 띠인 당신은 오늘 내면의 목소리에 귀 기울이면 중요한 통찰을 얻을 수 있습니다. 급하게 서두르기보다는 신중하게 행동하는 것이 좋겠습니다.`,
      lucky:
        birthMonth % 4 === 0
          ? "오늘은 오후 시간대에 운이 좋습니다. 중요한 미팅이나 약속은 오후에 잡는 것이 유리합니다. 특히 3시에서 5시 사이가 가장 좋은 시간대입니다."
          : birthMonth % 4 === 1
          ? "오늘은 오전 시간대가 행운을 가져다줍니다. 중요한 일은 가능한 오전에 처리하세요. 9시에서 11시 사이가 최고의 시간입니다."
          : birthMonth % 4 === 2
          ? "저녁 시간이 당신에게 행운을 가져다줄 것입니다. 퇴근 후나 저녁 식사 시간에 좋은 소식을 들을 수 있습니다."
          : "하루 종일 고른 운세를 보입니다. 언제든 좋은 기회가 찾아올 수 있으니 항상 준비된 자세를 유지하세요.",
      caution:
        birthDay % 3 === 0
          ? "오늘은 재정적인 결정을 내릴 때 특히 신중해야 합니다. 충동구매나 큰 투자는 하루 더 생각해보는 것이 좋겠습니다."
          : birthDay % 3 === 1
          ? "감정적인 대화나 논쟁은 피하는 것이 좋습니다. 오해가 생기기 쉬운 날이니 말을 신중하게 선택하세요."
          : "건강 관리에 신경 쓰세요. 무리한 일정은 피하고 충분한 휴식을 취하는 것이 중요합니다.",
      luckyTime:
        birthHour < 6
          ? "06:00 - 08:00"
          : birthHour < 12
          ? "14:00 - 16:00"
          : birthHour < 18
          ? "18:00 - 20:00"
          : "21:00 - 23:00",
      luckyItem: ["파란색 볼펜", "노트", "커피", "식물", "책"][
        (birthMonth + birthDay) % 5
      ],
      advice:
        todayDay === 0 || todayDay === 6
          ? "주말을 맞아 자신을 위한 시간을 가지세요. 좋아하는 취미 활동이나 휴식을 통해 에너지를 충전하면 다가올 한 주를 더 활기차게 시작할 수 있습니다."
          : "오늘 하루는 긍정적인 마음가짐으로 시작하세요. 작은 친절과 미소가 큰 행운을 불러올 수 있습니다. 주변 사람들에게 먼저 다가가보세요.",
    }

    setDailyFortune(dailyFortuneResult)
    setDailyLoading(false)
  }

  const generateDetailedFortune = async () => {
    if (!formData.name || !formData.birthDate || !formData.birthTime) {
      alert("이름, 생년월일, 태어난 시각을 입력해주세요.")
      return
    }

    setDetailedLoading(true)

    try {
      const response = await fetch("/api/generate-detailed-fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "상세 운세 생성 실패")
      }

      const data = await response.json()
      setDetailedFortune(data.fortune)
    } catch (error: any) {
      console.error("상세 운세 생성 오류:", error)
      alert(`상세 운세 생성에 실패했습니다.\n\n${error.message}`)
    } finally {
      setDetailedLoading(false)
    }
  }

  const getZodiac = (year: number) => {
    const zodiacs = ["원숭이", "닭", "개", "돼지", "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양"]
    return zodiacs[year % 12]
  }

  const getGanjiYear = (year: number) => {
    const cheongan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
    const jiji = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
    const jijiAnimals = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]

    // 오행 색상 (천간 기준)
    const colors = ["푸른", "푸른", "붉은", "붉은", "노란", "노란", "흰", "흰", "검은", "검은"]

    const cheonganIndex = (year - 4) % 10
    const jijiIndex = (year - 4) % 12

    const ganjiName = cheongan[cheonganIndex] + jiji[jijiIndex]
    const animal = jijiAnimals[jijiIndex]
    const color = colors[cheonganIndex]

    return {
      ganji: ganjiName,
      animal,
      color,
      fullName: `${ganjiName}년 ${color} ${animal}의 해`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-8 w-8 text-yellow-500" />
        <h2 className="text-2xl font-bold">운세</h2>
      </div>

      {/* 입력 폼 - 항상 표시 */}
      <Card className="p-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              생년월일 *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태어난 시각 *
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 주소 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>
        </div>
      </Card>

      {/* 탭 */}
      <Tabs defaultValue="yearly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="yearly" className="gap-2">
            <Sparkles className="h-4 w-4" />
            신년운세
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <Sun className="h-4 w-4" />
            오늘의운세
          </TabsTrigger>
        </TabsList>

        {/* 신년운세 탭 */}
        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={generateFortune}
              disabled={loading}
              className="col-span-1"
              size="lg"
            >
              {loading ? (
                <>처리 중...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  신년운세
                </>
              )}
            </Button>
            <Button
              onClick={generateDetailedFortune}
              disabled={detailedLoading}
              variant="outline"
              className="col-span-1"
              size="lg"
            >
              {detailedLoading ? (
                <>생성 중...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  상세 운세
                </>
              )}
            </Button>
            {fortune && (
              <Button
                onClick={sendEmail}
                disabled={sending}
                variant="outline"
                className="col-span-1"
                size="lg"
              >
                {sending ? (
                  <>전송 중...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    이메일
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 신년운세 결과 */}
          {fortune && (
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {formData.name}님의 {fortune.year} 운세
              </h3>
              <div className="flex items-center justify-center gap-2 text-yellow-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-lg font-medium">특별한 한 해가 될 것입니다</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-6">
              <FortuneSection title="종합운" content={fortune.overall} />
              <FortuneSection title="애정운" content={fortune.love} emoji="💕" />
              <FortuneSection title="직업운" content={fortune.career} emoji="💼" />
              <FortuneSection title="재물운" content={fortune.wealth} emoji="💰" />
              <FortuneSection title="건강운" content={fortune.health} emoji="🏥" />

              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-white rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">행운의 색</div>
                  <div className="text-xl font-bold text-gray-800">{fortune.luckyColor}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">행운의 숫자</div>
                  <div className="text-xl font-bold text-gray-800">{fortune.luckyNumber}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-800 mb-2">💡 한마디 조언</div>
                <p className="text-blue-900 leading-relaxed">{fortune.advice}</p>
              </div>
            </div>
          </Card>
        </div>
          )}

          {/* 상세 운세 결과 */}
          {detailedFortune && (
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {formData.name}님의 상세 신년운세
                </h3>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-lg font-medium">전문 역술 분석</span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-6">
                {/* 사주팔자 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-xl text-purple-800 mb-3 flex items-center gap-2">
                    <span>🎋</span>
                    사주팔자 분석
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{detailedFortune.saju}</p>
                </div>

                {/* 오행 분석 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-xl text-purple-800 mb-3 flex items-center gap-2">
                    <span>☯️</span>
                    오행 분석
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{detailedFortune.오행분석}</p>
                </div>

                {/* 월별 운세 */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-xl text-purple-800 mb-4 flex items-center gap-2">
                    <span>📅</span>
                    월별 운세
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {detailedFortune.월별운세.map((item, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="font-semibold text-purple-700 mb-2">{item.month}</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 특별 조언 */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border-2 border-purple-300">
                  <h4 className="font-bold text-xl text-purple-900 mb-3 flex items-center gap-2">
                    <span>✨</span>
                    특별 조언
                  </h4>
                  <p className="text-purple-900 leading-relaxed whitespace-pre-wrap font-medium">{detailedFortune.특별조언}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* 오늘의운세 탭 */}
        <TabsContent value="daily" className="space-y-4">
          <Button
            onClick={generateDailyFortune}
            disabled={dailyLoading}
            className="w-full"
            size="lg"
          >
            {dailyLoading ? (
              <>처리 중...</>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-2" />
                오늘의 운세 보기
              </>
            )}
          </Button>

          {/* 오늘의운세 결과 */}
          {dailyFortune && (
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {formData.name}님의 오늘의 운세
                </h3>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Sun className="h-5 w-5" />
                  <span className="text-lg font-medium">{dailyFortune.date}</span>
                  <Sun className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-6">
                {/* 종합운 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🌟</span>
                    오늘의 운세
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{dailyFortune.overall}</p>
                </div>

                {/* 행운 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>🍀</span>
                    행운의 시간
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{dailyFortune.lucky}</p>
                </div>

                {/* 주의사항 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    주의할 점
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{dailyFortune.caution}</p>
                </div>

                {/* 행운 정보 */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">행운의 시간대</div>
                    <div className="text-xl font-bold text-blue-600">{dailyFortune.luckyTime}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">행운의 아이템</div>
                    <div className="text-xl font-bold text-blue-600">{dailyFortune.luckyItem}</div>
                  </div>
                </div>

                {/* 조언 */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-800 mb-2">💡 오늘의 한마디</div>
                  <p className="text-yellow-900 leading-relaxed">{dailyFortune.advice}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FortuneSection({ title, content, emoji }: { title: string; content: string; emoji?: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {title}
      </h4>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  )
}
