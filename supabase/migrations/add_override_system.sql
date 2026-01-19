-- ============================================
-- Override System for VoyagrIQ
-- ============================================
-- This migration adds tables for managing:
-- 1. Agency-level default settings (commission rates, markup rules)
-- 2. Vendor-specific pricing rules (markups, discounts, negotiated rates)
-- 3. Client-specific pricing overrides (VIP discounts, corporate rates)
-- 4. Cost adjustment tracking (original vs. final pricing)
--
-- Created: 2026-01-19
-- ============================================

-- ============================================
-- 1. AGENCY SETTINGS TABLE
-- ============================================
-- Stores agency-wide default settings and preferences

CREATE TABLE IF NOT EXISTS public.agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Default Commission Settings
  default_commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (default_commission_type IN ('percentage', 'flat_fee')),
  default_commission_value DECIMAL(10,2) NOT NULL DEFAULT 15.0,

  -- Commission by Client Type
  individual_commission_rate DECIMAL(10,2),
  corporate_commission_rate DECIMAL(10,2),
  group_commission_rate DECIMAL(10,2),

  -- Markup/Discount Defaults
  default_markup_percentage DECIMAL(10,2) DEFAULT 0,
  apply_markup_to_flights BOOLEAN DEFAULT false,
  apply_markup_to_hotels BOOLEAN DEFAULT false,
  apply_markup_to_activities BOOLEAN DEFAULT false,

  -- Other Settings
  currency TEXT DEFAULT 'USD',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================
-- 2. VENDOR PRICING RULES TABLE
-- ============================================
-- Stores pricing rules for specific vendors

CREATE TABLE IF NOT EXISTS public.vendor_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vendor Information
  vendor_name TEXT NOT NULL,
  vendor_category TEXT NOT NULL CHECK (vendor_category IN ('flight', 'hotel', 'ground_transport', 'activities', 'cruise', 'insurance', 'other')),

  -- Pricing Rules
  rule_type TEXT NOT NULL CHECK (rule_type IN ('markup', 'discount', 'flat_fee', 'negotiated_rate')),
  rule_value DECIMAL(10,2) NOT NULL, -- Percentage or dollar amount

  -- Optional: Negotiated Rate Details
  negotiated_description TEXT, -- e.g., "10% discount on all bookings over $5000"
  minimum_booking_amount DECIMAL(10,2), -- Threshold for negotiated rate

  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, vendor_name, vendor_category)
);

-- ============================================
-- 3. CLIENT PRICING OVERRIDES TABLE
-- ============================================
-- Stores client-specific pricing rules

CREATE TABLE IF NOT EXISTS public.client_pricing_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Client Information
  client_name TEXT NOT NULL,
  client_id TEXT, -- Optional client ID for grouping
  client_type TEXT CHECK (client_type IN ('individual', 'corporate', 'group')),

  -- Override Type
  override_type TEXT NOT NULL CHECK (override_type IN ('commission_rate', 'markup', 'discount', 'flat_fee')),
  override_value DECIMAL(10,2) NOT NULL,

  -- Description
  description TEXT, -- e.g., "VIP client - 5% discount on all trips"

  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, client_name)
);

-- ============================================
-- 4. TRIP COST ADJUSTMENTS TABLE
-- ============================================
-- Tracks cost adjustments and overrides applied to specific trips

CREATE TABLE IF NOT EXISTS public.trip_cost_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL, -- References trips.trip_id

  -- Adjustment Details
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('vendor_markup', 'vendor_discount', 'client_discount', 'negotiated_rate', 'manual_adjustment', 'commission_override')),
  cost_category TEXT NOT NULL CHECK (cost_category IN ('flight', 'hotel', 'ground_transport', 'activities', 'meals', 'insurance', 'cruise', 'other', 'commission')),

  -- Original vs. Adjusted Values
  original_amount DECIMAL(10,2) NOT NULL,
  adjusted_amount DECIMAL(10,2) NOT NULL,
  adjustment_amount DECIMAL(10,2) GENERATED ALWAYS AS (adjusted_amount - original_amount) STORED,
  adjustment_percentage DECIMAL(10,2), -- Optional: for percentage-based adjustments

  -- Applied Rules
  vendor_name TEXT,
  vendor_rule_id UUID REFERENCES public.vendor_pricing_rules(id) ON DELETE SET NULL,
  client_override_id UUID REFERENCES public.client_pricing_overrides(id) ON DELETE SET NULL,

  -- Description
  reason TEXT,
  notes TEXT,

  -- Metadata
  applied_by UUID REFERENCES auth.users(id), -- User who applied the adjustment
  applied_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_agency_settings_user_id ON public.agency_settings(user_id);
