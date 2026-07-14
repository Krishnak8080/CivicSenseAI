# 🍎 macOS Complete Setup Guide - Civic Sense AI

This guide walk you through setting up a brand new MacBook (Intel or Apple Silicon M1/M2/M3) from scratch, installing all required development dependencies, configuring environment variables, setting up the database, and running the project in development mode.

---

## 🛠️ Step 1: macOS Developer Environment Setup

Before running the project, you must install the native development tools required for compiling NPM packages (like `sharp` which handles image diagnostics).

### 1. Install Xcode Command Line Tools

Open your Terminal (`Cmd + Space` -> type `Terminal`) and run:

```bash
xcode-select --install
```

A popup will appear asking for confirmation. Click **Install** and wait for it to complete.

### 2. Install Homebrew (macOS Package Manager)

Homebrew makes installing developer packages extremely simple. Run the installation script:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

During installation, it will ask for your Mac user password. Enter it (no characters will show) and hit `Enter`.

#### **CRITICAL: Add Homebrew to your PATH (Especially Apple Silicon M1/M2/M3 Macs)**

If you are on an Apple Silicon Mac, run the following commands in your terminal to enable `brew`:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify the installation:

```bash
brew --version
```

### 3. Install Git

Install Git using Homebrew:

```bash
brew install git
```

### 4. Install Node.js via NVM (Node Version Manager)

Instead of installing Node directly, we use NVM. This allows you to install multiple Node versions, change them easily, and avoids `sudo` permission errors when installing packages.

Install NVM using curl:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Reload your terminal profile:

```bash
source ~/.zshrc
```

_(If your terminal shell is bash instead of zsh, run `source ~/.bash_profile`)_

Verify NVM is installed:

```bash
nvm --version
```

Now, install the **Node.js LTS (Long Term Support)** version:

```bash
# Install Node.js v20 (LTS)
nvm install 20

# Configure NVM to use it
nvm use 20

# Set v20 as your default for all new terminal sessions
nvm alias default 20
```

Verify your active Node.js and npm versions:

```bash
node -v
npm -v
```

---

## 📥 Step 2: Clone the Project

Navigate to the folder where you want to keep the repository (e.g., your local `Downloads` or `Development` directory) and clone:

```bash
git clone https://github.com/Krishnak8080/Civic_Sense.git
cd Civic_Sense
```

---

## 📦 Step 3: Install Project Dependencies

The project contains a root manager that installs frontend and backend dependencies.

### 1. Install root dependencies (like `concurrently` for running dev servers):

```bash
npm install
```

### 2. Install sub-packages (for backend API and frontend client):

Run the installer script configured in `package.json`:

```bash
npm run install:all
```

_This command navigates to `backend/` and `frontend/` folders respectively, triggering local installs for libraries like Express, Sharp, React, Vite, and Supabase._

---

## 🔑 Step 4: Environment Variables Setup

You must create two separate config files since they contain credentials that are ignored by Git.

### 1. Backend Environment Setup (`backend/.env`)

Navigate to the backend directory and create a `.env` file:

```bash
cd backend
touch .env
```

Open `backend/.env` in your text editor (VS Code, Cursor, Nano, etc.) and add the following keys:

```env
# Your Google Gemini AI API Key (Get from Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Your Supabase Project URL
SUPABASE_URL="https://yourprojectid.supabase.co"

# Your Supabase Service Role Secret Key (Allows backend to bypass Row Level Security)
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yourServiceRoleKey"
```

### 2. Frontend Environment Setup (`frontend/.env.local`)

Navigate to the frontend directory and create a `.env.local` file:

```bash
cd ../frontend
touch .env.local
```

Open `frontend/.env.local` and add:

```env
# Your Supabase Project URL (must match the backend URL)
VITE_SUPABASE_URL="https://yourprojectid.supabase.co"

# Your Supabase Public Anon Key (Found in Supabase API settings)
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yourAnonKey"

# Your Google Maps API Key (Must have Maps Javascript, Places, and Geocoding APIs enabled)
VITE_GOOGLE_MAPS_API_KEY="AIzaSyYourGoogleMapsApiKeyHere"

# Port routing configuration to local Node server
VITE_API_URL="http://localhost:8000"
```

---

## 🗄️ Step 5: Supabase Cloud Database Provisioning

If you are starting with a clean Supabase project:

1. Go to your **Supabase Dashboard** -> Select your Project.
2. Open the **SQL Editor** from the left panel.
3. Click **New Query** and paste the following setup schema (enabling geospatial extensions, creating tables, triggers for votes, and storage buckets):

```sql
-- Enable PostGIS for geospatial query support
create extension if not exists postgis schema extensions;

-- Create profiles table (linked to Auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reports table (houses issue data & AI verification metrics)
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

-- Index for admin dashboard efficiency
create index if not exists idx_reports_requires_review
  on reports(requires_manual_review)
  where requires_manual_review = true;

-- Create votes table (prevents duplicate voting per report)
create table votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  report_id uuid references public.reports(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, report_id)
);

-- Row Level Security policies
alter table profiles enable row level security;
alter table reports enable row level security;
alter table votes enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Reports Policies
create policy "Reports are viewable by everyone." on reports for select using (true);
create policy "Users can create reports." on reports for insert with check (auth.uid() = user_id);
create policy "Admins can update reports." on reports for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Votes Policies
create policy "Votes are viewable by everyone." on votes for select using (true);
create policy "Users can vote." on votes for insert with check (auth.uid() = user_id);
create policy "Users can remove their vote." on votes for delete using (auth.uid() = user_id);

-- Upvote trigger functions
create or replace function increment_votes()
returns trigger as $$
begin
  update reports set votes_count = votes_count + 1 where id = new.report_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_vote_insert
after insert on votes
for each row execute function increment_votes();

-- Downvote / Remove vote trigger functions
create or replace function decrement_votes()
returns trigger as $$
begin
  update reports set votes_count = votes_count - 1 where id = old.report_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_vote_delete
after delete on votes
for each row execute function decrement_votes();

-- Storage Buckets Configuration
insert into storage.buckets (id, name, public) values ('report-photos', 'report-photos', true);
create policy "Images are publicly accessible." on storage.objects for select using (bucket_id = 'report-photos');
create policy "Users can upload images." on storage.objects for insert with check (bucket_id = 'report-photos' and auth.uid() = owner);
```

4. Click **Run** on the editor to create the database schema.
5. In your Supabase Dashboard, create a **Database Trigger** to auto-provision a profile record whenever a user signs up. Run the following code in the SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🏃 Step 6: Running the Application Locally

Return to the project root directory (`Civic_Sense`):

```bash
cd ../
```

Start both servers in parallel:

```bash
npm start
```

This boots:

1. **Frontend (Vite client)** at `http://localhost:5173`
2. **Backend (Express server)** at `http://localhost:8000`

---

## ⚙️ Step 7: Troubleshooting on macOS

### 1. "Port 8000 is already in use"

If the backend fails to start, another service might be running on port 8000. Run this to check and kill it:

```bash
lsof -i :8000
# Kill the process using its PID (Process ID)
kill -9 <PID>
```

### 2. Location permissions denied in Browser

If the app shows a location error blocking you from viewing/submitting reports:

1. Open **macOS System Settings** -> **Privacy & Security** -> **Location Services**.
2. Make sure Location Services are turned ON.
3. Make sure your browser (Chrome, Safari, Brave, Firefox) is allowed to access Location.
4. Refresh the page at `http://localhost:5173` and click "Allow" on the browser pop-up.
