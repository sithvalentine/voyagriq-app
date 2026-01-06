-- ============================================
-- CRITICAL SECURITY FIX: Enable RLS on trips table
-- This migration MUST be run immediately!
-- ============================================

-- Enable RLS on trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- Policy: Users can view only their own trips
CREATE POLICY "Users can view own trips"
ON public.trips
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert only their own trips
CREATE POLICY "Users can insert own trips"
ON public.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own trips
CREATE POLICY "Users can update own trips"
ON public.trips
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own trips
CREATE POLICY "Users can delete own trips"
ON public.trips
FOR DELETE
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.trips IS 'Trip data with RLS enabled - users can only access their own trips';

-- Verify RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'trips'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS is ENABLED on trips table';
  ELSE
    RAISE EXCEPTION '❌ RLS is NOT enabled on trips table! Migration failed.';
  END IF;
END $$;

-- Show all policies on trips table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'trips'
ORDER BY policyname;

-- Verify policy count
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'trips';

  IF policy_count = 4 THEN
    RAISE NOTICE '✅ All 4 RLS policies created successfully';
  ELSE
    RAISE WARNING '⚠️  Expected 4 policies, found %', policy_count;
  END IF;
END $$;
