"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/myutils/sidebar"
import { Translator } from "@/components/myutils/translator"
import { Mindmap } from "@/components/myutils/mindmap"
import { DocumentGPT } from "@/components/myutils/document-gpt"
import { Guestbook } from "@/components/myutils/guestbook"
import { DataTransform } from "@/components/myutils/data-transform"
import { TripPlanner } from "@/components/myutils/trip-planner"
import { CalendarView } from "@/components/myutils/calendar"
import { Fortune } from "@/components/myutils/fortune"
import { VisitReview } from "@/components/myutils/visit-review"
import { useAuth } from "@/hooks/useAuth"

type MenuItem = "translator" | "reatFlow" | "doument" | "guestBook" | "dataTransform" | "tripPlanner" | "calendar" | "fortune" | "visitReview" | "testA" | "testB" | "testC"

export default function MyUtilsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activeMenu, setActiveMenu] = useState<MenuItem>("translator")

  // 인증 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // 로딩 중이거나 사용자가 없으면 로딩 표시
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">나의 유틸리티</h1>

        {/* 좌우 레이아웃 */}
        <div className="grid grid-cols-[20%_1fr] gap-6 min-h-[600px]">
          {/* 좌측 메뉴 (20%) */}
          <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

          {/* 우측 컨텐츠 (80%) */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            {activeMenu === "translator" && <Translator />}
            {activeMenu === "reatFlow" && <Mindmap />}
            {activeMenu === "doument" && <DocumentGPT />}
            {activeMenu === "guestBook" && <Guestbook />}
            {activeMenu === "dataTransform" && <DataTransform />}
            {activeMenu === "tripPlanner" && <TripPlanner />}
            {activeMenu === "calendar" && <CalendarView />}
            {activeMenu === "fortune" && <Fortune />}
            {activeMenu === "visitReview" && <VisitReview />}
            {activeMenu === "testA" && (
              <div className="text-center text-gray-500 py-20">
                테스트 A 컨텐츠 영역
              </div>
            )}
            {activeMenu === "testB" && (
              <div className="text-center text-gray-500 py-20">
                테스트 B 컨텐츠 영역
              </div>
            )}
            {activeMenu === "testC" && (
              <div className="text-center text-gray-500 py-20">
                테스트 C 컨텐츠 영역
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
