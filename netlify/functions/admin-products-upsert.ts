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
    const { valid, missing } = validateRequired(body, ['name', 'price']);

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

    // Validar imágenes (máx 5)
    if (body.images && body.images.length > 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Máximo 5 imágenes por producto' }),
      };
    }

    const productData: any = {
      slug: body.slug,
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      product_type: body.product_type || 'standard',
      images: body.images || [],
      tags: body.tags || [],
      stock: parseInt(body.stock || '0'),
      is_active: body.is_active !== undefined ? body.is_active : true,
      featured: body.featured || false,
      discount_fixed: body.discount_fixed ? parseFloat(body.discount_fixed) : 0,
      discount_percentage: body.discount_percentage ? parseFloat(body.discount_percentage) : 0,
      is_offer: body.is_offer || false,
      is_made_to_order: body.is_made_to_order || false,
      updated_at: new Date().toISOString(),
    };

    if (body.category_id) {
      productData.category_id = body.category_id;
    }

    if (body.product_type === 'weighted') {
      productData.price_per_kg = parseFloat(body.price_per_kg || '0');
      productData.min_weight = parseFloat(body.min_weight || '0');
      productData.max_weight = parseFloat(body.max_weight || '0');
    }

    if (body.product_type === 'apparel' && body.variants) {
      productData.variants = body.variants;
    }

    let result;
    if (event.httpMethod === 'PUT' && body.id) {
      const { data, error } = await supabaseServer
        .from('fuegoamigo_products')
        .update(productData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      productData.id = body.id || randomUUID();
      const { data, error } = await supabaseServer
        .from('fuegoamigo_products')
        .insert(productData)
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
