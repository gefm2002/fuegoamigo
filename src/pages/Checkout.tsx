import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../cart/useCart';
import { buildWhatsAppLink } from '../utils/cartWhatsApp';
import { WHATSAPP_NUMBER } from '../utils/whatsapp';
import { apiFetch } from '../lib/api';
import { createOrderDev } from '../lib/ordersDev';
import { useToast } from '../context/ToastContext';

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryType: 'entrega' as 'entrega' | 'retiro',
    zone: '',
    paymentMethod: 'efectivo' as
      | 'efectivo'
      | 'tarjeta'
      | 'transferencia'
      | 'modo'
      | 'mercado'
      | 'billeteras-qr',
    notes: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/tienda');
    }
  }, [items, navigate]);

  const isValid =
    formData.name.trim().length > 0 &&
    formData.phone.trim().length > 0 &&
    (formData.deliveryType === 'retiro' || formData.zone.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || items.length === 0) return;

    setIsSubmitting(true);
    
    // Crear orden en la base de datos
    const orderData = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      delivery_type: formData.deliveryType,
      zone: formData.deliveryType === 'entrega' ? formData.zone : null,
      payment_method: formData.paymentMethod,
      items: items.map((item) => ({
        product_id: item.id,
        name: item.name,
        variant: item.variant,
        price: item.price,
        qty: item.qty,
        notes: item.notes,
      })),
      notes: formData.notes,
    };

    try {
      let response: { order_number: number; whatsapp_message: string };
      
      // Intentar con Netlify Function primero
      try {
        response = await apiFetch<{ order_number: number; whatsapp_message: string }>(
          'orders-create',
          {
            method: 'POST',
            body: JSON.stringify(orderData),
          }
        );
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, intentar con Supabase directo
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo');
          response = await createOrderDev(orderData);
        } else {
          throw netlifyError;
        }
      }

      if (response.order_number && response.whatsapp_message) {
        // Generar mensaje con número de orden
        const finalMessage = `*Pedido #${response.order_number}*\n\n${response.whatsapp_message}`;
        const link = buildWhatsAppLink(WHATSAPP_NUMBER, finalMessage);
        window.open(link, '_blank');

        // Limpiar carrito y redirigir
        clear();
        navigate('/tienda', { state: { orderCreated: true, orderNumber: response.order_number } });
      } else {
        throw new Error('No se recibió número de orden o mensaje de WhatsApp.');
      }
    } catch (error: any) {
      console.error('Error al crear la orden:', error);
      const errorMessage = error?.message || 'Error desconocido';
      console.error('Detalles del error:', {
        message: errorMessage,
        orderData,
        items: items.length,
      });
      toast.error(
        `Hubo un error al procesar tu pedido: ${errorMessage}. Por favor, intentá de nuevo.`,
        'No se pudo procesar'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl text-secondary mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen del pedido */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
            <h2 className="font-display text-2xl text-secondary mb-4">Tu pedido</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant || ''}`} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">{item.name}</p>
                    {item.variant && <p className="text-xs text-neutral-400">{item.variant}</p>}
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.qty} x ${item.price.toLocaleString('es-AR')} = ${(item.price * item.qty).toLocaleString('es-AR')}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-neutral-400 mt-1 italic">Nota: {item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-700 pt-4">
              <div className="flex items-center justify-between text-lg font-display text-secondary">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
            <h2 className="font-display text-2xl text-secondary mb-4">Tus datos</h2>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Nombre y apellido *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Tipo de entrega *
              </label>
              <select
                value={formData.deliveryType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryType: e.target.value as 'entrega' | 'retiro',
                    zone: e.target.value === 'retiro' ? '' : prev.zone,
                  }))
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="entrega">Entrega</option>
                <option value="retiro">Retiro</option>
              </select>
            </div>

            {formData.deliveryType === 'entrega' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Zona/barrio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zone: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Palermo, CABA"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Medio de pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as typeof formData.paymentMethod,
                  }))
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="modo">MODO</option>
                <option value="mercado">Mercado Pago</option>
                <option value="billeteras-qr">Billeteras QR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none min-h-[100px]"
                placeholder="Aclaraciones, preferencias, etc."
              />
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
              <p className="text-xs text-neutral-400">
                <span className="font-medium text-neutral-300">Importante:</span> Los pedidos serán mediante transferencia de seña a coordinar en el próximo paso.
              </p>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                isValid && !isSubmitting
                  ? 'bg-accent text-secondary hover:bg-accent/90'
                  : 'bg-neutral-800 text-neutral-500 pointer-events-none cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Creando pedido...' : 'Enviar pedido por WhatsApp'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
