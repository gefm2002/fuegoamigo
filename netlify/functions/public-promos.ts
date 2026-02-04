import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async () => {
  try {
    const { data, error } = await supabasePublic
      .from('fuegoamigo_promos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

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
