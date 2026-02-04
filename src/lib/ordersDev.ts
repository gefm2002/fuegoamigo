import { supabasePublic } from './supabasePublic';
import { createClient } from '@supabase/supabase-js';

/**
 * Helper para crear órdenes directamente desde Supabase en desarrollo
 * cuando las Netlify Functions no están disponibles
 */
export async function createOrderDev(orderData: {
  customer_name: string;
  customer_phone: string;
  delivery_type: 'entrega' | 'retiro';
  zone: string | null;
  payment_method: string;
  items: any[];
  notes?: string;
}): Promise<{ order_number: number; whatsapp_message: string }> {
  // Calcular totales
  let subtotal = 0;
  for (const item of orderData.items) {
    subtotal += (item.price || 0) * (item.qty || 1);
  }
  const total = subtotal;

  // Generar mensaje WhatsApp
  const whatsappMessage = buildWhatsAppMessage(orderData, total);

  // Insertar orden usando anon key (con RLS policies que permiten INSERT)
  console.log('Creating order with supabasePublic client...');
  console.log('Environment check:', {
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    urlPreview: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
    keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
  });
  
  // Log the actual values to verify they're correct
  const orderPayload = {
    customer_name: orderData.customer_name,
    customer_phone: orderData.customer_phone,
    delivery_type: orderData.delivery_type,
    zone: orderData.zone,
    payment_method: orderData.payment_method,
    items: orderData.items,
    subtotal,
    total,
    notes: orderData.notes,
    whatsapp_message: whatsappMessage,
    status: 'pending',
  };
  
  console.log('Order payload:', orderPayload);
  
  // Test connection first - try a simple query to verify the client works
  console.log('Testing Supabase connection...');
  const { data: testData, error: testError } = await supabasePublic
    .from('fuegoamigo_site_config')
    .select('id')
    .limit(1)
    .single();
  
  if (testError) {
    console.error('❌ Supabase connection test failed:', testError);
    throw new Error(`Error de conexión con Supabase: ${testError.message}`);
  }
  console.log('✅ Supabase connection test passed');
  
  // Try INSERT directly first
  console.log('Attempting INSERT with configured client...');
  let order: any;
  let error: any;
  
  const insertResult = await supabasePublic
    .from('fuegoamigo_orders')
    .insert(orderPayload)
    .select()
    .single();
  
  order = insertResult.data;
  error = insertResult.error;

  // If direct INSERT fails, try using the RPC function as fallback
  if (error && error.code === '42501') {
    console.warn('Direct INSERT failed, trying RPC function...');
    const rpcResult = await supabasePublic.rpc('fuegoamigo_insert_order', {
      p_customer_name: orderData.customer_name,
      p_customer_phone: orderData.customer_phone,
      p_delivery_type: orderData.delivery_type,
      p_payment_method: orderData.payment_method,
      p_items: orderData.items,
      p_subtotal: subtotal,
      p_total: total,
      p_customer_email: null,
      p_zone: orderData.zone,
      p_notes: orderData.notes,
      p_whatsapp_message: whatsappMessage,
    });
    
    if (rpcResult.error) {
      console.error('RPC function also failed:', rpcResult.error);
      error = rpcResult.error;
    } else {
      const rpcOrder = rpcResult.data?.[0];
      if (rpcOrder) {
        order = rpcOrder;
        error = null;
        console.log('✅ Order created successfully via RPC function:', order);
      }
    }
  }

  if (error) {
    console.error('Error creating order (dev):', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    throw new Error(`Error al crear orden: ${error.message}`);
  }
  
  if (!order) {
    throw new Error('No se pudo crear la orden');
  }
  
  console.log('✅ Order created successfully:', order);

  // Event is created automatically by RPC function, so we don't need to create it again
  // Only create event if we used direct INSERT (not RPC)
  // RPC function already creates the event, so we skip if order_number exists
  if (!error && order.id && !order.order_number) {
    // This means we used direct INSERT, so create the event
    const eventResult = await supabasePublic.from('fuegoamigo_order_events').insert({
      order_id: order.id,
      status: 'pending',
      notes: 'Orden creada',
    });
    
    if (eventResult.error) {
      // Ignore error if event already exists
      console.log('Event creation skipped (may already exist):', eventResult.error.message);
    }
  }

  return {
    order_number: order.order_number,
    whatsapp_message: whatsappMessage,
  };
}

/**
 * Helper para mapear datos de Supabase al formato Order
 */
function mapOrderFromSupabase(order: any): any {
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    deliveryType: order.delivery_type,
    zone: order.zone,
    paymentMethod: order.payment_method,
    items: order.items || [],
    subtotal: parseFloat(order.subtotal || 0),
    total: parseFloat(order.total || 0),
    notes: order.notes,
    whatsappMessage: order.whatsapp_message,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

/**
 * Helper para mapear notas de Supabase
 */
function mapNoteFromSupabase(note: any): any {
  return {
    id: note.id,
    orderId: note.order_id,
    note: note.note,
    createdBy: note.created_by,
    createdAt: note.created_at,
  };
}

/**
 * Helper para obtener órdenes en desarrollo usando service_role key
 */
export async function getOrdersDev(): Promise<any[]> {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) return [];

  const { data, error } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders (dev):', error);
    return [];
  }

  return (data || []).map(mapOrderFromSupabase);
}

