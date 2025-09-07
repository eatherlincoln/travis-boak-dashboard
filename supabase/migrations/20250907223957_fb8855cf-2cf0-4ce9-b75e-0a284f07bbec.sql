-- RAW TABLE (admin/ingest writes here)
create table if not exists public.instagram_posts (
  media_id text primary key,
  caption text,
  permalink text,
  media_url text,
  like_count int,
  comment_count int,
  reach int,
  saves int,
  timestamp timestamptz,
  updated_at timestamptz default now()
);

-- PUBLIC SNAPSHOT (UI reads here)
create table if not exists public.instagram_posts_public (
  media_id text primary key,
  caption text,
  permalink text,
  media_url text,
  like_count int,
  comment_count int,
  reach int,
  saves int,
  timestamp timestamptz,
  updated_at timestamptz not null default now()
);

-- Sync raw → public
create or replace function public.sync_instagram_posts_public()
returns trigger language plpgsql as $$
begin
  insert into public.instagram_posts_public as p (
    media_id, caption, permalink, media_url, like_count, comment_count, reach, saves, timestamp, updated_at
  )
  values (
    new.media_id, new.caption, new.permalink, new.media_url, new.like_count, new.comment_count, new.reach, new.saves, new.timestamp, coalesce(new.updated_at, now())
  )
  on conflict (media_id) do update set
    caption       = excluded.caption,
    permalink     = excluded.permalink,
    media_url     = excluded.media_url,
    like_count    = excluded.like_count,
    comment_count = excluded.comment_count,
    reach         = excluded.reach,
    saves         = excluded.saves,
    timestamp     = excluded.timestamp,
    updated_at    = excluded.updated_at;
  return new;
end; $$;

drop trigger if exists trg_sync_instagram_posts_public on public.instagram_posts;
create trigger trg_sync_instagram_posts_public
after insert or update on public.instagram_posts
for each row execute function public.sync_instagram_posts_public();

-- Realtime + RLS
alter publication supabase_realtime add table public.instagram_posts_public;

alter table public.instagram_posts_public enable row level security;

drop policy if exists read_instagram_posts_public on public.instagram_posts_public;
create policy read_instagram_posts_public
on public.instagram_posts_public
for select to authenticated
using (true);