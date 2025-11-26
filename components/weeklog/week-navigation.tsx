"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WeekNavigationProps {
  currentWeek: string
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function WeekNavigation({
  currentWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
}: WeekNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          오늘
        </Button>
      </div>
      <div className="text-xl font-semibold">{currentWeek}</div>
    </div>
  )
}
