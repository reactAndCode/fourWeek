-- ============================================
-- Weekly Log 프로젝트 - Supabase 데이터베이스 설정
-- ============================================

-- 현재 사용자 ID: 904f05e3-43cd-446b-838e-3ef1d53a38ce

-- ============================================
-- 1. my_weeklog 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS my_weeklog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  work_date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0 CHECK (total_minutes >= 0),
  status TEXT DEFAULT 'empty' CHECK (status IN ('draft', 'completed', 'empty')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- 한 사용자는 하루에 하나의 일지만 작성
  CONSTRAINT unique_user_date UNIQUE (user_id, work_date)
);

-- my_weeklog 인덱스
CREATE INDEX IF NOT EXISTS idx_my_weeklog_user_date
  ON my_weeklog(user_id, work_date DESC);

-- my_weeklog 코멘트
COMMENT ON TABLE my_weeklog IS '주간 작업일지 메인 테이블';
COMMENT ON COLUMN my_weeklog.work_date IS '작업 날짜';
COMMENT ON COLUMN my_weeklog.total_minutes IS '총 작업 시간(분)';
COMMENT ON COLUMN my_weeklog.status IS '작성 상태: draft(임시저장), completed(작성완료), empty(일지없음)';

-- ============================================
-- 2. my_weeklog_task 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS my_weeklog_task (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weeklog_id UUID REFERENCES my_weeklog(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  minutes INTEGER DEFAULT 0 CHECK (minutes >= 0),
  category TEXT NOT NULL CHECK (category IN ('design', 'planning', 'development', 'analysis')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- my_weeklog_task 인덱스
CREATE INDEX IF NOT EXISTS idx_my_weeklog_task_weeklog
  ON my_weeklog_task(weeklog_id, sort_order);

-- my_weeklog_task 코멘트
COMMENT ON TABLE my_weeklog_task IS '작업 일지의 개별 작업 항목';
COMMENT ON COLUMN my_weeklog_task.description IS '작업 설명';
COMMENT ON COLUMN my_weeklog_task.minutes IS '작업 소요 시간(분)';
COMMENT ON COLUMN my_weeklog_task.category IS '작업 카테고리: design(디자인), planning(기획), development(개발), analysis(분석)';
COMMENT ON COLUMN my_weeklog_task.tags IS '작업 태그 배열';
COMMENT ON COLUMN my_weeklog_task.sort_order IS '작업 표시 순서';

-- ============================================
-- 3. my_memo 테이블 생성 (탭 기반)
-- ============================================
DROP TABLE IF EXISTS my_memo CASCADE;

CREATE TABLE my_memo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tab_name TEXT NOT NULL DEFAULT 'Tab 1',
  title TEXT NOT NULL DEFAULT '제목 없음',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- 한 사용자는 각 탭에 하나의 메모만 작성
  CONSTRAINT unique_user_tab UNIQUE (user_id, tab_name)
);

-- my_memo 인덱스
CREATE INDEX idx_my_memo_user_tab
  ON my_memo(user_id, tab_name);

CREATE INDEX idx_my_memo_user_created
  ON my_memo(user_id, created_at DESC);

-- my_memo 코멘트
COMMENT ON TABLE my_memo IS '탭 기반 메모 테이블';
COMMENT ON COLUMN my_memo.tab_name IS '탭 이름 (Tab 1, Tab 2, ...)';
COMMENT ON COLUMN my_memo.title IS '메모 제목';
COMMENT ON COLUMN my_memo.content IS '메모 내용 (Markdown)';
COMMENT ON COLUMN my_memo.tags IS '메모 태그 배열';
COMMENT ON COLUMN my_memo.is_pinned IS '상단 고정 여부';

-- ============================================
-- 4. Row Level Security (RLS) 정책
-- ============================================

-- my_weeklog RLS
ALTER TABLE my_weeklog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "사용자는 자신의 주간일지를 조회할 수 있습니다" ON my_weeklog;
CREATE POLICY "사용자는 자신의 주간일지를 조회할 수 있습니다"
  ON my_weeklog FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 주간일지를 생성할 수 있습니다" ON my_weeklog;
CREATE POLICY "사용자는 자신의 주간일지를 생성할 수 있습니다"
  ON my_weeklog FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 주간일지를 수정할 수 있습니다" ON my_weeklog;
CREATE POLICY "사용자는 자신의 주간일지를 수정할 수 있습니다"
  ON my_weeklog FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 주간일지를 삭제할 수 있습니다" ON my_weeklog;
CREATE POLICY "사용자는 자신의 주간일지를 삭제할 수 있습니다"
  ON my_weeklog FOR DELETE
  USING (auth.uid() = user_id);

-- my_weeklog_task RLS
ALTER TABLE my_weeklog_task ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "사용자는 자신의 작업을 조회할 수 있습니다" ON my_weeklog_task;
CREATE POLICY "사용자는 자신의 작업을 조회할 수 있습니다"
  ON my_weeklog_task FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM my_weeklog
    WHERE my_weeklog.id = my_weeklog_task.weeklog_id
    AND my_weeklog.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "사용자는 자신의 작업을 생성할 수 있습니다" ON my_weeklog_task;
CREATE POLICY "사용자는 자신의 작업을 생성할 수 있습니다"
  ON my_weeklog_task FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM my_weeklog
    WHERE my_weeklog.id = my_weeklog_task.weeklog_id
    AND my_weeklog.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "사용자는 자신의 작업을 수정할 수 있습니다" ON my_weeklog_task;
CREATE POLICY "사용자는 자신의 작업을 수정할 수 있습니다"
  ON my_weeklog_task FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM my_weeklog
    WHERE my_weeklog.id = my_weeklog_task.weeklog_id
    AND my_weeklog.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "사용자는 자신의 작업을 삭제할 수 있습니다" ON my_weeklog_task;
CREATE POLICY "사용자는 자신의 작업을 삭제할 수 있습니다"
  ON my_weeklog_task FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM my_weeklog
    WHERE my_weeklog.id = my_weeklog_task.weeklog_id
    AND my_weeklog.user_id = auth.uid()
  ));

