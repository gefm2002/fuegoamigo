import { useState, useEffect } from 'react';
import type { Product, Event, Promo, FAQ } from '../types';
import productsData from '../data/products.json';
import eventsData from '../data/events.json';
import promosData from '../data/promos.json';
import faqsData from '../data/faqs.json';
import { loadProducts, loadEvents, loadPromos, loadFAQs } from '../utils/storage';

export function useProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = loadProducts();
    return stored || (productsData as Product[]);
  });

  useEffect(() => {
    const stored = loadProducts();
    if (stored) {
      setProducts(stored);
    }
  }, []);

  return products;
}

export function useEvents(): Event[] {
  const [events, setEvents] = useState<Event[]>(() => {
    const stored = loadEvents();
    return stored || (eventsData as Event[]);
  });

  useEffect(() => {
    const stored = loadEvents();
    if (stored) {
      setEvents(stored);
    }
  }, []);

  return events;
}

export function usePromos(): Promo[] {
  const [promos, setPromos] = useState<Promo[]>(() => {
    const stored = loadPromos();
    return stored || (promosData as Promo[]);
  });

  useEffect(() => {
    const stored = loadPromos();
    if (stored) {
      setPromos(stored);
    }
  }, []);

  return promos;
}

export function useFAQs(): FAQ[] {
  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    const stored = loadFAQs();
    return stored || (faqsData as FAQ[]);
  });

  useEffect(() => {
    const stored = loadFAQs();
    if (stored) {
      setFaqs(stored);
    }
  }, []);

  return faqs;
}
