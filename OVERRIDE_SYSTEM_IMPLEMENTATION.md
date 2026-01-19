# Override System Implementation Guide

**Status**: Phase 1 Complete - Database schema and agency settings
**Created**: January 19, 2026

---

## Overview

The Override System allows agencies to:
1. Set default commission rates for all trips
2. Define commission rates by client type (individual, corporate, group)
3. Create vendor-specific pricing rules (markups, discounts, negotiated rates)
4. Set client-specific pricing overrides
5. Track cost adjustments and view pricing history

---

## Phase 1: ✅ COMPLETED

### Database Schema (`add_override_system.sql`)

**Tables Created:**
1. **`agency_settings`** - Agency-wide defaults
   - Default commission type and rate
   - Commission rates by client type
   - Default markup settings
   - Currency preferences

2. **`vendor_pricing_rules`** - Vendor-specific pricing
   - Vendor name and category
   - Rule type (markup, discount, flat_fee, negotiated_rate)
   - Effective dates and conditions
   - Minimum booking thresholds

3. **`client_pricing_overrides`** - Client-specific overrides
   - Client identification
   - Override type and value
   - Effective date ranges

4. **`trip_cost_adjustments`** - Adjustment tracking
   - Original vs adjusted costs
   - Applied rules and reasons
   - Audit trail

**Helper Functions:**
- `get_client_commission_rate()` - Calculates effective commission for a client
- `get_vendor_pricing_adjustment()` - Applies vendor pricing rules

### UI Components

**Agency Settings Page** (`/settings/agency`)
- ✅ Default commission configuration
- ✅ Client type commission rates
- ✅ Default markup settings
- ✅ Currency selection

---

## Phase 2: IN PROGRESS

### Vendor Management Page (`/settings/vendors`)

**Features to implement:**
- List all vendor pricing rules
- Add new vendor rules by category
- Edit existing vendor rules
- Set effective date ranges
- Configure minimum booking amounts
- Track negotiated rate agreements

**UI Components:**
```
- Vendor rules table with filtering
- Add/Edit vendor rule modal
- Vendor category tabs (flights, hotels, etc.)
- Rule activation toggle
- Delete confirmation
```

---

## Phase 3: PLANNED

### Client Overrides Page (`/settings/clients`)

**Features:**
- List all client-specific overrides
- Add override for specific client
- Set override types (commission, markup, discount)
- Configure effective date ranges
- VIP client management

**Use Cases:**
- VIP clients get 5% discount
- Corporate clients pay negotiated rates
- Group bookings get special pricing
- Repeat customer incentives

---

## Phase 4: PLANNED

### Trip Form Integration

**Automatic Override Application:**
1. When client name is entered → Check for client overrides
2. When vendor is selected → Apply vendor pricing rules
3. When cost is entered → Calculate with markup/discount
4. Show original vs. adjusted pricing
5. Allow manual override if needed

**UI Changes:**
- Add "Override Applied" badge to cost fields
- Show pricing breakdown tooltip
- Add "View Applied Rules" link
- Display effective commission rate

---

## Phase 5: PLANNED

### Analytics & Reporting

**Reports to Add:**
- Vendor pricing impact analysis
- Client override effectiveness
- Markup/discount trends
- Commission variance by client type
- Cost adjustment audit log

**Dashboard Widgets:**
- Top vendors by savings/markup
- Client segments by profitability
- Override application rate
- Average commission by client type

---

## Usage Examples

### Example 1: Agency with Different Commission Rates

**Setup:**
```
Default Commission: 15%
Individual Clients: 12%
Corporate Clients: 10%
Group Clients: 8%
```

**Result:** When adding a trip, commission auto-populates based on client type

### Example 2: Negotiated Hotel Rates

**Setup:**
```
Vendor: Marriott Hotels
Category: Hotel
Rule Type: Discount
Value: 10%
Minimum Booking: $1,000
```

**Result:** All Marriott bookings over $1,000 automatically get 10% discount

### Example 3: VIP Client Pricing

**Setup:**
```
Client: John Smith
Override Type: Commission Rate
Value: 8%
Description: VIP client - preferred rate
```

**Result:** All trips for John Smith use 8% commission regardless of client type

### Example 4: Default Markup

**Setup:**
```
Default Markup: 5%
Apply to: Flights ✓, Hotels ✓
```

**Result:** Flight and hotel costs automatically marked up 5% unless vendor rule overrides

---

## Database Queries

### Get Effective Commission for Client
```sql
SELECT get_client_commission_rate(
  'user-id',
  'John Smith',
  'individual'
);
```

### Get Vendor Pricing Adjustment
```sql
SELECT * FROM get_vendor_pricing_adjustment(
  'user-id',
  'Marriott Hotels',
  'hotel',
  1500.00
);
```

### Get All Active Vendor Rules
```sql
SELECT *
FROM vendor_pricing_rules
WHERE user_id = 'user-id'
  AND is_active = true
  AND (effective_from IS NULL OR effective_from <= CURRENT_DATE)
  AND (effective_until IS NULL OR effective_until >= CURRENT_DATE);
```

---

## API Endpoints to Create

### Agency Settings
- `GET /api/settings/agency` - Get agency settings
- `PUT /api/settings/agency` - Update agency settings

### Vendor Rules
- `GET /api/vendor-rules` - List all vendor rules
- `POST /api/vendor-rules` - Create new vendor rule
- `PUT /api/vendor-rules/:id` - Update vendor rule
- `DELETE /api/vendor-rules/:id` - Delete vendor rule

### Client Overrides
- `GET /api/client-overrides` - List all client overrides
- `POST /api/client-overrides` - Create client override
- `PUT /api/client-overrides/:id` - Update client override
- `DELETE /api/client-overrides/:id` - Delete client override

### Cost Adjustments
- `GET /api/trips/:id/adjustments` - Get adjustments for trip
- `POST /api/trips/:id/adjustments` - Record manual adjustment

---

## Migration Instructions

### Apply Database Migration

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Open `supabase/migrations/add_override_system.sql`
   - Run the migration

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

### Verify Migration
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'agency_settings',
    'vendor_pricing_rules',
    'client_pricing_overrides',
    'trip_cost_adjustments'
  );

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_client_commission_rate',
    'get_vendor_pricing_adjustment'
  );
```

---

## Tier-Based Features

### All Tiers (Starter+)
- Basic agency settings
- Default commission configuration
- Currency selection

### Standard Tier
- Client type commission rates
- Basic vendor rules (up to 10 vendors)
- Default markup settings

### Premium Tier
- Unlimited vendor rules
- Client-specific overrides
- Cost adjustment tracking
- Advanced analytics
- Negotiated rate management
- Pricing history audit

---

## Future Enhancements

### Phase 6+
- [ ] Bulk import vendor rules from CSV
- [ ] Seasonal pricing rules
- [ ] Multi-currency conversion rules
- [ ] Automatic vendor rule suggestions based on booking history
- [ ] Client tier/loyalty program integration
- [ ] Commission split rules for multi-agent bookings
- [ ] Approval workflow for manual overrides
- [ ] Integration with accounting software
- [ ] Vendor performance scoring
- [ ] Predictive pricing recommendations

---

## Support

For questions or issues:
- **Email**: james@voyagriq.com
- **Documentation**: This file
- **Database Schema**: `supabase/migrations/add_override_system.sql`

---

## Changelog

### 2026-01-19
- Created database schema for override system
- Added agency settings page
- Implemented helper functions for commission calculation
- Created documentation

### Next Steps
1. Complete vendor management UI
2. Create client overrides UI
3. Integrate with trip entry form
4. Add override analytics
5. Create comprehensive test suite
