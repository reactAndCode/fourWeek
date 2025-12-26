"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { getCalendarEventsByYear, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/api/calendar"
import { Event } from "@/types/calendar.types"

// 한국 공휴일 데이터
const KOREAN_HOLIDAYS: Event[] = [
  // 2025년 한국 공휴일
  { id: "holiday-1", date: "2025-01-01", title: "신정", description: "새해 첫날", isHoliday: true },
  { id: "holiday-2", date: "2025-01-28", title: "설날 연휴", description: "설날 전날", isHoliday: true },
  { id: "holiday-3", date: "2025-01-29", title: "설날", description: "음력 1월 1일", isHoliday: true },
  { id: "holiday-4", date: "2025-01-30", title: "설날 연휴", description: "설날 다음날", isHoliday: true },
  { id: "holiday-5", date: "2025-03-01", title: "삼일절", description: "3·1 운동 기념일", isHoliday: true },
  { id: "holiday-6", date: "2025-05-05", title: "어린이날", description: "어린이날", isHoliday: true },
  { id: "holiday-7", date: "2025-05-05", title: "부처님오신날", description: "음력 4월 8일", isHoliday: true },
  { id: "holiday-8", date: "2025-06-06", title: "현충일", description: "순국선열 추모일", isHoliday: true },
  { id: "holiday-9", date: "2025-08-15", title: "광복절", description: "광복 기념일", isHoliday: true },
  { id: "holiday-10", date: "2025-10-05", title: "추석 연휴", description: "추석 전날", isHoliday: true },
  { id: "holiday-11", date: "2025-10-06", title: "추석", description: "음력 8월 15일", isHoliday: true },
  { id: "holiday-12", date: "2025-10-07", title: "추석 연휴", description: "추석 다음날", isHoliday: true },
  { id: "holiday-13", date: "2025-10-03", title: "개천절", description: "개천절", isHoliday: true },
  { id: "holiday-14", date: "2025-10-09", title: "한글날", description: "한글 반포 기념일", isHoliday: true },
  { id: "holiday-15", date: "2025-12-25", title: "크리스마스", description: "기독탄신일", isHoliday: true },
  // 2026년 공휴일
  { id: "holiday-16", date: "2026-01-01", title: "신정", description: "새해 첫날", isHoliday: true },
  { id: "holiday-17", date: "2026-02-16", title: "설날 연휴", description: "설날 전날", isHoliday: true },
  { id: "holiday-18", date: "2026-02-17", title: "설날", description: "음력 1월 1일", isHoliday: true },
  { id: "holiday-19", date: "2026-02-18", title: "설날 연휴", description: "설날 다음날", isHoliday: true },
  { id: "holiday-20", date: "2026-03-01", title: "삼일절", description: "3·1 운동 기념일", isHoliday: true },
  { id: "holiday-21", date: "2026-05-05", title: "어린이날", description: "어린이날", isHoliday: true },
  { id: "holiday-22", date: "2026-05-24", title: "부처님오신날", description: "음력 4월 8일", isHoliday: true },
  { id: "holiday-23", date: "2026-06-06", title: "현충일", description: "순국선열 추모일", isHoliday: true },
  { id: "holiday-24", date: "2026-08-15", title: "광복절", description: "광복 기념일", isHoliday: true },
  { id: "holiday-25", date: "2026-09-24", title: "추석 연휴", description: "추석 전날", isHoliday: true },
  { id: "holiday-26", date: "2026-09-25", title: "추석", description: "음력 8월 15일", isHoliday: true },
  { id: "holiday-27", date: "2026-09-26", title: "추석 연휴", description: "추석 다음날", isHoliday: true },
  { id: "holiday-28", date: "2026-10-03", title: "개천절", description: "개천절", isHoliday: true },
  { id: "holiday-29", date: "2026-10-09", title: "한글날", description: "한글 반포 기념일", isHoliday: true },
  { id: "holiday-30", date: "2026-12-25", title: "크리스마스", description: "기독탄신일", isHoliday: true },
]

