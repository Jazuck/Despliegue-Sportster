import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { deporteService, getToken } from '../services/api'
// import { getDeporteImagenUrl } from '../utils/deporteImagenUrl'

/* Imágenes de deportes en tarjetas — desactivado temporalmente
const IMAGENES_FALLBACK = [
  { src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop', alt: 'Corredor en pista de atletismo' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop', alt: 'Levantamiento de pesas en gimnasio' },
  { src: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop', alt: 'Nadador en piscina' },
  { src: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop', alt: 'Balón de fútbol en campo' },
  { src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop', alt: 'Cancha de baloncesto' },
]
*/

function Home() {
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery  = searchParams.get('search')?.toLowerCase() || ''
  const estaLogueado = Boolean(getToken())
  const [mobileSearch, setMobileSearch] = useState(() => searchParams.get('search') || '')

  const [deportes, setDeportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState('')
  // const [idsImagenRota, setIdsImagenRota] = useState(() => new Set())

  // Cargamos los deportes siempre, logueado o no.
  useEffect(() => {
    let activo = true
    deporteService
      .getAll()
      .then((data) => {
        if (!activo) return
        setDeportes(Array.isArray(data) ? data : [])
        // setIdsImagenRota(new Set())
      })
      .catch((err) => {
        if (activo) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error('[Sportster] deportes:', msg)
          setError(msg || 'No se pudieron cargar los deportes.')
        }
      })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [])

  // Si el catálogo cambia en otra pestaña o el admin actualiza datos, al volver a esta pestaña recargamos.
  useEffect(() => {
    let activo = true
    const onVis = () => {
      if (document.visibilityState !== 'visible' || !activo) return
      deporteService
        .getAll()
        .then((data) => {
          if (!activo) return
          setDeportes(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          if (!activo) return
          console.error('[Sportster] deportes (visibility):', err)
        })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      activo = false
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    setMobileSearch(searchParams.get('search') || '')
  }, [searchParams])

  function handleMobileSearch(e) {
    e.preventDefault()
    navigate(`/?search=${encodeURIComponent(mobileSearch.trim())}`)
  }

  // Solo deportes visibles en la web (el API ya filtra; esto refuerza en cliente).
  const deportesVisibles = useMemo(
    () => deportes.filter((d) => d.visible !== false),
    [deportes],
  )

  // Filtrado de deportes por búsqueda
  const deportesFiltrados = deportesVisibles.filter((d) =>
    d.nombre.toLowerCase().includes(searchQuery),
  )

  // Si el usuario no está logueado y pulsa una acción protegida → login
  function handleProtected(e) {
    if (!estaLogueado) {
      e.preventDefault()
      navigate('/login')
    }
  }

  return (
    <>
      <Header />

      <form
        className="search-container search-container--home-mobile"
        onSubmit={handleMobileSearch}
        role="search"
        aria-label="Buscar deportes"
      >
        <input
          type="text"
          placeholder="Buscar deportes..."
          className="search-input"
          value={mobileSearch}
          onChange={(e) => setMobileSearch(e.target.value)}
        />
        <button type="submit" className="search-btn" aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" />
          </svg>
        </button>
      </form>

      <main className="sports-section">
       
        {cargando && <p style={{ textAlign: 'center' }}>Cargando deportes...</p>}
        {error    && <p style={{ textAlign: 'center', color: 'var(--error)' }}>{error}</p>}

        {!cargando && !error && deportesFiltrados.length === 0 && deportesVisibles.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '2rem' }}>
            No se encontraron deportes que coincidan con «{searchQuery}».
          </p>
        )}

        {!cargando && !error && deportesVisibles.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '2rem' }}>
            No hay deportes en el catálogo (o aún no están visibles). Si acabas de desplegar, revisa que la base de datos tenga datos.
          </p>
        )}

        <div className={`sports-grid${searchQuery ? ' sports-grid--search' : ''}`}>
          {deportesFiltrados.map((deporte) => (
            <article key={deporte.idDeporte} className="sport-card">
              {/*
              <div className="card-image">
                <img src="..." alt="" />
              </div>
              */}
              <div className="card-content">
                <h3>{deporte.nombre}</h3>
                <div className="card-actions">
                  {/* onClick captura el evento: si no logueado redirige a login */}
                  <Link
                    to={`/ranking/${deporte.idDeporte}`}
                    className="btn btn-primary"
                    onClick={handleProtected}
                  >
                    Ver Rankings
                  </Link>
                  <Link
                    to={`/marca?deporte=${deporte.idDeporte}`}
                    className="btn btn-secondary"
                    onClick={handleProtected}
                  >
                    Subir mi marca
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Sportster. Todos los derechos reservados.</p>
      </footer>
    </>
  )
}

export default Home
