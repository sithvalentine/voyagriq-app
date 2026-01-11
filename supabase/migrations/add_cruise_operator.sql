-- Migration: Add Cruise Operator support to trips table
-- Created: 2026-01-11
-- Description: Adds cruise_cost and cruise_operator fields to enable tracking cruise vendor expenses

-- Add cruise_cost column (stored in cents like other costs)
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS cruise_cost INTEGER DEFAULT 0;

-- Add cruise_operator vendor field
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS cruise_operator TEXT;

-- Update the trip_total_cost generated column to include cruise_cost
-- First, drop the view that depends on it
DROP VIEW IF EXISTS trip_statistics CASCADE;

-- Drop the existing generated column
ALTER TABLE public.trips
DROP COLUMN IF EXISTS trip_total_cost;

-- Recreate it with cruise_cost included
ALTER TABLE public.trips
ADD COLUMN trip_total_cost INTEGER GENERATED ALWAYS AS (
  flight_cost + hotel_cost + ground_transport +
  activities_tours + meals_cost + insurance_cost +
  COALESCE(cruise_cost, 0) + other_costs
) STORED;

-- Recreate the trip_statistics view
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

-- Add comment for documentation
COMMENT ON COLUMN public.trips.cruise_cost IS 'Cost of cruise packages in cents';
COMMENT ON COLUMN public.trips.cruise_operator IS 'Name of cruise line/operator (e.g., Royal Caribbean, Carnival, Norwegian)';

-- Migration complete
-- This migration is safe to run multiple times (idempotent)
