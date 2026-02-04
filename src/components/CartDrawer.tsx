import { useNavigate } from 'react-router-dom';
import { useCart } from '../cart/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, updateNotes, total, clear } = useCart();

  const handleGoToCheckout = () => {
    if (items.length === 0) return;
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div 
          className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-2xl max-h-[calc(100vh-2rem)] my-auto flex flex-col overflow-hidden pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-700 flex items-center justify-between bg-neutral-900 flex-shrink-0">
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

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400 mb-4">Tu carrito está vacío</p>
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary hover:bg-neutral-700 transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.variant || ''}`}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                              Sin foto
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary">{item.name}</p>
                          {item.variant && <p className="text-xs text-neutral-400">{item.variant}</p>}
                          <p className="text-xs text-neutral-500 mt-1">
                            Subtotal: ${(item.price * item.qty).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-accent hover:underline flex-shrink-0"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="h-8 w-8 rounded-full border border-neutral-700 bg-neutral-900 text-secondary hover:bg-neutral-800 transition-colors flex items-center justify-center flex-shrink-0"
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center text-sm text-secondary">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="h-8 w-8 rounded-full border border-neutral-700 bg-neutral-900 text-secondary hover:bg-neutral-800 transition-colors flex items-center justify-center flex-shrink-0"
                      >
                        +
                      </button>
                      <input
                        className="ml-auto flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent min-w-0"
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

                <div className="flex flex-col gap-3 border-t border-neutral-700 bg-neutral-900 p-6 flex-shrink-0">
                  <button
                    onClick={() => {
                      clear();
                    }}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-secondary hover:bg-neutral-700 transition-colors"
                  >
                    Vaciar carrito
                  </button>
                  <button
                    onClick={handleGoToCheckout}
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors bg-accent text-secondary hover:bg-accent/90"
                  >
                    Ir a checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
