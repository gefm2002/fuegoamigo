export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 1572864; // 1.5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo excede el tamaño máximo de 1.5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Solo JPEG, PNG y WebP' };
  }

  return { valid: true };
}

import { randomUUID } from 'crypto';

export function getStoragePath(prefix: string, entityId: string, filename: string): string {
  const uuid = randomUUID();
  const ext = filename.split('.').pop() || 'webp';
  return `${prefix}/${entityId}/${uuid}.${ext}`;
}
