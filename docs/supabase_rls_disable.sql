-- ============================================
-- 테스트용 RLS 비활성화 (개발 환경에서만 사용)
-- ============================================

-- 경고: 프로덕션 환경에서는 절대 사용하지 마세요!
-- 이 설정은 모든 사용자가 모든 데이터를 읽고 쓸 수 있게 합니다.

-- RLS 정책 임시 비활성화
ALTER TABLE my_memo DISABLE ROW LEVEL SECURITY;

-- 또는 모든 사용자에게 권한을 주는 정책 추가
DROP POLICY IF EXISTS "임시_모든사용자_접근허용" ON my_memo;
CREATE POLICY "임시_모든사용자_접근허용"
  ON my_memo
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 테스트 완료 후 다시 활성화하는 방법
-- ============================================

-- RLS 다시 활성화
-- ALTER TABLE my_memo ENABLE ROW LEVEL SECURITY;

-- 임시 정책 삭제
-- DROP POLICY IF EXISTS "임시_모든사용자_접근허용" ON my_memo;
