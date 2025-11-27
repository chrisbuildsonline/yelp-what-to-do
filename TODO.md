# Technical Implementation Guide: Yelp! What to do?

## Overview
This prototype is a frontend-only mockup. To make it a fully functional production application, you need to integrate a backend with database, authentication, and the Yelp Fusion API.

## 1. Architecture
- **Frontend**: React (Vite) + Tailwind CSS (Already built)
- **Backend**: Node.js / Express (Needs implementation in `server/`)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **AI/Data**: Yelp Fusion API + OpenAI (for personalized reasoning)

## 2. Supabase Setup (Database & Auth)

### Authentication
1. Create a Supabase project.
2. Enable **Email/Password** and **Google/Social** providers in Authentication > Providers.
3. Install Supabase client: `npm install @supabase/supabase-js`
4. Initialize Supabase in `client/src/lib/supabase.ts`.

### Database Schema
Run the following SQL in Supabase's SQL Editor to create the necessary tables:

```sql
-- Users table (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Trips table
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  location text not null,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- Interests & Companions (JSONB is flexible for this)
alter table public.trips add column interests jsonb default '[]'; 
alter table public.trips add column companions jsonb default '[]'; 
-- Companions should be stored as an array of objects:
-- [
--   { "name": "Alex", "interests": ["Sushi", "Jazz", "Hiking"] },
--   { "name": "Sam", "interests": [] }
-- ]
-- This rich data structure allows the AI to find intersections between user interests and companion interests.

-- Saved Places (Itinerary)
create table public.saved_places (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) not null,
  yelp_business_id text not null,
  custom_notes text,
  day_order int,
  created_at timestamp with time zone default now()
);
```

## 3. Yelp Fusion API Integration

### Setup
1. Go to [Yelp Fusion](https://www.yelp.com/fusion).
2. Create an App to get your `API_KEY`.
3. **Important**: API calls must happen on the **Backend** (`server/`) to avoid CORS issues and exposing your API key.

### Backend Routes (Node.js/Express)
Create a proxy route in `server/routes.ts`:

```typescript
import axios from 'axios';

// Search Businesses
app.get('/api/yelp/search', async (req, res) => {
  const { location, term, categories } = req.query;
  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
      params: {
        location,
        term, // e.g., "dinner", "hiking"
        categories, // e.g., "cafes,newamerican"
        limit: 20
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Business Details (Reviews, Photos)
app.get('/api/yelp/business/:id', async (req, res) => {
  // ... similar implementation for /businesses/{id} endpoint
});
```

## 4. AI Personalization Layer (OpenAI)
To generate the "Why we picked this" text:
1. Fetch raw results from Yelp.
2. Send the list of businesses + User Preferences (Interests/Companions) to OpenAI.
3. Prompt: *"Given these 5 Yelp restaurants and a user who loves Jazz and has a friend who is Vegan, select the best 3 matches and write a one-sentence justification for each."*
4. Return the enriched list to the frontend.

## 5. Environment Variables
Create a `.env` file (do not commit this):
```
DATABASE_URL=postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=[PUBLIC_KEY]
YELP_API_KEY=[YOUR_YELP_KEY]
OPENAI_API_KEY=[YOUR_OPENAI_KEY]
```
