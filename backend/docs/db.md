# Database Schema Documentation

This document outlines the database schema for the Imara Platform using Supabase.

## Tables

### Users
```sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  address text unique not null,
  email text unique,
  github_id text unique,
  type text not null check (type in ('wallet', 'email', 'github')),
  profile jsonb,
  reputation integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Teams
```sql
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  owner text not null references users(address),
  skills text[] default '{}',
  reputation integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Team Members
```sql
create table team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade,
  address text not null references users(address),
  role text not null check (role in ('owner', 'member', 'validator')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, address)
);
```

### Projects
```sql
create table projects (
  id uuid default uuid_generate_v4() primary key,
  owner text not null references users(address),
  title text not null,
  description text not null,
  skills text[] default '{}',
  team_size integer not null,
  duration integer not null,
  total_amount numeric not null,
  min_stake numeric not null,
  status text not null check (status in ('active', 'completed', 'cancelled')) default 'active',
  team_id uuid references teams(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Project Milestones
```sql
create table project_milestones (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text not null,
  amount numeric not null,
  is_completed boolean default false,
  is_funded boolean default false,
  validators text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Project Stakes
```sql
create table project_stakes (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  staker text not null references users(address),
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Storage Buckets

```sql
-- Create storage buckets for file uploads
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('project-images', 'project-images', true),
  ('team-images', 'team-images', true);
```

## Row Level Security (RLS) Policies

### Users Table
```sql
-- Enable RLS
alter table users enable row level security;

-- Allow users to read any user profile
create policy "Users are viewable by everyone"
  on users for select
  using (true);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);
```

### Teams Table
```sql
-- Enable RLS
alter table teams enable row level security;

-- Allow anyone to view teams
create policy "Teams are viewable by everyone"
  on teams for select
  using (true);

-- Allow team owners to update their teams
create policy "Team owners can update their teams"
  on teams for update
  using (auth.uid() = owner);
```

### Team Members Table
```sql
-- Enable RLS
alter table team_members enable row level security;

-- Allow anyone to view team members
create policy "Team members are viewable by everyone"
  on team_members for select
  using (true);

-- Allow team owners to manage members
create policy "Team owners can manage members"
  on team_members for all
  using (
    exists (
      select 1 from teams
      where teams.id = team_members.team_id
      and teams.owner = auth.uid()
    )
  );
```

### Projects Table
```sql
-- Enable RLS
alter table projects enable row level security;

-- Allow anyone to view projects
create policy "Projects are viewable by everyone"
  on projects for select
  using (true);

-- Allow project owners to manage their projects
create policy "Project owners can manage their projects"
  on projects for all
  using (auth.uid() = owner);
```

### Project Milestones Table
```sql
-- Enable RLS
alter table project_milestones enable row level security;

-- Allow anyone to view milestones
create policy "Milestones are viewable by everyone"
  on project_milestones for select
  using (true);

-- Allow project owners and validators to manage milestones
create policy "Project owners and validators can manage milestones"
  on project_milestones for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
      and (
        projects.owner = auth.uid()
        or auth.uid() = any(project_milestones.validators)
      )
    )
  );
```

### Project Stakes Table
```sql
-- Enable RLS
alter table project_stakes enable row level security;

-- Allow anyone to view stakes
create policy "Stakes are viewable by everyone"
  on project_stakes for select
  using (true);

-- Allow users to create their own stakes
create policy "Users can create their own stakes"
  on project_stakes for insert
  with check (auth.uid() = staker);
```

## Indexes

```sql
-- Users table indexes
create index users_address_idx on users(address);
create index users_email_idx on users(email);
create index users_github_id_idx on users(github_id);

-- Teams table indexes
create index teams_owner_idx on teams(owner);
create index teams_skills_idx on teams using gin(skills);

-- Team members table indexes
create index team_members_team_id_idx on team_members(team_id);
create index team_members_address_idx on team_members(address);

-- Projects table indexes
create index projects_owner_idx on projects(owner);
create index projects_team_id_idx on projects(team_id);
create index projects_skills_idx on projects using gin(skills);
create index projects_status_idx on projects(status);

-- Project milestones table indexes
create index project_milestones_project_id_idx on project_milestones(project_id);
create index project_milestones_validators_idx on project_milestones using gin(validators);

-- Project stakes table indexes
create index project_stakes_project_id_idx on project_stakes(project_id);
create index project_stakes_staker_idx on project_stakes(staker);
```

## Environment Variables

Add the following to your `.env` file:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Notes

1. All timestamps are in UTC
2. All addresses are stored in lowercase
3. Arrays (skills, validators) are stored as PostgreSQL arrays
4. Profile data is stored as JSONB for flexibility
5. All tables have created_at and updated_at timestamps
6. Foreign key constraints ensure data integrity
7. RLS policies ensure proper access control
8. Indexes are created for frequently queried fields 