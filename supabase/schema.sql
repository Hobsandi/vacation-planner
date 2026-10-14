-- Owner: Person B. Paste into Supabase → SQL editor and run once.

create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,            -- matches the Profile type in lib/types.ts
  updated_at timestamptz default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  request jsonb not null,         -- TripRequest
  plan jsonb not null,            -- TripPlan
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table trips enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trips" on trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
