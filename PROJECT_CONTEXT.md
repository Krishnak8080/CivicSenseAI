# Civic Sense AI - Project Context & Implementation Details

This document serves as the technical memory of the Civic Sense AI project. It outlines the architectural decisions, database schemas, and specific implementation details completed so far, ensuring a smooth transition for future development sessions.

---

## 1. System Architecture

Civic Sense AI is a monolithic repository with a separated frontend and backend, orchestrated by a root `package.json` workspace runner.

*   **Frontend (`/frontend`)**: A React 18 SPA built with Vite, TypeScript, and Tailwind CSS.
*   **Backend (`/backend`)**: A Node.js/Express server that acts as a secure proxy to the Gemini AI API and the Supabase database.
*   **Database**: Supabase (PostgreSQL) hosted remotely.
*   **Orchestration**: The root directory uses `concurrently` to run both servers simultaneously via `npm start`.

---

## 2. Core Workflows Implemented

### 📍 Location Precision System
The application features a highly precise location input mechanism to ensure civic issues are accurately mapped.
*   **Component**: `LocationAutocompleteInput.tsx` uses `@googlemaps/js-api-loader`.
*   **Features**: It utilizes the Google Places Autocomplete API for search, and HTML5 Geolocation for "Use My Location".
*   **Data Extracted**: It captures the raw text address, the `formatted_address` from Google, and the precise `latitude` and `longitude` coordinates.

### 🧠 AI Priority Analysis & Submission
When a user submits a report via `ReportForm.tsx`:
1.  The frontend uploads the photo (if any) directly to Supabase Storage (`report-photos` bucket).
2.  The frontend sends the form data (including location and photo URL) to the backend via a `POST` request to `http://localhost:8000/api/reports`.
3.  **The Backend** intercepts the request and uses the **Gemini 1.5 Flash model** (`genAI.getGenerativeModel`) to analyze the `title` and `description`.
4.  Gemini returns a priority classification: `high`, `medium`, or `low`.
5.  The backend then securely inserts the entire record (including coordinates, formatted address, and AI-determined priority) into the Supabase database using the `SUPABASE_SERVICE_KEY` to bypass RLS during creation.

### 🗺️ Interactive Map
*   **Component**: `MapSection.tsx`
*   **Features**: Renders reports on a Google Map. Markers are dynamically colored based on the AI-assigned `priority` using custom SVG assets (`pin-high.svg`, `pin-medium.svg`, `pin-low.svg`).

---

## 3. Database Schema (Supabase)

### Table: `reports`
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (Foreign Key to `profiles.id`)
*   `title`: Text
*   `description`: Text
*   `location`: Text (User-friendly name or searched string)
*   `formatted_address`: Text (Precise address from Google Maps API)
*   `latitude`: Numeric
*   `longitude`: Numeric
*   `image_url`: Text (Nullable, URL to Supabase Storage)
*   `priority`: Text (Enum: 'low', 'medium', 'high' - Determined by Gemini)
*   `status`: Text (Enum: 'pending', 'resolved')
*   `votes_count`: Numeric (Default: 0) *(Note: Previously attempted as `upvotes`/`downvotes`, but migrated to a single `votes_count` metric to prevent 500 errors).*
*   `created_at`: Timestampz

### Table: `profiles`
*   `id`: UUID (Matches Supabase Auth UID)
*   `email`: Text
*   `role`: Text ('user' | 'admin')
*   `created_at`: Timestampz

### Table: `votes`
*(Note: Implementation for unique user voting tracking)*
*   `id`: UUID
*   `user_id`: UUID
*   `report_id`: UUID
*   `vote_type`: Numeric (1 for upvote, -1 for downvote)
*   `created_at`: Timestampz

---

## 4. Environment Variables Required

**Frontend (`frontend/.env.local`)**:
```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

**Backend (`backend/.env`)**:
```env
PORT=8000
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_KEY="your_supabase_service_role_key" # DO NOT SHARE
GEMINI_API_KEY="your_google_gemini_key"
```

---

## 5. Known Warnings & Future Work

*   **Google Maps Console Warnings**: You may see yellow warnings in the browser console regarding `google.maps.Marker` and `google.maps.places.Autocomplete` deprecations. These are safe to ignore for now, but a future refactor should migrate `MapSection.tsx` to use `AdvancedMarkerElement` and `PlaceAutocompleteElement`.
*   **Social Feed Integration**: The current routing points `/my-reports` to the generic Feed page. A dedicated view filtering reports by the active `user_id` needs to be built.
*   **Admin Dashboard Features**: The `/admin` route is protected, but the UI for bulk-updating statuses from 'pending' to 'resolved' is pending completion.
*   **Error Handling**: The backend currently returns 500 on database insertion failures. Better error typing and frontend toast notifications (via `sonner`) should be expanded.
