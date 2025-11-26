import { supabase } from '@/lib/db/supabase'
import { Database } from '@/types/database.types'

type Worklog = Database['public']['Tables']['my_weeklog']['Row']
type WorklogInsert = Database['public']['Tables']['my_weeklog']['Insert']
type WorklogUpdate = Database['public']['Tables']['my_weeklog']['Update']

/**
 * 특정 날짜의 작업일지 조회
 */
export async function getWorklogByDate(userId: string, date: Date) {
  const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD 형식

  const { data, error } = await supabase
    .from('my_weeklog')
    .select('*')
    .eq('user_id', userId)
    .eq('work_date', dateString)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116: 데이터 없음 에러는 무시
    throw error
  }

  return data
}

/**
 * 작업일지 저장 (upsert)
 */
export async function upsertWorklog(
  userId: string,
  date: Date,
  content: string,
  status: 'draft' | 'completed' | 'empty' = 'completed'
) {
  const dateString = date.toISOString().split('T')[0]

  // content를 tasks 형식으로 변환
  const tasks = content ? [{
    id: Date.now().toString(),
    description: content,
    minutes: 0,
    tags: [],
    category: 'development' as const
  }] : []

  const { data, error } = await supabase
    .from('my_weeklog')
    .upsert({
      user_id: userId,
      work_date: dateString,
      status,
      total_minutes: 0,
    }, {
      onConflict: 'user_id,work_date',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 작업일지 삭제
 */
export async function deleteWorklog(id: string) {
  const { error } = await supabase
    .from('my_weeklog')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * 주간 작업일지 조회 (7일)
 */
export async function getWeekWorklogs(userId: string, startDate: Date) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const startDateString = startDate.toISOString().split('T')[0]
  const endDateString = endDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('my_weeklog')
    .select('*')
    .eq('user_id', userId)
    .gte('work_date', startDateString)
    .lte('work_date', endDateString)
    .order('work_date')

  if (error) throw error
  return data || []
}

/**
 * 참고 정보 저장 (메모 테이블 사용)
 */
export async function saveReferenceInfo(
  userId: string,
  date: Date,
  tabName: string,
  content: string
) {
  const dateString = date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('my_memo')
    .upsert({
      user_id: userId,
      tab_name: `${dateString}-${tabName}`, // 날짜별 메모 구분
      title: tabName,
      content,
    }, {
      onConflict: 'user_id,tab_name',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 참고 정보 조회
 */
export async function getReferenceInfo(userId: string, date: Date, tabName: string) {
  const dateString = date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('my_memo')
    .select('*')
    .eq('user_id', userId)
    .eq('tab_name', `${dateString}-${tabName}`)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}
