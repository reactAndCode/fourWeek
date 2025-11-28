"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

interface WorklogFormProps {
  selectedDate: Date
  initialContent?: string
  isLoading?: boolean
  isSaving?: boolean
  onSave?: (content: string) => void
  onCancel?: () => void
}

export function WorklogForm({
  selectedDate,
  initialContent = "",
  isLoading = false,
  isSaving = false,
  onSave,
  onCancel
}: WorklogFormProps) {
  const [content, setContent] = useState(initialContent)
  const [hasChanges, setHasChanges] = useState(false)

  // initialContent가 변경되면 업데이트
  useEffect(() => {
    setContent(initialContent)
    setHasChanges(false)
  }, [initialContent])

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(value !== initialContent)
  }

  const handleSave = () => {
    onSave?.(content)
    setHasChanges(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 h-full flex flex-col">
      {/* 타이틀 + 버튼/상태 */}
      <div className="flex items-center justify-between mb-6">
        {/* 왼쪽: 레이블 */}
        <label className="text-lg font-bold text-gray-800">
          {formatDate(selectedDate)} 작업 내용
        </label>

        {/* 우측: 저장 상태 + 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 저장 상태 */}
          <CheckCircle2 className={`h-5 w-5 ${!hasChanges && content ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-sm ${!hasChanges && content ? 'text-green-600' : 'text-gray-500'}`}>
            {isSaving ? '저장 중...' : !hasChanges && content ? '저장 완료' : '저장되지 않음'}
          </span>

          {/* 버튼들 */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
            disabled={isSaving || isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-500 hover:bg-blue-600"
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </div>
      </div>

      {/* 작업 내용 입력 영역 (flex-1로 나머지 공간 차지) */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center border border-gray-300 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="오늘 수행한 주요 업무, 진행 상황, 특이사항 등을 기록하세요."
            className="w-full h-full p-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSaving}
          />
        )}
      </div>
    </div>
  )
}
