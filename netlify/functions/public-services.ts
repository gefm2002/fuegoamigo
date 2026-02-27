import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async () => {
  try {
    const { data, error } = await supabasePublic
      .from('fuegoamigo_services')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      // Si la tabla todavía no existe (migración pendiente), responder vacío para no romper el frontend
      if (/does not exist/i.test(error.message) || /relation .*fuegoamigo_services.*does not exist/i.test(error.message)) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([]),
        };
      }
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

