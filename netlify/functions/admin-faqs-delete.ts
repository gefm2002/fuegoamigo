import type { Handler } from '@netlify/functions';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'DELETE') {
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

    const { error } = await supabaseServer.from('fuegoamigo_faqs').delete().eq('id', id);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
