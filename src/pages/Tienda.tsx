import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useSupabaseData';

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
const STORE_CATEGORY_SLUGS = categories.filter((c) => c !== 'Todas');

export function Tienda() {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Debug: Log productos cargados
  console.log('Tienda - Products loaded:', products.length, 'Loading:', loading);
  console.log('Tienda - Active products:', products.filter((p) => p.isActive).length);

  // Separar productos destacados, ofertas y resto
  const { featuredProducts, offerProducts } = useMemo(() => {
    // Evitar mezclar servicios u otras entidades: mostrar solo categorías de tienda
    const active = products.filter(
      (p) => p.isActive && !!p.category && STORE_CATEGORY_SLUGS.includes(p.category)
    );
    
    const featured = active.filter((p) => p.featured);
    const offers = active.filter((p) => p.isOffer);

    return {
      featuredProducts: featured,
      offerProducts: offers,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    // Filtrar solo productos activos
    let filtered = products.filter(
      (p) => p.isActive === true && !!p.category && STORE_CATEGORY_SLUGS.includes(p.category)
    );

    // Si hay búsqueda, aplicar filtros de búsqueda
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some((tag) => tag.toLowerCase().includes(queryLower))) ||
          (queryLower === 'destacado' && p.featured) ||
          (queryLower === 'nuevo' && p.tags && p.tags.includes('nuevo')) ||
          (queryLower === 'ahumados' && (p.category === 'ahumados' || (p.tags && p.tags.includes('ahumados')))) ||
          (queryLower === 'para regalar' && (p.category === 'boxes-y-regalos' || (p.tags && p.tags.includes('regalo'))))
      );
    }

    // Filtrar por categoría (solo si no hay búsqueda o la búsqueda no es un tag especial)
    if (selectedCategory !== 'Todas' && !['destacado', 'nuevo', 'ahumados', 'para regalar'].includes(searchQuery)) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Calcular precio con descuento
  const getFinalPrice = (product: any) => {
    if (product.price === null) return null;
    let finalPrice = product.price;
    if (product.discountPercentage > 0) {
      finalPrice = finalPrice * (1 - product.discountPercentage / 100);
    }
    if (product.discountFixed > 0) {
      finalPrice = finalPrice - product.discountFixed;
    }
    return Math.max(0, finalPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-neutral-400">Cargando productos...</p>
      </div>
    );
  }

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
                setSearchQuery(tag);
              }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                searchQuery === tag
                  ? 'bg-accent text-secondary'
                  : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-accent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Hero: Productos Destacados */}
        {!searchQuery && selectedCategory === 'Todas' && featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-secondary mb-6">⭐ Productos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Hero: Ofertas */}
        {!searchQuery && selectedCategory === 'Todas' && offerProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-secondary mb-6">🔥 Ofertas Especiales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerProducts.slice(0, 4).map((product) => {
                const finalPrice = getFinalPrice(product);
                return (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    {(product.discountPercentage ?? 0) > 0 && (
                      <div className="absolute top-2 right-2 bg-accent text-secondary px-2 py-1 rounded text-xs font-bold">
                        -{product.discountPercentage}%
                      </div>
                    )}
                    {(product.discountFixed ?? 0) > 0 && (
                      <div className="absolute top-2 right-2 bg-accent text-secondary px-2 py-1 rounded text-xs font-bold">
                        -${(product.discountFixed ?? 0).toLocaleString('es-AR')}
                      </div>
                    )}
                    {finalPrice !== null && product.price !== null && product.price !== finalPrice && (
                      <div className="absolute bottom-2 left-2 bg-neutral-900/90 px-2 py-1 rounded">
                        <span className="text-xs text-neutral-400 line-through">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                        <span className="text-sm text-accent font-bold ml-2">
                          ${finalPrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No se encontraron productos</p>
            {products.length > 0 && (
              <p className="text-neutral-500 text-sm mt-2">
                Total de productos activos: {products.filter((p) => p.isActive).length}
              </p>
            )}
          </div>
        ) : (
          <>
            {(!searchQuery && selectedCategory === 'Todas') && (
              <h2 className="font-display text-2xl text-secondary mb-6 mt-8">Todos los Productos</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
