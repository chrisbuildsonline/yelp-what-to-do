-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS saved_places CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  interests JSONB DEFAULT '[]'::jsonb,
  companions JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved places table
CREATE TABLE saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  yelp_business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_data JSONB DEFAULT '{}'::jsonb,
  custom_notes TEXT,
  ai_reason TEXT,
  day_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_saved_places_trip_id ON saved_places(trip_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read all user data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- RLS Policies for trips table
CREATE POLICY "Users can read all trips" ON trips
  FOR SELECT USING (true);

CREATE POLICY "Users can insert trips" ON trips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update trips" ON trips
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete trips" ON trips
  FOR DELETE USING (true);

-- RLS Policies for saved_places table
CREATE POLICY "Users can read all saved places" ON saved_places
  FOR SELECT USING (true);

CREATE POLICY "Users can insert saved places" ON saved_places
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update saved places" ON saved_places
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete saved places" ON saved_places
  FOR DELETE USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📊 Tables created: users, trips, saved_places';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '🚀 Ready to use!';
END $$;
