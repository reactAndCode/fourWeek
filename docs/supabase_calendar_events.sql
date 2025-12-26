-- ============================================
-- 캘린더 일정 테이블 생성 스크립트
-- ============================================
-- 생성일: 2025-12-26
-- 설명: 사용자별 캘린더 일정을 저장하는 테이블
-- ============================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, date);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 조회 정책: 사용자는 자신의 일정만 조회 가능
CREATE POLICY IF NOT EXISTS "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

-- 삽입 정책: 사용자는 자신의 일정만 생성 가능
CREATE POLICY IF NOT EXISTS "Users can insert their own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 수정 정책: 사용자는 자신의 일정만 수정 가능
CREATE POLICY IF NOT EXISTS "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

-- 삭제 정책: 사용자는 자신의 일정만 삭제 가능
CREATE POLICY IF NOT EXISTS "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- 5. updated_at 자동 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성 (UPDATE 시 updated_at 자동 갱신)
DROP TRIGGER IF EXISTS set_updated_at ON calendar_events;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- ============================================
-- 테이블 구조
-- ============================================
-- id          : UUID - 일정 고유 ID (자동 생성)
-- user_id     : UUID - 사용자 ID (auth.users 참조)
-- date        : DATE - 일정 날짜 (YYYY-MM-DD)
-- title       : TEXT - 일정 제목
-- description : TEXT - 일정 상세 정보
-- start_time  : TIME - 시작 시간 (HH:MM:SS) - 선택적
-- end_time    : TIME - 종료 시간 (HH:MM:SS) - 선택적
-- created_at  : TIMESTAMP - 생성 시간 (자동)
-- updated_at  : TIMESTAMP - 수정 시간 (자동 업데이트)
-- ============================================

-- ============================================
-- 사용 방법
-- ============================================
-- 1. Supabase Dashboard 접속
-- 2. 좌측 메뉴에서 SQL Editor 클릭
-- 3. 이 스크립트 전체를 복사해서 붙여넣기
-- 4. Run 버튼 클릭
-- ============================================
