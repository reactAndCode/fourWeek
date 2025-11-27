import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '없음')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 초기화 확인
console.log('Supabase 클라이언트 초기화됨:', {
  url: supabaseUrl ? '설정됨' : '없음',
  key: supabaseAnonKey ? '설정됨' : '없음'
})
