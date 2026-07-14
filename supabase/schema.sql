-- Enable PostGIS for geospatial queries
create extension if not exists postgis schema extensions;

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  location text not null,
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'resolved')),
  votes_count integer default 0,
  photo_validation_status text check (photo_validation_status in ('verified', 'flagged', 'rejected', 'pending')),
  photo_validation_confidence integer check (photo_validation_confidence >= 0 and photo_validation_confidence <= 100),
  photo_validation_warnings text[],
  photo_validation_data jsonb,
  requires_manual_review boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for filtering flagged reports
create index if not exists idx_reports_requires_review 
  on reports(requires_manual_review) 
  where requires_manual_review = true;


-- Create votes table to track upvotes
create table votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  report_id uuid references public.reports(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, report_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table reports enable row level security;
alter table votes enable row level security;

-- Profiles RLS
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Reports RLS
create policy "Reports are viewable by everyone." on reports for select using (true);
create policy "Users can create reports." on reports for insert with check (auth.uid() = user_id);
create policy "Admins can update reports." on reports for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Votes RLS
create policy "Votes are viewable by everyone." on votes for select using (true);
create policy "Users can vote." on votes for insert with check (auth.uid() = user_id);
create policy "Users can remove their vote." on votes for delete using (auth.uid() = user_id);

-- Function to increment vote count
create or replace function increment_votes()
returns trigger as $$
begin
  update reports set votes_count = votes_count + 1 where id = new.report_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on insert
create trigger on_vote_insert
after insert on votes
for each row execute function increment_votes();

-- Function to decrement vote count
create or replace function decrement_votes()
returns trigger as $$
begin
  update reports set votes_count = votes_count - 1 where id = old.report_id;
  return old;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on delete
create trigger on_vote_delete
after delete on votes
for each row execute function decrement_votes();

-- Create a storage bucket for report images (run these manually if not via API)
insert into storage.buckets (id, name, public) values ('report-photos', 'report-photos', true);
create policy "Images are publicly accessible." on storage.objects for select using (bucket_id = 'report-photos');
create policy "Users can upload images." on storage.objects for insert with check (bucket_id = 'report-photos' and auth.uid() = owner);
