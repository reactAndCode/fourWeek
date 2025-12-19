"use client"

import { Languages, FlaskConical, Network, FileText, Database } from "lucide-react"
import { cn } from "@/lib/utils"

type MenuItem = "translator" | "reatFlow" | "doument" | "guestBook" | "dataTransform" | "testA" | "testB" | "testC"

interface SidebarProps {
  activeMenu: MenuItem
  onMenuClick: (menu: MenuItem) => void
}

const menuItems = [
  {
    id: "translator" as MenuItem,
    label: "번역/이미지",
    icon: Languages,
  },
  {
    id: "reatFlow" as MenuItem,
    label: "리액트플로우",
    icon: Network,
  },
  {
    id: "doument" as MenuItem,
    label: "문서요약",
    icon: FileText,
  },
  {
    id: "guestBook" as MenuItem,
    label: "방명록",
    icon: FlaskConical,
  },
  {
    id: "dataTransform" as MenuItem,
    label: "Data변환",
    icon: Database,
  },
  {
    id: "testA" as MenuItem,
    label: "테스트 A",
    icon: FlaskConical,
  },
  {
    id: "testB" as MenuItem,
    label: "테스트 B",
    icon: FlaskConical,
  },
  {
    id: "testC" as MenuItem,
    label: "테스트 C",
    icon: FlaskConical,
  },
]

export function Sidebar({ activeMenu, onMenuClick }: SidebarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-bold mb-4 px-2">메뉴</h2>

      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.id

          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
