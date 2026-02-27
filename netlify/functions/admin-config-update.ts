import type { Handler } from '@netlify/functions';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const configData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.brand_name !== undefined) configData.brand_name = body.brand_name;
    if (body.whatsapp !== undefined) configData.whatsapp = body.whatsapp;
    if (body.email !== undefined) configData.email = body.email;
    if (body.address !== undefined) configData.address = body.address;
    if (body.zone !== undefined) configData.zone = body.zone;
    if (body.hours !== undefined) configData.hours = body.hours;
    if (body.payment_methods !== undefined) configData.payment_methods = body.payment_methods;
    if (body.delivery_options !== undefined) configData.delivery_options = body.delivery_options;
    if (body.wa_templates !== undefined) configData.wa_templates = body.wa_templates;
    if (body.home_hero_image !== undefined) configData.home_hero_image = body.home_hero_image;
    if (body.events_hero_image !== undefined) configData.events_hero_image = body.events_hero_image;

    // Verificar si existe configuración
    const { data: existing, error: checkError } = await supabaseServer
      .from('fuegoamigo_site_config')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing && !checkError) {
      // Actualizar
      const { data, error } = await supabaseServer
        .from('fuegoamigo_site_config')
        .update(configData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Crear
      configData.brand_name = body.brand_name || 'Fuego Amigo';
      const { data, error } = await supabaseServer
        .from('fuegoamigo_site_config')
        .insert(configData)
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
