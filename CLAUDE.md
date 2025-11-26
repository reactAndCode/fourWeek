# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js project for a Weekly Log (주간 작업일지) application - a work journal/timesheet tracking system with Korean localization.

### Application Purpose
Based on the design mockup in `plan/weeklog.png`, this application will:
- Track weekly work logs with daily entries
- Display summary statistics (total time, completed tasks, progress percentage)
- Allow users to log tasks with time tracking and tags
- Show completion status for each day
- Provide navigation through weekly views

## Project Status

✅ **ACTIVE**: The Next.js project has been initialized with all base components and UI implemented.

## Development Commands

### Development
```bash
# Run development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Setup
Create a `.env.local` file with Supabase credentials:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your Supabase URL and anon key
```

## Technology Stack

- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Component Library**: Shadcn/ui (custom components)
- **Icons**: Lucide React
- **Database**: Supabase (auth, database, storage)
- **Supabase Client**: @supabase/supabase-js, @supabase/ssr
- **Localization**: Korean (ko-KR)

## Architecture - Multi-Tier Design Pattern

The project follows a multi-tier architecture pattern separating concerns:

```
app/                      # Next.js App Router (Pages & Layouts)
  layout.tsx             # Root layout with navigation
  page.tsx               # Home dashboard
  weeklog/
    page.tsx             # Weekly log view
  memos/
    page.tsx             # Memo management
  globals.css            # Global styles & CSS variables

components/              # UI Components Layer
  ui/                    # Shadcn/ui base components
    button.tsx
    card.tsx
    badge.tsx
  navigation.tsx         # Main navigation component
  weeklog/               # Weekly log feature components
    weekly-summary.tsx   # Summary statistics
    day-card.tsx         # Daily task card
    week-navigation.tsx  # Week selector

lib/                     # Business Logic & Utilities Layer
  utils.ts              # Common utilities (cn function)
  bizlogic/             # Business logic layer (to be implemented)
  api/                  # API functions layer (to be implemented)
  db/                   # Database layer
    supabase.ts         # Supabase client for client components
    server.ts           # Supabase server client for RSC

types/                  # TypeScript Type Definitions
  database.types.ts     # Supabase database schema types
  worklog.types.ts      # WorkLog, Task, WeeklySummary types

hooks/                  # Custom React hooks (to be implemented)
```

## Implemented Features

### 1. Home Dashboard (/)
- Summary statistics cards (총 근무 시간, 완료한 업무, 진행률)
- Quick links to 주간일지 and 메모관리

### 2. Weekly Log (/weeklog)
- **Weekly summary**: Total hours, completed tasks, progress percentage
- **Week navigation**: Previous/next week, jump to today
- **Daily cards**: Each day shows:
  - Date and day of week
  - Status badge (작성 완료, 임시 저장, 일지 없음)
  - Task list with descriptions
  - Time spent per day
  - Tags with category colors (디자인, 기획, 개발, 분석)
  - Empty state with "일지를 작성해주세요" prompt
- **Today indicator**: Current day highlighted with blue ring

### 3. Navigation
- Persistent top navigation with 홈, 주간일지, 메모관리
- Active page highlighting
- Notification and user profile icons

### 4. Memo Management (/memos)
- Placeholder page (to be implemented)

## Data Models

```typescript
// types/worklog.types.ts
interface Task {
  id: string
  description: string
  minutes: number
  tags: string[]
  category: 'design' | 'planning' | 'development' | 'analysis'
}

interface WorkLog {
  id: string
  userId: string
  date: Date
  tasks: Task[]
  status: 'draft' | 'completed' | 'empty'
  totalMinutes: number
  createdAt: Date
  updatedAt: Date
}

interface WeeklySummary {
  totalMinutes: number
  completedTasks: number
  progressRate: number
}
```

## Supabase Setup

### Required Tables

Create these tables in Supabase:

```sql
-- Work logs table
create table work_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  tasks jsonb default '[]'::jsonb,
  status text check (status in ('draft', 'completed', 'empty')) default 'empty',
  total_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Memos table
create table memos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table work_logs enable row level security;
alter table memos enable row level security;

-- RLS policies
create policy "Users can view their own work logs"
  on work_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own work logs"
  on work_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own work logs"
  on work_logs for update
  using (auth.uid() = user_id);

create policy "Users can view their own memos"
  on memos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memos"
  on memos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memos"
  on memos for update
  using (auth.uid() = user_id);
```

## Next Steps (TODO)

1. **Authentication**: Implement Supabase Auth with login/signup
2. **API Layer**: Create API functions in `lib/api/` for CRUD operations
3. **Business Logic**: Implement business logic in `lib/bizlogic/` for calculations
4. **Task Creation Modal**: Add modal to create/edit work log entries
5. **Real Data Integration**: Connect UI to Supabase database
6. **Memo Feature**: Implement full memo management with CRUD operations
7. **Date Utilities**: Add Korean date formatting helpers
8. **Storage**: Implement file upload for memos using Supabase Storage

## Korean Localization

All UI text should be in Korean. Key terms:
- 주간 작업일지: Weekly Log
- 총 근무 시간: Total Work Time
- 완료한 업무: Completed Tasks
- 진행률: Progress Rate
- 작성 완료: Complete
- 임시 저장: Draft/Temporary Save
- 일지 작성: Create Entry
