-- Migration: Add webhook_events table for idempotency
-- Run this in Supabase SQL Editor if you've already created the main schema

-- ============================================
-- WEBHOOK EVENTS TABLE (for idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL, -- Stripe event ID
  event_type TEXT NOT NULL, -- e.g., 'checkout.session.completed'
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_data JSONB, -- Store the full event data for debugging
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- No user access to webhook_events - only service role
-- This table is for backend idempotency checking only
