"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, StickyNote, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

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
]

export function Navigation() {
  const pathname = usePathname()

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
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
