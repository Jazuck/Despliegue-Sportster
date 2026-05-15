/** Coincide con backend: RegisterCreateRequest @Pattern */
const PHONE_REGEX = /^[+]?[0-9]{9,15}$/

export function isValidEmail(value) {
  const v = String(value || '').trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function normalizePhoneDigits(value) {
  return String(value || '').replace(/\s/g, '')
}

/** Teléfono vacío = válido (opcional). Si hay texto, debe cumplir el patrón del API. */
export function isValidPhoneOptional(value) {
  const raw = normalizePhoneDigits(value)
  if (!raw) return true
  return PHONE_REGEX.test(raw)
}

/**
 * Parsea cuerpo de error del API (JSON array de "campo: mensaje" o texto plano).
 * Claves en inglés como devuelve Spring (name, email, phone, password, confirmPassword).
 */
export function parseFieldErrorsFromApi(bodyText) {
  const raw = String(bodyText || '').trim()
  if (!raw) return { fields: {}, general: '' }

  if (raw.startsWith('[')) {
    try {
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) return { fields: {}, general: raw }

      const fields = {}
      for (const line of arr) {
        const s = String(line)
        const idx = s.indexOf(': ')
        if (idx > 0) {
          const key = s.slice(0, idx).trim()
          const msg = s.slice(idx + 2).trim()
          if (key && msg) {
            fields[key] = fields[key] ? `${fields[key]} ${msg}` : msg
          }
        }
      }
      return { fields, general: Object.keys(fields).length ? '' : raw }
    } catch {
      return { fields: {}, general: raw }
    }
  }

  return { fields: {}, general: raw }
}
