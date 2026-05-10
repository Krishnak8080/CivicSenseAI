# 🚀 Civic Sense AI - Complete Setup Guide

This guide contains everything you need to set up, configure, and run the Civic Sense AI platform from scratch on a brand new system.

---

## 📦 1. Prerequisites

Before doing anything, ensure your system has the following installed:

1. **Node.js**: (Version 18 or higher is required). 
   - Download it from [Node.js Official Website](https://nodejs.org/).
   - To verify installation, open a terminal and run: `node -v`
2. **Git**: Required for cloning the repository.
   - Download it from [Git SCM](https://git-scm.com/).
   - To verify installation, run: `git --version`

---

## 📥 2. Clone the Repository

Open a terminal window and navigate to the directory where you want your project to be located.

```bash
# Clone the repository
git clone https://github.com/Krishnak8080/Civic_Sense.git

# Enter the project folder
cd Civic_Sense
```

---

## ⚙️ 3. Install Dependencies

The project uses a workspace structure that allows you to install frontend and backend dependencies simultaneously from the root directory.

Run the following command in the root `Civic_Sense` folder:

```bash
# Install all dependencies for both frontend and backend
npm install
```

---

## 🔑 4. Environment Variables Configuration

For security reasons, `.env` files are ignored by git. You must manually recreate them to connect the application to Supabase, Google Maps, and Gemini AI.

### Frontend Environment Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create a new file named `.env.local` and add the following keys:
   ```env
   # Your Supabase Project URL
   VITE_SUPABASE_URL="https://your-project-url.supabase.co"
   
   # Your Supabase Public Anon Key
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   
   # Your Google Maps API Key (Must have Maps JS, Places, and Geocoding APIs enabled)
   VITE_GOOGLE_MAPS_API_KEY="your-google-maps-key"
   
   # Point the frontend to the local backend during development
   VITE_API_URL="http://localhost:8000" 
   ```

### Backend Environment Setup
1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```
2. Create a new file named `.env` and add the following keys:
   ```env
   # Your Google Gemini AI API Key
   GEMINI_API_KEY="your-gemini-api-key"
   
   # Your Supabase Project URL
   SUPABASE_URL="https://your-project-url.supabase.co"
   
   # Your Supabase Service Role Key (DO NOT share this publicly)
   SUPABASE_SERVICE_KEY="your-service-role-key"
   ```

---

## 🗄️ 5. Supabase Database Configuration

If you are setting this up with a brand new Supabase instance, you must create the necessary tables for the application to function.

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'pending',
  latitude NUMERIC,
  longitude NUMERIC,
  formatted_address TEXT,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reads
CREATE POLICY "Allow public read access" ON reports
FOR SELECT USING (true);

-- Create policy to allow public inserts
CREATE POLICY "Allow public inserts" ON reports
FOR INSERT WITH CHECK (true);

-- Create policy to allow public updates (for voting)
CREATE POLICY "Allow public updates" ON reports
FOR UPDATE USING (true);
```

You must also create a storage bucket named `reports` and make it public so users can upload and view photos.

---

## 🏃 6. Running the Development Servers

Now that dependencies are installed and environment variables are set, you can run the entire stack with a single command.

Navigate back to the root `Civic_Sense` directory:
```bash
cd ..
```

Run the application:
```bash
npm start
```

### What happens now?
- The **Frontend** (React + Vite) will compile and become accessible at: `http://localhost:5173`
- The **Backend** (Node.js + Express) will boot up and listen for API requests at: `http://localhost:8000`

---

## 🌐 7. Deploying to Production (Vercel & Render)

When you are ready to take the project live:

**Backend (Render):**
1. Create a new Web Service on Render and point it to the repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add the backend Environment Variables.

**Frontend (Vercel):**
1. Create a new Project on Vercel and import the repository.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite.
4. Add the frontend Environment Variables.
5. Set `VITE_API_URL` to your live Render backend URL.
6. Deploy!
