import { supabase } from '@/lib/db/supabase'
import { Database } from '@/types/database.types'

type Worklog = Database['public']['Tables']['my_weeklog']['Row']
type WorklogInsert = Database['public']['Tables']['my_weeklog']['Insert']
type WorklogUpdate = Database['public']['Tables']['my_weeklog']['Update']

/**
 * 특정 날짜의 작업일지 조회 (tasks 포함)
 */
export async function getWorklogByDate(userId: string, date: Date) {
  const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD 형식

  // 1. 작업일지 조회
  const { data: worklog, error: worklogError } = await supabase
    .from('my_weeklog')
    .select('*')
    .eq('user_id', userId)
    .eq('work_date', dateString)
    .single()

  if (worklogError && worklogError.code !== 'PGRST116') {
    // PGRST116: 데이터 없음 에러는 무시
    throw worklogError
  }

  if (!worklog) {
    return null
  }

  // 2. 해당 작업일지의 tasks 조회
  const { data: tasks, error: tasksError } = await supabase
    .from('my_weeklog_task')
    .select('*')
    .eq('weeklog_id', worklog.id)
    .order('sort_order')

  if (tasksError) {
    throw tasksError
  }

  // 3. worklog에 tasks 추가하여 반환
  return {
    ...worklog,
    tasks: tasks || []
  }
}

/**
 * 작업일지 저장 (upsert) - my_weeklog와 my_weeklog_task 테이블에 저장
 */
export async function upsertWorklog(
  userId: string,
  date: Date,
  content: string,
  status: 'draft' | 'completed' | 'empty' = 'completed'
) {
  const dateString = date.toISOString().split('T')[0]

  // 1. 기존 작업일지 조회
  const { data: existingWorklog } = await supabase
    .from('my_weeklog')
    .select('id')
    .eq('user_id', userId)
    .eq('work_date', dateString)
    .single()

  let worklogId: string

  if (existingWorklog) {
    // 2-1. 기존 작업일지가 있으면 업데이트
    const { data, error } = await supabase
      .from('my_weeklog')
      .update({
        status,
        total_minutes: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingWorklog.id)
      .select()
      .single()

    if (error) throw error
    worklogId = data.id

    // 2-2. 기존 tasks 삭제
    await supabase
      .from('my_weeklog_task')
      .delete()
      .eq('weeklog_id', worklogId)
  } else {
    // 2-3. 새 작업일지 생성
    const { data, error } = await supabase
      .from('my_weeklog')
      .insert({
        user_id: userId,
        work_date: dateString,
        status,
        total_minutes: 0,
      })
      .select()
      .single()

    if (error) throw error
    worklogId = data.id
  }

  // 3. 새 task 저장 (content가 있을 경우에만)
  if (content && content.trim()) {
    const { error: taskError } = await supabase
      .from('my_weeklog_task')
      .insert({
        weeklog_id: worklogId,
        description: content,
        minutes: 0,
        category: 'development',
        tags: [],
        sort_order: 0
      })

    if (taskError) throw taskError
  }

  // 4. 저장된 작업일지 반환 (tasks 포함)
  return getWorklogByDate(userId, date)
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
 * 주간 작업일지 조회 (7일) - tasks 포함
 */
export async function getWeekWorklogs(userId: string, startDate: Date) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const startDateString = startDate.toISOString().split('T')[0]
  const endDateString = endDate.toISOString().split('T')[0]

  // 1. 작업일지 목록 조회
  const { data: worklogs, error: worklogsError } = await supabase
    .from('my_weeklog')
    .select('*')
    .eq('user_id', userId)
    .gte('work_date', startDateString)
    .lte('work_date', endDateString)
    .order('work_date')

  if (worklogsError) throw worklogsError

  if (!worklogs || worklogs.length === 0) {
    return []
  }

  // 2. 모든 worklog의 id 수집
  const worklogIds = worklogs.map(w => w.id)

  // 3. 해당 작업일지들의 모든 tasks 조회
  const { data: tasks, error: tasksError } = await supabase
    .from('my_weeklog_task')
    .select('*')
    .in('weeklog_id', worklogIds)
    .order('sort_order')

  if (tasksError) throw tasksError

  // 4. 각 worklog에 해당하는 tasks 매핑
  const worklogsWithTasks = worklogs.map(worklog => ({
    ...worklog,
    tasks: tasks?.filter(task => task.weeklog_id === worklog.id) || []
  }))

  return worklogsWithTasks
}

/**
 * 참고 정보 저장 (메모 테이블 사용) - 날짜별 메모 구분
 */
export async function saveReferenceInfo(
  userId: string,
  date: Date,
  tabName: string,
  content: string
) {
  const dateString = date.toISOString().split('T')[0]
  const fullTabName = `${dateString}-${tabName}`

  console.log('참고 정보 저장 시작:', { userId, dateString, tabName, fullTabName, contentLength: content.length })

  // 1. 기존 메모 확인
  const { data: existing } = await supabase
    .from('my_memo')
    .select('id')
    .eq('user_id', userId)
    .eq('tab_name', fullTabName)
    .maybeSingle()

  console.log('기존 메모 확인:', existing)

  if (existing) {
    // 2-1. 기존 메모 업데이트
    const { data, error } = await supabase
      .from('my_memo')
      .update({
        title: tabName,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('참고 정보 업데이트 실패:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('참고 정보 업데이트 성공:', data)
    return data
  } else {
    // 2-2. 새 메모 생성
    const { data, error } = await supabase
      .from('my_memo')
      .insert({
        user_id: userId,
        tab_name: fullTabName,
        title: tabName,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error('참고 정보 삽입 실패:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('참고 정보 삽입 성공:', data)
    return data
  }
}

/**
 * 참고 정보 조회 - 날짜별 메모 구분
 */
export async function getReferenceInfo(userId: string, date: Date, tabName: string) {
  const dateString = date.toISOString().split('T')[0]
  const fullTabName = `${dateString}-${tabName}`

  console.log('참고 정보 조회 시작:', { userId, dateString, tabName, fullTabName })

  const { data, error } = await supabase
    .from('my_memo')
    .select('*')
    .eq('user_id', userId)
    .eq('tab_name', fullTabName)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('참고 정보 조회 실패:', error)
    throw error
  }

  console.log('참고 정보 조회 결과:', data ? '데이터 있음' : '데이터 없음', data)
  return data
}
