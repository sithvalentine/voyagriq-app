import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/client-overrides/calculate-commission - Calculate commission rate for a client
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.client_name) {
      return NextResponse.json(
        { error: 'Missing required field: client_name' },
        { status: 400 }
      );
    }

    const clientName = body.client_name.trim();
    const clientType = body.client_type || null;

    // Use the database function to get commission rate
    const { data, error } = await supabase.rpc('get_client_commission_rate', {
      p_user_id: user.id,
      p_client_name: clientName,
      p_client_type: clientType,
    });

    if (error) {
      console.error('Error calculating client commission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // The function returns a single decimal value
    const commissionRate = data;

    // Get the source of this rate for transparency
    let source = 'default';
    let override_id = null;

    // Check if there's a client-specific override
    const { data: override } = await supabase
      .from('client_pricing_overrides')
      .select('id, override_value')
      .eq('user_id', user.id)
      .eq('client_name', clientName)
      .eq('override_type', 'commission_rate')
      .eq('is_active', true)
      .single();

    if (override) {
      source = 'client_override';
      override_id = override.id;
    } else if (clientType) {
      // Check if it's from client type default
      const { data: settings } = await supabase
        .from('agency_settings')
        .select('individual_commission_rate, corporate_commission_rate, group_commission_rate')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        const typeRate = clientType === 'individual' ? settings.individual_commission_rate
          : clientType === 'corporate' ? settings.corporate_commission_rate
          : clientType === 'group' ? settings.group_commission_rate
          : null;

        if (typeRate !== null) {
          source = 'client_type_default';
        }
      }
    }

    return NextResponse.json({
      commission_rate: parseFloat(commissionRate),
      source,
      override_id,
      client_name: clientName,
      client_type: clientType,
    });
  } catch (error: any) {
    console.error('POST /api/client-overrides/calculate-commission error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
