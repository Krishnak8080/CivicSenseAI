# Civic Sense AI - System Architecture & Technical Documentation

This document explains the architecture, data flow, database design, and key subsystems of **Civic Sense AI**, a full-stack AI-powered civic reporting and verification platform.

---

## 1. System Architecture Overview

Civic Sense AI is built using a decoupled client-server architecture consisting of three main tiers: the React Frontend SPA, the Node.js/Express API Backend, and the Supabase Cloud Backend (database, auth, and object storage).

```mermaid
graph TD
    subgraph Frontend ["React SPA (Client)"]
        UI["UI Pages / Components"]
        GMaps["Google Maps JS API Loader"]
        SupaClient["Supabase Client SDK"]
    end

    subgraph Backend ["Node.js Express API (Server)"]
        Server["Express App (PORT 8000)"]
        VerifyEngine["Photo Validation Engine"]
        ReportRoute["Report Router"]
    end

    subgraph Supabase ["Supabase Cloud Services"]
        Auth["Supabase Authentication"]
        DB["PostgreSQL Database"]
        Storage["Object Storage (report-photos)"]
    end

    subgraph AI_Services ["Third-Party APIs"]
        Gemini["Google Gemini 2.5 Flash API"]
        GooglePlaces["Google Places / Autocomplete API"]
    end

    %% Client Interactions
    UI --> GMaps
    UI --> SupaClient
    SupaClient -- Authenticates / Gets JWT --> Auth
    SupaClient -- Uploads Image File --> Storage
    UI -- Sends Report Submission POST --> Server
    GMaps -- Geocodes location --> GooglePlaces

    %% Server Interactions
    Server --> VerifyEngine
    VerifyEngine -- Sends Image & Prompt --> Gemini
    Server -- Secure Insert (Service Role Key) --> DB
```

---

## 2. Core Subsystems

### A. Frontend Single-Page Application (React & TypeScript)

- **Vite Development Server:** Hosts the client on `http://localhost:5173`.
- **Google Maps Integration:** Utilizes `@googlemaps/js-api-loader` to load Google Maps dynamically. The maps display report locations with custom SVG markers color-coded by priority.
- **Form Wizard:** The `ReportForm.tsx` component guides users through submitting a title, description, locating the issue on the map, and uploading a photo.

### B. Node.js & Express API Backend

- **Server Entrypoint:** Runs on `http://localhost:8000` via `backend/server.js`.
- **Gemini priority classifier:** Classifies civic reports dynamically based on description severity (High, Medium, Low).
- **Photo Validation Engine (`backend/routes/photoValidation.js`):** Performs multi-layered validation on uploaded photos to detect mismatches, deepfakes, and coordinate checks.

### C. Database & Storage Layer (Supabase / PostgreSQL)

- **Relational Database:** Houses PostgreSQL tables (`profiles`, `reports`, `votes`) with RLS policy controls.
- **Supabase Storage:** Hosts a public bucket named `report-photos` where uploaded photos are stored.

---

## 3. Data Flow Diagram: Report Submission & Verification

The sequence diagram below shows how a citizen report goes through validation, AI priority analysis, and database insertion.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen User
    participant FE as React Frontend
    participant SB_Storage as Supabase Storage
    participant BE as Express Backend
    participant Gemini as Gemini 2.5 Flash
    participant DB as PostgreSQL (Supabase)

    Citizen->>FE: Enters report details & selects photo
    FE->>FE: Extracts EXIF metadata & converts photo to Base64
    FE->>BE: POST /api/validate-photo (imageBase64, title, description)

    activate BE
    Note over BE,Gemini: Multi-Layer Validation Pipeline (Parallel)
    par Content Match
        BE->>Gemini: Check if image matches title/description
    and Authenticity Check
        BE->>BE: Run Sharp image diagnostics (noise, edges, compression)
    and Metadata Check
        BE->>BE: Read EXIF metadata bounds (must be in India bounds)
    and Issue Classification
        BE->>Gemini: Auto-classify issue category & severity
    end

    Gemini-->>BE: Returns classification & match rating JSON
    BE-->>FE: Returns verification outcome (VERIFIED / FLAGGED / REJECTED)
    deactivate BE

    alt Validation Status is REJECTED
        FE-->>Citizen: Show validation error toast (Stops submission)
    else Validation Status is VERIFIED or FLAGGED
        FE->>SB_Storage: Upload photo file to 'report-photos' bucket
        SB_Storage-->>FE: Return public image_url

        FE->>BE: POST /api/reports (with image_url, coordinates, address, and validation data)
        activate BE
        BE->>Gemini: Query priority determination (high/medium/low) based on text description
        Gemini-->>BE: Returns priority word

        BE->>DB: Insert into 'reports' table (using service role key to bypass RLS)
        DB-->>BE: Insert success status
        BE-->>FE: Return saved report object
        deactivate BE

        FE-->>Citizen: Show success toast & redirect to Feed
    end
```

---

## 4. Database Schema & Relationships

```mermaid
erDiagram
    profiles {
        uuid id PK "Matches auth.users.id"
        text email "User email address"
        text role "user | admin"
        timestampz created_at
    }

    reports {
        uuid id PK
        uuid user_id FK "References profiles.id"
        text title
        text description
        text location "User selected address text"
        text formatted_address "Standardized address from Google Maps"
        double_precision latitude "Latitude for map markers"
        double_precision longitude "Longitude for map markers"
        text image_url "URL of uploaded photo"
        text priority "low | medium | high"
        text status "pending | resolved"
        integer votes_count "Upvote count tracker"
        text photo_validation_status "verified | flagged | rejected | pending"
        integer photo_validation_confidence "0-100 score"
        text_array photo_validation_warnings "Array of validation warnings"
        jsonb photo_validation_data "Detailed analysis payload"
        boolean requires_manual_review "Flags suspicious reports"
        timestampz created_at
    }

    votes {
        uuid id PK
        uuid user_id FK "References profiles.id"
        uuid report_id FK "References reports.id"
        integer vote_type "1 (upvote) or -1 (downvote)"
        timestampz created_at
    }

    profiles ||--o{ reports : "submits"
    profiles ||--o{ votes : "casts"
    reports ||--o{ votes : "receives"
```

### PostgreSQL Functions & Triggers (Supabase)

To ensure the social feed remains fast and upvotes are consistent, we utilize an active database trigger that calculates upvotes:

```sql
CREATE OR REPLACE FUNCTION handle_vote_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reports SET votes_count = votes_count + NEW.vote_type WHERE id = NEW.report_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reports SET votes_count = votes_count - OLD.vote_type WHERE id = OLD.report_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE reports SET votes_count = votes_count - OLD.vote_type + NEW.vote_type WHERE id = NEW.report_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION handle_vote_change();
```

---

## 5. Main APIs & Endpoints

| Endpoint                | Method | Description                                                                           | Input                                                                                                           | Output                                                                                    |
| ----------------------- | ------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/api/validate-photo`   | `POST` | Processes Base64 image data through the multi-layered verification pipeline.          | `{ imageBase64, description, title }`                                                                           | `{ status, overallConfidence, warnings, recommendation, validations }`                    |
| `/api/reports`          | `POST` | Creates a new report after running AI Priority classification and saving to Postgres. | `{ title, description, photo_url, latitude, longitude, address, formatted_address, user_id, photo_validation }` | `{ id, title, description, latitude, longitude, priority, photo_validation_status, ... }` |
| `/api/analyze-priority` | `POST` | Analyzes a title and description, returning an issue severity classification.         | `{ title, description }`                                                                                        | `{ priority }`                                                                            |
