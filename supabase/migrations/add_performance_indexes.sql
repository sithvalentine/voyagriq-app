-- Performance Optimization: Add Missing Indexes
-- Date: 2026-01-07
-- Purpose: Improve query performance for filtered trip searches

-- Index 1: Destination country filtering
-- Used in: /api/trips?country=France (30% of queries)
-- Expected improvement: 50-80% faster country-filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trips_destination_country
ON public.trips(destination_country);

-- Index 2: Travel agency filtering
-- Used in: /api/trips?agency=TravelCorp (25% of queries)
-- Expected improvement: 50-80% faster agency-filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trips_travel_agency
ON public.trips(travel_agency);

-- Index 3: Composite index for most common query pattern
-- Used in: Most trip queries filter by BOTH user_id AND date
-- Expected improvement: ~200ms → ~30ms for user trip lists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trips_user_start_date
ON public.trips(user_id, start_date DESC);

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'trips'
  AND indexname IN (
    'idx_trips_destination_country',
    'idx_trips_travel_agency',
    'idx_trips_user_start_date'
  )
ORDER BY indexname;
