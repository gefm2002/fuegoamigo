import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { CheckoutFormData } from '../types';
import { openWhatsApp, formatCheckoutMessage } from '../utils/whatsapp';

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    zone: '',
    deliveryType: 'retiro',
    date: '',
    timeSlot: '',
    comments: '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => navigate('/tienda')}
            className="px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const message = formatCheckoutMessage(
      items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price * item.quantity,
        notes: item.notes,
      })),
      total,
      formData
    );
    openWhatsApp(message);
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl text-secondary mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl text-secondary mb-4">
                Resumen del pedido
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/product-box-01.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-secondary">
                        {item.product.name}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {item.quantity}x ${item.product.price.toLocaleString('es-AR')}
                      </p>
                      {item.notes && (
                        <p className="text-neutral-500 text-xs mt-1">
                          Nota: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="text-accent font-medium">
                      ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-700 mt-6 pt-6 flex justify-between items-center">
                <span className="font-display text-xl text-secondary">Total</span>
                <span className="font-display text-2xl text-accent">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
              <h2 className="font-display text-xl text-secondary mb-4">
                Datos de contacto
              </h2>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nombre y apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Zona (barrio/localidad) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej: Palermo, CABA"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Entrega *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="retiro"
                      checked={formData.deliveryType === 'retiro'}
                      onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'retiro' | 'envio' })}
                      className="mr-2"
                    />
                    <span className="text-neutral-300">Retiro</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="envio"
                      checked={formData.deliveryType === 'envio'}
                      onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'retiro' | 'envio' })}
                      className="mr-2"
                    />
                    <span className="text-neutral-300">Envío</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Fecha deseada *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Franja horaria deseada *
                </label>
                <select
                  required
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Seleccionar</option>
                  <option value="Mañana (9-12hs)">Mañana (9-12hs)</option>
                  <option value="Mediodía (12-15hs)">Mediodía (12-15hs)</option>
                  <option value="Tarde (15-18hs)">Tarde (15-18hs)</option>
                  <option value="Noche (18-21hs)">Noche (18-21hs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Comentarios
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={4}
                  placeholder="Instrucciones especiales, preferencias, etc."
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors text-lg"
              >
                Enviar pedido por WhatsApp
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 sticky top-24">
              <h3 className="font-display text-lg text-secondary mb-4">
                Resumen
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Productos</span>
                  <span className="text-neutral-300">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Cantidad total</span>
                  <span className="text-neutral-300">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-display text-lg text-secondary">Total</span>
                  <span className="font-display text-2xl text-accent">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-neutral-500 text-xs">
                  Al enviar, se abrirá WhatsApp con tu pedido completo listo para enviar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
