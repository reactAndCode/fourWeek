-- Supabase Vector DB 오류 수정 SQL
-- 이 파일의 내용을 Supabase SQL Editor에서 순서대로 실행하세요

-- =====================================================
-- 1단계: 기존 테이블 및 함수 삭제 (있다면)
-- =====================================================

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS match_document_chunks(vector, text, float, int);
DROP FUNCTION IF EXISTS match_document_chunks(text, uuid, int, float, vector);

-- 기존 테이블 삭제 (주의: 기존 데이터 삭제됨)
DROP TABLE IF EXISTS document_embeddings;

-- =====================================================
-- 2단계: pgvector 확장 활성화
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 3단계: document_embeddings 테이블 생성
-- =====================================================

CREATE TABLE document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 4단계: 인덱스 생성
-- =====================================================

-- 벡터 검색을 위한 ivfflat 인덱스
CREATE INDEX document_embeddings_embedding_idx
  ON document_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- document_id 검색을 위한 인덱스
CREATE INDEX document_embeddings_document_id_idx
  ON document_embeddings (document_id);

-- =====================================================
-- 5단계: RLS (Row Level Security) 정책
-- =====================================================

-- RLS 활성화
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용 (개발용)
CREATE POLICY "Allow public read access"
  ON document_embeddings
  FOR SELECT
  USING (true);

-- 모든 사용자 삽입 허용 (개발용)
CREATE POLICY "Allow public insert access"
  ON document_embeddings
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자 삭제 허용 (개발용)
CREATE POLICY "Allow public delete access"
  ON document_embeddings
  FOR DELETE
  USING (true);

-- =====================================================
-- 6단계: 유사도 검색 함수 생성
-- =====================================================

-- 정확한 파라미터 순서로 함수 생성
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding VECTOR(1536),
  filter_document_id TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
  chunk_index INTEGER,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.document_id,
    document_embeddings.chunk_index,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE document_embeddings.document_id = filter_document_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- 7단계: 설정 완료 확인
-- =====================================================

-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'document_embeddings'
) AS table_exists;

-- 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'document_embeddings'
ORDER BY ordinal_position;

-- 함수 존재 확인
SELECT proname, proargnames
FROM pg_proc
WHERE proname = 'match_document_chunks';

-- 완료 메시지
SELECT '✅ Supabase Vector DB 설정이 완료되었습니다!' AS status;
