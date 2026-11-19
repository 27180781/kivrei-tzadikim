-- אתר קברי צדיקים: מבנה מסד הנתונים (Supabase / Postgres)
-- להרצה פעם אחת ב-Supabase: SQL Editor → New query → הדבקה → Run

create extension if not exists pgcrypto;

-- מקומות ציון (מקום פיזי; במקום אחד יכולים להיות כמה צדיקים)
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  lat double precision,
  lng double precision,
  directions text,
  public_transport text,
  opening_hours text,
  accessibility text,
  notes text,
  created_at timestamptz default now()
);

-- צדיקים
-- hebrew_death_month לפי מספור hebcal: 1 ניסן, 2 אייר, 3 סיוון, 4 תמוז, 5 אב, 6 אלול,
-- 7 תשרי, 8 חשוון, 9 כסלו, 10 טבת, 11 שבט, 12 אדר (אדר א׳), 13 אדר ב׳
create table if not exists tzadikim (
  id uuid primary key default gen_random_uuid(),
  ivr_code int unique,
  name text not null,
  aka text[],
  slug text unique not null,
  bio text,
  bio_short text,
  hebrew_death_day int check (hebrew_death_day between 1 and 30),
  hebrew_death_month int check (hebrew_death_month between 1 and 13),
  death_year_hebrew int,
  site_id uuid references sites(id) on delete set null,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  tzadik_id uuid references tzadikim(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort int default 0
);

create table if not exists hillula_events (
  id uuid primary key default gen_random_uuid(),
  tzadik_id uuid references tzadikim(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  starts_at timestamptz not null,
  location_text text,
  organizer text,
  contact_phone text,
  details text,
  status text not null default 'scheduled' check (status in ('scheduled','updated','cancelled')),
  updated_at timestamptz default now()
);
create index if not exists hillula_events_starts_at on hillula_events (starts_at);

-- נרשמים לעדכון טלפוני יומי (נכתב מהשלוחה עם service role)
create table if not exists ivr_subscribers (
  phone text primary key,
  active boolean not null default true,
  subscribed_at timestamptz default now()
);

create table if not exists ivr_call_log (
  id bigserial primary key,
  caller text,
  step text,
  params jsonb,
  created_at timestamptz default now()
);

-- מנהלים: משתמשי Supabase Auth שמורשים לערוך
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- הרשאות (RLS): קריאה ציבורית לתוכן, כתיבה למנהלים בלבד
alter table sites enable row level security;
alter table tzadikim enable row level security;
alter table photos enable row level security;
alter table hillula_events enable row level security;
alter table ivr_subscribers enable row level security;
alter table ivr_call_log enable row level security;
alter table admins enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sites','photos','hillula_events'] loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('drop policy if exists "admin write" on %I', t);
    execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on tzadikim;
create policy "public read" on tzadikim for select using (is_published or is_admin());
drop policy if exists "admin write" on tzadikim;
create policy "admin write" on tzadikim for all using (is_admin()) with check (is_admin());

drop policy if exists "admin read" on ivr_subscribers;
create policy "admin read" on ivr_subscribers for select using (is_admin());
drop policy if exists "admin read" on ivr_call_log;
create policy "admin read" on ivr_call_log for select using (is_admin());
drop policy if exists "self read" on admins;
create policy "self read" on admins for select using (user_id = auth.uid());

-- אחסון תמונות
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "photos admin write" on storage.objects;
create policy "photos admin write" on storage.objects for all
  using (bucket_id = 'photos' and is_admin()) with check (bucket_id = 'photos' and is_admin());

-- הוספת מנהל (אחרי שנוצר משתמש ב-Authentication → Users):
-- insert into admins (user_id) select id from auth.users where email = 'YOUR_EMAIL';
