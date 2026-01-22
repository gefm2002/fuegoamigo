import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, Event, Promo, FAQ } from '../types';
import productsData from '../data/products.json';
import eventsData from '../data/events.json';
import promosData from '../data/promos.json';
import faqsData from '../data/faqs.json';
import {
  saveProducts,
  loadProducts,
  saveEvents,
  loadEvents,
  savePromos,
  loadPromos,
  saveFAQs,
  loadFAQs,
  exportData,
  importData,
  imageToBase64,
} from '../utils/storage';

const ADMIN_PASSWORD = 'fuegoamigo2024';

type Tab = 'products' | 'events' | 'promos' | 'faqs';

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fuegoamigo_admin_auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  const loadAllData = () => {
    const loadedProducts = loadProducts() || (productsData as Product[]);
    const loadedEvents = loadEvents() || (eventsData as Event[]);
    const loadedPromos = loadPromos() || (promosData as Promo[]);
    const loadedFAQs = loadFAQs() || (faqsData as FAQ[]);

    setProducts(loadedProducts);
    setEvents(loadedEvents);
    setPromos(loadedPromos);
    setFaqs(loadedFAQs);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('fuegoamigo_admin_auth', 'true');
      loadAllData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('fuegoamigo_admin_auth');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md w-full mx-4">
          <h1 className="font-display text-2xl text-secondary mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl text-secondary">Panel de Administración</h1>
          <div className="flex gap-4">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-secondary rounded hover:bg-neutral-800 transition-colors"
            >
              Exportar JSON
            </button>
            <label className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-secondary rounded hover:bg-neutral-800 transition-colors cursor-pointer">
              Importar JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importData(file)
                      .then(() => {
                        loadAllData();
                        alert('Datos importados correctamente');
                      })
                      .catch(() => alert('Error al importar datos'));
                  }
                }}
              />
            </label>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-700">
          {(['products', 'events', 'promos', 'faqs'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-neutral-400 hover:text-secondary'
              }`}
            >
              {tab === 'products' && 'Productos'}
              {tab === 'events' && 'Eventos'}
              {tab === 'promos' && 'Promociones'}
              {tab === 'faqs' && 'FAQs'}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl text-secondary">Productos</h2>
              <button
                onClick={() => setEditingProduct({} as Product)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
              >
                + Nuevo Producto
              </button>
            </div>
            <ProductManager
              products={products}
              onUpdate={(updated) => {
                setProducts(updated);
                saveProducts(updated);
              }}
              editing={editingProduct}
              onEdit={setEditingProduct}
            />
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl text-secondary">Eventos</h2>
              <button
                onClick={() => setEditingEvent({} as Event)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
              >
                + Nuevo Evento
              </button>
            </div>
            <EventManager
              events={events}
              onUpdate={(updated) => {
                setEvents(updated);
                saveEvents(updated);
              }}
              editing={editingEvent}
              onEdit={setEditingEvent}
            />
          </div>
        )}

        {/* Promos Tab */}
        {activeTab === 'promos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl text-secondary">Promociones</h2>
              <button
                onClick={() => setEditingPromo({} as Promo)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
              >
                + Nueva Promoción
              </button>
            </div>
            <PromoManager
              promos={promos}
              onUpdate={(updated) => {
                setPromos(updated);
                savePromos(updated);
              }}
              editing={editingPromo}
              onEdit={setEditingPromo}
            />
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl text-secondary">FAQs</h2>
              <button
                onClick={() => setEditingFAQ({} as FAQ)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
              >
                + Nueva FAQ
              </button>
            </div>
            <FAQManager
              faqs={faqs}
              onUpdate={(updated) => {
                setFaqs(updated);
                saveFAQs(updated);
              }}
              editing={editingFAQ}
              onEdit={setEditingFAQ}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Product Manager Component
function ProductManager({
  products,
  onUpdate,
  editing,
  onEdit,
}: {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  editing: Product | null;
  onEdit: (product: Product | null) => void;
}) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (editing) {
      setFormData(editing.id ? editing : {});
    }
  }, [editing]);

  const handleSave = () => {
    if (!formData.name || !formData.slug || !formData.price) {
      alert('Completa los campos obligatorios');
      return;
    }

    let updated: Product[];
    if (editing?.id) {
      updated = products.map((p) => (p.id === editing.id ? { ...formData, id: editing.id } as Product : p));
    } else {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        slug: formData.slug,
        name: formData.name,
        description: formData.description || '',
        price: formData.price,
        category: formData.category || 'boxes-y-regalos',
        image: formData.image || '/images/product-box-01.jpg',
        tags: formData.tags || [],
        stock: formData.stock || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        featured: formData.featured || false,
      };
      updated = [...products, newProduct];
    }
    onUpdate(updated);
    onEdit(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      onUpdate(products.filter((p) => p.id !== id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        setFormData({ ...formData, image: base64 });
      } catch (error) {
        alert('Error al cargar imagen');
      }
    }
  };

  if (editing) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
        <h3 className="font-display text-xl text-secondary mb-4">
          {editing.id ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Precio *</label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Categoría</label>
            <select
              value={formData.category || 'boxes-y-regalos'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            >
              <option value="boxes-y-regalos">Boxes y Regalos</option>
              <option value="picadas-y-tablas">Picadas y Tablas</option>
              <option value="ahumados">Ahumados</option>
              <option value="salsas-y-aderezos">Salsas y Aderezos</option>
              <option value="sandwiches-y-burgers">Sandwiches y Burgers</option>
              <option value="finger-food">Finger Food</option>
              <option value="postres">Postres</option>
              <option value="combos">Combos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Stock</label>
            <input
              type="number"
              value={formData.stock || 0}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
            <input
              type="text"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="O ingresa URL"
              className="w-full mt-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Tags (separados por coma)</label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t) => t.trim()) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-neutral-300">Activo</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-neutral-300">Destacado</span>
            </label>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              onEdit(null);
              setFormData({});
            }}
            className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex items-center gap-4">
          <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
          <div className="flex-1">
            <h3 className="font-display text-lg text-secondary">{product.name}</h3>
            <p className="text-neutral-400 text-sm">${product.price.toLocaleString('es-AR')}</p>
            <p className="text-neutral-500 text-xs">{product.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Event Manager Component
function EventManager({
  events,
  onUpdate,
  editing,
  onEdit,
}: {
  events: Event[];
  onUpdate: (events: Event[]) => void;
  editing: Event | null;
  onEdit: (event: Event | null) => void;
}) {
  const [formData, setFormData] = useState<Partial<Event>>({});

  useEffect(() => {
    if (editing) {
      setFormData(editing.id ? editing : {});
    }
  }, [editing]);

  const handleSave = () => {
    if (!formData.title || !formData.eventType) {
      alert('Completa los campos obligatorios');
      return;
    }

    let updated: Event[];
    if (editing?.id) {
      updated = events.map((e) => (e.id === editing.id ? { ...formData, id: editing.id } as Event : e));
    } else {
      const newEvent: Event = {
        id: `evento-${Date.now()}`,
        title: formData.title,
        eventType: formData.eventType,
        location: formData.location || '',
        guestsRange: formData.guestsRange || '',
        highlightMenu: formData.highlightMenu || '',
        description: formData.description || '',
        images: formData.images || ['/images/gallery-bbq-01.jpg'],
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };
      updated = [...events, newEvent];
    }
    onUpdate(updated);
    onEdit(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este evento?')) {
      onUpdate(events.filter((e) => e.id !== id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        const images = formData.images || [];
        images[index] = base64;
        setFormData({ ...formData, images });
      } catch (error) {
        alert('Error al cargar imagen');
      }
    }
  };

  if (editing) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
        <h3 className="font-display text-xl text-secondary mb-4">
          {editing.id ? 'Editar Evento' : 'Nuevo Evento'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Título *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo *</label>
            <select
              value={formData.eventType || ''}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            >
              <option value="">Seleccionar</option>
              <option value="Social">Social</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Boda">Boda</option>
              <option value="Cumple">Cumple</option>
              <option value="Producción">Producción</option>
              <option value="Feria">Feria</option>
              <option value="Foodtruck">Foodtruck</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Ubicación</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Cantidad de personas</label>
            <input
              type="text"
              value={formData.guestsRange || ''}
              onChange={(e) => setFormData({ ...formData, guestsRange: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Menú destacado</label>
            <input
              type="text"
              value={formData.highlightMenu || ''}
              onChange={(e) => setFormData({ ...formData, highlightMenu: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Imágenes</label>
            <div className="space-y-2">
              {(formData.images || ['']).map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, idx)}
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
                  />
                  {img && <img src={img} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded" />}
                </div>
              ))}
              <button
                onClick={() => setFormData({ ...formData, images: [...(formData.images || []), ''] })}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded"
              >
                + Agregar imagen
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-neutral-300">Activo</span>
            </label>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              onEdit(null);
              setFormData({});
            }}
            className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex items-center gap-4">
          {event.images[0] && (
            <img src={event.images[0]} alt={event.title} className="w-20 h-20 object-cover rounded" />
          )}
          <div className="flex-1">
            <h3 className="font-display text-lg text-secondary">{event.title}</h3>
            <p className="text-neutral-400 text-sm">{event.eventType} • {event.location}</p>
            <p className="text-neutral-500 text-xs">{event.guestsRange}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(event)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(event.id)}
              className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Promo Manager Component
function PromoManager({
  promos,
  onUpdate,
  editing,
  onEdit,
}: {
  promos: Promo[];
  onUpdate: (promos: Promo[]) => void;
  editing: Promo | null;
  onEdit: (promo: Promo | null) => void;
}) {
  const [formData, setFormData] = useState<Partial<Promo>>({});

  useEffect(() => {
    if (editing) {
      setFormData(editing.id ? editing : {});
    }
  }, [editing]);

  const handleSave = () => {
    if (!formData.banco || !formData.dia) {
      alert('Completa los campos obligatorios');
      return;
    }

    let updated: Promo[];
    if (editing?.id) {
      updated = promos.map((p) => (p.id === editing.id ? { ...formData, id: editing.id } as Promo : p));
    } else {
      const newPromo: Promo = {
        id: `promo-${Date.now()}`,
        banco: formData.banco,
        dia: formData.dia,
        topeReintegro: formData.topeReintegro || 0,
        porcentaje: formData.porcentaje || 0,
        medios: formData.medios || [],
        vigencia: formData.vigencia || '',
      };
      updated = [...promos, newPromo];
    }
    onUpdate(updated);
    onEdit(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta promoción?')) {
      onUpdate(promos.filter((p) => p.id !== id));
    }
  };

  if (editing) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
        <h3 className="font-display text-xl text-secondary mb-4">
          {editing.id ? 'Editar Promoción' : 'Nueva Promoción'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Banco *</label>
            <input
              type="text"
              value={formData.banco || ''}
              onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Día *</label>
            <input
              type="text"
              value={formData.dia || ''}
              onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Tope Reintegro</label>
            <input
              type="number"
              value={formData.topeReintegro || 0}
              onChange={(e) => setFormData({ ...formData, topeReintegro: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Porcentaje</label>
            <input
              type="number"
              value={formData.porcentaje || 0}
              onChange={(e) => setFormData({ ...formData, porcentaje: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Medios (separados por coma)</label>
            <input
              type="text"
              value={formData.medios?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, medios: e.target.value.split(',').map((m) => m.trim()) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Vigencia</label>
            <input
              type="text"
              value={formData.vigencia || ''}
              onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              onEdit(null);
              setFormData({});
            }}
            className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {promos.map((promo) => (
        <div key={promo.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
          <h3 className="font-display text-lg text-secondary">{promo.banco}</h3>
          <p className="text-neutral-400 text-sm">{promo.dia}: {promo.porcentaje}% reintegro</p>
          <p className="text-neutral-500 text-xs">Tope: ${promo.topeReintegro.toLocaleString('es-AR')}</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(promo)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(promo.id)}
              className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// FAQ Manager Component
function FAQManager({
  faqs,
  onUpdate,
  editing,
  onEdit,
}: {
  faqs: FAQ[];
  onUpdate: (faqs: FAQ[]) => void;
  editing: FAQ | null;
  onEdit: (faq: FAQ | null) => void;
}) {
  const [formData, setFormData] = useState<Partial<FAQ>>({});

  useEffect(() => {
    if (editing) {
      setFormData(editing.id ? editing : {});
    }
  }, [editing]);

  const handleSave = () => {
    if (!formData.question || !formData.answer) {
      alert('Completa los campos obligatorios');
      return;
    }

    let updated: FAQ[];
    if (editing?.id) {
      updated = faqs.map((f) => (f.id === editing.id ? { ...formData, id: editing.id } as FAQ : f));
    } else {
      const newFAQ: FAQ = {
        id: `faq-${Date.now()}`,
        question: formData.question,
        answer: formData.answer,
      };
      updated = [...faqs, newFAQ];
    }
    onUpdate(updated);
    onEdit(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta FAQ?')) {
      onUpdate(faqs.filter((f) => f.id !== id));
    }
  };

  if (editing) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-6">
        <h3 className="font-display text-xl text-secondary mb-4">
          {editing.id ? 'Editar FAQ' : 'Nueva FAQ'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Pregunta *</label>
            <input
              type="text"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Respuesta *</label>
            <textarea
              value={formData.answer || ''}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              onEdit(null);
              setFormData({});
            }}
            className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
          <h3 className="font-display text-lg text-secondary mb-2">{faq.question}</h3>
          <p className="text-neutral-400 text-sm mb-4">{faq.answer}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(faq)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(faq.id)}
              className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
