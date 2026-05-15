import { Link } from 'react-router-dom'

/** Enlace al inicio (/) con flecha de línea + texto «Volver» */
export function BackToHomeLink({ className = '' }) {
  return (
    <nav className={`page-back-nav ${className}`.trim()}>
      <Link to="/" className="page-back-link" title="Ir al inicio">
        <svg className="page-back-link__icon" viewBox="0 0 24 24" aria-hidden>
          <polyline
            points="14 7 8 12 14 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="page-back-link__text">Volver</span>
      </Link>
    </nav>
  )
}
