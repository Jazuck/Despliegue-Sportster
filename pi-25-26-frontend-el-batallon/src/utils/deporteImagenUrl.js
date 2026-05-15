/**
 * URL de imagen del deporte tal como viene del API (camelCase o snake_case).
 */
export function getDeporteImagenUrl(deporte) {
  if (!deporte) return ''
  const u = deporte.imagenUrl ?? deporte.imagen_url
  return typeof u === 'string' ? u.trim() : ''
}
