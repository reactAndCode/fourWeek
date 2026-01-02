# 개발 이력

## 2026-01-02

### 신년운세 기능 추가 (탭 UI: 신년운세 / 오늘의운세)

#### 새로운 기능
- **신년운세 메뉴 추가**
  - 나의유틸 좌측 메뉴에 "신년운세" 메뉴 추가 (캘린더 아래)
  - Sparkles 아이콘 사용
  - 탭 UI로 신년운세와 오늘의운세 제공

#### 1. 신년운세 기능
- **입력 폼**
  - 이름, 생년월일, 태어난 시각, 이메일 (4개 컬럼 한 줄 배치)
  - 기본값 설정: 윤상민, 1974-08-03, 13:30, yoon.lion@gmail.com
  - 입력값 유지 (탭 전환 시에도 유지)

- **운세 내용**
  - 종합운, 애정운, 직업운, 재물운, 건강운
  - 행운의 색상 및 숫자
  - 한마디 조언
  - 생년월일과 태어난 시각 기반 개인화

- **간지(干支) 계산**
  - 천간(天干) 10개: 갑, 을, 병, 정, 무, 기, 경, 신, 임, 계
  - 지지(地支) 12개: 자, 축, 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해
  - 오행 색상 계산: 푸른, 붉은, 노란, 흰, 검은
  - 2026년 = 병오년 붉은 말의 해 (자동 계산)

- **이메일 전송 기능**
  - Resend API 통합 (@resend 패키지)
  - HTML 이메일 템플릿 (그라데이션, 섹션별 카드)
  - 환경변수: RESEND_API_KEY, RESEND_FROM_EMAIL
  - 도메인 인증 시 누구에게나 전송 가능
  - 무료 티어 제한: onboarding@resend.dev는 본인 이메일만

#### 2. 오늘의운세 기능
- **입력 정보 공유**
  - 신년운세에서 입력한 정보 그대로 사용
  - 이메일 필드 불필요 (오늘의운세는 이메일 전송 없음)

- **운세 내용**
  - 오늘의 날짜 표시 (한국어 형식)
  - 오늘의 종합운
  - 행운의 시간 (오전/오후/저녁 구분)
  - 주의할 점 (재정/감정/건강 등)
  - 행운의 시간대 (예: 14:00-16:00)
  - 행운의 아이템 (파란색 볼펜, 노트, 커피, 식물, 책)
  - 오늘의 한마디

- **생성 로직**
  - 생년월일, 태어난 시각 기반
  - 오늘 요일, 월, 일 조합으로 다양한 운세 생성
  - 주말/평일 구분 조언

#### 3. UI/UX
- **Tabs 컴포넌트** (@radix-ui/react-tabs)
  - 신년운세 탭 (Sparkles 아이콘, 노란색/주황색 테마)
  - 오늘의운세 탭 (Sun 아이콘, 파란색/인디고 테마)

- **카드 디자인**
  - 신년운세: 노란색→주황색 그라데이션 배경
  - 오늘의운세: 파란색→인디고 그라데이션 배경
  - 섹션별 흰 배경 카드
  - 이모지 아이콘 활용

- **반응형 레이아웃**
  - 입력 폼: grid-cols-4 (4개 컬럼)
  - 행운 정보: grid-cols-2 (2개 컬럼)

#### 이메일 전송 설정
- **Resend 도메인 인증 방법**
  1. https://resend.com/domains 에서 도메인 추가
  2. DNS 레코드 설정 (SPF, DKIM)
  3. `.env.local`에 `RESEND_FROM_EMAIL` 설정
  4. 개발 서버 재시작

- **API 라우트** (`app/api/send-fortune/route.ts`)
  - POST /api/send-fortune
  - 운세 결과를 HTML 이메일로 전송
  - 에러 로깅 및 응답 개선
  - 환경변수 검증

#### 기술적 변경사항
- **새 파일 생성**
  - `components/myutils/fortune.tsx` - 신년운세 메인 컴포넌트 (~460줄)
  - `components/ui/tabs.tsx` - Tabs UI 컴포넌트 (Radix UI)
  - `app/api/send-fortune/route.ts` - 이메일 전송 API 라우트 (~240줄)

