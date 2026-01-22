import type { Product, Event, Promo, FAQ } from '../types';

const STORAGE_KEYS = {
  products: 'fuegoamigo_admin_products',
  events: 'fuegoamigo_admin_events',
  promos: 'fuegoamigo_admin_promos',
  faqs: 'fuegoamigo_admin_faqs',
};

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export function loadProducts(): Product[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.products);
  return stored ? JSON.parse(stored) : null;
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

export function loadEvents(): Event[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.events);
  return stored ? JSON.parse(stored) : null;
}

export function savePromos(promos: Promo[]): void {
  localStorage.setItem(STORAGE_KEYS.promos, JSON.stringify(promos));
}

export function loadPromos(): Promo[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.promos);
  return stored ? JSON.parse(stored) : null;
}

export function saveFAQs(faqs: FAQ[]): void {
  localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(faqs));
}

export function loadFAQs(): FAQ[] | null {
  const stored = localStorage.getItem(STORAGE_KEYS.faqs);
  return stored ? JSON.parse(stored) : null;
}

export function exportData() {
  const data = {
    products: loadProducts() || [],
    events: loadEvents() || [],
    promos: loadPromos() || [],
    faqs: loadFAQs() || [],
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fuegoamigo-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products) saveProducts(data.products);
        if (data.events) saveEvents(data.events);
        if (data.promos) savePromos(data.promos);
        if (data.faqs) saveFAQs(data.faqs);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
