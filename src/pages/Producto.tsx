import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/useCart';
import { useCartDrawer } from '../context/CartDrawerContext';
import { useProducts } from '../hooks/useData';

export function Producto() {
  const products = useProducts();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openDrawer } = useCartDrawer();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">Producto no encontrado</p>
          <button
            onClick={() => navigate('/tienda')}
            className="px-6 py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      notes: notes || undefined,
      image: product.image,
    });
    openDrawer();
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/tienda')}
          className="text-neutral-400 hover:text-secondary mb-6 transition-colors"
        >
          ← Volver a la tienda
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-900 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/product-box-01.jpg';
              }}
            />
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-4xl text-secondary mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-accent font-display mb-6">
              ${product.price.toLocaleString('es-AR')}
            </p>
            <p className="text-neutral-400 mb-8">{product.description}</p>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-700 rounded text-neutral-300 hover:bg-neutral-800"
                  >
                    -
                  </button>
                  <span className="text-secondary font-medium text-lg w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-700 rounded text-neutral-300 hover:bg-neutral-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferencias, sin sal, sin picante, etc"
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors text-lg"
              >
                Sumar al carrito - ${(product.price * quantity).toLocaleString('es-AR')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
