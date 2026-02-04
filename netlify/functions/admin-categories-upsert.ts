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
    const { valid, missing } = validateRequired(body, ['name']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    // Generar slug automáticamente si no viene
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const categoryData: any = {
      slug: body.slug,
      name: body.name,
      description: body.description || '',
      image: body.image || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      order: parseInt(body.order || '0'),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (event.httpMethod === 'PUT' && body.id) {
      const { data, error } = await supabaseServer
        .from('fuegoamigo_categories')
        .update(categoryData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      categoryData.id = body.id || randomUUID();
      const { data, error } = await supabaseServer
        .from('fuegoamigo_categories')
        .insert(categoryData)
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
