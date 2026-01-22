import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useData';

const categories = [
  'Todas',
  'boxes-y-regalos',
  'picadas-y-tablas',
  'ahumados',
  'salsas-y-aderezos',
  'sandwiches-y-burgers',
  'finger-food',
  'postres',
  'combos',
];

export function Tienda() {
  const products = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.isActive);

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-4">
          Tienda
        </h1>
        <p className="text-neutral-400 mb-8">
          Productos premium para llevar o pedir a domicilio
        </p>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded text-secondary placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-accent text-secondary'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {category === 'Todas'
                ? 'Todas'
                : category
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['destacado', 'nuevo', 'ahumados', 'para regalar'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                // Simple tag filter - could be enhanced
                setSearchQuery(tag);
              }}
              className="px-3 py-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs text-neutral-300 hover:border-accent transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
