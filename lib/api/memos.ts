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
  const { data, error } = await supabase
    .from('my_memo')
    .upsert({
      user_id: userId,
      tab_name: tabName,
      title,
      content,
      tags: tags || [],
    }, {
      onConflict: 'user_id,tab_name',
    })
    .select()
    .single()

  if (error) throw error
  return data
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
