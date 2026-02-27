import { useState, useEffect } from 'react';
import { supabasePublic } from '../lib/supabasePublic';
import { apiUrl } from '../lib/api';
import { getImageUrl } from '../lib/imageUrl';
import type { Product, Event, Promo, FAQ, Service } from '../types';

export function useProducts(): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const isDev = import.meta.env.DEV;
        let data: any[] = [];

        if (isDev) {
          // En desarrollo, usar Supabase directamente
          const { data: productsData, error } = await supabasePublic
            .from('fuegoamigo_products')
            .select(`
              *,
              fuegoamigo_categories:category_id (
                id,
                slug,
                name
              )
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching products from Supabase:', error);
            throw error;
          }
          data = productsData || [];
          console.log('Products fetched from Supabase:', data.length);
        } else {
          // En producción, usar Netlify Function
          const response = await fetch(apiUrl('public-catalog'));
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching products from API:', errorText);
            throw new Error('Failed to fetch products');
          }
          data = await response.json();
          console.log('Products fetched from API:', data.length);
        }

        // Mapear datos de Supabase al formato esperado
        const mappedPromises = data.map(async (p: any) => {
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
        });
        
        const mapped = await Promise.all(mappedPromises);
        console.log('Products mapped:', mapped.length, 'Active:', mapped.filter((p) => p.isActive).length);
        setProducts(mapped);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return { products, loading };
}

export function useEvents(): Event[] {
  const [events, setEvents] = useState<Event[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const isDev = import.meta.env.DEV;
        let data: any[] = [];

        if (isDev) {
          const { data: eventsData, error } = await supabasePublic
            .from('fuegoamigo_events')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching events from Supabase:', error);
            throw error;
          }
          data = eventsData || [];
        } else {
          const response = await fetch(apiUrl('public-events'));
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching events from API:', errorText);
            throw new Error('Failed to fetch events');
          }
          data = await response.json();
        }

        const mappedPromises = data.map(async (e: any) => {
          const imageUrls = await Promise.all((e.images || []).map((img: string) => getImageUrl(img)));

          return {
            id: e.id,
            title: e.title,
            eventType: e.event_type,
            location: e.location || '',
            guestsRange: e.guests_range || '',
            highlightMenu: e.highlight_menu || '',
            description: e.description || '',
            images: imageUrls.length > 0 ? imageUrls : ['/images/gallery-bbq-01.jpg'],
            isActive: e.is_active !== false,
          };
        });

        setEvents(await Promise.all(mappedPromises));
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return events;
}

export function usePromos(): Promo[] {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const isDev = import.meta.env.DEV;
        let data: any[] = [];

        if (isDev) {
          const { data: promosData, error } = await supabasePublic
            .from('fuegoamigo_promos')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching promos from Supabase:', error);
            throw error;
          }
          data = promosData || [];
        } else {
          const response = await fetch(apiUrl('public-promos'));
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching promos from API:', errorText);
            throw new Error('Failed to fetch promos');
          }
          data = await response.json();
        }

        const mapped = data.map((p: any) => ({
          id: p.id,
          banco: p.banco,
          dia: p.dia,
          topeReintegro: parseFloat(p.tope_reintegro || '0'),
          porcentaje: p.porcentaje || 0,
          medios: p.medios || [],
          vigencia: p.vigencia || '',
        }));
        setPromos(mapped);
      } catch (error) {
        console.error('Error fetching promos:', error);
        setPromos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPromos();
  }, []);

  return promos;
}

export function useFAQs(): FAQ[] {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const isDev = import.meta.env.DEV;
        let data: any[] = [];

        if (isDev) {
          const { data: faqsData, error } = await supabasePublic
            .from('fuegoamigo_faqs')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true });

          if (error) {
            console.error('Error fetching FAQs from Supabase:', error);
            throw error;
          }
          data = faqsData || [];
        } else {
          const response = await fetch(apiUrl('public-faqs'));
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching FAQs from API:', errorText);
            throw new Error('Failed to fetch FAQs');
          }
          data = await response.json();
        }

        const mapped = data.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }));
        setFaqs(mapped);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  return faqs;
}

export function useServices(): Service[] {
  const [services, setServices] = useState<Service[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const isDev = import.meta.env.DEV;
        let data: any[] = [];

        if (isDev) {
          const { data: servicesData, error } = await supabasePublic
            .from('fuegoamigo_services')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true });

          if (error) {
            console.error('Error fetching services from Supabase:', error);
            throw error;
          }
          data = servicesData || [];
        } else {
          const response = await fetch(apiUrl('public-services'));
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching services from API:', errorText);
            throw new Error('Failed to fetch services');
          }
          data = await response.json();
        }

        const mapped = await Promise.all(
          (data || []).map(async (s: any) => {
            const imageUrl = s.image ? await getImageUrl(s.image) : undefined;
            return {
              id: s.id,
              slug: s.slug || '',
              title: s.title,
              shortDescription: s.short_description || s.shortDescription || '',
              longDescription: s.long_description || s.longDescription || '',
              image: imageUrl,
              isActive: s.is_active !== false,
              order: s.order || 0,
            } satisfies Service;
          })
        );

        setServices(mapped);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return services;
}
