-- Fix security warning: set search_path for the function
create or replace function public.sync_instagram_posts_public()
returns trigger language plpgsql security definer set search_path = public as $$
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