import type { Handler } from '@netlify/functions';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';
import { validateRequired } from './_shared/validate';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { valid, missing } = validateRequired(body, ['order_id', 'note']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    // Obtener orden
    const { data: order, error: orderError } = await supabaseServer
      .from('fuegoamigo_orders')
      .select('*')
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Orden no encontrada' }),
      };
    }

    // Agregar nota
    const { data: note, error: noteError } = await supabaseServer
      .from('fuegoamigo_order_notes')
      .insert({
        order_id: body.order_id,
        note: body.note,
        created_by: payload.email || 'admin',
      })
      .select()
      .single();

    if (noteError) throw noteError;

    // Generar mensaje WhatsApp
    const whatsappMessage = `*Actualización Pedido #${order.order_number}*\n\n${body.note}`;
    const phone = order.customer_phone?.replace(/\D/g, '') || '';
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
      : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note,
        whatsapp_url: whatsappUrl,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
