-- ============================================
-- GolfBuddy Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text default '',
  skill_level text default 'Beginner' check (skill_level in ('Beginner', 'Average', 'Skilled', 'Casual/Sporty')),
  gender text default 'Prefer not to say' check (gender in ('Male', 'Female', 'Non-binary', 'Prefer not to say')),
  address text default '',
  lat double precision default 37.7749,
  lng double precision default -122.4194,
  created_at timestamptz default now()
);

-- 2. Buddy availability
create table if not exists buddy_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  available_dates text[] default '{}',
  available_times text[] default '{}',
  preferred_course_id text default '',
  alternate_course_ids text[] default '{}',
  needs_ride boolean default false,
  can_offer_ride boolean default false,
  ride_note text default '',
  is_free_now boolean default false,
  free_now_until text,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- 3. Chat groups
create table if not exists chat_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  member_ids uuid[] not null default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 4. Chat messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references chat_groups(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- 5. Weekend polls
create table if not exists weekend_polls (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references chat_groups(id) on delete cascade,
  created_by uuid references profiles(id),
  weekend_date text not null,
  date_options text[] default '{}',
  time_options text[] default '{}',
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now()
);

-- 6. Poll votes
create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references weekend_polls(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  selected_dates text[] default '{}',
  selected_times text[] default '{}',
  needs_ride boolean default false,
  can_offer_ride boolean default false,
  unique(poll_id, user_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table profiles enable row level security;
alter table buddy_availability enable row level security;
alter table chat_groups enable row level security;
alter table chat_messages enable row level security;
alter table weekend_polls enable row level security;
alter table poll_votes enable row level security;

-- Profiles: anyone can read, users can update own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Availability: anyone can read, users can manage own
create policy "Availability is viewable by everyone" on buddy_availability for select using (true);
create policy "Users can manage own availability" on buddy_availability for insert with check (auth.uid() = user_id);
create policy "Users can update own availability" on buddy_availability for update using (auth.uid() = user_id);
create policy "Users can delete own availability" on buddy_availability for delete using (auth.uid() = user_id);

-- Chat groups: members can read, authenticated can create
create policy "Chat groups viewable by members" on chat_groups for select using (auth.uid() = any(member_ids));
create policy "Authenticated users can create groups" on chat_groups for insert with check (auth.uid() = created_by);
create policy "Creator can update group" on chat_groups for update using (auth.uid() = created_by);

-- Messages: group members can read, authenticated can send
create policy "Messages viewable by group members" on chat_messages for select
  using (exists (select 1 from chat_groups where id = chat_messages.group_id and auth.uid() = any(member_ids)));
create policy "Authenticated users can send messages" on chat_messages for insert with check (auth.uid() = sender_id);

-- Polls: group members can read, authenticated can create
create policy "Polls viewable by group members" on weekend_polls for select
  using (exists (select 1 from chat_groups where id = weekend_polls.group_id and auth.uid() = any(member_ids)));
create policy "Authenticated users can create polls" on weekend_polls for insert with check (auth.uid() = created_by);
create policy "Creator can update poll" on weekend_polls for update using (auth.uid() = created_by);

-- Votes: group members can read, users can manage own
create policy "Votes viewable by group members" on poll_votes for select
  using (exists (
    select 1 from weekend_polls wp
    join chat_groups cg on cg.id = wp.group_id
    where wp.id = poll_votes.poll_id and auth.uid() = any(cg.member_ids)
  ));
create policy "Users can cast votes" on poll_votes for insert with check (auth.uid() = user_id);
create policy "Users can update own votes" on poll_votes for update using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, first_name, last_name, email, phone, skill_level, gender, address, lat, lng)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'skill_level', 'Beginner'),
    coalesce(new.raw_user_meta_data->>'gender', 'Prefer not to say'),
    coalesce(new.raw_user_meta_data->>'address', ''),
    coalesce((new.raw_user_meta_data->>'lat')::double precision, 37.7749),
    coalesce((new.raw_user_meta_data->>'lng')::double precision, -122.4194)
  );
  return new;
exception when others then
  -- Log but don't block signup; client-side fallback will create the profile
  raise log 'handle_new_user failed for %: % %', new.id, SQLERRM, SQLSTATE;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- Indexes for performance
-- ============================================

create index if not exists idx_availability_user on buddy_availability(user_id);
create index if not exists idx_messages_group on chat_messages(group_id);
create index if not exists idx_messages_created on chat_messages(created_at);
create index if not exists idx_polls_group on weekend_polls(group_id);
create index if not exists idx_votes_poll on poll_votes(poll_id);

-- ============================================
-- Enable Realtime for chat messages
-- ============================================

alter publication supabase_realtime add table chat_messages;
