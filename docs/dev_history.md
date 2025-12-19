# 개발 이력

## 2024-12-19

### 데이터 변환 도구 추가 (4가지 변환 기능)

#### 새로운 기능
- **Data변환 메뉴 추가**
  - 나의유틸 좌측 메뉴에 "Data변환" 메뉴 추가
  - Database 아이콘 사용
  - 4개의 탭으로 구성된 변환 도구 제공

#### 1. IN절 생성기
- 값 목록을 SQL IN 구문으로 변환
- 고급 옵션 (접었다 펼치기 가능)
  - 문자열 감싸기: 단일따옴표/쌍따옴표/없음
  - 구분자: 쉼표+공백/쉼표/공백
  - 템플릿: 괄호/대괄호/중괄호/없음
  - 접두사/접미사 추가
  - 줄바꿈 제어
- 옵션
  - 중복 제거 (기본 활성화)
  - 오름차순 정렬
  - 빈 값 무시 (기본 활성화)
- 결과 복사 기능
- 통계 표시 (원본 개수/최종 개수)

#### 2. 값 비교 도구
- A/B 두 값 목록 비교 기능
- 비교 결과
  - 공통 값 (A ∩ B)
  - A에만 있는 값 (A - B)
  - B에만 있는 값 (B - A)
  - 전체 유니크 값 (A ∪ B)
- 옵션
  - 중복 제거 (기본 활성화)
  - 오름차순 정렬 (기본 활성화)
  - 앞뒤 공백 제거 (기본 활성화)
- A ↔ B 교환 기능
- 줄바꿈/쉼표/공백 구분 지원

#### 3. JSON 비교
- JSON A와 B의 차이점 비교
- 결과 요약
  - 동일/다름 표시
  - 차이 개수 및 옵션 상태 표시
- Diff (경로 기준)
  - 경로 표기: [$.a], [$.b.c] 등
  - 변경 타입: value, added, removed
  - 예: [$.a] 1 → 2 (value)
- 옵션
  - 키 정렬(알파벳 비교) (기본 활성화)
  - 배열 순서 무시(값 set 비교)
  - 문자열 앞뒤 공백 trim (기본 활성화)
- 기능
  - A/B 포맷(정렬+들여쓰기)
  - A ↔ B 교환
  - Diff 복사
- 브라우저에서만 처리 (서버 전송 없음)

#### 4. INSERT문 생성
- Excel 데이터를 SQL INSERT 문으로 변환
- 설정
  - 테이블명 입력
  - INSERT 모드: 행마다 한 줄씩/한 번에 여러 행
  - 행 구분: 줄바꿈/커스텀
- 입력
  - 컬럼 목록 (줄바꿈 또는 쉼표 구분)
  - Excel 데이터 (탭 또는 쉼표 구분)
- 옵션 (모두 기본 활성화)
  - INSERT 문에 컬럼명 포함
  - 숫자는 따옴표 없이 사용
  - 빈 값은 NULL 처리
  - 셀 앞뒤 공백 제거
  - 문장 끝에 세미콜론(;) 추가
- 작은따옴표 자동 이스케이프
- 통계 표시 (행 수/컬럼 수)

#### 기술적 변경사항
- **새 파일 생성**
  - `components/myutils/data-transform.tsx` - 메인 데이터 변환 컴포넌트 (탭 구조)
  - `components/myutils/value-compare.tsx` - 값 비교 도구
  - `components/myutils/json-compare.tsx` - JSON 비교
  - `components/myutils/insert-generator.tsx` - INSERT문 생성기
  - `components/ui/checkbox.tsx` - Checkbox UI 컴포넌트
  - `components/ui/label.tsx` - Label UI 컴포넌트
  - `components/ui/select.tsx` - Select UI 컴포넌트

- **수정된 파일**
  - `components/myutils/sidebar.tsx` - Data변환 메뉴 추가
  - `app/myutils/page.tsx` - DataTransform 컴포넌트 연결
  - `.claude/settings.local.json` - Claude Code 설정 업데이트

#### 커밋 정보
- 커밋 해시: 7dd5fb9
- 변경 파일: 11개
- 추가된 코드: 1,550줄