/**
 * Helper para obtener el detalle de una orden en desarrollo
 */
export async function getOrderDetailDev(orderId: string): Promise<any> {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) throw new Error('Service role key not available');

  // Obtener orden
  const { data: order, error: orderError } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Orden no encontrada');
  }

  // Obtener eventos
  const { data: events } = await supabaseServer
    .from('fuegoamigo_order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  // Obtener notas
  const { data: notes } = await supabaseServer
    .from('fuegoamigo_order_notes')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  return {
    ...mapOrderFromSupabase(order),
    events: events || [],
    notes: (notes || []).map(mapNoteFromSupabase),
  };
}

/**
 * Helper para actualizar el estado de una orden en desarrollo
 */
export async function updateOrderStatusDev(orderId: string, status: string, statusNotes?: string): Promise<any> {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) throw new Error('Service role key not available');

  // Actualizar orden
  const { data: order, error: updateError } = await supabaseServer
    .from('fuegoamigo_orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Error actualizando orden: ${updateError.message}`);
  }

  // Crear evento de cambio de estado
  await supabaseServer.from('fuegoamigo_order_events').insert({
    order_id: orderId,
    status,
    notes: statusNotes || '',
  });

  return mapOrderFromSupabase(order);
}

/**
 * Helper para agregar una nota a una orden en desarrollo
 */
export async function addOrderNoteDev(orderId: string, note: string, createdBy: string = 'admin'): Promise<{ note: any; whatsapp_url: string | null }> {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) throw new Error('Service role key not available');

  // Obtener orden para el número de teléfono
  const { data: order, error: orderError } = await supabaseServer
    .from('fuegoamigo_orders')
    .select('order_number, customer_phone')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Orden no encontrada');
  }

  // Agregar nota
  const { data: noteData, error: noteError } = await supabaseServer
    .from('fuegoamigo_order_notes')
    .insert({
      order_id: orderId,
      note,
      created_by: createdBy,
    })
    .select()
    .single();

  if (noteError) {
    throw new Error(`Error agregando nota: ${noteError.message}`);
  }

  // Generar URL de WhatsApp
  const whatsappMessage = `*Actualización Pedido #${order.order_number}*\n\n${note}`;
  const phone = order.customer_phone?.replace(/\D/g, '') || '';
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return {
    note: noteData,
    whatsapp_url: whatsappUrl,
  };
}

/**
 * Helper para obtener cliente de Supabase con service_role key
 */
function getSupabaseServer() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Service role key not available');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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
