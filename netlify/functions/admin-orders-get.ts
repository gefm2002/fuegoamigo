import type { Handler } from '@netlify/functions';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing id parameter' }),
      };
    }

    const { data: order, error: orderError } = await supabaseServer
      .from('fuegoamigo_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' }),
      };
    }

    const { data: events } = await supabaseServer
      .from('fuegoamigo_order_events')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    const { data: notes } = await supabaseServer
      .from('fuegoamigo_order_notes')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, events: events || [], notes: notes || [] }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
