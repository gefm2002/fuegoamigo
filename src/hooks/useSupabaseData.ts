import { useState, useEffect } from 'react';
import { supabasePublic } from '../lib/supabasePublic';
import { apiUrl } from '../lib/api';
import { getImageUrl } from '../lib/imageUrl';
import type { Product, Event, Promo, FAQ } from '../types';

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
          
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description || '',
            price: parseFloat(p.price),
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
        // Fallback a datos locales si falla
        try {
          const localData = await import('../data/products.json');
          setProducts(localData.default as Product[]);
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError);
          setProducts([]);
        }
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(apiUrl('public-events'));
        const data = await response.json();
        const mappedPromises = data.map(async (e: any) => {
          const imageUrls = await Promise.all(
            (e.images || []).map((img: string) => getImageUrl(img))
          );
          
          return {
            id: e.id,
            title: e.title,
            eventType: e.event_type,
            location: e.location || '',
            guestsRange: e.guests_range || '',
            highlightMenu: e.highlight_menu || '',
            description: e.description || '',
            images: imageUrls.length > 0 ? imageUrls : ['/images/gallery-bbq-01.jpg'],
            isActive: e.is_active,
          };
        });
        
        const mapped = await Promise.all(mappedPromises);
        setEvents(mapped);
      } catch (error) {
        console.error('Error fetching events:', error);
        const localData = await import('../data/events.json');
        setEvents(localData.default as Event[]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const response = await fetch(apiUrl('public-promos'));
        const data = await response.json();
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
        const localData = await import('../data/promos.json');
        setPromos(localData.default as Promo[]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const response = await fetch(apiUrl('public-faqs'));
        const data = await response.json();
        const mapped = data.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }));
        setFaqs(mapped);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        const localData = await import('../data/faqs.json');
        setFaqs(localData.default as FAQ[]);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  return faqs;
}
