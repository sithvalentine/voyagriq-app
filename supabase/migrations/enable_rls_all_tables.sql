-- ============================================
-- Enable RLS on ALL remaining tables
-- Run this AFTER fix_trips_rls_policies.sql
-- ============================================

-- ============================================
-- TAGS TABLE
-- ============================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;

CREATE POLICY "Users can view own tags"
ON public.tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
ON public.tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
ON public.tags FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
ON public.tags FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own team" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage own team" ON public.team_members;

-- Users can view teams they own OR are members of
CREATE POLICY "Users can view own team"
ON public.team_members FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = member_id);

-- Only owners can manage (insert/update/delete) team members
CREATE POLICY "Users can manage own team"
ON public.team_members FOR ALL
USING (auth.uid() = owner_id);

-- ============================================
-- WHITE LABEL SETTINGS TABLE
-- ============================================
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own white label settings" ON public.white_label_settings;
DROP POLICY IF EXISTS "Users can manage own white label settings" ON public.white_label_settings;

CREATE POLICY "Users can view own white label settings"
ON public.white_label_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own white label settings"
ON public.white_label_settings FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- API KEYS TABLE
-- ============================================
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;

CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
ON public.api_keys FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- SCHEDULED REPORTS TABLE
-- ============================================
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reports" ON public.scheduled_reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON public.scheduled_reports;

CREATE POLICY "Users can view own reports"
ON public.scheduled_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports"
ON public.scheduled_reports FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  tables_with_rls INTEGER;
  total_tables INTEGER := 7; -- profiles, trips, tags, team_members, white_label_settings, api_keys, scheduled_reports
BEGIN
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'trips', 'tags', 'team_members', 'white_label_settings', 'api_keys', 'scheduled_reports')
  AND rowsecurity = true;

  IF tables_with_rls = total_tables THEN
    RAISE NOTICE '✅ RLS is ENABLED on all % tables', total_tables;
  ELSE
    RAISE WARNING '⚠️  RLS enabled on % out of % tables', tables_with_rls, total_tables;
  END IF;
END $$;

-- Show summary of all tables and their RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'trips', 'tags', 'team_members', 'white_label_settings', 'api_keys', 'scheduled_reports')
ORDER BY tablename;
