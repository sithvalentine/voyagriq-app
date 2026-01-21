-- Add is_archived column to trips table if it doesn't exist
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add trial_expired column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expired BOOLEAN DEFAULT false;

-- Create index for archived trips
CREATE INDEX IF NOT EXISTS idx_trips_archived ON trips(user_id, is_archived, departure_date);

-- Create index for trial expiration
CREATE INDEX IF NOT EXISTS idx_profiles_trial ON profiles(trial_ends_at, subscription_tier, stripe_customer_id);

-- Function to analyze all tables (for maintenance)
CREATE OR REPLACE FUNCTION analyze_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Analyze main tables for query optimization
  ANALYZE trips;
  ANALYZE profiles;
  ANALYZE vendor_pricing_rules;
  ANALYZE client_pricing_overrides;
  ANALYZE agency_settings;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION analyze_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_tables() TO service_role;

-- Comment on function
COMMENT ON FUNCTION analyze_tables() IS 'Analyzes all main tables to update statistics for query optimization';