export function CalendarView() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [userEvents, setUserEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  })

  // 사용자 일정 + 공휴일 합치기
  const events = [...userEvents, ...KOREAN_HOLIDAYS]

  // 년도가 변경될 때마다 해당 년도의 일정 로드
  useEffect(() => {
    const loadEvents = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const year = getYear(currentDate)
        const data = await getCalendarEventsByYear(user.id, year)

        // Supabase 데이터를 Event 형식으로 변환
        const formattedEvents: Event[] = data.map((event) => ({
          id: event.id,
          date: event.date,
          title: event.title,
          description: event.description || "",
          start_time: event.start_time || "",
          end_time: event.end_time || "",
          isHoliday: false,
        }))

        setUserEvents(formattedEvents)
      } catch (error) {
        console.error("일정 로드 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, currentDate])

  // 달력 유틸리티 함수
  const getYear = (date: Date) => date.getFullYear()
  const getMonth = (date: Date) => date.getMonth()
  const getDate = (date: Date) => date.getDate()

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const formatYearMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => event.date === dateStr)
  }

  // 달력 날짜 생성
  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days: (number | null)[] = []

    // 이전 달의 빈 칸
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // 현재 달의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(getYear(currentDate), getMonth(currentDate) - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(getYear(currentDate), getMonth(currentDate) + 1, 1))
  }

  // 년도 변경
  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, getMonth(currentDate), 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // 날짜 선택
  const handleDateClick = (day: number) => {
    const selected = new Date(getYear(currentDate), getMonth(currentDate), day)
    setSelectedDate(selected)
  }

  // 일정 클릭 (수정 팝업 열기)
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation() // 날짜 클릭 이벤트 막기

    // 공휴일은 수정 불가
    if (event.isHoliday) return

    setEditingEvent(event)
    setSelectedDate(new Date(event.date))
    setNewEvent({
      title: event.title,
      description: event.description,
      start_time: event.start_time || "",
      end_time: event.end_time || "",
    })
    setShowEventModal(true)
  }

  // 일정 추가 모달 열기
  const openAddEventModal = () => {
    setEditingEvent(null)
    setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
    setShowEventModal(true)
  }

  // 일정 추가
  const handleAddEvent = async () => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    if (!selectedDate) {
      alert("날짜를 선택해주세요.")
      return
    }

    if (!newEvent.title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    try {
      // undefined 값 제거
      const eventData: any = {
        user_id: user.id,
        date: formatDate(selectedDate),
        title: newEvent.title,
        description: newEvent.description || "",
      }

      if (newEvent.start_time) {
        eventData.start_time = newEvent.start_time
      }

      if (newEvent.end_time) {
        eventData.end_time = newEvent.end_time
      }

      // Supabase에 저장
      const createdEvent = await createCalendarEvent(eventData)

      // 로컬 상태 업데이트
      const newEventData: Event = {
        id: createdEvent.id,
        date: createdEvent.date,
        title: createdEvent.title,
        description: createdEvent.description || "",
        start_time: createdEvent.start_time || "",
        end_time: createdEvent.end_time || "",
        isHoliday: false,
      }

      setUserEvents([...userEvents, newEventData])
      setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
      setShowEventModal(false)
    } catch (error) {
      console.error("일정 추가 실패:", error)
      if (error instanceof Error) {
        alert(`일정 추가에 실패했습니다: ${error.message}`)
      } else {
        alert("일정 추가에 실패했습니다. Supabase 테이블에 start_time, end_time 컬럼이 추가되었는지 확인해주세요.")
      }
    }
  }

  // 일정 수정
  const handleUpdateEvent = async () => {
    if (!user || !editingEvent) return

    if (!newEvent.title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    try {
      // undefined 값 제거
      const updates: any = {
        title: newEvent.title,
        description: newEvent.description || "",
      }

      if (selectedDate) {
        updates.date = formatDate(selectedDate)
      }

      if (newEvent.start_time) {
        updates.start_time = newEvent.start_time
      }

      if (newEvent.end_time) {
        updates.end_time = newEvent.end_time
      }

      const updatedEvent = await updateCalendarEvent(editingEvent.id, updates)

      // 로컬 상태 업데이트
      const updatedEvents = userEvents.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              date: updatedEvent.date,
              title: updatedEvent.title,
              description: updatedEvent.description || "",
              start_time: updatedEvent.start_time || "",
              end_time: updatedEvent.end_time || "",
            }
          : event
      )

      setUserEvents(updatedEvents)
      setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
      setEditingEvent(null)
      setShowEventModal(false)
    } catch (error) {
      console.error("일정 수정 실패:", error)
      if (error instanceof Error) {
        alert(`일정 수정에 실패했습니다: ${error.message}`)
      } else {
        alert("일정 수정에 실패했습니다. Supabase 테이블에 start_time, end_time 컬럼이 추가되었는지 확인해주세요.")
      }
    }
  }

  // 일정 삭제
  const handleDeleteEvent = async () => {
    if (!editingEvent) return

    if (!confirm("일정을 삭제하시겠습니까?")) return

    try {
      await deleteCalendarEvent(editingEvent.id)

      // 로컬 상태 업데이트
      setUserEvents(userEvents.filter((event) => event.id !== editingEvent.id))
      setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
      setEditingEvent(null)
      setShowEventModal(false)
    } catch (error) {
      console.error("일정 삭제 실패:", error)
      alert("일정 삭제에 실패했습니다.")
    }
  }

  // 모달 닫기 및 저장
  const handleSaveEvent = () => {
    if (editingEvent) {
      handleUpdateEvent()
    } else {
      handleAddEvent()
    }
  }

  const today = new Date()
  const todayStr = formatDate(today)
  const year = getYear(currentDate)
  const month = getMonth(currentDate)
  const calendarDays = generateCalendarDays(year, month)

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="flex gap-6 h-[calc(100vh-220px)]">
      {/* 좌측: 작은 달력 */}
      <div className="w-64 flex flex-col gap-4">
        {/* 작은 달력 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {formatYearMonth(currentDate)}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 년도 선택 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleYearChange(year - 1)}
            className="flex-1"
          >
            {year - 1}
          </Button>
          <Button
            size="sm"
            variant="default"
            className="flex-1"
          >
            {year}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleYearChange(year + 1)}
            className="flex-1"
          >
            {year + 1}
          </Button>
        </div>

        {/* 작은 달력 그리드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const dateStr = formatDate(
                new Date(year, month, day)
              )
              const isToday = dateStr === todayStr
              const isSelected =
                selectedDate && dateStr === formatDate(selectedDate)

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-full
                    ${isToday ? "bg-blue-500 text-white font-semibold" : ""}
                    ${isSelected && !isToday ? "bg-blue-100 text-blue-600" : ""}
                    ${!isToday && !isSelected ? "hover:bg-gray-100" : ""}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* 만들기 버튼 */}
        <Button
          onClick={openAddEventModal}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          만들기
        </Button>
      </div>

      {/* 중앙: 큰 달력 */}
      <div className="flex-1 flex flex-col">
        {/* 큰 달력 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">캘린더</h1>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={goToToday}
            >
              오늘
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleYearChange(year - 1)}
              >
                {year - 1}
              </Button>
              <Button
                size="sm"
                variant="default"
              >
                {year}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleYearChange(year + 1)}
              >
                {year + 1}
              </Button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 font-semibold">
                {formatYearMonth(currentDate)}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 큰 달력 그리드 */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 auto-rows-fr h-[calc(100%-52px)]">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-r border-b border-gray-200 bg-gray-50"
                  />
                )
              }

              const dateStr = formatDate(
                new Date(year, month, day)
              )
              const isToday = dateStr === todayStr
              const dayEvents = getEventsForDate(dateStr)

              return (
                <div
                  key={day}
                  className="border-r border-b border-gray-200 p-2 overflow-y-auto hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDateClick(day)}
                >
                  <div
                    className={`
                      text-sm font-medium mb-1
                      ${isToday ? "text-blue-600" : "text-gray-700"}
                    `}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`px-2 py-1 rounded truncate ${
                          event.isHoliday
                            ? "bg-green-100 text-green-800 text-xs"
                            : "bg-blue-100 text-blue-800 text-[10px] cursor-pointer hover:bg-blue-200"
                        }`}
                      >
                        {event.isHoliday && event.start_time && `${event.start_time} `}
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingEvent ? "일정 수정" : "일정 추가"}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setEditingEvent(null)
                  setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="eventDate">날짜</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={selectedDate ? formatDate(selectedDate) : ""}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, start_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventTitle">제목</Label>
                <Input
                  id="eventTitle"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="일정 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="eventDescription">상세정보</Label>
                <Textarea
                  id="eventDescription"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="상세 정보를 입력하세요"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {editingEvent && (
                <Button
                  onClick={handleDeleteEvent}
                  variant="destructive"
                  className="flex-1"
                >
                  삭제
                </Button>
              )}
              <Button onClick={handleSaveEvent} className="flex-1">
                {editingEvent ? "수정" : "저장"}
              </Button>
              <Button
                onClick={() => {
                  setShowEventModal(false)
                  setEditingEvent(null)
                  setNewEvent({ title: "", description: "", start_time: "", end_time: "" })
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
