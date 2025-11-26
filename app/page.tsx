"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/home/calendar"
import { WorklogForm } from "@/components/home/worklog-form"
import { ReferenceTabs } from "@/components/home/reference-tabs"
import { getWorklogByDate, upsertWorklog } from "@/lib/api/worklog"

// 현재 사용자 ID
const USER_ID = "904f05e3-43cd-446b-838e-3ef1d53a38ce"

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [worklogContent, setWorklogContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 날짜 변경 시 해당 날짜의 작업일지 로드
  useEffect(() => {
    loadWorklog(selectedDate)
  }, [selectedDate])

  const loadWorklog = async (date: Date) => {
    setIsLoading(true)
    try {
      const worklog = await getWorklogByDate(USER_ID, date)
      if (worklog) {
        // tasks 배열에서 첫 번째 작업의 description을 가져옴
        const tasks = worklog.tasks as any[]
        setWorklogContent(tasks?.[0]?.description || "")
      } else {
        setWorklogContent("")
      }
    } catch (error) {
      console.error('작업일지 로드 실패:', error)
      setWorklogContent("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (content: string) => {
    setIsSaving(true)
    try {
      await upsertWorklog(USER_ID, selectedDate, content, 'completed')
      setWorklogContent(content)
      alert("작업일지가 저장되었습니다!")
    } catch (error: any) {
      console.error('저장 실패:', error)
      alert(`저장에 실패했습니다.\n${error?.message || '알 수 없는 오류'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm("작성 중인 내용을 취소하시겠습니까?")) {
      loadWorklog(selectedDate)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단: 달력 + 작업일지 */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 mb-6">
          {/* 왼쪽: 달력 */}
          <div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* 오른쪽: 작업일지 입력 */}
          <div>
            <WorklogForm
              selectedDate={selectedDate}
              initialContent={worklogContent}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* 하단: 참고 정보 */}
        <div>
          <ReferenceTabs selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  )
}
