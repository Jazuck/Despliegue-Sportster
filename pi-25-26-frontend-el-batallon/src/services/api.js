/**
 * Origen del API (solo scheme + host + port). Evita URLs inválidas que rompen fetch()
 * ("Invalid value"), p. ej. si VITE_API_ORIGIN quedó como el texto "undefined".
 */
function resolveApiOrigin() {
  let raw = import.meta.env.VITE_API_ORIGIN
  if (raw != null) raw = String(raw).trim()
  if (!raw || raw === 'undefined' || raw === 'null') {
    if (import.meta.env.DEV) return 'http://localhost:8080'
    return null
  }

  let candidate = raw.replace(/\/$/, '')
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }

  try {
    const u = new URL(candidate)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.origin
  } catch {
    return null
  }
}

const API_ORIGIN = resolveApiOrigin()
const BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : ''

if (import.meta.env.PROD && !API_ORIGIN) {
  console.warn(
    '[Sportster] VITE_API_ORIGIN vacío o inválido en el build. En Render → Environment: VITE_API_ORIGIN=https://TU-API.onrender.com (sin /api/v1) y redeploy del front.',
  )
}

// Guarda y recupera el token JWT
export const getToken = () => localStorage.getItem('sportster-token')
export const setToken = (token) => localStorage.setItem('sportster-token', token)
export const removeToken = () => localStorage.removeItem('sportster-token')

// Petición base — añade el token automáticamente si existe
async function request(endpoint, options = {}) {
  const token = getToken()
  const hasBody =
    options.body !== undefined && options.body !== null && options.body !== ''

  // No enviar Content-Type en GET/HEAD sin cuerpo: evita preflight CORS innecesario.
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  if (!BASE_URL) {
    throw new Error(
      'URL del API no configurada o inválida (VITE_API_ORIGIN). Revisa variables en Render y vuelve a desplegar el front.',
    )
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `Error ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const rawText = await response.text()

  if (contentType.includes('application/json')) {
    const trimmed = rawText.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch {
      throw new Error(
        'El servidor respondió JSON inválido. ¿La URL del API apunta al backend (Spring) y no al front?',
      )
    }
  }

  if (rawText.trimStart().startsWith('<') || rawText.includes('<!DOCTYPE')) {
    throw new Error(
      'El servidor devolvió HTML en lugar de datos (suele pasar si el API no existe o la URL es la del front). Revisa VITE_API_ORIGIN.',
    )
  }

  return rawText
}

// ── Auth ─────────────────────────────────────────────────────────
export const authService = {
  // El backend devuelve JSON { token: "eyJ..." }
  // Antes se guardaba el objeto entero como string, rompiendo parseJwt
  login: async (datos) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(datos) })
    return typeof data === 'object' && data.token ? data.token : data
  },

  register: (datos) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(datos) }),
}

// ── Deportes ─────────────────────────────────────────────────────
export const deporteService = {
  getAll: (opts = {}) => {
    const q = new URLSearchParams()
    if (opts.todos) q.set('todos', 'true')
    const suffix = q.toString() ? `?${q}` : ''
    return request(`/deportes${suffix}`)
  },
  getById: (id, opts = {}) => {
    const q = new URLSearchParams()
    if (opts.todos) q.set('todos', 'true')
    const suffix = q.toString() ? `?${q}` : ''
    return request(`/deportes/${id}${suffix}`)
  },
  create: (payload) =>
    request('/deportes', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/deportes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => request(`/deportes/${id}`, { method: 'DELETE' }),
}

// ── Modalidades ──────────────────────────────────────────────────
export const modalidadService = {
  getAll: () => request('/modalidades'),
  getByDeporte: (deporteId, opts = {}) => {
    const q = new URLSearchParams()
    if (opts.todos) q.set('todos', 'true')
    const suffix = q.toString() ? `?${q}` : ''
    return request(`/modalidades/deporte/${deporteId}${suffix}`)
  },
  create: (payload) =>
    request('/modalidades', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/modalidades/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => request(`/modalidades/${id}`, { method: 'DELETE' }),
}

// ── Administración (usuarios) ────────────────────────────────────
export const adminUserService = {
  list: () => request('/admin/users'),
  delete: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
}

// ── Marcas ───────────────────────────────────────────────────────
export const marcaService = {
  crear: (datos) =>
    request('/marcas', { method: 'POST', body: JSON.stringify(datos) }),

  getRanking: (modalidadId) =>
    request(`/marcas/ranking?modalidadId=${modalidadId}`),

  eliminar: (id) =>
    request(`/marcas/${id}`, { method: 'DELETE' }),
}

// ── Perfil ────────────────────────────────────────────────────────
export const profileService = {
  getPerfil: () => request('/perfil'),
  eliminarCuenta: () => request('/perfil', { method: 'DELETE' }),
}