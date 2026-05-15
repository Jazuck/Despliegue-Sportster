// Ahora (React 17+)
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <header className="footer">
      <nav className="navbar">
        <Link to="/" className="site-title">SPORTSTER</Link>
      </nav>
    </header>
  )
}

export default Footer