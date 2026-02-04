import { apiUrl } from './api';
import { supabasePublic } from './supabasePublic';

/**
 * Convierte un path de Supabase Storage a una URL firmada
 * Si el path ya es una URL completa o un path local, lo retorna tal cual
 */
export async function getImageUrl(storagePath: string): Promise<string> {
  // Si ya es una URL completa, retornarla
  if (storagePath.startsWith('http')) {
    return storagePath;
  }

  // Si es un path local (empieza con /images/), retornarlo tal cual
  if (storagePath.startsWith('/images/')) {
    return storagePath;
  }

  // Si es un path de Supabase Storage, obtener URL firmada
  if (storagePath.startsWith('fuegoamigo/')) {
    try {
      // Intentar con función de Netlify primero (producción)
      const isDev = import.meta.env.DEV;
      if (!isDev) {
        try {
          const response = await fetch(`${apiUrl('public-signed-url')}?path=${encodeURIComponent(storagePath)}`);
          if (response.ok) {
            const data = await response.json();
            return data.url || storagePath;
          }
        } catch (error) {
          // Fallback a Supabase directo
        }
      }

      // Usar Supabase directamente (desarrollo y fallback)
      const { data } = await supabasePublic.storage
        .from('fuegoamigo_assets')
        .createSignedUrl(storagePath, 3600); // 1 hora de validez

      if (data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (error) {
      console.warn('Error getting signed URL for', storagePath, error);
    }
  }

  // Fallback: retornar path original
  return storagePath;
}

/**
 * Convierte un array de paths a URLs
 */
export async function getImageUrls(paths: string[]): Promise<string[]> {
  return Promise.all(paths.map(getImageUrl));
}
