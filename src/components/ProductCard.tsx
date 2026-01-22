import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../cart/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-accent transition-colors">
      <Link to={`/producto/${product.slug}`}>
        <div className="aspect-square bg-neutral-800 overflow-hidden">
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
          <span className="font-display text-xl text-accent">
            ${product.price.toLocaleString('es-AR')}
          </span>
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
