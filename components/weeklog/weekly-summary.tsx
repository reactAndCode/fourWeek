import { Card, CardContent } from "@/components/ui/card"

interface WeeklySummaryProps {
  totalMinutes: number
  completedTasks: number
  progressRate: number
}

export function WeeklySummary({ totalMinutes, completedTasks, progressRate }: WeeklySummaryProps) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 mb-2">총 근무 시간</div>
          <div className="text-3xl font-bold">{hours}시간 {minutes}분</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 mb-2">완료한 업무</div>
          <div className="text-3xl font-bold">{completedTasks}개</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 mb-2">진행률</div>
          <div className="text-3xl font-bold">{progressRate}%</div>
        </CardContent>
      </Card>
    </div>
  )
}
