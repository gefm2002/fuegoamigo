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
    const { data, error } = await supabaseServer
      .from('fuegoamigo_site_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Si no existe, retornar valores por defecto
    if (!data) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: null,
          brand_name: 'Fuego Amigo',
          whatsapp: '',
          email: '',
          address: '',
          zone: '',
          hours: {},
          payment_methods: [],
          delivery_options: [],
          wa_templates: {},
          home_hero_image: '',
          events_hero_image: '',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('Error in admin-config-get:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error' }),
    };
  }
};
