import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../cart/useCart';
import { useCartDrawer } from '../context/CartDrawerContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { openDrawer } = useCartDrawer();

  // Calcular precio final con descuentos
  const getFinalPrice = () => {
    let finalPrice = product.price;
    if (product.discountPercentage && product.discountPercentage > 0) {
      finalPrice = finalPrice * (1 - product.discountPercentage / 100);
    }
    if (product.discountFixed && product.discountFixed > 0) {
      finalPrice = finalPrice - product.discountFixed;
    }
    return Math.max(0, finalPrice);
  };

  const finalPrice = getFinalPrice();
  const hasDiscount = finalPrice < product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice, // Usar precio con descuento
      qty: 1,
      image: product.image,
    });
    openDrawer();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-accent transition-colors relative">
      {/* Badges */}
      {product.isOffer && (
        <div className="absolute top-2 right-2 z-10">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-accent text-secondary px-2 py-1 rounded text-xs font-bold">
              -{product.discountPercentage}%
            </span>
          )}
          {product.discountFixed && product.discountFixed > 0 && !product.discountPercentage && (
            <span className="bg-accent text-secondary px-2 py-1 rounded text-xs font-bold">
              -${product.discountFixed.toLocaleString('es-AR')}
            </span>
          )}
        </div>
      )}
      {product.featured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-yellow-500 text-primary px-2 py-1 rounded text-xs font-bold">
            ⭐ Destacado
          </span>
        </div>
      )}
      {product.isMadeToOrder && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-blue-500 text-secondary px-2 py-1 rounded text-xs font-bold">
            Por pedido
          </span>
        </div>
      )}

      <Link to={`/producto/${product.slug}`}>
        <div className="aspect-square bg-neutral-800 overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/product-box-01.jpg';
            }}
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-display text-lg text-secondary mb-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-neutral-500 line-through">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                <span className="font-display text-xl text-accent">
                  ${finalPrice.toLocaleString('es-AR')}
                </span>
              </>
            ) : (
              <span className="font-display text-xl text-accent">
                ${product.price.toLocaleString('es-AR')}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors text-sm"
          >
            Sumar
          </button>
        </div>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-neutral-800 text-neutral-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
