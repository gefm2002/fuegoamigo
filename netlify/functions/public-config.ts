import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async () => {
  try {
    const { data, error } = await supabasePublic
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
