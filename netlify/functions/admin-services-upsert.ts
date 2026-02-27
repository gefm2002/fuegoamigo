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
    const { valid, missing } = validateRequired(body, ['title', 'short_description']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    const serviceData: any = {
      slug: body.slug || null,
      title: body.title,
      short_description: body.short_description,
      long_description: body.long_description || '',
      image: body.image || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      order: body.order !== undefined && body.order !== null ? Number(body.order) : 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (event.httpMethod === 'PUT' && body.id) {
      const { data, error } = await supabaseServer
        .from('fuegoamigo_services')
        .update(serviceData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      serviceData.id = body.id || randomUUID();
      const { data, error } = await supabaseServer
        .from('fuegoamigo_services')
        .insert(serviceData)
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

