export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
  stock: number;
  isActive: boolean;
  featured: boolean;
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
  budget: string;
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
