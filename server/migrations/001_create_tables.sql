-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  interests JSONB DEFAULT '[]'::jsonb,
  companions JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_places table
CREATE TABLE IF NOT EXISTS public.saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  yelp_business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_data JSONB DEFAULT '{}'::jsonb,
  custom_notes TEXT,
  ai_reason TEXT,
  day_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_trip_id ON public.saved_places(trip_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
