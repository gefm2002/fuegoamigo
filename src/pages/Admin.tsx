import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, Event, FAQ, Category, SiteConfig, Order, OrderNote, Service } from '../types';
import { apiUrl, apiFetch } from '../lib/api';
import { slugify } from '../utils/slugify';
import { supabasePublic } from '../lib/supabasePublic';
import { getImageUrl } from '../lib/imageUrl';
import { WHATSAPP_NUMBER } from '../utils/whatsapp';
import { buildWhatsAppLink } from '../utils/cartWhatsApp';
import { getDashboardStatsDev } from '../lib/dashboardDev';

type AdminSection = 'dashboard' | 'products' | 'categories' | 'services' | 'events' | 'faqs' | 'orders' | 'config';

function mapOrderFromApi(order: any): Order {
  return {
    id: order.id,
    orderNumber: order.order_number ?? order.orderNumber ?? 0,
    customerName: order.customer_name ?? order.customerName ?? '',
    customerEmail: order.customer_email ?? order.customerEmail ?? undefined,
    customerPhone: order.customer_phone ?? order.customerPhone ?? '',
    deliveryType: order.delivery_type ?? order.deliveryType ?? 'retiro',
    zone: order.zone ?? undefined,
    paymentMethod: order.payment_method ?? order.paymentMethod ?? '',
    items: order.items || [],
    subtotal: Number(order.subtotal ?? 0),
    total: Number(order.total ?? 0),
    notes: typeof order.notes === 'string' ? order.notes : undefined,
    whatsappMessage: order.whatsapp_message ?? order.whatsappMessage ?? undefined,
    status: order.status,
    createdAt: order.created_at ?? order.createdAt ?? '',
    updatedAt: order.updated_at ?? order.updatedAt ?? '',
  };
}

