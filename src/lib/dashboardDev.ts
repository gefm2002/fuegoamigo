import { supabasePublic } from './supabasePublic';
import { createClient } from '@supabase/supabase-js';

/**
 * Helper para obtener estadísticas del dashboard directamente desde Supabase en desarrollo
 * cuando las Netlify Functions no están disponibles
 */
export async function getDashboardStatsDev(): Promise<{
  products: { active: number };
  events: { active: number };
  orders: {
    total: number;
    thisMonth: number;
    byStatus: Record<string, number>;
  };
}> {
  try {
    // Crear cliente con service_role para leer órdenes
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseServer = serviceRoleKey 
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : null;

    // Productos activos
    const { count: productsCount } = await supabasePublic
      .from('fuegoamigo_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Eventos activos
    const { count: eventsCount } = await supabasePublic
      .from('fuegoamigo_events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Órdenes por estado - usar service_role si está disponible
    const ordersClient = supabaseServer || supabasePublic;
    const { data: ordersByStatus } = await ordersClient
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
    const { count: ordersThisMonth } = await ordersClient
      .from('fuegoamigo_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    return {
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
    };
  } catch (error: any) {
    console.error('Error getting dashboard stats (dev):', error);
    // Retornar valores por defecto
    return {
      products: { active: 0 },
      events: { active: 0 },
      orders: {
        total: 0,
        thisMonth: 0,
        byStatus: {
          pending: 0,
          confirmed: 0,
          preparing: 0,
          ready: 0,
          delivered: 0,
          cancelled: 0,
        },
      },
    };
  }
}