- **수정된 파일**
  - `components/myutils/sidebar.tsx` - 신년운세 메뉴 추가
  - `app/myutils/page.tsx` - Fortune 컴포넌트 연결
  - `.env.local` - Resend API 키 및 발신자 이메일 추가

- **패키지 추가**
  - `resend: latest` - 이메일 전송
  - `@radix-ui/react-tabs: latest` - Tabs UI

#### 데이터 모델
```typescript
// 입력 데이터
interface FortuneData {
  name: string
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:MM
  email: string
}

// 신년운세 결과
interface FortuneResult {
  year: string
  overall: string
  love: string
  career: string
  wealth: string
  health: string
  luckyColor: string
  luckyNumber: string
  advice: string
}

// 오늘의운세 결과
interface DailyFortune {
  date: string
  overall: string
  lucky: string
  caution: string
  luckyTime: string // HH:MM - HH:MM
  luckyItem: string
  advice: string
}
```

#### 간지 계산 로직
```typescript
const getGanjiYear = (year: number) => {
  const cheongan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
  const jiji = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
  const jijiAnimals = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]
  const colors = ["푸른", "푸른", "붉은", "붉은", "노란", "노란", "흰", "흰", "검은", "검은"]

  const cheonganIndex = (year - 4) % 10
  const jijiIndex = (year - 4) % 12

  return {
    ganji: cheongan[cheonganIndex] + jiji[jijiIndex],
    animal: jijiAnimals[jijiIndex],
    color: colors[cheonganIndex],
    fullName: `${ganji}년 ${color} ${animal}의 해`
  }
}
// 2026년 → 병오년 붉은 말의 해
```

#### 환경변수
```bash
# Resend API (이메일 전송용)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=신년운세 <fortune@yourdomain.com>
```

#### 커밋 정보
- 변경 파일: 6개
- 추가된 코드: ~900줄
- 신규 패키지: 2개

---

## 2025-12-26

### 캘린더 기능 추가 및 Supabase 연동

#### 새로운 기능
- **캘린더 메뉴 추가**
  - 나의유틸 좌측 메뉴에 "캘린더" 메뉴 추가 (여행경로 아래)
  - Calendar 아이콘 사용
  - 월간 캘린더 뷰 제공

#### 캘린더 기능
1. **좌측 작은 달력**
   - 월간 미니 캘린더 표시
   - 이전달/다음달 네비게이션
   - 년도 변경 버튼 (전년도, 현재년도, 다음년도)
   - 오늘 날짜 파란색 원으로 강조
   - 선택된 날짜 파란색 배경
   - "만들기" 버튼으로 일정 추가 팝업

2. **중앙 큰 달력**
   - 전체 화면 월간 캘린더
   - "오늘" 버튼으로 현재 날짜 빠른 이동
   - 년도 변경 및 월 네비게이션
   - 일정이 녹색 배지로 표시
   - 날짜 클릭으로 일정 추가 가능

3. **일정 추가 팝업**
   - 선택된 날짜 표시 (읽기 전용)
   - 제목 입력 필드
   - 상세정보 입력 (Textarea)
   - 저장/취소 버튼
   - Supabase 자동 저장

4. **한국 공휴일 자동 표시**
   - 2025년 공휴일: 신정, 설날 연휴(3일), 삼일절, 어린이날, 부처님오신날, 현충일, 광복절, 추석 연휴(3일), 개천절, 한글날, 크리스마스
   - 2026년 공휴일도 포함
   - 공휴일은 녹색 배지로 표시

#### Supabase 연동
- **테이블 생성**: calendar_events
  - 컬럼: id, user_id, date, title, description, created_at, updated_at
  - RLS 정책: 사용자별 데이터 격리
  - 인덱스: user_id, date, (user_id, date) 복합 인덱스
  - 트리거: updated_at 자동 업데이트

- **API 함수** (lib/api/calendar.ts)
  - getCalendarEventsByMonth: 월별 일정 조회
  - getCalendarEventsByYear: 년도별 일정 조회
  - getAllCalendarEvents: 모든 일정 조회
  - createCalendarEvent: 일정 생성
  - updateCalendarEvent: 일정 수정
  - deleteCalendarEvent: 일정 삭제
  - getCalendarEventsByDate: 특정 날짜 일정 조회

