"use client"

import { cn } from "@/lib/utils"

interface MemoTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  hasUnsavedChanges?: Record<string, boolean>
}

export function MemoTabs({ tabs, activeTab, onTabChange, hasUnsavedChanges = {} }: MemoTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              "border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            {tab}
            {hasUnsavedChanges[tab] && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
