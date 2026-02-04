import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async (event) => {
  try {
    const eventType = event.queryStringParameters?.eventType;

    let query = supabasePublic
      .from('fuegoamigo_events')
      .select('*')
      .eq('is_active', true);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || []),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