- **실시간 데이터 로드**
  - useEffect로 년도 변경 시 자동 로드
  - 로딩 상태 관리
  - 공휴일과 사용자 일정 분리 관리

#### 기술적 변경사항
- **새 파일 생성**
  - `components/myutils/calendar.tsx` - 캘린더 메인 컴포넌트 (~620줄)
  - `lib/api/calendar.ts` - 캘린더 API 함수
  - `types/calendar.types.ts` - 캘린더 타입 정의
  - `docs/supabase_calendar_events.sql` - Supabase 테이블 생성 스크립트

- **수정된 파일**
  - `components/myutils/sidebar.tsx` - 캘린더 메뉴 추가
  - `app/myutils/page.tsx` - CalendarView 컴포넌트 연결

#### 데이터 모델
```typescript
// Supabase 테이블 타입
interface CalendarEvent {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  created_at: string
  updated_at: string
}

// 클라이언트 타입 (공휴일 포함)
interface Event {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  isHoliday?: boolean
}
```

#### 커밋 정보
- 커밋 메시지: "feat: 캘린더 기능 추가 및 Supabase 연동"
- 변경 파일: 6개
- 추가된 코드: ~820줄

### 캘린더 기능 개선 - 시간 입력 및 수정 기능 추가

#### 추가 기능
1. **시간 입력 필드 추가**
   - 시작 시간 (start_time) 입력 필드
   - 종료 시간 (end_time) 입력 필드
   - HTML5 time input 사용
   - Supabase 테이블에 TIME 타입 컬럼 추가

2. **일정 수정 기능**
   - 사용자 일정 배지 클릭 시 수정 팝업
   - 공휴일은 클릭해도 수정 불가
   - 날짜, 시간, 제목, 상세정보 모두 수정 가능
   - 수정/삭제 버튼 제공

3. **일정 배지 색상 구분**
   - 공휴일: 녹색 배지 (bg-green-100)
   - 사용자 일정: 연한블루 배지 (bg-blue-100)
   - 사용자 일정에만 hover 효과 및 클릭 가능

4. **UI 개선**
   - 모달 제목: "일정 추가" / "일정 수정" 구분
   - 날짜 필드: date picker로 직접 선택 가능
   - 삭제 버튼: 수정 모드에만 표시 (빨간색)
   - 블루 배지 글자 크기: 10px (작게)
   - 블루 배지: 제목만 표시 (시간 제외)

#### 기술적 변경사항
- **수정된 파일**
  - `components/myutils/calendar.tsx`
    - handleEventClick: 일정 클릭 시 수정 모달
    - handleUpdateEvent: 일정 수정 API 호출
    - handleDeleteEvent: 일정 삭제 (확인 대화상자)
    - 시간 입력 필드 UI 추가
    - undefined 값 처리 개선
    - 오류 메시지 개선
  - `types/calendar.types.ts`
    - start_time, end_time 필드 추가
  - `docs/supabase_calendar_events.sql`
    - start_time TIME 컬럼 추가
    - end_time TIME 컬럼 추가

#### 데이터 모델 업데이트
```typescript
interface CalendarEvent {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  start_time?: string // HH:MM
  end_time?: string // HH:MM
  created_at: string
  updated_at: string
}
```

#### Supabase 테이블 업데이트
```sql
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;
```

#### 커밋 정보
- 커밋 메시지: "feat: 캘린더 일정 수정/삭제 및 시간 입력 기능 추가"
- 변경 파일: 3개
- 추가된 코드: ~150줄

---

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

