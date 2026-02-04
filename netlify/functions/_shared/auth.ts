import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production';

export interface JWTPayload {
  email: string;
  userId: string;
  role: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function getAuthFromHeaders(headers: Record<string, string | undefined>): JWTPayload | null {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}
