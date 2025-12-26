/**
 * 캘린더 이벤트 타입 정의
 */

export interface CalendarEvent {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  start_time?: string // HH:MM
  end_time?: string // HH:MM
  created_at: string
  updated_at: string
}

export interface CalendarEventInsert {
  user_id: string
  date: string
  title: string
  description?: string
  start_time?: string
  end_time?: string
}

export interface CalendarEventUpdate {
  date?: string
  title?: string
  description?: string
  start_time?: string
  end_time?: string
}

/**
 * 클라이언트에서 사용하는 이벤트 타입 (공휴일 포함)
 */
export interface Event {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  start_time?: string // HH:MM
  end_time?: string // HH:MM
  isHoliday?: boolean // 공휴일 여부
}
