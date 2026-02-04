import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async (event) => {
  try {
    const key = event.queryStringParameters?.key;

    if (key) {
      const { data, error } = await supabasePublic
        .from('fuegoamigo_content_blocks')
        .select('*')
        .eq('key', key)
        .eq('is_active', true)
        .single();

      if (error) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Content block not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    const { data, error } = await supabasePublic
      .from('fuegoamigo_content_blocks')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
