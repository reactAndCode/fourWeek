"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // 해당 월의 첫날과 마지막 날
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 달력 시작 요일 (0 = 일요일)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1))
  }

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today)
  }

  // 날짜 선택
  const selectDate = (day: number) => {
    const newDate = new Date(year, month, day)
    onDateSelect(newDate)
  }

  // 날짜가 선택된 날짜인지 확인
  const isSelected = (day: number) => {
    const date = new Date(year, month, day)
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // 오늘 날짜인지 확인
  const isToday = (day: number) => {
    const today = new Date()
    const date = new Date(year, month, day)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // 달력 그리드 생성
  const calendarDays = []

  // 빈 칸 추가 (이전 달)
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} />)
  }

  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <button
        key={day}
        onClick={() => selectDate(day)}
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          isSelected(day) && "bg-blue-500 text-white hover:bg-blue-600",
          !isSelected(day) && isToday(day) && "bg-blue-100 text-blue-600",
          !isSelected(day) && !isToday(day) && "hover:bg-gray-100"
        )}
      >
        {day}
      </button>
    )
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {year}년 {month + 1}월
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
 
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="h-10 flex items-center justify-center text-sm text-gray-500 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {calendarDays}
      </div>

      {/* 오늘 날짜로 이동 버튼 */}
      <Button
        onClick={goToToday}
        variant="outline"
        className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
      >
        오늘 날짜로 이동
      </Button>
    </div>
  )
}