CREATE INDEX idx_vendor_pricing_rules_user_id ON public.vendor_pricing_rules(user_id);
CREATE INDEX idx_vendor_pricing_rules_vendor ON public.vendor_pricing_rules(user_id, vendor_name, vendor_category);
CREATE INDEX idx_vendor_pricing_rules_active ON public.vendor_pricing_rules(user_id, is_active);
CREATE INDEX idx_client_pricing_overrides_user_id ON public.client_pricing_overrides(user_id);
CREATE INDEX idx_client_pricing_overrides_client ON public.client_pricing_overrides(user_id, client_name);
CREATE INDEX idx_client_pricing_overrides_active ON public.client_pricing_overrides(user_id, is_active);
CREATE INDEX idx_trip_cost_adjustments_user_trip ON public.trip_cost_adjustments(user_id, trip_id);
CREATE INDEX idx_trip_cost_adjustments_type ON public.trip_cost_adjustments(adjustment_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_cost_adjustments ENABLE ROW LEVEL SECURITY;

-- Agency Settings Policies
CREATE POLICY "Users can view own agency settings" ON public.agency_settings
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own agency settings" ON public.agency_settings
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own agency settings" ON public.agency_settings
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own agency settings" ON public.agency_settings
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Vendor Pricing Rules Policies
CREATE POLICY "Users can view own vendor rules" ON public.vendor_pricing_rules
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own vendor rules" ON public.vendor_pricing_rules
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own vendor rules" ON public.vendor_pricing_rules
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own vendor rules" ON public.vendor_pricing_rules
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Client Pricing Overrides Policies
CREATE POLICY "Users can view own client overrides" ON public.client_pricing_overrides
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own client overrides" ON public.client_pricing_overrides
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own client overrides" ON public.client_pricing_overrides
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own client overrides" ON public.client_pricing_overrides
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Trip Cost Adjustments Policies
CREATE POLICY "Users can view own trip adjustments" ON public.trip_cost_adjustments
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own trip adjustments" ON public.trip_cost_adjustments
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own trip adjustments" ON public.trip_cost_adjustments
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own trip adjustments" ON public.trip_cost_adjustments
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp for agency_settings
CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for vendor_pricing_rules
CREATE TRIGGER update_vendor_pricing_rules_updated_at
  BEFORE UPDATE ON public.vendor_pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for client_pricing_overrides
CREATE TRIGGER update_client_pricing_overrides_updated_at
  BEFORE UPDATE ON public.client_pricing_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get effective commission rate for a client
CREATE OR REPLACE FUNCTION get_client_commission_rate(
  p_user_id UUID,
  p_client_name TEXT,
  p_client_type TEXT
) RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_override_rate DECIMAL(10,2);
  v_type_rate DECIMAL(10,2);
  v_default_rate DECIMAL(10,2);
BEGIN
  -- Check for client-specific override
  SELECT override_value INTO v_override_rate
  FROM client_pricing_overrides
  WHERE user_id = p_user_id
    AND client_name = p_client_name
    AND override_type = 'commission_rate'
    AND is_active = true
    AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
    AND (effective_until IS NULL OR effective_until >= CURRENT_DATE);

  IF v_override_rate IS NOT NULL THEN
    RETURN v_override_rate;
  END IF;

  -- Check for client type default
  SELECT
    CASE
      WHEN p_client_type = 'individual' THEN individual_commission_rate
      WHEN p_client_type = 'corporate' THEN corporate_commission_rate
      WHEN p_client_type = 'group' THEN group_commission_rate
      ELSE NULL
    END INTO v_type_rate
  FROM agency_settings
  WHERE user_id = p_user_id;

  IF v_type_rate IS NOT NULL THEN
    RETURN v_type_rate;
  END IF;

  -- Fall back to default commission rate
  SELECT default_commission_value INTO v_default_rate
  FROM agency_settings
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_default_rate, 15.0);
END;
$$;

-- Function to get vendor markup/discount
CREATE OR REPLACE FUNCTION get_vendor_pricing_adjustment(
  p_user_id UUID,
  p_vendor_name TEXT,
  p_vendor_category TEXT,
  p_cost_amount DECIMAL(10,2)
) RETURNS TABLE (
  adjusted_amount DECIMAL(10,2),
  adjustment_type TEXT,
  rule_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rule RECORD;
  v_adjusted DECIMAL(10,2);
BEGIN
  -- Find active vendor pricing rule
  SELECT * INTO v_rule
  FROM vendor_pricing_rules
  WHERE user_id = p_user_id
    AND vendor_name = p_vendor_name
    AND vendor_category = p_vendor_category
    AND is_active = true
    AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
    AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    AND (minimum_booking_amount IS NULL OR p_cost_amount >= minimum_booking_amount)
  LIMIT 1;

  IF v_rule IS NULL THEN
    -- No rule found, return original amount
    RETURN QUERY SELECT p_cost_amount, 'none'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Apply the rule based on type
  CASE v_rule.rule_type
    WHEN 'markup' THEN
      v_adjusted := p_cost_amount * (1 + v_rule.rule_value / 100);
    WHEN 'discount' THEN
      v_adjusted := p_cost_amount * (1 - v_rule.rule_value / 100);
    WHEN 'flat_fee' THEN
      v_adjusted := p_cost_amount + v_rule.rule_value;
    WHEN 'negotiated_rate' THEN
      v_adjusted := p_cost_amount * (1 - v_rule.rule_value / 100);
    ELSE
      v_adjusted := p_cost_amount;
  END CASE;

  RETURN QUERY SELECT v_adjusted, v_rule.rule_type, v_rule.id;
END;
$$;

-- ============================================
-- COMPLETION
-- ============================================
-- Override system tables, policies, and functions created successfully
-- Next steps:
-- 1. Create UI for managing agency settings
-- 2. Create UI for vendor pricing rules
-- 3. Create UI for client overrides
-- 4. Update trip form to apply overrides automatically
