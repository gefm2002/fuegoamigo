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
    if (!body.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing id' }),
      };
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.items !== undefined) {
      updateData.items = body.items;
      // Recalcular totales
      let subtotal = 0;
      for (const item of body.items) {
        subtotal += (item.price || 0) * (item.qty || 1);
      }
      updateData.subtotal = subtotal;
      updateData.total = subtotal;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
      // Crear evento de cambio de estado
      await supabaseServer.from('fuegoamigo_order_events').insert({
        order_id: body.id,
        status: body.status,
        notes: body.status_notes || '',
      });
    }

    if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
    if (body.customer_email !== undefined) updateData.customer_email = body.customer_email;
    if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone;
    if (body.delivery_type !== undefined) updateData.delivery_type = body.delivery_type;
    if (body.zone !== undefined) updateData.zone = body.zone;
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabaseServer
      .from('fuegoamigo_orders')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

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
