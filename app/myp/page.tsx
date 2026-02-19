"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { VisitReview } from "@/components/myutils/visit-review"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MyPPage() {
    const router = useRouter()
    const { user, loading } = useAuth()

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
                <div className="text-gray-500 font-medium">인증 확인 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 상단 헤더 */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/myutils">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                목록으로
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">내 방문 리뷰</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        {user.email}님 환영합니다
                    </div>
                </div>
            </header>

            {/* 컨텐츠 레이아웃 */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[700px]">
                    <VisitReview />
                </div>
            </main>

            {/* 푸터 (선택 사항) */}
            <footer className="py-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} My Utilities. All rights reserved.
            </footer>
        </div>
    )
}
