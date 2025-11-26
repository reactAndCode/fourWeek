"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WeeklySummary } from "@/components/weeklog/weekly-summary"
import { DayCard } from "@/components/weeklog/day-card"
import { WeekNavigation } from "@/components/weeklog/week-navigation"
import { Plus } from "lucide-react"

// Mock data - 나중에 Supabase에서 가져올 데이터
const mockData = {
  summary: {
    totalMinutes: 2310, // 38시간 30분
    completedTasks: 12,
    progressRate: 75,
  },
  days: [
    {
      date: new Date(2023, 9, 23),
      dayOfWeek: "월요일",
      tasks: [
        {
          id: "1",
          description: "UI 디자인 시스템 컴포넌트 개발",
          minutes: 480,
          tags: ["디자인", "기획"],
          category: "design" as const,
        },
        {
          id: "2",
          description: "주간 회의 및 업무 계획 수립",
          minutes: 60,
          tags: ["기획"],
          category: "planning" as const,
        },
        {
          id: "3",
          description: "사용자 피드백 분석 및 정리",
          minutes: 120,
          tags: ["분석"],
          category: "analysis" as const,
        },
      ],
      status: "completed" as const,
    },
    {
      date: new Date(2023, 9, 24),
      dayOfWeek: "화요일",
      tasks: [
        {
          id: "4",
          description: "A/B 테스트 결과 분석 보고서 작성",
          minutes: 180,
          tags: ["분석", "디자인"],
          category: "analysis" as const,
        },
        {
          id: "5",
          description: "신규 기능 프로토타입 제작 (진행중)",
          minutes: 210,
          tags: ["디자인"],
          category: "development" as const,
        },
      ],
      status: "draft" as const,
      isToday: true,
    },
    {
      date: new Date(2023, 9, 25),
      dayOfWeek: "수요일",
      tasks: [
        {
          id: "6",
          description: "API 연동 테스트 및 버그 수정",
          minutes: 480,
          tags: ["개발"],
          category: "development" as const,
        },
        {
          id: "7",
          description: "기술 문서 조사 작성",
          minutes: 60,
          tags: ["개발"],
          category: "development" as const,
        },
      ],
      status: "completed" as const,
    },
    {
      date: new Date(2023, 9, 26),
      dayOfWeek: "목요일",
      tasks: [],
      status: "empty" as const,
    },
    {
      date: new Date(2023, 9, 27),
      dayOfWeek: "금요일",
      tasks: [],
      status: "empty" as const,
    },
    {
      date: new Date(2023, 9, 28),
      dayOfWeek: "토요일",
      tasks: [],
      status: "empty" as const,
    },
    {
      date: new Date(2023, 9, 29),
      dayOfWeek: "일요일",
      tasks: [],
      status: "empty" as const,
    },
  ],
}

export default function WeeklogPage() {
  const [currentWeek, setCurrentWeek] = useState("2023년 10월 4주차")

  const handlePrevWeek = () => {
    // TODO: 이전 주로 이동
    console.log("Previous week")
  }

  const handleNextWeek = () => {
    // TODO: 다음 주로 이동
    console.log("Next week")
  }

  const handleToday = () => {
    // TODO: 오늘이 속한 주로 이동
    console.log("Today")
  }

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

      <WeeklySummary
        totalMinutes={mockData.summary.totalMinutes}
        completedTasks={mockData.summary.completedTasks}
        progressRate={mockData.summary.progressRate}
      />

      <WeekNavigation
        currentWeek={currentWeek}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockData.days.map((day, index) => (
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
    </div>
  )
}
