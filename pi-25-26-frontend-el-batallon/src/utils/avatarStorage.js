export function avatarStorageKey(email) {
  return `sportster-avatar:${String(email || '').toLowerCase()}`
}

/** Data URL JPEG guardada desde el perfil (mismo dispositivo / navegador). */
export function getStoredAvatarDataUrl(email) {
  if (!email) return null
  try {
    const v = localStorage.getItem(avatarStorageKey(email))
    return v && v.startsWith('data:') ? v : null
  } catch {
    return null
  }
}
