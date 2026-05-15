const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080').replace(/\/$/, '')
const BASE_URL = `${API_ORIGIN}/api/v1`

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

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
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