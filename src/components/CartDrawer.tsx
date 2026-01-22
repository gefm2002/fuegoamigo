import { useMemo, useState } from 'react';
import { useCart } from '../cart/useCart';
import { buildCartMessage, buildWhatsAppLink } from '../utils/cartWhatsApp';
import { WHATSAPP_NUMBER } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialCustomer = {
  name: '',
  phone: '',
  address: '',
  deliveryMethod: 'retiro' as 'retiro' | 'envio',
  paymentMethod: 'efectivo' as
    | 'efectivo'
    | 'tarjeta'
    | 'transferencia'
    | 'modo'
    | 'mercado'
    | 'billeteras-qr',
  notes: '',
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQty, removeItem, updateNotes, total, clear } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);

  const isValid = customer.name.trim().length > 0 && customer.phone.trim().length > 0;

  const whatsappLink = useMemo(() => {
    const message = buildCartMessage(items, total, {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      deliveryMethod: customer.deliveryMethod,
      paymentMethod: customer.paymentMethod,
      notes: customer.notes,
    });
    return buildWhatsAppLink(WHATSAPP_NUMBER, message);
  }, [customer, items, total]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-neutral-900 border-l border-neutral-700 z-50 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-neutral-700 flex items-center justify-between sticky top-0 bg-neutral-900">
          <h2 className="font-display text-2xl text-secondary">Tu carrito</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 mb-4">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.variant || ''}`}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary">{item.name}</p>
                      {item.variant && <p className="text-xs text-neutral-400">{item.variant}</p>}
                      <p className="text-xs text-neutral-500 mt-1">
                        Subtotal: ${(item.price * item.qty).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-accent hover:underline"
                  >
                    Quitar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="h-8 w-8 rounded-full border border-neutral-700 bg-neutral-900 text-secondary hover:bg-neutral-800 transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="min-w-[24px] text-center text-sm text-secondary">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="h-8 w-8 rounded-full border border-neutral-700 bg-neutral-900 text-secondary hover:bg-neutral-800 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                  <input
                    className="ml-auto flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Aclaraciones"
                    value={item.notes ?? ''}
                    onChange={(e) => updateNotes(item.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="px-6 py-4 border-t border-neutral-700 bg-neutral-800">
              <div className="flex items-center justify-between text-sm font-display text-lg text-secondary">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="p-6 space-y-3 border-t border-neutral-700">
              <h3 className="font-display text-lg text-secondary">Tus datos</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Nombre y apellido"
                  value={customer.name}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Teléfono"
                  value={customer.phone}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                  value={customer.deliveryMethod}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      deliveryMethod: e.target.value as 'retiro' | 'envio',
                    }))
                  }
                >
                  <option value="retiro">Retiro</option>
                  <option value="envio">Consultar envío</option>
                </select>
                <input
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="Dirección (si pedís envío)"
                  value={customer.address}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={customer.deliveryMethod !== 'envio'}
                />
              </div>
              <div>
                <select
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                  value={customer.paymentMethod}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value as typeof initialCustomer.paymentMethod,
                    }))
                  }
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="modo">MODO</option>
                  <option value="mercado">Mercado Pago</option>
                  <option value="billeteras-qr">Billeteras QR</option>
                </select>
              </div>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Observaciones generales"
                value={customer.notes}
                onChange={(e) => setCustomer((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral-700 bg-neutral-900 p-6 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => {
                  clear();
                  setCustomer(initialCustomer);
                }}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary hover:bg-neutral-700 transition-colors"
              >
                Vaciar carrito
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener"
                className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                  isValid && items.length > 0
                    ? 'bg-accent text-secondary hover:bg-accent/90'
                    : 'bg-neutral-800 text-neutral-500 pointer-events-none'
                }`}
              >
                Enviar pedido por WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
