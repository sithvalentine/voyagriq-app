-- ============================================
-- API KEYS TABLE (FIXED VERSION)
-- Store Premium user API keys securely in database
-- ============================================

-- Drop table if it exists (clean slate)
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  requests_count INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'api_keys'
  ) THEN
    RAISE NOTICE '✅ api_keys table created successfully';
  ELSE
    RAISE WARNING '❌ api_keys table was NOT created!';
  END IF;
END $$;
