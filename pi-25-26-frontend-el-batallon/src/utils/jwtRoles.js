import { getToken } from '../services/api'

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/** Roles del JWT (claim `roles`: string o array). */
export function getRolesFromToken() {
  const token = getToken()
  if (!token) return []
  const payload = parseJwtPayload(token)
  const raw = payload?.roles
  if (raw == null || raw === '') return []
  return Array.isArray(raw) ? raw.filter(Boolean) : [String(raw)]
}

export function tokenHasRole(role) {
  return getRolesFromToken().includes(role)
}
