import type { Handler } from '@netlify/functions';
import { supabaseServer } from './_shared/supabaseServer';
import { validateRequired } from './_shared/validate';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { valid, missing } = validateRequired(body, [
      'customer_name',
      'customer_phone',
      'delivery_type',
      'payment_method',
      'items',
    ]);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of body.items) {
      subtotal += (item.price || 0) * (item.qty || 1);
    }
    const total = subtotal;

    // Generar mensaje WhatsApp (pasar total como parámetro)
    const whatsappMessage = buildWhatsAppMessage(body, total);

    const { data: order, error } = await supabaseServer
      .from('fuegoamigo_orders')
      .insert({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        delivery_type: body.delivery_type,
        zone: body.zone,
        payment_method: body.payment_method,
        items: body.items,
        subtotal,
        total,
        notes: body.notes,
        whatsapp_message: whatsappMessage,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    // Crear evento inicial
    await supabaseServer.from('fuegoamigo_order_events').insert({
      order_id: order.id,
      status: 'pending',
      notes: 'Orden creada',
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        order_number: order.order_number,
        whatsapp_message: whatsappMessage,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function buildWhatsAppMessage(body: any, total: number): string {
  const lines = [`Hola soy ${body.customer_name}, quiero hacer un pedido.`, ''];

  lines.push(`*Tipo de entrega:* ${body.delivery_type === 'entrega' ? 'Entrega' : 'Retiro'}`);
  lines.push('');

  if (body.delivery_type === 'entrega' && body.zone) {
    lines.push(`*Zona/Barrio:* ${body.zone}`);
    lines.push('');
  }

  lines.push('*Productos:*');
  body.items.forEach((item: any) => {
    const variant = item.variant ? ` (${item.variant})` : '';
    const subtotal = (item.price || 0) * (item.qty || 1);
    lines.push(`${item.qty}x ${item.name}${variant} - $${subtotal.toLocaleString('es-AR')}`);
  });

  lines.push('');
  lines.push(`*Total estimado: $${total.toLocaleString('es-AR')}*`);
  lines.push('');
  lines.push(`*Medio de pago:* ${body.payment_method}`);

  if (body.notes) {
    lines.push('');
    lines.push(`*Notas:* ${body.notes}`);
  }

  lines.push('');
  lines.push('Importante: Los pedidos serán mediante transferencia de seña a coordinar en el próximo paso.');
  lines.push('');
  lines.push('Gracias por tu pedido! 🔥');

  return lines.join('\n');
}
