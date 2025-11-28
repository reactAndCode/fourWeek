"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FileText, StickyNote, Wrench, Bell, User, LogOut, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { signOut } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    name: "홈",
    href: "/",
    icon: Home,
  },
  {
    name: "주간일지",
    href: "/weeklog",
    icon: FileText,
  },
  {
    name: "메모관리",
    href: "/memos",
    icon: StickyNote,
  },
  {
    name: "나의유틸",
    href: "/myutils",
    icon: Wrench,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        await signOut()
        router.push("/auth/login")
      } catch (error) {
        console.error("로그아웃 실패:", error)
        alert("로그아웃에 실패했습니다.")
      }
    }
  }

  // 로그인 페이지에서는 네비게이션 숨김
  if (pathname === "/auth/login") {
    return null
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold">Weekly Log</span>
            </Link>

            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* 사용자 이메일 표시 */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {user.email?.split("@")[0]}
                      </span>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    {/* 로그인 버튼 */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push("/auth/login")}
                      className="gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      로그인
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
