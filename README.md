# Civic Sense AI 🏙️

Civic Sense AI is a modern, AI-powered platform designed to help citizens easily report and track community issues (like potholes, broken streetlights, or illegal dumping). By combining precise location data, AI-driven priority assessment, and a transparent social feed, Civic Sense AI empowers communities and helps local administrations prioritize critical infrastructure repairs.

## 🚀 Key Features

* **Smart Issue Reporting:** Citizens can submit photos and descriptions of civic issues.
* **AI Priority Analysis:** Using the Gemini API, reports are instantly analyzed to determine their severity and priority (High, Medium, Low) without manual triage.
* **Precise Location Tracking:** Integrated with Google Maps Autocomplete and Reverse Geocoding to pinpoint exact coordinates and formatted addresses.
* **Interactive Map Visualization:** A live map displays active reports in your area, using custom SVG markers color-coded by AI-determined priority.
* **Social Feed & Upvoting:** A community feed where citizens can view, upvote, and track the status of reported issues, ensuring democratic prioritization.
* **Admin Dashboard:** A dedicated interface for municipal workers to manage issue statuses and view high-priority alerts.

## 🛠️ Technology Stack

**Frontend:**
* **React 18** (with TypeScript)
* **Vite** (Build Tool)
* **Tailwind CSS** (Styling & Layout)
* **Lucide React** (Icons)
* **Google Maps API** (`@googlemaps/js-api-loader`)

**Backend:**
* **Node.js & Express**
* **Gemini AI API** (Issue severity and priority assessment)
* **Multer** (Image upload handling)

**Database & Storage:**
* **Supabase** (PostgreSQL Database)
* **Supabase Storage** (Photo hosting)
* **Row Level Security (RLS)** configured for secure public access

## 📂 Project Structure

```
Civic_Sense/
├── frontend/             # React application
│   ├── src/components/   # Reusable UI components and Map logic
│   ├── src/pages/        # Main application routes (Home, Feed, Admin)
│   └── src/lib/          # Supabase client and utilities
├── backend/              # Node.js API server
│   ├── routes/           # Express routes (e.g., /api/reports)
│   └── server.js         # Main backend entry point
├── supabase/             # SQL Migrations and schema
└── package.json          # Root workspace runner
```

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Supabase project (Database and Storage configured)
* A Google Maps API Key (with Places, Geocoding, and Maps JavaScript APIs enabled)
* A Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Krishnak8080/Civic_Sense.git
   cd Civic_Sense
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   npm run install:all
   ```

3. **Environment Setup:**
   - In the `frontend` folder, copy `.env.example` to `.env.local` and add your Supabase and Google Maps keys.
   - In the `backend` folder, copy `.env.example` to `.env` and add your Gemini API key, Supabase URL, and Supabase Service Role key.

4. **Run the Application:**
   Thanks to the workspace runner, you can start both the frontend and backend simultaneously from the root directory:
   ```bash
   npm start
   ```
   - The frontend will be available at `http://localhost:5173`
   - The backend will run on `http://localhost:8000`

## 🛡️ Database Schema Notes
Make sure your Supabase `reports` table includes the following essential columns:
- `latitude` (numeric)
- `longitude` (numeric)
- `formatted_address` (text)
- `priority` (text)
- `votes_count` (numeric, default 0)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
