/**
 * Genera un slug desde un texto en español
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Reemplazar acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios y caracteres especiales con guiones
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    // Eliminar guiones al inicio y final
    .replace(/^-+|-+$/g, '');
}
