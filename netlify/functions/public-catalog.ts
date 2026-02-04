import type { Handler } from '@netlify/functions';
import { supabasePublic } from './_shared/supabasePublic';

export const handler: Handler = async (event) => {
  try {
    const category = event.queryStringParameters?.category;
    const featured = event.queryStringParameters?.featured === 'true';

    let query = supabasePublic
      .from('fuegoamigo_products')
      .select(`
        *,
        fuegoamigo_categories:category_id (
          id,
          slug,
          name
        )
      `)
      .eq('is_active', true);

    if (category) {
      const { data: catData } = await supabasePublic
        .from('fuegoamigo_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || []),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
