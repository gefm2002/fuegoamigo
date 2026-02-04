import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';
import { validateRequired } from './_shared/validate';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { valid, missing } = validateRequired(body, ['title', 'event_type']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    // Validar imágenes (máx 5)
    if (body.images && body.images.length > 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Máximo 5 imágenes por evento' }),
      };
    }

    const eventData: any = {
      title: body.title,
      event_type: body.event_type,
      location: body.location || '',
      guests_range: body.guests_range || '',
      highlight_menu: body.highlight_menu || '',
      description: body.description || '',
      images: body.images || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (event.httpMethod === 'PUT' && body.id) {
      const { data, error } = await supabaseServer
        .from('fuegoamigo_events')
        .update(eventData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      eventData.id = body.id || randomUUID();
      const { data, error } = await supabaseServer
        .from('fuegoamigo_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
