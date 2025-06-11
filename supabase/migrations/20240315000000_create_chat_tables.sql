-- Create chat_messages table
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  username text,
  email text,
  is_system_message boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable real-time for chat_messages
alter table chat_messages replica identity full;

-- Create typing_indicators table
create table if not exists typing_indicators (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references ideas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_typing boolean default false,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Enable real-time for typing_indicators
alter table typing_indicators replica identity full;

-- Create indexes for better performance
create index if not exists chat_messages_project_id_idx on chat_messages(project_id);
create index if not exists chat_messages_created_at_idx on chat_messages(created_at);
create index if not exists typing_indicators_project_id_idx on typing_indicators(project_id);
create index if not exists typing_indicators_last_updated_idx on typing_indicators(last_updated);

-- Set up Row Level Security (RLS) policies
alter table chat_messages enable row level security;
alter table typing_indicators enable row level security;

-- Create policies for chat_messages
create policy "Users can view messages for projects they are part of"
  on chat_messages for select
  using (
    exists (
      select 1 from idea_contributors
      where idea_contributors.idea_id = chat_messages.project_id
      and idea_contributors.user_id = auth.uid()
    )
  );

create policy "Users can insert messages for projects they are part of"
  on chat_messages for insert
  with check (
    exists (
      select 1 from idea_contributors
      where idea_contributors.idea_id = chat_messages.project_id
      and idea_contributors.user_id = auth.uid()
    )
  );

-- Create policies for typing_indicators
create policy "Users can view typing indicators for projects they are part of"
  on typing_indicators for select
  using (
    exists (
      select 1 from idea_contributors
      where idea_contributors.idea_id = typing_indicators.project_id
      and idea_contributors.user_id = auth.uid()
    )
  );

create policy "Users can update their own typing indicators"
  on typing_indicators for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can insert their own typing indicators"
  on typing_indicators for insert
  with check (auth.uid() = user_id); 