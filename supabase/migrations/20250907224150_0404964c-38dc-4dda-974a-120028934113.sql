-- Fix security warning: set search_path for sync_analytics_public function
create or replace function public.sync_analytics_public()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.analytics_public as ap (source, metric, value, updated_at)
  values (new.source, new.metric, new.value, coalesce(new.updated_at, now()))
  on conflict (source, metric)
  do update set
    value = excluded.value,
    updated_at = excluded.updated_at;
  return new;
end; $$;