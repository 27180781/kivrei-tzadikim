-- מבנה מסד הנתונים (Postgres). האפליקציה מריצה את הקובץ הזה אוטומטית בעלייה,
-- וכל הפקודות בטוחות להרצה חוזרת.

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

-- תמונות נשמרות בתוך מסד הנתונים (נכללות בגיבוי, אין צורך בתיקייה בשרת)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  tzadik_id uuid references tzadikim(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,
  mime text not null,
  data bytea not null,
  caption text,
  sort int default 0,
  created_at timestamptz default now()
);
create index if not exists photos_tzadik on photos (tzadik_id);

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

-- מנויי מייל (הרשמה כפולה: האישור דרך קישור במייל)
create table if not exists email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  token text unique not null,
  daily boolean not null default true,
  seudot boolean not null default false,
  confirmed boolean not null default false,
  created_at timestamptz default now(),
  confirmed_at timestamptz,
  last_mail_at timestamptz
);

-- מניעת הרצה כפולה של משימות יומיות
create table if not exists job_runs (
  job text not null,
  run_date date not null,
  created_at timestamptz default now(),
  primary key (job, run_date)
);
