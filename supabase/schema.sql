-- Bảng xếp hạng trực tuyến cho English Game Dinosaur.
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor. Chạy lại nhiều lần vẫn an toàn.

-- 1. Bảng điểm: mỗi học sinh (họ tên + lớp, không phân biệt hoa thường) có đúng 1 dòng
create table if not exists public.leaderboard (
  name_key text not null,
  class_key text not null,
  full_name text not null,
  class_name text not null,
  high_score integer not null default 0,
  best_mode text not null default 'BASIC',
  milestones_passed integer not null default 0,
  correct_answers integer not null default 0,
  skin_id text not null default 'skin_emerald_rookie',
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (name_key, class_key)
);

-- 2. Ai cũng được xem; không ai được ghi trực tiếp (chỉ ghi qua hàm submit_score bên dưới)
alter table public.leaderboard enable row level security;

drop policy if exists "Ai cũng xem được bảng xếp hạng" on public.leaderboard;
create policy "Ai cũng xem được bảng xếp hạng"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

grant select on public.leaderboard to anon, authenticated;
revoke insert, update, delete on public.leaderboard from anon, authenticated;

-- 3. Thứ hạng: số câu đúng kỷ lục trong một lượt (high_score), rồi số cột mốc, tổng câu đúng, ai đạt trước xếp trên
create or replace view public.leaderboard_view
with (security_invoker = true) as
select
  rank() over (
    order by high_score desc, milestones_passed desc, correct_answers desc, achieved_at asc
  )::integer as position,
  name_key,
  class_key,
  full_name,
  class_name,
  high_score,
  best_mode,
  milestones_passed,
  correct_answers,
  skin_id,
  achieved_at
from public.leaderboard;

grant select on public.leaderboard_view to anon, authenticated;

-- 4. Gửi kỷ lục: kiểm tra dữ liệu, chỉ cho kỷ lục tăng, trả về hạng trước và sau khi gửi
create or replace function public.submit_score(
  p_full_name text,
  p_class_name text,
  p_score integer,
  p_best_mode text,
  p_milestones integer,
  p_correct integer,
  p_skin_id text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(p_full_name);
  v_class text := btrim(p_class_name);
  v_prev_rank integer;
  v_rank integer;
begin
  if char_length(v_name) not between 2 and 60 or char_length(v_class) not between 2 and 15 then
    raise exception 'Họ tên hoặc lớp không hợp lệ';
  end if;

  if p_score not between 0 and 1000000
    or p_best_mode not in ('BASIC', 'MEDIUM', 'HARDCORE')
    or p_milestones not between 0 and 10000
    or p_correct not between 0 and 1000000
    or char_length(p_skin_id) not between 1 and 64 then
    raise exception 'Dữ liệu điểm không hợp lệ';
  end if;

  select position into v_prev_rank
  from public.leaderboard_view
  where name_key = lower(v_name) and class_key = lower(v_class);

  insert into public.leaderboard as l (
    name_key, class_key, full_name, class_name, high_score,
    best_mode, milestones_passed, correct_answers, skin_id
  )
  values (
    lower(v_name), lower(v_class), v_name, v_class, p_score,
    p_best_mode, p_milestones, p_correct, p_skin_id
  )
  on conflict (name_key, class_key) do update set
    full_name = excluded.full_name,
    class_name = excluded.class_name,
    best_mode = excluded.best_mode,
    skin_id = excluded.skin_id,
    milestones_passed = greatest(l.milestones_passed, excluded.milestones_passed),
    correct_answers = greatest(l.correct_answers, excluded.correct_answers),
    achieved_at = case when excluded.high_score > l.high_score then now() else l.achieved_at end,
    high_score = greatest(l.high_score, excluded.high_score),
    updated_at = now();

  select position into v_rank
  from public.leaderboard_view
  where name_key = lower(v_name) and class_key = lower(v_class);

  return json_build_object('rank', v_rank, 'previous_rank', v_prev_rank);
end;
$$;

revoke all on function public.submit_score(text, text, integer, text, integer, integer, text) from public;
grant execute on function public.submit_score(text, text, integer, text, integer, integer, text) to anon, authenticated;

-- 5. Bật realtime để bảng xếp hạng tự cập nhật trên mọi máy
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leaderboard'
  ) then
    alter publication supabase_realtime add table public.leaderboard;
  end if;
end $$;
