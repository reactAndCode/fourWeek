import { supabase } from '@/lib/db/supabase'
import { CalendarEventInsert, CalendarEventUpdate } from '@/types/calendar.types'

/**
 * 특정 월의 캘린더 이벤트 조회
 */
export async function getCalendarEventsByMonth(userId: string, year: number, month: number) {
  // 해당 월의 첫날과 마지막날
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = new Date(year, month + 1, 0) // 다음 달 0일 = 이번 달 마지막 날
  const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDateStr)
    .order('date')

  if (error) throw error
  return data || []
}

/**
 * 특정 년도의 모든 캘린더 이벤트 조회 (년도별 조회)
 */
export async function getCalendarEventsByYear(userId: string, year: number) {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw error
  return data || []
}

/**
 * 모든 캘린더 이벤트 조회
 */
export async function getAllCalendarEvents(userId: string) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('date')

  if (error) throw error
  return data || []
}

/**
 * 캘린더 이벤트 생성
 */
export async function createCalendarEvent(event: CalendarEventInsert) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 캘린더 이벤트 수정
 */
export async function updateCalendarEvent(eventId: string, updates: CalendarEventUpdate) {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 캘린더 이벤트 삭제
 */
export async function deleteCalendarEvent(eventId: string) {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)

  if (error) throw error
}

/**
 * 특정 날짜의 캘린더 이벤트 조회
 */
export async function getCalendarEventsByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at')

  if (error) throw error
  return data || []
}
