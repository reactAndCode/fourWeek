"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MemoTabs } from "@/components/memos/memo-tabs"
import { ToastEditor } from "@/components/memos/toast-editor-wrapper"
import { Save, X, Loader2 } from "lucide-react"
import { getMemoByTab, upsertMemo } from "@/lib/api/memos"
import { useAuth } from "@/hooks/useAuth"

const TABS = Array.from({ length: 10 }, (_, i) => `Tab ${i + 1}`)

export default function MemosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [title, setTitle] = useState("제목 없음")
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // 탭 변경 시 메모 로드
  useEffect(() => {
    if (user) {
      loadMemo(activeTab)
    }
  }, [activeTab, user])

  const loadMemo = async (tabName: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const memo = await getMemoByTab(user.id, tabName)
      if (memo) {
        setTitle(memo.title)
        setContent(memo.content)
        setOriginalContent(memo.content)
      } else {
        setTitle("제목 없음")
        setContent("")
        setOriginalContent("")
      }
    } catch (error) {
      console.error('메모 로드 실패:', error)
      setTitle("제목 없음")
      setContent("")
      setOriginalContent("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    // 변경사항 추적
    const changed = value !== originalContent
    setHasUnsavedChanges(prev => ({ ...prev, [activeTab]: changed }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const result = await upsertMemo(user.id, activeTab, title, content)
      console.log('저장 성공:', result)
      setOriginalContent(content)
      setHasUnsavedChanges(prev => ({ ...prev, [activeTab]: false }))
      alert('저장되었습니다!')
    } catch (error: any) {
      console.error('저장 실패 상세:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      alert(`저장에 실패했습니다.\n${error?.message || '알 수 없는 오류'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges[activeTab]) {
      if (confirm('변경사항이 저장되지 않았습니다. 취소하시겠습니까?')) {
        setContent(originalContent)
        setHasUnsavedChanges(prev => ({ ...prev, [activeTab]: false }))
      }
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">메모관리</h1>
          <p className="text-gray-600 mt-1">탭별로 메모를 작성하고 관리하세요.</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <MemoTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col p-6">
          {/* 제목 입력 */}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 에디터 */}
          <div className="flex-1 bg-white rounded-lg border border-gray-300 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <ToastEditor
                key={activeTab}
                initialValue={content}
                onChange={handleContentChange}
                height="100%"
              />
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges[activeTab] || isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges[activeTab] || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
