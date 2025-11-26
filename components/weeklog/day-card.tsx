import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  description: string
  minutes: number
  tags: string[]
  category: 'design' | 'planning' | 'development' | 'analysis'
}

interface DayCardProps {
  date: Date
  dayOfWeek: string
  tasks: Task[]
  status: 'completed' | 'draft' | 'empty'
  isToday?: boolean
}

const categoryColors = {
  design: 'bg-blue-100 text-blue-700',
  planning: 'bg-purple-100 text-purple-700',
  development: 'bg-green-100 text-green-700',
  analysis: 'bg-red-100 text-red-700',
}

const categoryLabels = {
  design: '디자인',
  planning: '기획',
  development: '개발',
  analysis: '분석',
}

const statusColors = {
  completed: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  empty: 'bg-gray-100 text-gray-500',
}

const statusLabels = {
  completed: '작성 완료',
  draft: '임시 저장',
  empty: '일지 없음',
}

export function DayCard({ date, dayOfWeek, tasks, status, isToday }: DayCardProps) {
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const isEmpty = tasks.length === 0

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isToday && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold">
              {date.getMonth() + 1}.{date.getDate()} {dayOfWeek}
            </div>
            {status !== 'empty' && (
              <div className="text-sm text-gray-600 mt-1">
                {hours}시간 {minutes > 0 && `${minutes}분`}
              </div>
            )}
          </div>
          <Badge className={cn(statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <button className="flex flex-col items-center gap-2 hover:text-gray-600 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm">일지를 작성해주세요.</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="border-l-2 border-gray-200 pl-3">
                <div className="text-sm text-gray-900 mb-1">{task.description}</div>
                <div className="flex items-center gap-2">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "text-xs",
                        categoryColors[task.category as keyof typeof categoryColors]
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
