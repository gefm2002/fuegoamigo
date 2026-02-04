import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';
import { getAuthFromHeaders } from './_shared/auth';
import { supabaseServer } from './_shared/supabaseServer';
import { validateRequired } from './_shared/validate';

export const handler: Handler = async (event) => {
  const payload = getAuthFromHeaders(event.headers);
  if (!payload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { valid, missing } = validateRequired(body, ['question', 'answer']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    const faqData: any = {
      question: body.question,
      answer: body.answer,
      order: parseInt(body.order || '0'),
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (event.httpMethod === 'PUT' && body.id) {
      const { data, error } = await supabaseServer
        .from('fuegoamigo_faqs')
        .update(faqData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      faqData.id = body.id || randomUUID();
      const { data, error } = await supabaseServer
        .from('fuegoamigo_faqs')
        .insert(faqData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
