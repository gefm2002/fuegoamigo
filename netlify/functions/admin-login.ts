import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { supabaseServer } from './_shared/supabaseServer';
import { generateToken } from './_shared/auth';
import { validateRequired } from './_shared/validate';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { valid, missing } = validateRequired(body, ['email', 'password']);

    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
      };
    }

    const { data: admin, error } = await supabaseServer
      .from('fuegoamigo_admin_users')
      .select('*')
      .eq('email', body.email)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const isValidPassword = await bcrypt.compare(body.password, admin.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const token = generateToken({
      email: admin.email,
      userId: admin.id,
      role: admin.role || 'admin',
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, user: { email: admin.email, role: admin.role } }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
