import type { Handler } from '@netlify/functions';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const path = event.queryStringParameters?.path;
    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing path parameter' }),
      };
    }

    const expiresIn = parseInt(event.queryStringParameters?.expiresIn || '3600');

    const { data, error } = await supabaseServer.storage
      .from('fuegoamigo_assets')
      .createSignedUrl(path, expiresIn);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: data.signedUrl }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