function mapOrderNoteFromApi(note: any): OrderNote {
  return {
    id: note.id,
    orderId: note.order_id ?? note.orderId ?? '',
    note: note.note ?? '',
    createdBy: note.created_by ?? note.createdBy ?? undefined,
    createdAt: note.created_at ?? note.createdAt ?? '',
  };
}

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<OrderNote[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('fuegoamigo_admin_token');
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeSection === 'dashboard') {
      loadDashboardStats();
    }
    if (isAuthenticated && activeSection === 'orders') {
      loadOrders();
    }
    if (isAuthenticated && activeSection === 'config') {
      loadConfig();
    }
  }, [isAuthenticated, activeSection]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      try {
        const decoded = JSON.parse(atob(tokenToVerify));
        if (decoded.dev) {
          setToken(tokenToVerify);
          setIsAuthenticated(true);
          loadAllData();
          return;
        }
      } catch {}

      const data = await apiFetch<{ user: any }>('admin-me', {
        method: 'GET',
        token: tokenToVerify,
      });
      if (data.user) {
        setToken(tokenToVerify);
        setIsAuthenticated(true);
        loadAllData();
      }
    } catch (error) {
      localStorage.removeItem('fuegoamigo_admin_token');
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  const loadAllData = async () => {
    try {
      const isDev = import.meta.env.DEV;
      
      if (isDev) {
        // Products
        const { data: productsData } = await supabasePublic
          .from('fuegoamigo_products')
          .select('*, fuegoamigo_categories:category_id(id, slug, name)')
          .order('created_at', { ascending: false });
        
        const mappedProducts = await Promise.all((productsData || []).map(async (p: any) => {
          const imagePath = p.images?.[0] || '/images/product-box-01.jpg';
          const imageUrl = await getImageUrl(imagePath);
          const priceRaw = p.price;
          const parsedPrice =
            priceRaw === null || priceRaw === undefined || priceRaw === ''
              ? null
              : Number(priceRaw);
          const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description || '',
            price,
            category: p.fuegoamigo_categories?.slug || '',
            image: imageUrl,
            tags: p.tags || [],
            stock: p.stock || 0,
            isActive: p.is_active !== false,
            featured: p.featured || false,
            discountFixed: parseFloat(p.discount_fixed || '0'),
            discountPercentage: parseFloat(p.discount_percentage || '0'),
            isOffer: p.is_offer || false,
            isMadeToOrder: p.is_made_to_order || false,
          };
        }));
        setProducts(mappedProducts);

        // Categories
        const { data: categoriesData } = await supabasePublic
          .from('fuegoamigo_categories')
          .select('*')
          .order('order', { ascending: true });
        setCategories((categoriesData || []).map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          image: c.image,
          isActive: c.is_active !== false,
          order: c.order || 0,
        })));

        // Services
        const { data: servicesData } = await supabasePublic
          .from('fuegoamigo_services')
          .select('*')
          .order('order', { ascending: true });
        setServices((servicesData || []).map((s: any) => ({
          id: s.id,
          slug: s.slug || '',
          title: s.title,
          shortDescription: s.short_description || '',
          longDescription: s.long_description || '',
          image: s.image || '',
          isActive: s.is_active !== false,
          order: s.order || 0,
        })));

        // Events
        const { data: eventsData } = await supabasePublic
          .from('fuegoamigo_events')
          .select('*')
          .order('created_at', { ascending: false });
        const mappedEvents = await Promise.all((eventsData || []).map(async (e: any) => {
          const imageUrls = await Promise.all(
            (e.images || []).map(async (img: string) => {
              try {
                return await getImageUrl(img);
              } catch {
                return img;
              }
            })
          );
          return {
            id: e.id,
            title: e.title,
            eventType: e.event_type,
            location: e.location || '',
            guestsRange: e.guests_range || '',
            highlightMenu: e.highlight_menu || '',
            description: e.description || '',
            images: imageUrls.length > 0 ? imageUrls : [],
            isActive: e.is_active !== false,
          };
        }));
        setEvents(mappedEvents);

        // FAQs
        const { data: faqsData } = await supabasePublic
          .from('fuegoamigo_faqs')
          .select('*')
          .order('order', { ascending: true });
        setFaqs((faqsData || []).map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        })));
      } else {
        // Production: use Netlify Functions
        const [productsRes, categoriesRes, servicesRes, eventsRes, faqsRes] = await Promise.all([
          fetch(apiUrl('public-catalog')),
          fetch(apiUrl('public-categories')),
          fetch(apiUrl('public-services')),
          fetch(apiUrl('public-events')),
          fetch(apiUrl('public-faqs')),
        ]);

        const productsData = await productsRes.json();
        const mappedProducts = await Promise.all(productsData.map(async (p: any) => {
          const imagePath = p.images?.[0] || '/images/product-box-01.jpg';
          const imageUrl = await getImageUrl(imagePath);
          const priceRaw = p.price;
          const parsedPrice =
            priceRaw === null || priceRaw === undefined || priceRaw === ''
              ? null
              : Number(priceRaw);
          const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description || '',
            price,
            category: p.fuegoamigo_categories?.slug || '',
            image: imageUrl,
            tags: p.tags || [],
            stock: p.stock || 0,
            isActive: p.is_active !== false,
            featured: p.featured || false,
            discountFixed: parseFloat(p.discount_fixed || '0'),
            discountPercentage: parseFloat(p.discount_percentage || '0'),
            isOffer: p.is_offer || false,
            isMadeToOrder: p.is_made_to_order || false,
          };
        }));
        setProducts(mappedProducts);

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          image: c.image,
          isActive: c.is_active !== false,
          order: c.order || 0,
        })));

        const servicesData = await servicesRes.json();
        setServices((servicesData || []).map((s: any) => ({
          id: s.id,
          slug: s.slug || '',
          title: s.title,
          shortDescription: s.short_description || '',
          longDescription: s.long_description || '',
          image: s.image || '',
          isActive: s.is_active !== false,
          order: s.order || 0,
        })));

        const eventsData = await eventsRes.json();
        const mappedEvents = await Promise.all(eventsData.map(async (e: any) => {
          const imageUrls = await Promise.all(
            (e.images || []).map(async (img: string) => {
              try {
                return await getImageUrl(img);
              } catch {
                return img;
              }
            })
          );
          return {
            id: e.id,
            title: e.title,
            eventType: e.event_type,
            location: e.location || '',
            guestsRange: e.guests_range || '',
            highlightMenu: e.highlight_menu || '',
            description: e.description || '',
            images: imageUrls.length > 0 ? imageUrls : [],
            isActive: e.is_active !== false,
          };
        }));
        setEvents(mappedEvents);

        const faqsData = await faqsRes.json();
        setFaqs(faqsData.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        })));
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Intentar con Netlify Function primero
      try {
        const stats = await apiFetch<any>('admin-dashboard', {
          method: 'GET',
          token: token!,
        });
        setDashboardStats(stats);
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, intentar con Supabase directo
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo para dashboard');
          const stats = await getDashboardStatsDev();
          setDashboardStats(stats);
        } else {
          throw netlifyError;
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Establecer valores por defecto si falla
      setDashboardStats({
        products: { active: 0 },
        events: { active: 0 },
        orders: {
          total: 0,
          thisMonth: 0,
          byStatus: {
            pending: 0,
            confirmed: 0,
            preparing: 0,
            ready: 0,
            delivered: 0,
            cancelled: 0,
          },
        },
      });
    }
  };

  const loadOrders = async () => {
    try {
      // Intentar con Netlify Function primero
      try {
        const ordersData = await apiFetch<Order[]>('admin-orders-list', {
          method: 'GET',
          token: token!,
        });
        setOrders((ordersData || []).map(mapOrderFromApi));
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, intentar con Supabase directo usando service_role
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo para órdenes');
          const { getOrdersDev } = await import('../lib/ordersDev');
          const ordersData = await getOrdersDev();
          setOrders(ordersData || []);
        } else {
          throw netlifyError;
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const loadOrderDetail = async (orderId: string) => {
    try {
      // Intentar con Netlify Function primero
      try {
        const order = await apiFetch<Order>('admin-orders-get', {
          method: 'GET',
          token: token!,
          query: { id: orderId },
        });
        setSelectedOrder(mapOrderFromApi(order));
        const notesRaw = Array.isArray((order as any).notes) ? (order as any).notes : [];
        setOrderNotes(notesRaw.map(mapOrderNoteFromApi));
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, usar Supabase directo
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo para detalle de orden');
          const { getOrderDetailDev } = await import('../lib/ordersDev');
          const order = await getOrderDetailDev(orderId);
          setSelectedOrder(order);
          setOrderNotes(order.notes || []);
        } else {
          throw netlifyError;
        }
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const configData = await apiFetch<any>('admin-config-get', {
        method: 'GET',
        token: token!,
      });
      // Mapear de snake_case a camelCase
      setConfig({
        id: configData.id || '',
        brandName: configData.brand_name || 'Fuego Amigo',
        whatsapp: configData.whatsapp || '',
        email: configData.email || '',
        address: configData.address || '',
        zone: configData.zone || '',
        hours: configData.hours || {},
        paymentMethods: configData.payment_methods || [],
        deliveryOptions: configData.delivery_options || [],
        waTemplates: configData.wa_templates || {},
      });
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginEmail = email || 'admin@fuegoamigo.com';
      let data: { token: string; user: any };
      
      try {
        data = await apiFetch<{ token: string; user: any }>('admin-login', {
          method: 'POST',
          body: JSON.stringify({ email: loginEmail, password }),
        });
      } catch (netlifyError) {
        if (import.meta.env.DEV) {
          if (loginEmail === 'admin@fuegoamigo.com' && password === 'fuegoamigo2024') {
            const devToken = btoa(JSON.stringify({ email: loginEmail, dev: true }));
            data = { token: devToken, user: { email: loginEmail, role: 'admin' } };
          } else {
            throw new Error('Credenciales incorrectas');
          }
        } else {
          throw netlifyError;
        }
      }

      if (data.token) {
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('fuegoamigo_admin_token', data.token);
        await loadAllData();
      }
    } catch (error: any) {
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('fuegoamigo_admin_token');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md w-full mx-4">
          <h1 className="font-display text-2xl text-secondary mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-accent/20 border border-accent rounded p-3 text-sm text-accent">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fuegoamigo.com"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems: { id: AdminSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Productos', icon: '🛍️' },
    { id: 'categories', label: 'Categorías', icon: '📁' },
    { id: 'services', label: 'Servicios', icon: '🧰' },
    { id: 'events', label: 'Eventos', icon: '🎉' },
    { id: 'faqs', label: 'FAQs', icon: '❓' },
    { id: 'orders', label: 'Órdenes', icon: '📦' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-700 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="font-display text-xl text-secondary">Admin</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-neutral-400 hover:text-secondary"
          >
            ✕
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeSection === item.id
                  ? 'bg-accent text-secondary'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-secondary'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-neutral-800 text-secondary rounded hover:bg-neutral-700 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mb-4 p-2 text-neutral-400 hover:text-secondary"
          >
            ☰
          </button>

          {/* Render active section */}
          {activeSection === 'dashboard' && <DashboardSection stats={dashboardStats} />}
          {activeSection === 'products' && (
            <ProductsSection
              products={products}
              categories={categories}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              token={token!}
              onReload={loadAllData}
            />
          )}
          {activeSection === 'categories' && (
            <CategoriesSection
              categories={categories}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
              token={token!}
              onReload={loadAllData}
            />
          )}
          {activeSection === 'services' && (
            <ServicesSection
              services={services}
              editingService={editingService}
              setEditingService={setEditingService}
              token={token!}
              onReload={loadAllData}
            />
          )}
          {activeSection === 'events' && (
            <EventsSection
              events={events}
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
              token={token!}
              onReload={loadAllData}
            />
          )}
          {activeSection === 'faqs' && (
            <FAQsSection
              faqs={faqs}
              editingFAQ={editingFAQ}
              setEditingFAQ={setEditingFAQ}
              token={token!}
              onReload={loadAllData}
            />
          )}
          {activeSection === 'orders' && (
            <OrdersSection
              orders={orders}
              selectedOrder={selectedOrder}
              orderNotes={orderNotes}
              newNote={newNote}
              setNewNote={setNewNote}
              onSelectOrder={loadOrderDetail}
              onUpdateOrder={loadOrders}
              token={token!}
            />
          )}
          {activeSection === 'config' && (
            <ConfigSection
              config={config}
              token={token!}
              onReload={loadConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Section
function DashboardSection({ stats }: { stats: any }) {
  // Valores por defecto si no hay stats
  const defaultStats = {
    products: { active: 0 },
    events: { active: 0 },
    orders: {
      total: 0,
      thisMonth: 0,
      byStatus: {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
      },
    },
  };

  const displayStats = stats || defaultStats;

  return (
    <div>
      <h1 className="font-display text-3xl text-secondary mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-neutral-400 text-sm mb-2">Productos Activos</h3>
          <p className="font-display text-3xl text-secondary">{displayStats.products?.active || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-neutral-400 text-sm mb-2">Eventos Activos</h3>
          <p className="font-display text-3xl text-secondary">{displayStats.events?.active || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-neutral-400 text-sm mb-2">Total Órdenes</h3>
          <p className="font-display text-3xl text-secondary">{displayStats.orders?.total || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-neutral-400 text-sm mb-2">Órdenes Este Mes</h3>
          <p className="font-display text-3xl text-secondary">{displayStats.orders?.thisMonth || 0}</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
        <h2 className="font-display text-xl text-secondary mb-4">Órdenes por Estado</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(displayStats.orders?.byStatus || defaultStats.orders.byStatus).map(([status, count]: [string, any]) => (
            <div key={status} className="bg-neutral-800 rounded p-4">
              <p className="text-neutral-400 text-sm capitalize">{status}</p>
              <p className="font-display text-2xl text-secondary">{count || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Products Section
function ProductsSection({
  products,
  categories,
  editingProduct,
  setEditingProduct,
  token,
  onReload,
}: {
  products: Product[];
  categories: Category[];
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: '',
    isQuote: false,
    category_id: '',
    stock: '',
    discountFixed: '',
    discountPercentage: '',
    isActive: true,
    featured: false,
    isOffer: false,
    isMadeToOrder: false,
    tags: [],
    images: [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 1572864; // 1.5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo excede el tamaño máximo de 1.5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido. Solo JPEG, PNG y WebP' };
    }

    return { valid: true };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (formData.images.length >= 5) {
      alert('Máximo 5 imágenes por producto');
      return;
    }

    setUploadingImage(true);
    try {
      const entityId = editingProduct?.id || 'temp-' + Date.now();
      const filename = file.name;

      // Obtener signed URL
      const signResponse = await apiFetch<{ signedUrl: string; path: string }>('admin-assets-sign-upload', {
        method: 'POST',
        token,
        body: JSON.stringify({
          entityId,
          filename,
          contentType: file.type,
        }),
      });

      // Subir imagen a Supabase Storage
      const uploadResponse = await fetch(signResponse.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir la imagen');
      }

      // Agregar path a las imágenes
      const newImages = [...formData.images, signResponse.path];
      setFormData({ ...formData, images: newImages });

      // Cargar preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews([...imagePreviews, previewUrl]);

      alert('Imagen subida exitosamente');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  useEffect(() => {
    const loadProductImages = async () => {
      if (editingProduct) {
        // Cargar imágenes desde Supabase para obtener los paths reales
        try {
          const isDev = import.meta.env.DEV;
          let productData: any;
          
          if (isDev) {
            const { data } = await supabasePublic
              .from('fuegoamigo_products')
              .select('images')
              .eq('id', editingProduct.id)
              .single();
            productData = data;
          } else {
            // En producción, necesitaríamos una función admin para obtener el producto completo
            // Por ahora, usar las imágenes del producto editado
            productData = { images: editingProduct.image ? [editingProduct.image] : [] };
          }
          
          const existingImages = productData?.images || [];
          setFormData({
            id: editingProduct.id,
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price?.toString?.() ?? '',
            isQuote: editingProduct.price === null,
            category_id: categories.find(c => c.slug === editingProduct.category)?.id || '',
            stock: editingProduct.stock.toString(),
            discountFixed: (editingProduct.discountFixed || 0).toString(),
            discountPercentage: (editingProduct.discountPercentage || 0).toString(),
            isActive: editingProduct.isActive,
            featured: editingProduct.featured,
            isOffer: editingProduct.isOffer || false,
            isMadeToOrder: editingProduct.isMadeToOrder || false,
            tags: editingProduct.tags || [],
            images: existingImages,
          });
          
          // Cargar previews de imágenes existentes
          const previews = await Promise.all(
            existingImages.map(async (imgPath: string) => {
              try {
                return await getImageUrl(imgPath);
              } catch {
                return imgPath;
              }
            })
          );
          setImagePreviews(previews);
        } catch (error) {
          console.error('Error loading product images:', error);
          // Fallback: usar imagen del producto
          const existingImages = editingProduct.image ? [editingProduct.image] : [];
          setFormData({
            id: editingProduct.id,
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price?.toString?.() ?? '',
            isQuote: editingProduct.price === null,
            category_id: categories.find(c => c.slug === editingProduct.category)?.id || '',
            stock: editingProduct.stock.toString(),
            discountFixed: (editingProduct.discountFixed || 0).toString(),
            discountPercentage: (editingProduct.discountPercentage || 0).toString(),
            isActive: editingProduct.isActive,
            featured: editingProduct.featured,
            isOffer: editingProduct.isOffer || false,
            isMadeToOrder: editingProduct.isMadeToOrder || false,
            tags: editingProduct.tags || [],
            images: existingImages,
          });
          setImagePreviews(existingImages);
        }
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          isQuote: false,
          category_id: '',
          stock: '',
          discountFixed: '',
          discountPercentage: '',
          isActive: true,
          featured: false,
          isOffer: false,
          isMadeToOrder: false,
          tags: [],
          images: [],
        });
        setImagePreviews([]);
      }
    };
    
    loadProductImages();
  }, [editingProduct, categories]);

  const handleSave = async () => {
    try {
      const parsed =
        formData.isQuote || formData.price === '' ? null : Number(formData.price);
      const price =
        formData.isQuote || formData.price === ''
          ? null
          : Number.isFinite(parsed)
            ? parsed
            : null;

      await apiFetch('admin-products-upsert', {
        method: editingProduct ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          slug: slugify(formData.name),
          price,
          stock: parseInt(formData.stock || '0'),
          discount_fixed: parseFloat(formData.discountFixed || '0'),
          discount_percentage: parseFloat(formData.discountPercentage || '0'),
          is_offer: formData.isOffer,
          is_made_to_order: formData.isMadeToOrder,
          images: formData.images, // Incluir imágenes
        }),
      });
      setEditingProduct(null);
      onReload();
      alert('Producto guardado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await apiFetch('admin-products-delete', {
        method: 'DELETE',
        token,
        query: { id },
      });
      onReload();
      alert('Producto eliminado');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (editingProduct || formData.name) {
    return (
      <div>
        <h1 className="font-display text-2xl text-secondary mb-4">
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-medium text-neutral-300">Precio</label>
                <label className="flex items-center gap-2 text-neutral-300 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={formData.isQuote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isQuote: e.target.checked,
                        price: e.target.checked ? '' : formData.price,
                      })
                    }
                    className="rounded"
                  />
                  A cotizar (sin precio)
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={formData.isQuote}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
              {formData.isQuote && (
                <p className="text-xs text-neutral-500 mt-2">
                  Este producto se mostrará como <span className="text-accent font-medium">A Cotizar</span>.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Categoría</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Descuento Fijo</label>
              <input
                type="number"
                step="0.01"
                value={formData.discountFixed}
                onChange={(e) => setFormData({ ...formData, discountFixed: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Descuento %</label>
              <input
                type="number"
                step="0.01"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
          </div>
          
          {/* Upload de imágenes */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Imágenes ({formData.images.length}/5)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage || formData.images.length >= 5}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary mb-2"
            />
            {uploadingImage && <p className="text-neutral-400 text-sm">Subiendo imagen...</p>}
            {formData.images.length >= 5 && (
              <p className="text-accent text-sm">Máximo 5 imágenes alcanzado</p>
            )}
            
            {/* Preview de imágenes */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded border border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-accent text-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-accent/90"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={formData.isOffer}
                onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                className="rounded"
              />
              Oferta
            </label>
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={formData.isMadeToOrder}
                onChange={(e) => setFormData({ ...formData, isMadeToOrder: e.target.checked })}
                className="rounded"
              />
              Por pedido
            </label>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingProduct(null)}
              className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-secondary">Productos</h1>
        <button
          onClick={() => setEditingProduct({} as Product)}
          className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          + Nuevo Producto
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            {product.image && (
              <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
            )}
            <h3 className="font-display text-lg text-secondary mb-2">{product.name}</h3>
            {product.price === null ? (
              <p className="text-accent font-display text-sm mb-2">A Cotizar</p>
            ) : (
              <p className="text-neutral-400 text-sm mb-2">${product.price.toLocaleString('es-AR')}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingProduct(product)}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Categories Section
function CategoriesSection({
  categories,
  editingCategory,
  setEditingCategory,
  token,
  onReload,
}: {
  categories: Category[];
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        name: editingCategory.name,
        description: editingCategory.description || '',
        order: editingCategory.order || 0,
        isActive: editingCategory.isActive,
      });
    } else {
      setFormData({ name: '', description: '', order: 0, isActive: true });
    }
  }, [editingCategory]);

  const handleSave = async () => {
    try {
      await apiFetch('admin-categories-upsert', {
        method: editingCategory ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          slug: slugify(formData.name),
        }),
      });
      setEditingCategory(null);
      onReload();
      alert('Categoría guardada');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await apiFetch('admin-categories-delete', {
        method: 'DELETE',
        token,
        query: { id },
      });
      onReload();
      alert('Categoría eliminada');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (editingCategory || formData.name) {
    return (
      <div>
        <h1 className="font-display text-2xl text-secondary mb-4">
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </h1>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Orden</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
            <label className="flex items-center gap-2 text-neutral-300 mt-6">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              Activa
            </label>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingCategory(null)}
              className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-secondary">Categorías</h1>
        <button
          onClick={() => setEditingCategory({} as Category)}
          className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          + Nueva Categoría
        </button>
      </div>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-secondary">{category.name}</h3>
              {category.description && (
                <p className="text-neutral-400 text-sm">{category.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCategory(category)}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Services Section
function ServicesSection({
  services,
  editingService,
  setEditingService,
  token,
  onReload,
}: {
  services: Service[];
  editingService: Service | null;
  setEditingService: (s: Service | null) => void;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    short_description: '',
    long_description: '',
    image: '',
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        id: editingService.id,
        title: editingService.title || '',
        slug: editingService.slug || '',
        short_description: editingService.shortDescription || '',
        long_description: editingService.longDescription || '',
        image: editingService.image || '',
        is_active: editingService.isActive,
        order: editingService.order || 0,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        short_description: '',
        long_description: '',
        image: '',
        is_active: true,
        order: 0,
      });
    }
  }, [editingService]);

  const handleSave = async () => {
    try {
      await apiFetch('admin-services-upsert', {
        method: editingService ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || slugify(formData.title),
          order: Number(formData.order || 0),
        }),
      });
      setEditingService(null);
      onReload();
      alert('Servicio guardado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await apiFetch('admin-services-delete', {
        method: 'DELETE',
        token,
        query: { id },
      });
      onReload();
      alert('Servicio eliminado');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (editingService || formData.title) {
    return (
      <div>
        <h1 className="font-display text-2xl text-secondary mb-4">
          {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h1>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Se genera solo si lo dejás vacío"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción corta *</label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Detalle (opcional)</label>
            <textarea
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Imagen (path o URL)</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Orden</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              Activo
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingService(null)}
              className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-secondary">Servicios</h1>
        <button
          onClick={() => setEditingService({} as Service)}
          className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          + Nuevo Servicio
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            {service.image && (
              <img src={service.image} alt={service.title} className="w-full h-32 object-cover rounded mb-2" />
            )}
            <h3 className="font-display text-lg text-secondary mb-2">{service.title}</h3>
            <p className="text-neutral-400 text-sm mb-2 line-clamp-2">{service.shortDescription}</p>
            <p className="text-neutral-500 text-xs">Orden: {service.order}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingService(service)}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex-1 px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      {services.length === 0 && (
        <p className="text-neutral-500 text-sm mt-6">
          No hay servicios cargados (si la tabla `fuegoamigo_services` no existe aún, hay que crearla en Supabase).
        </p>
      )}
    </div>
  );
}

// Events Section
function EventsSection({
  events,
  editingEvent,
  setEditingEvent,
  token,
  onReload,
}: {
  events: Event[];
  editingEvent: Event | null;
  setEditingEvent: (e: Event | null) => void;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    title: '',
    event_type: '',
    location: '',
    guests_range: '',
    highlight_menu: '',
    description: '',
    images: [],
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        id: editingEvent.id,
        title: editingEvent.title,
        event_type: editingEvent.eventType,
        location: editingEvent.location,
        guests_range: editingEvent.guestsRange,
        highlight_menu: editingEvent.highlightMenu,
        description: editingEvent.description,
        images: editingEvent.images || [],
        isActive: editingEvent.isActive,
      });
      setImagePreviews(editingEvent.images || []);
    } else {
      setFormData({
        title: '',
        event_type: '',
        location: '',
        guests_range: '',
        highlight_menu: '',
        description: '',
        images: [],
        isActive: true,
      });
      setImagePreviews([]);
    }
  }, [editingEvent]);

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 1572864;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo excede el tamaño máximo de 1.5MB' };
    }
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido. Solo JPEG, PNG y WebP' };
    }
    return { valid: true };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (formData.images.length >= 5) {
      alert('Máximo 5 imágenes por evento');
      return;
    }

    setUploadingImage(true);
    try {
      const entityId = editingEvent?.id || 'temp-' + Date.now();
      const signResponse = await apiFetch<{ signedUrl: string; path: string }>('admin-assets-sign-upload', {
        method: 'POST',
        token,
        body: JSON.stringify({
          entityId,
          filename: file.name,
          contentType: file.type,
        }),
      });

      const uploadResponse = await fetch(signResponse.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Error al subir la imagen');

      const newImages = [...formData.images, signResponse.path];
      setFormData({ ...formData, images: newImages });
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews([...imagePreviews, previewUrl]);
      alert('Imagen subida exitosamente');
    } catch (error: any) {
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSave = async () => {
    try {
      await apiFetch('admin-events-upsert', {
        method: editingEvent ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          is_active: formData.isActive,
        }),
      });
      setEditingEvent(null);
      onReload();
      alert('Evento guardado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await apiFetch('admin-events-delete', {
        method: 'DELETE',
        token,
        query: { id },
      });
      onReload();
      alert('Evento eliminado');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (editingEvent || formData.title) {
    return (
      <div>
        <h1 className="font-display text-2xl text-secondary mb-4">
          {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
        </h1>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo de Evento *</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            >
              <option value="">Seleccionar...</option>
              <option value="Social">Social</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Boda">Boda</option>
              <option value="Cumple">Cumple</option>
              <option value="Producción">Producción</option>
              <option value="Feria">Feria</option>
              <option value="Foodtruck">Foodtruck</option>
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Rango de Invitados</label>
              <input
                type="text"
                value={formData.guests_range}
                onChange={(e) => setFormData({ ...formData, guests_range: e.target.value })}
                placeholder="Ej: 50-100 personas"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Menú Destacado</label>
            <input
              type="text"
              value={formData.highlight_menu}
              onChange={(e) => setFormData({ ...formData, highlight_menu: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Imágenes ({formData.images.length}/5)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage || formData.images.length >= 5}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary mb-2"
            />
            {uploadingImage && <p className="text-neutral-400 text-sm">Subiendo imagen...</p>}
            {formData.images.length >= 5 && (
              <p className="text-accent text-sm">Máximo 5 imágenes alcanzado</p>
            )}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded border border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-accent text-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-accent/90"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            Activo
          </label>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingEvent(null)}
              className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-secondary">Eventos</h1>
        <button
          onClick={() => setEditingEvent({} as Event)}
          className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          + Nuevo Evento
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            {event.images && event.images.length > 0 && (
              <img src={event.images[0]} alt={event.title} className="w-full h-32 object-cover rounded mb-2" />
            )}
            <h3 className="font-display text-lg text-secondary mb-2">{event.title}</h3>
            <p className="text-neutral-400 text-sm mb-2">{event.eventType}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingEvent(event)}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="flex-1 px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// FAQs Section
function FAQsSection({
  faqs,
  editingFAQ,
  setEditingFAQ,
  token,
  onReload,
}: {
  faqs: FAQ[];
  editingFAQ: FAQ | null;
  setEditingFAQ: (f: FAQ | null) => void;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    question: '',
    answer: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingFAQ) {
      setFormData({
        id: editingFAQ.id,
        question: editingFAQ.question,
        answer: editingFAQ.answer,
        order: 0,
        isActive: true,
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        order: faqs.length,
        isActive: true,
      });
    }
  }, [editingFAQ, faqs.length]);

  const handleSave = async () => {
    try {
      await apiFetch('admin-faqs-upsert', {
        method: editingFAQ ? 'PUT' : 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          is_active: formData.isActive,
        }),
      });
      setEditingFAQ(null);
      onReload();
      alert('FAQ guardada exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta FAQ?')) return;
    try {
      await apiFetch('admin-faqs-delete', {
        method: 'DELETE',
        token,
        query: { id },
      });
      onReload();
      alert('FAQ eliminada');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (editingFAQ || formData.question) {
    return (
      <div>
        <h1 className="font-display text-2xl text-secondary mb-4">
          {editingFAQ ? 'Editar FAQ' : 'Nueva FAQ'}
        </h1>
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Pregunta *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Respuesta *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Orden</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            Activa
          </label>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingFAQ(null)}
              className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-secondary">FAQs</h1>
        <button
          onClick={() => setEditingFAQ({} as FAQ)}
          className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          + Nueva FAQ
        </button>
      </div>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            <h3 className="font-display text-lg text-secondary mb-2">{faq.question}</h3>
            <p className="text-neutral-400 text-sm mb-4">{faq.answer}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingFAQ(faq)}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-secondary rounded hover:bg-neutral-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersSection({
  orders,
  selectedOrder,
  orderNotes,
  newNote,
  setNewNote,
  onSelectOrder,
  onUpdateOrder,
  token,
}: {
  orders: Order[];
  selectedOrder: Order | null;
  orderNotes: OrderNote[];
  newNote: string;
  setNewNote: (n: string) => void;
  onSelectOrder: (id: string) => void;
  onUpdateOrder: () => void;
  token: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string | null>(null);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Intentar con Netlify Function primero
      try {
        await apiFetch('admin-orders-update', {
          method: 'PUT',
          token,
          body: JSON.stringify({ id: orderId, status: newStatus }),
        });
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, usar Supabase directo
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo para actualizar orden');
          const { updateOrderStatusDev } = await import('../lib/ordersDev');
          await updateOrderStatusDev(orderId, newStatus);
        } else {
          throw netlifyError;
        }
      }
      onUpdateOrder();
      if (selectedOrder?.id === orderId) {
        onSelectOrder(orderId);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !newNote.trim()) return;
    try {
      let result: { whatsapp_url: string | null };
      
      // Intentar con Netlify Function primero
      try {
        result = await apiFetch<{ whatsapp_url: string }>('admin-orders-send-note', {
          method: 'POST',
          token,
          body: JSON.stringify({
            order_id: selectedOrder.id,
            note: newNote,
          }),
        });
      } catch (netlifyError) {
        // Si falla y estamos en desarrollo, usar Supabase directo
        if (import.meta.env.DEV) {
          console.warn('Netlify Functions no disponibles, usando Supabase directo para agregar nota');
          const { addOrderNoteDev } = await import('../lib/ordersDev');
          // Obtener email del token si es posible
          let createdBy = 'admin';
          try {
            const decoded = JSON.parse(atob(token));
            createdBy = decoded.email || 'admin';
          } catch {}
          result = await addOrderNoteDev(selectedOrder.id, newNote, createdBy);
        } else {
          throw netlifyError;
        }
      }
      
      setNewNote('');
      onSelectOrder(selectedOrder.id);
      if (result.whatsapp_url) {
        setPendingWhatsAppUrl(result.whatsapp_url);
        setShowWhatsAppModal(true);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (pendingWhatsAppUrl) {
      window.open(pendingWhatsAppUrl, '_blank');
    }
    setShowWhatsAppModal(false);
    setPendingWhatsAppUrl(null);
  };

  const handleWhatsAppCancel = () => {
    setShowWhatsAppModal(false);
    setPendingWhatsAppUrl(null);
  };

  return (
    <div>
      {/* Modal de confirmación WhatsApp */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-1.013-2.03-1.262-.272-.25-.47-.369-.669.149-.198.519-.768 1.262-1.05 1.52-.281.258-.57.29-.99.099-.42-.191-1.776-.654-3.384-2.084-1.251-1.13-2.096-2.527-2.34-2.955-.243-.428-.027-.66.178-.88.182-.193.407-.428.61-.642.203-.214.271-.357.407-.595.136-.238.068-.446-.007-.624-.074-.178-.669-1.61-.916-2.207-.242-.579-.487-.5-.669-.31-.182.191-.757.925-.757 2.257 0 1.331.969 2.62 1.105 2.8.136.18.192.297.297.495.104.198.052.371-.015.545-.067.174-.297.297-.61.495-.312.198-.669.371-.916.545-.247.174-.428.297-.595.495-.167.198-.124.371.05.595.174.223.757 1.07 1.623 1.728 1.38.91 2.534 1.19 3.18 1.36.646.17 1.22.128 1.68.077.46-.05 1.42-.297 1.62-.644.198-.347.149-.644.099-.644-.05 0-.182-.05-.297-.099z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-secondary mb-1">Enviar por WhatsApp</h3>
                <p className="text-neutral-400 text-sm">¿Deseas enviar esta nota al cliente?</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleWhatsAppCancel}
                className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium rounded hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleWhatsAppConfirm}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-1.013-2.03-1.262-.272-.25-.47-.369-.669.149-.198.519-.768 1.262-1.05 1.52-.281.258-.57.29-.99.099-.42-.191-1.776-.654-3.384-2.084-1.251-1.13-2.096-2.527-2.34-2.955-.243-.428-.027-.66.178-.88.182-.193.407-.428.61-.642.203-.214.271-.357.407-.595.136-.238.068-.446-.007-.624-.074-.178-.669-1.61-.916-2.207-.242-.579-.487-.5-.669-.31-.182.191-.757.925-.757 2.257 0 1.331.969 2.62 1.105 2.8.136.18.192.297.297.495.104.198.052.371-.015.545-.067.174-.297.297-.61.495-.312.198-.669.371-.916.545-.247.174-.428.297-.595.495-.167.198-.124.371.05.595.174.223.757 1.07 1.623 1.728 1.38.91 2.534 1.19 3.18 1.36.646.17 1.22.128 1.68.077.46-.05 1.42-.297 1.62-.644.198-.347.149-.644.099-.644-.05 0-.182-.05-.297-.099z"/>
                </svg>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-display text-3xl text-secondary mb-6">Órdenes</h1>
      
      <div className="mb-4 flex gap-2">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded ${
              statusFilter === status
                ? 'bg-accent text-secondary'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {status === 'all' ? 'Todas' : status}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className={`bg-neutral-900 border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedOrder?.id === order.id
                  ? 'border-accent bg-neutral-800'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-display text-lg text-secondary">Pedido #{order.orderNumber}</h3>
                  <p className="text-neutral-400 text-sm">{order.customerName}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500' :
                  order.status === 'preparing' ? 'bg-purple-500/20 text-purple-500' :
                  order.status === 'ready' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'delivered' ? 'bg-green-600/20 text-green-600' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-secondary font-medium">${order.total.toLocaleString('es-AR')}</p>
              <p className="text-neutral-400 text-xs mt-1">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR') : '-'}
              </p>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6">
            <h2 className="font-display text-xl text-secondary mb-4">Detalle del Pedido #{selectedOrder.orderNumber}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-neutral-400 text-sm">Cliente</p>
                <p className="text-secondary">{selectedOrder.customerName}</p>
                <p className="text-neutral-400 text-sm">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Entrega</p>
                <p className="text-secondary capitalize">{selectedOrder.deliveryType}</p>
                {selectedOrder.zone && <p className="text-neutral-400 text-sm">{selectedOrder.zone}</p>}
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Pago</p>
                <p className="text-secondary capitalize">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm mb-2">Estado</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">Preparando</option>
                  <option value="ready">Listo</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-lg text-secondary mb-2">Productos</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-800 rounded p-2 flex justify-between">
                    <span className="text-secondary text-sm">{item.qty}x {item.name}</span>
                    <span className="text-secondary text-sm">${(item.price * item.qty).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-lg font-display text-secondary">
                <span>Total</span>
                <span>${selectedOrder.total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-lg text-secondary mb-2">Notas</h3>
              <div className="space-y-2 mb-4">
                {orderNotes.map((note) => (
                  <div key={note.id} className="bg-neutral-800 rounded p-3">
                    <p className="text-secondary text-sm">{note.note}</p>
                    <p className="text-neutral-400 text-xs mt-1">
                      {note.createdAt ? new Date(note.createdAt).toLocaleString('es-AR') : '-'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Nueva nota..."
                  className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
                >
                  Agregar
                </button>
              </div>
            </div>

            {selectedOrder.whatsappMessage && (
              <button
                onClick={() => {
                  const link = buildWhatsAppLink(WHATSAPP_NUMBER, selectedOrder.whatsappMessage!);
                  window.open(link, '_blank');
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Abrir WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigSection({
  config,
  token,
  onReload,
}: {
  config: SiteConfig | null;
  token: string;
  onReload: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    brand_name: '',
    whatsapp: '',
    email: '',
    address: '',
    zone: '',
    payment_methods: [],
    delivery_options: [],
  });

  useEffect(() => {
    if (config) {
      setFormData({
        brand_name: config.brandName || '',
        whatsapp: config.whatsapp || '',
        email: config.email || '',
        address: config.address || '',
        zone: config.zone || '',
        payment_methods: config.paymentMethods || [],
        delivery_options: config.deliveryOptions || [],
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      console.log('Guardando configuración:', formData);
      const response = await apiFetch('admin-config-update', {
        method: 'PUT',
        token,
        body: JSON.stringify(formData),
      });
      console.log('Configuración guardada:', response);
      alert('Configuración guardada exitosamente');
      onReload();
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      const errorMessage = error?.message || 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-secondary mb-6">Configuración</h1>
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Nombre de la marca</label>
          <input
            type="text"
            value={formData.brand_name}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Dirección</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Zona</label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-secondary"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
