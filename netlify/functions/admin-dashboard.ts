import type { Handler } from '@netlify/functions';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Productos activos
    const { count: productsCount } = await supabaseServer
      .from('fuegoamigo_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Eventos activos
    const { count: eventsCount } = await supabaseServer
      .from('fuegoamigo_events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Órdenes por estado
    const { data: ordersByStatus } = await supabaseServer
      .from('fuegoamigo_orders')
      .select('status');

    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };

    (ordersByStatus || []).forEach((order: any) => {
      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Total de órdenes
    const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Órdenes del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: ordersThisMonth } = await supabaseServer
      .from('fuegoamigo_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: {
          active: productsCount || 0,
        },
        events: {
          active: eventsCount || 0,
        },
        orders: {
          total: totalOrders,
          thisMonth: ordersThisMonth || 0,
          byStatus: statusCounts,
        },
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
