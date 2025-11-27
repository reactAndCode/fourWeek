import { supabase } from '@/lib/db/supabase'
import { Database } from '@/types/database.types'

type Memo = Database['public']['Tables']['my_memo']['Row']
type MemoInsert = Database['public']['Tables']['my_memo']['Insert']
type MemoUpdate = Database['public']['Tables']['my_memo']['Update']

/**
 * 특정 탭의 메모 조회
 */
export async function getMemoByTab(userId: string, tabName: string) {
  const { data, error } = await supabase
    .from('my_memo')
    .select('*')
    .eq('user_id', userId)
    .eq('tab_name', tabName)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116: 데이터 없음 에러는 무시
    throw error
  }

  return data
}

/**
 * 모든 탭의 메모 조회
 */
export async function getAllMemos(userId: string) {
  const { data, error } = await supabase
    .from('my_memo')
    .select('*')
    .eq('user_id', userId)
    .order('tab_name')

  if (error) throw error
  return data || []
}

/**
 * 메모 생성
 */
export async function createMemo(memo: MemoInsert) {
  const { data, error } = await supabase
    .from('my_memo')
    .insert(memo)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 메모 수정 (upsert)
 */
export async function upsertMemo(userId: string, tabName: string, title: string, content: string, tags?: string[]) {
  console.log('upsertMemo 호출:', { userId, tabName, title: title.substring(0, 20), contentLength: content.length })

  // 1. 기존 메모 확인
  const { data: existing } = await supabase
    .from('my_memo')
    .select('id')
    .eq('user_id', userId)
    .eq('tab_name', tabName)
    .maybeSingle()

  console.log('기존 메모:', existing)

  if (existing) {
    // 2-1. 기존 메모 업데이트
    const { data, error } = await supabase
      .from('my_memo')
      .update({
        title,
        content,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    console.log('업데이트 결과:', { data, error })
    if (error) {
      console.error('업데이트 에러 상세:', JSON.stringify(error, null, 2))
      throw error
    }
    return data
  } else {
    // 2-2. 새 메모 생성
    const { data, error } = await supabase
      .from('my_memo')
      .insert({
        user_id: userId,
        tab_name: tabName,
        title,
        content,
        tags: tags || [],
      })
      .select()
      .single()

    console.log('삽입 결과:', { data, error })
    if (error) {
      console.error('삽입 에러 상세:', JSON.stringify(error, null, 2))
      throw error
    }
    return data
  }
}

/**
 * 메모 삭제
 */
export async function deleteMemo(id: string) {
  const { error } = await supabase
    .from('my_memo')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * 사용자의 모든 탭 초기화 (10개 탭)
 */
export async function initializeUserTabs(userId: string) {
  const tabs = Array.from({ length: 10 }, (_, i) => `Tab ${i + 1}`)

  const memos: MemoInsert[] = tabs.map(tab => ({
    user_id: userId,
    tab_name: tab,
    title: '제목 없음',
    content: '',
  }))

  // upsert로 기존 탭은 유지
  const { data, error } = await supabase
    .from('my_memo')
    .upsert(memos, {
      onConflict: 'user_id,tab_name',
      ignoreDuplicates: true,
    })
    .select()

  if (error) throw error
  return data
}
