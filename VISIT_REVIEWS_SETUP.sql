-- 방문 리뷰 테이블 (Visit Reviews)
create table visit_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  place_name text not null,
  address text,
  lat double precision,
  lng double precision,
  rating integer check (rating >= 1 and rating <= 5) default 5,
  content text,
  visited_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 활성화
alter table visit_reviews enable row level security;

-- RLS 정책 설정 (본인 데이터만 접근 가능)
create policy "Users can view their own visit reviews"
  on visit_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert their own visit reviews"
  on visit_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own visit reviews"
  on visit_reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own visit reviews"
  on visit_reviews for delete
  using (auth.uid() = user_id);

-- 성능 최적화를 위한 인덱스 추가
create index visit_reviews_user_id_idx on visit_reviews (user_id);
create index visit_reviews_visited_date_idx on visit_reviews (visited_date);

-- updated_at 자동 업데이트를 위한 트리거 함수 (필요한 경우)
-- 이미 다른 테이블에서 사용 중이라면 생략 가능합니다.
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_visit_reviews_updated_at
    before update on visit_reviews
    for each row
    execute function update_updated_at_column();
