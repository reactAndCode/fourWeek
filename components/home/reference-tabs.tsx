"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getReferenceInfo, saveReferenceInfo } from "@/lib/api/worklog"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Save, Loader2, CheckCircle2 } from "lucide-react"

const TABS = Array.from({ length: 9 }, (_, i) => `메모 ${i + 1}`)

interface ReferenceTabsProps {
  selectedDate: Date
}

export function ReferenceTabs({ selectedDate }: ReferenceTabsProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [content, setContent] = useState<Record<string, string>>({})
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // 날짜나 탭 변경 시 해당 메모 로드
  useEffect(() => {
    if (user) {
      loadReferenceInfo(activeTab)
    }
  }, [activeTab, selectedDate, user])

  // 변경사항 추적
  useEffect(() => {
    const changed = content[activeTab] !== originalContent[activeTab]
    setHasChanges(changed)
  }, [content, activeTab, originalContent])

  const loadReferenceInfo = async (tabName: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const info = await getReferenceInfo(user.id, selectedDate, tabName)
      const loadedContent = info?.content || ""
      setContent(prev => ({ ...prev, [tabName]: loadedContent }))
      setOriginalContent(prev => ({ ...prev, [tabName]: loadedContent }))
    } catch (error) {
      console.error('참고 정보 로드 실패:', error)
      setContent(prev => ({ ...prev, [tabName]: "" }))
      setOriginalContent(prev => ({ ...prev, [tabName]: "" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentChange = (value: string) => {
    setContent(prev => ({ ...prev, [activeTab]: value }))
  }

  const handleSave = async () => {
    if (!user || !hasChanges) return

    setIsSaving(true)
    try {
      await saveReferenceInfo(user.id, selectedDate, activeTab, content[activeTab] || "")
      setOriginalContent(prev => ({ ...prev, [activeTab]: content[activeTab] }))
      console.log('참고 정보 저장 성공')
    } catch (error) {
      console.error('참고 정보 저장 실패:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && confirm('변경사항을 취소하시겠습니까?')) {
      setContent(prev => ({ ...prev, [activeTab]: originalContent[activeTab] || "" }))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
      {/* 섹션 제목 + 저장 상태 + 버튼들 */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">참고 정보</h2>

        {/* 우측: 저장 상태 + 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 저장 상태 */}
          <CheckCircle2 className={`h-5 w-5 ${!hasChanges && !isSaving ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-sm ${!hasChanges && !isSaving ? 'text-green-600' : 'text-gray-500'}`}>
            {isSaving ? '저장 중...' : !hasChanges ? '저장 완료' : '저장되지 않음'}
          </span>

          {/* 버튼들 */}
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
            disabled={!hasChanges || isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-500 hover:bg-blue-600"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
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
              {/* 변경사항 표시 */}
              {content[tab] !== originalContent[tab] && (
                <span className="ml-1 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 p-8 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center border border-gray-300 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <textarea
            value={content[activeTab] || ""}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`${activeTab}에 대한 참고 정보를 입력하세요...`}
            className="w-full h-full p-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSaving}
          />
        )}
      </div>
    </div>
  )
}
