# Supabase Vector DB 설정 가이드

Document GPT에서 Supabase Vector DB를 사용하기 위한 설정 가이드입니다.

## 1. Supabase SQL 설정

Supabase 대시보드의 SQL Editor에서 다음 SQL 명령어들을 **순서대로** 실행하세요:

### Step 1: pgvector 확장 활성화

```sql
-- pgvector 확장 활성화
create extension if not exists vector;
```

### Step 2: document_embeddings 테이블 생성

```sql
-- 문서 임베딩 테이블 생성
create table document_embeddings (
  id uuid default gen_random_uuid() primary key,
  document_id text not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536), -- OpenAI text-embedding-ada-002의 차원
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Step 3: 인덱스 생성 (성능 최적화)

```sql
-- 빠른 검색을 위한 인덱스 생성
create index on document_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- document_id로 필터링을 위한 인덱스
create index on document_embeddings (document_id);
```

### Step 4: RLS (Row Level Security) 정책 설정

```sql
-- RLS 활성화
alter table document_embeddings enable row level security;

-- 모든 사용자가 읽기 가능 (필요에 따라 조정)
create policy "Allow public read access"
  on document_embeddings for select
  using (true);

-- 모든 사용자가 삽입 가능 (필요에 따라 조정)
create policy "Allow public insert access"
  on document_embeddings for insert
  with check (true);
```

> **보안 참고**: 위 정책은 개발/테스트용입니다. 프로덕션에서는 `auth.uid()`를 사용하여 사용자별로 제한하세요.

### Step 5: 유사도 검색 함수 생성

```sql
-- 코사인 유사도 기반 검색 함수
create or replace function match_document_chunks(
  query_embedding vector(1536),
  filter_document_id text,
  match_threshold float default 0.7,
  match_count int default 4
)
returns table (
  id uuid,
  document_id text,
  chunk_index integer,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.document_id,
    document_embeddings.chunk_index,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where document_embeddings.document_id = filter_document_id
    and 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## 2. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
```

## 3. 사용 방법

### UI에서 모델 선택

Document GPT 페이지에서 세 가지 모드 중 하나를 선택할 수 있습니다:

1. **Chat (기본)**: 전체 문서를 컨텍스트로 사용 (기존 방식)
   - 장점: 간단하고 빠름
   - 단점: 문서가 길면 토큰 제한에 걸림 (3000자 제한)

2. **벡터 임베딩 (메모리)**: LangChain의 메모리 벡터 스토어 사용
   - 장점: 추가 설정 불필요
   - 단점: 서버 재시작 시 데이터 손실

3. **Supabase Vector**: Supabase pgvector 사용 (권장)
   - 장점: 영구 저장, 대용량 문서 지원, 빠른 검색
   - 단점: Supabase 설정 필요

### 문서 업로드 및 질문

1. 모델 방식을 **"Supabase Vector"**로 선택
2. TXT 파일 선택 (PDF는 메타데이터만 추출)
3. "업로드 및 분석" 버튼 클릭
4. 문서가 자동으로 청크로 분할되고 임베딩이 Supabase에 저장됩니다
5. 채팅 인터페이스에서 문서에 대한 질문 입력

## 4. 작동 원리

### 임베딩 생성 과정

1. **텍스트 분할**: `lib/utils/text-splitter.ts` 사용
   - 500단어 청크로 분할
   - 50단어 오버랩으로 문맥 유지

2. **임베딩 생성**: OpenAI `text-embedding-ada-002` 모델 사용
   - 각 청크를 1536차원 벡터로 변환
   - Supabase `document_embeddings` 테이블에 저장

3. **인덱스 구축**: Supabase가 자동으로 ivfflat 인덱스 업데이트

### 질문 응답 과정

1. **질문 임베딩**: 사용자 질문을 벡터로 변환

2. **유사도 검색**: `match_document_chunks()` 함수 호출
   - 코사인 유사도 계산
   - 유사도 0.7 이상인 상위 4개 청크 반환

3. **컨텍스트 구성**: 검색된 청크를 컨텍스트로 결합

4. **GPT 답변 생성**: GPT-3.5-turbo로 답변 생성

## 5. 비용 및 성능

### OpenAI API 비용

- **임베딩 생성**: $0.10 / 1M tokens
- **GPT 답변 (입력)**: $0.50 / 1M tokens
- **GPT 답변 (출력)**: $1.50 / 1M tokens

### 예상 비용 예시

- 10,000자 문서 업로드:
  - 약 20개 청크 생성
  - 임베딩 비용: ~$0.0005

- 질문 1회:
  - 질문 임베딩: ~$0.00001
  - GPT 답변: ~$0.001
  - 총: ~$0.00101

### Supabase 용량

- **무료 플랜**: 500MB 데이터베이스
- **예상 수용량**: 약 65,000개 벡터 (300-1,000개 문서)

### 성능

- **임베딩 생성**: 20개 청크 기준 약 5-10초
- **유사도 검색**: 100ms 이하 (ivfflat 인덱스 사용)
- **전체 질문 응답**: 약 2-3초

## 6. 데이터 관리

### 저장된 임베딩 확인

```sql
-- 문서별 청크 수 확인
select document_id, count(*) as chunk_count
from document_embeddings
group by document_id
order by created_at desc;

-- 특정 문서의 청크 조회
select chunk_index, left(content, 100) as preview
from document_embeddings
where document_id = 'doc_xxx'
order by chunk_index;
```

### 용량 확인

```sql
-- 테이블 크기 확인
select
  pg_size_pretty(pg_total_relation_size('document_embeddings')) as total_size,
  count(*) as total_chunks
from document_embeddings;
```

### 데이터 삭제

```sql
-- 특정 문서 삭제
delete from document_embeddings
where document_id = 'doc_xxx';

-- 전체 데이터 삭제 (주의!)
truncate table document_embeddings;
```

## 7. 트러블슈팅

### "pgvector extension not found" 오류

- SQL Editor에서 `create extension vector;` 실행했는지 확인

### "match_document_chunks function does not exist" 오류

- Step 5의 함수 생성 SQL을 실행했는지 확인

### "관련 청크를 찾지 못했습니다" 메시지

- `match_threshold`를 낮춰보세요 (예: 0.5)
- 질문을 더 구체적으로 다시 작성해보세요

### 임베딩 생성이 너무 느림

- 문서를 더 작은 파일로 분할하세요
- OpenAI API 속도 제한을 확인하세요

## 8. 향후 개선 사항

- [ ] 사용자별 문서 격리 (RLS 정책 개선)
- [ ] 문서 삭제 UI 추가
- [ ] 여러 문서 동시 검색 기능
- [ ] 임베딩 모델 선택 옵션 (ada-002, text-embedding-3-small 등)
- [ ] 청크 크기 및 오버랩 커스터마이징
- [ ] 검색 결과 하이라이팅
- [ ] 문서 메타데이터 (제목, 태그) 추가

## 참고 자료

- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
