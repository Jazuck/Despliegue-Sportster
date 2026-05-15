import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useSyncExternalStore } from 'react'
import logo from '../assets/logo.png'
import { getToken, removeToken } from '../services/api'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function getUsuarioFromToken() {
  const token = getToken()
  if (!token) return null
  const payload = parseJwt(token)
  return payload?.sub ? payload.sub.split('@')[0] : null
}

// Store externo para el token — compatible con useSyncExternalStore
const tokenStore = {
  subscribe(callback) {
    window.addEventListener('storage', callback)          // cambios desde otras pestañas
    window.addEventListener('sportster-auth', callback)   // cambios en esta misma pestaña
    return () => {
      window.removeEventListener('storage', callback)
      window.removeEventListener('sportster-auth', callback)
    }
  },
  getSnapshot: getUsuarioFromToken,
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const mostrarBuscador =
    location.pathname !== '/login' && location.pathname !== '/register'

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sportster-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  // ✅ Sin setState en efecto — useSyncExternalStore se suscribe directamente al store
  const usuario = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sportster-theme', theme)
  }, [theme])

  const [searchTerm, setSearchTerm] = useState('')
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const handleLogout = () => {
    removeToken()
    window.dispatchEvent(new Event('sportster-auth'))  // notifica al store en esta pestaña
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/?search=${encodeURIComponent(searchTerm)}`)
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link
            to="/"
            className="header-logo-link"
            onClick={() => setSearchTerm('')}
            aria-label="Ir al inicio"
          >
            <img src={logo} alt="" className="header-logo" width={28} height={28} />
          </Link>
          <Link to="/" className="site-title" onClick={() => setSearchTerm('')}>
            SPORTSTER
          </Link>
        </div>

        {mostrarBuscador ? (
          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar deportes..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" />
              </svg>
            </button>
          </form>
        ) : null}

        <div className="auth-buttons">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2" x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="4" y2="12"/>
                <line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {usuario ? (
            <>
              <Link to="/profile" className="btn btn-secondary auth-profile-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="auth-profile-link__icon" aria-hidden>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="auth-profile-name">{usuario}</span>
              </Link>
              <button type="button" className="btn btn-primary" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" aria-label="Iniciar sesión">
                <span className="auth-nav-label auth-nav-label--long">Iniciar sesión</span>
                <span className="auth-nav-label auth-nav-label--short">Entrar</span>
              </Link>
              <Link to="/register" className="btn btn-primary" aria-label="Crear cuenta">
                <span className="auth-nav-label auth-nav-label--long">Registro</span>
                <span className="auth-nav-label auth-nav-label--short">Alta</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header