-- ============================================
-- API KEYS TABLE
-- Store Premium user API keys securely in database
-- ============================================

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed key, not plaintext
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "tci_abc1")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  requests_count INTEGER DEFAULT 0,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;

-- RLS Policies: Users can only manage their own API keys
CREATE POLICY "Users can view own API keys"
ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
ON public.api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
ON public.api_keys
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
ON public.api_keys
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.api_keys IS 'Stores API keys for Premium tier users with secure hashing';
COMMENT ON COLUMN public.api_keys.key_hash IS 'SHA-256 hash of the API key - never store plaintext';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'First 8 characters for display purposes (e.g., tci_abc1)';
COMMENT ON COLUMN public.api_keys.rate_limit IS 'Maximum API requests allowed per hour';

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'api_keys'
  ) THEN
    RAISE NOTICE '✅ api_keys table created successfully';
  ELSE
    RAISE WARNING '❌ Failed to create api_keys table';
  END IF;
END $$;