-- my_memo RLS
ALTER TABLE my_memo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "사용자는 자신의 메모를 조회할 수 있습니다" ON my_memo;
CREATE POLICY "사용자는 자신의 메모를 조회할 수 있습니다"
  ON my_memo FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 메모를 생성할 수 있습니다" ON my_memo;
CREATE POLICY "사용자는 자신의 메모를 생성할 수 있습니다"
  ON my_memo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 메모를 수정할 수 있습니다" ON my_memo;
CREATE POLICY "사용자는 자신의 메모를 수정할 수 있습니다"
  ON my_memo FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "사용자는 자신의 메모를 삭제할 수 있습니다" ON my_memo;
CREATE POLICY "사용자는 자신의 메모를 삭제할 수 있습니다"
  ON my_memo FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. 트리거 함수
-- ============================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- my_weeklog 트리거
DROP TRIGGER IF EXISTS update_my_weeklog_updated_at ON my_weeklog;
CREATE TRIGGER update_my_weeklog_updated_at
  BEFORE UPDATE ON my_weeklog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- my_memo 트리거
DROP TRIGGER IF EXISTS update_my_memo_updated_at ON my_memo;
CREATE TRIGGER update_my_memo_updated_at
  BEFORE UPDATE ON my_memo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- total_minutes 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_weeklog_total_minutes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE my_weeklog
  SET total_minutes = (
    SELECT COALESCE(SUM(minutes), 0)
    FROM my_weeklog_task
    WHERE weeklog_id = COALESCE(NEW.weeklog_id, OLD.weeklog_id)
  )
  WHERE id = COALESCE(NEW.weeklog_id, OLD.weeklog_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- task 생성/수정/삭제 시 total_minutes 자동 계산
DROP TRIGGER IF EXISTS update_weeklog_total_minutes ON my_weeklog_task;
CREATE TRIGGER update_weeklog_total_minutes
  AFTER INSERT OR UPDATE OR DELETE ON my_weeklog_task
  FOR EACH ROW
  EXECUTE FUNCTION calculate_weeklog_total_minutes();

-- ============================================
-- 6. 초기 데이터 생성
-- ============================================

-- 메모 탭 10개 초기화
INSERT INTO my_memo (user_id, tab_name, title, content)
VALUES
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 1', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 2', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 3', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 4', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 5', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 6', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 7', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 8', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 9', '제목 없음', ''),
  ('904f05e3-43cd-446b-838e-3ef1d53a38ce', 'Tab 10', '제목 없음', '')
ON CONFLICT (user_id, tab_name) DO NOTHING;

-- ============================================
-- 완료!
-- ============================================
-- 위 스크립트를 Supabase SQL Editor에서 실행하세요.
-- 테이블 생성, RLS 정책, 트리거, 초기 데이터가 모두 설정됩니다.
