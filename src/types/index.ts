export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  image: string;
  tags: string[];
  stock: number;
  isActive: boolean;
  featured: boolean;
  discountFixed?: number;
  discountPercentage?: number;
  isOffer?: boolean;
  isMadeToOrder?: boolean;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface SiteConfig {
  id: string;
  brandName: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  zone?: string;
  hours?: Record<string, string>;
  paymentMethods?: string[];
  deliveryOptions?: string[];
  waTemplates?: Record<string, string>;
  homeHeroImage?: string;
  eventsHeroImage?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryType: 'entrega' | 'retiro';
  zone?: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  notes?: string;
  whatsappMessage?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id?: string;
  product_id?: string;
  name: string;
  variant?: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface OrderNote {
  id: string;
  orderId: string;
  note: string;
  createdBy?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  guestsRange: string;
  highlightMenu: string;
  description: string;
  images: string[];
  isActive: boolean;
}

export interface Promo {
  id: string;
  banco: string;
  dia: string;
  topeReintegro: number;
  porcentaje: number;
  medios: string[];
  vigencia: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface QuoteFormData {
  eventType: string;
  date: string;
  guests: string;
  zone: string;
  serviceType: string;
  comments: string;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  zone: string;
  deliveryType: 'retiro' | 'envio';
  date: string;
  timeSlot: string;
  comments: string;
}
