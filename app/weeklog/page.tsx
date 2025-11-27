"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WeeklySummary } from "@/components/weeklog/weekly-summary"
import { DayCard } from "@/components/weeklog/day-card"
import { WeekNavigation } from "@/components/weeklog/week-navigation"
import { Plus, Loader2 } from "lucide-react"
import { getWeekWorklogs } from "@/lib/api/worklog"
import { useAuth } from "@/hooks/useAuth"

// 주의 시작일(월요일) 계산
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 일요일이면 -6, 아니면 월요일로
  return new Date(d.setDate(diff))
}

// 주차 문자열 생성 (예: "2025년 1월 2주차")
function getWeekString(weekStart: Date): string {
  const year = weekStart.getFullYear()
  const month = weekStart.getMonth() + 1

  // 해당 월의 첫 번째 월요일 찾기
  const firstDayOfMonth = new Date(year, weekStart.getMonth(), 1)
  const firstMonday = getWeekStart(firstDayOfMonth)

  // 주차 계산
  const diffDays = Math.floor((weekStart.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffDays / 7) + 1

  return `${year}년 ${month}월 ${weekNumber}주차`
}

// 요일 이름 가져오기
function getDayOfWeekName(date: Date): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  return days[date.getDay()]
}

export default function WeeklogPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()))
  const [worklogs, setWorklogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // 주간 작업일지 로드
  useEffect(() => {
    if (user) {
      loadWeekWorklogs()
    }
  }, [weekStart, user])

  const loadWeekWorklogs = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getWeekWorklogs(user.id, weekStart)
      setWorklogs(data)
    } catch (error) {
      console.error('주간 작업일지 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중이거나 사용자가 없으면 로딩 표시
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  const handlePrevWeek = () => {
    const newWeekStart = new Date(weekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setWeekStart(newWeekStart)
  }

  const handleNextWeek = () => {
    const newWeekStart = new Date(weekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setWeekStart(newWeekStart)
  }

  const handleToday = () => {
    setWeekStart(getWeekStart(new Date()))
  }

  // 요약 통계 계산
  const calculateSummary = () => {
    const totalMinutes = worklogs.reduce((sum, log) => sum + (log.total_minutes || 0), 0)
    const completedTasks = worklogs.reduce((sum, log) => sum + (log.tasks?.length || 0), 0)
    const completedDays = worklogs.filter(log => log.status === 'completed').length
    const progressRate = Math.round((completedDays / 7) * 100)

    return { totalMinutes, completedTasks, progressRate }
  }

  // 7일간의 날짜 배열 생성 및 워크로그 매핑
  const getDaysData = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0]

      // 해당 날짜의 worklog 찾기
      const worklog = worklogs.find(w => w.work_date === dateString)

      days.push({
        date,
        dayOfWeek: getDayOfWeekName(date),
        tasks: worklog?.tasks || [],
        status: worklog?.status || 'empty',
        isToday: date.getTime() === today.getTime()
      })
    }

    return days
  }

  const summary = calculateSummary()
  const daysData = getDaysData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">주간 작업일지</h1>
          <p className="text-gray-600 mt-2">이번 주 업무 현황을 한눈에 확인하고 관리하세요.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          새 일지 작성
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <WeeklySummary
            totalMinutes={summary.totalMinutes}
            completedTasks={summary.completedTasks}
            progressRate={summary.progressRate}
          />

          <WeekNavigation
            currentWeek={getWeekString(weekStart)}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onToday={handleToday}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {daysData.map((day, index) => (
              <DayCard
                key={index}
                date={day.date}
                dayOfWeek={day.dayOfWeek}
                tasks={day.tasks}
                status={day.status}
                isToday={day.isToday}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
