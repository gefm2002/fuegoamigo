import type { Handler } from '@netlify/functions';
import { supabaseServer } from './_shared/supabaseServer';

export const handler: Handler = async () => {
  try {
    const { data, error } = await supabaseServer
      .from('fuegoamigo_site_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    if (!data) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: null,
          brand_name: 'Fuego Amigo',
          whatsapp: '',
          email: '',
          address: '',
          zone: '',
          hours: {},
          payment_methods: [],
          delivery_options: [],
          wa_templates: {},
          home_hero_image: '',
          events_hero_image: '',
          home_hero_title: '',
          home_hero_subtitle: '',
          home_hero_primary_label: '',
          home_hero_secondary_label: '',
          home_hero_secondary_message: '',
          home_hero_chips: [],
        }),
      };
    }

    // Pre-firmar hero images si vienen de Storage privado
    const sign = async (path: any) => {
      if (!path || typeof path !== 'string') return '';
      if (path.startsWith('http') || path.startsWith('/images/')) return path;
      if (!path.startsWith('fuegoamigo/')) return path;
      const { data: signed } = await supabaseServer.storage
        .from('fuegoamigo_assets')
        .createSignedUrl(path, 86400); // 24h
      return signed?.signedUrl || path;
    };

    const homeHeroImageUrl = await sign((data as any).home_hero_image);
    const eventsHeroImageUrl = await sign((data as any).events_hero_image);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        home_hero_image_url: homeHeroImageUrl,
        events_hero_image_url: eventsHeroImageUrl,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
