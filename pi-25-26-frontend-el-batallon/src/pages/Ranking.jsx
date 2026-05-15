import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import { BackToHomeLink } from '../components/BackToHomeLink'
import { deporteService, modalidadService, marcaService, getToken } from '../services/api'
import { getStoredAvatarDataUrl } from '../utils/avatarStorage'
import '../styles/ranking.css'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

const AVATAR_PALETTES = [
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#EAF3DE', color: '#3B6D11' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FBEAF0', color: '#993556' },
]

function getInitials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Avatar({ name, email, size = 44, paletteIndex = 0 }) {
  const photoUrl = getStoredAvatarDataUrl(email)
  const p = AVATAR_PALETTES[paletteIndex % AVATAR_PALETTES.length]

  if (photoUrl) {
    return (
      <div
        className="rank-avatar-circle rank-avatar-circle--photo"
        style={{
          width: size,
          height: size,
        }}
      >
        <img src={photoUrl} alt="" />
      </div>
    )
  }

  return (
    <div
      className="rank-avatar-circle"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: p.bg,
        color: p.color,
      }}
    >
      {getInitials(name || 'U')}
    </div>
  )
}

const PODIUM_ORDER = [1, 0, 2]

function PodiumCard({ entry, position, isMe }) {
  const labels = { 1: '1.er lugar', 2: '2.º lugar', 3: '3.er lugar' }
  const posClass = `podium-card podium-card--${position}${isMe ? ' podium-card--me' : ''}`
  const name = entry.userName || entry.email?.split('@')[0] || 'Usuario'

  return (
    <div className={posClass}>
      <span className="podium-rank-label">{labels[position]}</span>
      <div className="podium-av-wrap">
        <Avatar
          name={name}
          email={entry.email}
          size={position === 1 ? 52 : 44}
          paletteIndex={position - 1}
        />
        <span className={`podium-badge podium-badge--${position}`}>{position}</span>
      </div>
      <div className="podium-name">
        {name}
        {isMe && <span className="rank-me-dot" />}
      </div>
      <div className="podium-score">{entry.marca}</div>
      <div className="podium-date">{new Date(entry.fecha).toLocaleDateString('es-ES')}</div>
    </div>
  )
}

function Ranking() {
  const { idDeporte } = useParams()
  const token = getToken()
  const currentUserEmail = token ? parseJwt(token)?.sub : null

  const [deporte, setDeporte]         = useState(null)
  const [modalidades, setModalidades] = useState([])
  const [modalidadId, setModalidadId] = useState(null)
  const [ranking, setRanking]         = useState([])
  const [loaded, setLoaded]           = useState(false)
  const [error, setError]             = useState(null)

  useEffect(() => {
    Promise.all([
      deporteService.getById(idDeporte),
      modalidadService.getByDeporte(idDeporte),
    ])
      .then(([depData, modData]) => {
        setDeporte(depData)
        setModalidades(modData)
        if (modData.length > 0) {
          setModalidadId(modData[0].idModalidad)
        } else {
          setLoaded(true)
        }
      })
      .catch(() => setError('No se pudo cargar el deporte.'))
  }, [idDeporte])

  useEffect(() => {
    if (!modalidadId) return
    let activo = true

    const cargarRanking = async () => {
      try {
        const data = await marcaService.getRanking(modalidadId)
        if (activo) {
          setRanking(data)
          setLoaded(true)
        }
      } catch {
        if (activo) setError('No se pudo cargar el ranking.')
      }
    }

    cargarRanking()
    return () => { activo = false }
  }, [modalidadId])

  // cargando se deriva: no hay error y aún no terminó de cargar
  const cargando = !loaded && !error

  if (error) return (
    <>
      <Header />
      <main className="ranking-page">
        <div className="page">
          <BackToHomeLink />
          <div className="empty-ranking">{error}</div>
        </div>
      </main>
    </>
  )

  const isMe = (entry) =>
    entry.email?.toLowerCase() === currentUserEmail?.toLowerCase()

  const top3        = ranking.slice(0, 3)
  const rest        = ranking.slice(3)
  const myEntry     = ranking.find(isMe)
  const myPosition  = myEntry ? ranking.indexOf(myEntry) + 1 : null

  const podiumDisplay   = PODIUM_ORDER.map(i => top3[i]).filter(Boolean)
  const podiumPositions = PODIUM_ORDER.filter(i => top3[i] !== undefined).map(i => i + 1)

  return (
    <>
      <Header />

      <main className="ranking-page">
        <div className="page">
          <BackToHomeLink />

          <div className="section-title section-title--sm">
            Ranking: {deporte?.nombre ?? '…'}
          </div>

          {modalidades.length > 0 && (
            <div className="modality-nav-shell">
              <nav className="modality-nav" aria-label="Modalidades del ranking">
                {modalidades.map(m => (
                  <button
                    key={m.idModalidad}
                    type="button"
                    className={`mod-chip${modalidadId === m.idModalidad ? ' mod-chip--active' : ''}`}
                    onClick={() => {
                      setLoaded(false)
                      setRanking([])
                      setModalidadId(m.idModalidad)
                    }}
                  >
                    {m.nombre}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {cargando ? (
            <div className="empty-ranking">Cargando clasificación…</div>
          ) : ranking.length === 0 ? (
            <div className="empty-ranking">
              No hay marcas registradas para esta modalidad todavía.
            </div>
          ) : (
            <>
              {top3.length > 0 && (
                <div className={`podium-row podium-row--${top3.length}`}>
                  {podiumDisplay.map((entry, idx) => {
                    const position = podiumPositions[idx]
                    return (
                      <PodiumCard
                        key={position}
                        entry={entry}
                        position={position}
                        isMe={isMe(entry)}
                      />
                    )
                  })}
                </div>
              )}

              {rest.length > 0 && (
                <div className="ranking-rest">
                  <div className="ranking-rest-header">
                    <span>#</span>
                    <span>Atleta</span>
                    <span>Marca</span>
                  </div>
                  {rest.map((entry, idx) => {
                    const position = idx + 4
                    const meRow = isMe(entry)
                    const name = entry.userName || entry.email?.split('@')[0] || 'Usuario'
                    return (
                      <div
                        key={idx}
                        className={`rest-row${meRow ? ' rest-row--me' : ''}`}
                      >
                        <span className="rest-pos">{position}</span>
                        <Avatar name={name} email={entry.email} size={32} paletteIndex={position} />
                        <div className="rest-info">
                          <span className="rest-name">
                            {name}
                            {meRow && <span className="rank-me-badge">Tú</span>}
                          </span>
                          <span className="rest-date">
                            {new Date(entry.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <span className="rest-score">{entry.marca}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {myEntry && !cargando && (
        <div className="my-position-bar">
          <div className="my-position-inner">
            <div className="my-position-left">
              <span className="my-position-label">Tu posición</span>
              <span className="my-position-pill">#{myPosition}</span>
            </div>
            <span className="my-position-score">{myEntry.marca}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default Ranking