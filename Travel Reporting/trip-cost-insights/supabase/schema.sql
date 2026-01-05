-- VoyagrIQ Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT_ID/editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'standard', 'premium')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Trip Identification
  trip_id TEXT NOT NULL, -- User's custom trip ID (e.g., "T001")
  client_name TEXT NOT NULL,
  travel_agency TEXT,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Destination
  destination_country TEXT NOT NULL,
  destination_city TEXT,

  -- Travelers
  adults INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  total_travelers INTEGER NOT NULL,

  -- Costs (all in cents to avoid floating point issues)
  flight_cost INTEGER DEFAULT 0,
  hotel_cost INTEGER DEFAULT 0,
  ground_transport INTEGER DEFAULT 0,
  activities_tours INTEGER DEFAULT 0,
  meals_cost INTEGER DEFAULT 0,
  insurance_cost INTEGER DEFAULT 0,
  other_costs INTEGER DEFAULT 0,
  trip_total_cost INTEGER GENERATED ALWAYS AS (
    flight_cost + hotel_cost + ground_transport +
    activities_tours + meals_cost + insurance_cost + other_costs
  ) STORED,

  -- Currency
  currency TEXT DEFAULT 'USD',

  -- Commission tracking
  commission_rate DECIMAL(5,2),
  commission_amount INTEGER,

  -- Premium Features
  client_id TEXT, -- For organizing multiple trips per client
  client_type TEXT CHECK (client_type IN ('individual', 'corporate', 'group')),
  tags TEXT[], -- Array of tag names
  custom_fields JSONB, -- Flexible custom data

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, trip_id) -- User's trip_id must be unique per user
);

-- ============================================
-- TAGS TABLE (Premium Feature)
-- ============================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  trip_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name) -- Tag names must be unique per user
);

-- ============================================
-- TEAM MEMBERS TABLE (Standard+ Feature)
-- ============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL if invitation pending
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ,

  UNIQUE(owner_id, email) -- Can't invite same email twice
);

-- ============================================
-- WHITE LABEL SETTINGS TABLE (Premium Feature)
-- ============================================
CREATE TABLE public.white_label_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  company_name TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  website_url TEXT,
  support_email TEXT,
  footer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- API KEYS TABLE (Premium Feature)
-- ============================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, key_name)
);

-- ============================================
-- SCHEDULED REPORTS TABLE (Standard+ Feature)
-- ============================================
CREATE TABLE public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL, -- Array of email addresses
  filters JSONB, -- Store report filters
  is_active BOOLEAN DEFAULT true,
  last_sent TIMESTAMPTZ,
  next_send TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_start_date ON public.trips(start_date);
CREATE INDEX idx_trips_client_name ON public.trips(client_name);
CREATE INDEX idx_trips_tags ON public.trips USING GIN(tags);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_team_members_owner_id ON public.team_members(owner_id);
CREATE INDEX idx_team_members_member_id ON public.team_members(member_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips: Users can manage their own trips
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Tags: Users can manage their own tags
CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Team Members: Users can view/manage team members they own
CREATE POLICY "Users can view own team" ON public.team_members
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = member_id);

CREATE POLICY "Users can manage own team" ON public.team_members
  FOR ALL USING (auth.uid() = owner_id);

-- White Label: Users can manage their own settings
CREATE POLICY "Users can view own white label settings" ON public.white_label_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own white label settings" ON public.white_label_settings
  FOR ALL USING (auth.uid() = user_id);

-- API Keys: Users can manage their own API keys
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled Reports: Users can manage their own scheduled reports
CREATE POLICY "Users can view own reports" ON public.scheduled_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports" ON public.scheduled_reports
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_updated_at BEFORE UPDATE ON public.white_label_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, trial_start_date, trial_end_date)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- You can add sample data here if needed for testing

-- ============================================
-- VIEWS for Analytics (Optional)
-- ============================================

-- View for trip statistics per user
CREATE VIEW trip_statistics AS
SELECT
  user_id,
  COUNT(*) as total_trips,
  SUM(trip_total_cost) as total_revenue,
  AVG(trip_total_cost) as avg_trip_cost,
  MIN(start_date) as first_trip_date,
  MAX(start_date) as latest_trip_date
FROM public.trips
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON trip_statistics TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Schema created successfully!
-- Next steps:
-- 1. Copy your Supabase URL and keys to .env.local
-- 2. Test connection by signing up a user
-- 3. Migrate existing localStorage data (optional)
