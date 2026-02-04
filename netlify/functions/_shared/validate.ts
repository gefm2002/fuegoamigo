export function validateRequired(body: Record<string, any>, fields: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missing };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
}
