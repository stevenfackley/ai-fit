-- Enable RLS
alter table if exists profiles enable row level security;
alter table if exists projects enable row level security;
alter table if exists recommendations enable row level security;
alter table if exists usage_logs enable row level security;

-- Profiles (managed by Supabase Auth trigger)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- Projects (user's questionnaire submissions)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  description text,
  use_cases text[] not null default '{}',
  budget_usd numeric,
  max_latency_ms integer,
  compliance text[] default '{}',
  preferred_providers text[] default '{}',
  estimated_requests integer,
  avg_tokens integer,
  created_at timestamptz default now()
);

-- Recommendations (results from the engine)
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  task text not null,
  provider text not null,
  model text not null,
  display_name text,
  reasons text[] default '{}',
  estimated_monthly_cost numeric,
  estimated_latency_ms integer,
  snippet text,
  created_at timestamptz default now()
);

-- Usage logs (telemetry for refining cost models)
create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS Policies

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can read own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

create policy "Users can read own recommendations"
  on recommendations for select using (auth.uid() = user_id);

create policy "Users can insert own recommendations"
  on recommendations for insert with check (auth.uid() = user_id);

create policy "Users can delete own recommendations"
  on recommendations for delete using (auth.uid() = user_id);

create policy "Users can read own usage logs"
  on usage_logs for select using (auth.uid() = user_id);

create policy "Users can insert own usage logs"
  on usage_logs for insert with check (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