- 핵심 로직: generateInClause()
  1.1 입력값 파싱 (59-65행)
  - 입력값을 줄바꿈으로 분리하고 trim  
  - 원본 개수 저장

  1.2 빈 값 처리 (67-70행)
  if (ignoreEmpty) {
    values = values.filter(v => v !== "")
  }

  옵션: 빈 값 무시 (기본 활성화)

  1.3 중복 제거 (72-75행)

  if (removeDuplicates) {
    values = [...new Set(values)]
  }

  처리 방식:
  - JavaScript Set 사용하여 중복 제거
  - Spread operator로 배열 변환

  1.4 정렬 (77-80행)

  if (sortAscending) {
    values.sort()
  }

  옵션: 오름차순 정렬 (기본 비활성화)

  1.5 문자열 감싸기 (90-96행)
  
  1.6 줄바꿈 처리 (98-111행)  
  - maxPerLine > 0: 지정된 개수마다 줄바꿈
  - maxPerLine = 0: 모두 한 줄에 출력

  예시:
  maxPerLine = 3인 경우:
  '404', '405', '406',
  '407', '408', '409'

  1.7 템플릿 적용 (113-121행)
  옵션:
  - parens: ('404', '405', '406')
  - brackets: ['404', '405', '406']
  - braces: {'404', '405', '406'}
  - none: '404', '405', '406'

  1.8 접두사/접미사 추가 (123-129행)
  - 앞에 붙일 문자열 뒤에 붙일 문자열 처리 
  if (prefix) {
    result = `${prefix} ${result}`
  }
  if (suffix) {
    result = `${result} ${suffix}`
  }

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

---

### 여행경로 (Trip 스케치) 기능 추가

#### 새로운 기능
- **여행경로 메뉴 추가**
  - 나의유틸 좌측 메뉴에 "여행경로" 메뉴 추가
  - MapPin 아이콘 사용
  - 3개 섹션으로 구성된 여행 계획 도구

#### 레이아웃 구조 (3-Column)
1. **좌측 - 여행 계획 섹션** (w-32, 128px)
   - 여행 목록 표시
   - 여행명, 시작일, 종료일 정보
   - 선택된 여행 하이라이트
   - 여행 추가 버튼 (모달)

2. **중앙 - Google Maps 섹션** (flex-1, 최대 공간)
   - Google Maps JavaScript API 통합
   - 강남구 중심 (lat: 37.4979, lng: 127.0276)
   - 장소 마커 표시 (번호 라벨)
   - 장소 검색 입력 필드
   - 장소 추가 버튼

3. **우측 - 장소 상세 섹션** (w-40, 160px)
   - 선택된 여행의 Day 정보
   - 경로(장소) 목록
   - 장소별 정보: 이름, 주소, 시간
   - 편집/복제/삭제 버튼

#### 주요 기능
- **여행 관리**
  - 여행 추가: 여행명, 출발일, 도착일
  - 여행 선택 시 해당 여행의 장소 목록 표시

- **장소 관리**
  - 장소 추가: 경도/위도, 이름, 주소, 시작/종료 시간, 메모
  - 지도에 마커로 표시 (순서대로 번호 라벨)
  - 마커 클릭 시 상세 정보 표시

- **Google Maps 연동**
  - @react-google-maps/api 패키지 사용
  - LoadScript, GoogleMap, Marker 컴포넌트
  - 환경변수로 API 키 관리 (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

#### 레이아웃 최적화
- 초기 레이아웃: 좌측 256px, 우측 320px
- 최적화 후: 좌측 128px, 우측 160px (각 50% 축소)
- 지도 섹션 확대로 사용성 개선

#### 기술적 변경사항
- **새 파일 생성**
  - `components/myutils/trip-planner.tsx` - Trip 스케치 메인 컴포넌트

- **수정된 파일**
  - `components/myutils/sidebar.tsx` - 여행경로 메뉴 추가
  - `app/myutils/page.tsx` - TripPlanner 컴포넌트 연결
  - `.env.local` - Google Maps API 키 추가

- **패키지 추가**
  - `@react-google-maps/api: ^2.19.3`

#### 데이터 모델
```typescript
interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  startTime: string
  endTime: string
  memo: string
}
```

#### 커밋 정보
- 커밋 메시지: "feat: 여행경로(Trip 스케치) 기능 추가"
- 변경 파일: 5개
- 추가된 코드: ~450줄

지도에 워터마크 나오는 오류 해결 
Google Cloud Console → Billing → 결제 계정 생성/연결
프로젝트가 올바른지 확인 (현재 프로젝트에 billing 연결)
Maps JavaScript API가 활성화 되어 있는지 재확인
키 제한(HTTP referrer)에 http://localhost:3000/* 추가
.env.local 변경 시 dev 서버 재기동