"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getReferenceInfo, saveReferenceInfo } from "@/lib/api/worklog"

const TABS = Array.from({ length: 9 }, (_, i) => `메모 ${i + 1}`)
const USER_ID = "904f05e3-43cd-446b-838e-3ef1d53a38ce"

interface ReferenceTabsProps {
  selectedDate: Date
}

export function ReferenceTabs({ selectedDate }: ReferenceTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [content, setContent] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 날짜나 탭 변경 시 해당 메모 로드
  useEffect(() => {
    loadReferenceInfo(activeTab)
  }, [activeTab, selectedDate])

  const loadReferenceInfo = async (tabName: string) => {
    setIsLoading(true)
    try {
      const info = await getReferenceInfo(USER_ID, selectedDate, tabName)
      if (info) {
        setContent(prev => ({ ...prev, [tabName]: info.content }))
      } else {
        setContent(prev => ({ ...prev, [tabName]: "" }))
      }
    } catch (error) {
      console.error('참고 정보 로드 실패:', error)
      setContent(prev => ({ ...prev, [tabName]: "" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentChange = (value: string) => {
    setContent(prev => ({ ...prev, [activeTab]: value }))
  }

  const handleBlur = async () => {
    // 포커스를 잃을 때 자동 저장
    if (content[activeTab]) {
      try {
        await saveReferenceInfo(USER_ID, selectedDate, activeTab, content[activeTab])
      } catch (error) {
        console.error('참고 정보 저장 실패:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* 섹션 제목 */}
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-xl font-bold">참고 정보</h2>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <div className="flex px-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-8">
        <textarea
          value={content[activeTab] || ""}
          onChange={(e) => handleContentChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={`${activeTab}에 대한 참고 정보를 입력하세요...`}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
