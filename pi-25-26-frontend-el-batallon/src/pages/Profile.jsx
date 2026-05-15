import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import athleteHero from '../assets/profile-athlete-hero.png'
import { profileService, marcaService, removeToken } from '../services/api'
import '../styles/profile.css'
import { avatarStorageKey } from '../utils/avatarStorage'
import { tokenHasRole } from '../utils/jwtRoles'
import { AdminPanel } from '../components/admin/AdminPanel'
import { ModalDialog } from '../components/ModalDialog'
import { BackToHomeLink } from '../components/BackToHomeLink'

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Redimensiona en el cliente para caber en localStorage sin perder el círculo del perfil. */
function fileToAvatarDataUrl(file, maxEdge = 400, jpegQuality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxEdge || height > maxEdge) {
        const scale = maxEdge / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas no disponible'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', jpegQuality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

const IconUser = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconPhone = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const IconMail = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,12 2,6" />
  </svg>
)

const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const IconMedal = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
)

const IconRun = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="4" r="2" />
    <path d="M6 20l3-6 2-1" />
    <path d="M9 14l-2 6" />
    <path d="M15 7l2 3h3" />
    <path d="M11 20h8" />
  </svg>
)

const IconQuote = () => (
  <svg className="profile-hero__quote-icon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
    <path d="M7.5 6C5.57 6 4 7.57 4 9.5v5h5v-5H6.5c0-.83.67-1.5 1.5-1.5V6zm9 0c-1.93 0-3.5 1.57-3.5 3.5v5h5v-5h-2.5c0-.83.67-1.5 1.5-1.5V6z" opacity="0.9" />
  </svg>
)

const IconCamera = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

function Profile() {
  const navigate = useNavigate()
  const avatarFileRef = useRef(null)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [avatarStorageTick, setAvatarStorageTick] = useState(0)

  const avatarDataUrl = useMemo(() => {
    void avatarStorageTick
    if (!datos?.email) return null
    try {
      return localStorage.getItem(avatarStorageKey(datos.email))
    } catch {
      return null
    }
  }, [datos?.email, avatarStorageTick])

  const [alertDialog, setAlertDialog] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const confirmCbRef = useRef(null)

  const closeAlertDialog = () => setAlertDialog(null)
  const closeConfirmDialog = () => {
    confirmCbRef.current = null
    setConfirmDialog(null)
  }

  const runConfirmPrimary = () => {
    const cb = confirmCbRef.current
    confirmCbRef.current = null
    setConfirmDialog(null)
    cb?.()
  }

  const recargarDatos = async () => {
    setCargando(true)
    try {
      const data = await profileService.getPerfil()
      setDatos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true
    profileService
      .getPerfil()
      .then((data) => {
        if (activo) setDatos(data)
      })
      .catch((err) => {
        if (activo) setError(err.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const marcasPorDeporte = useMemo(() => {
    const list = datos?.mejoresMarcas ?? []
    return list.reduce((acc, marca) => {
      if (!acc[marca.deporte]) acc[marca.deporte] = []
      acc[marca.deporte].push(marca)
      return acc
    }, {})
  }, [datos?.mejoresMarcas])

  const deportesOrdenados = useMemo(
    () => Object.keys(marcasPorDeporte).sort((a, b) => a.localeCompare(b, 'es')),
    [marcasPorDeporte],
  )

  const [deporteSeleccionadoPreferido, setDeporteSeleccionadoPreferido] = useState('')

  const deporteSeleccionado = useMemo(() => {
    if (deportesOrdenados.length === 0) return ''
    if (deportesOrdenados.includes(deporteSeleccionadoPreferido)) {
      return deporteSeleccionadoPreferido
    }
    return deportesOrdenados[0]
  }, [deportesOrdenados, deporteSeleccionadoPreferido])

  const marcasDelDeporte = useMemo(() => {
    if (!deporteSeleccionado) return []
    return marcasPorDeporte[deporteSeleccionado] ?? []
  }, [deporteSeleccionado, marcasPorDeporte])

  const handleAvatarButtonClick = () => {
    avatarFileRef.current?.click()
  }

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !datos?.email) return
    if (!file.type.startsWith('image/')) {
      setAlertDialog({
        title: 'Foto de perfil',
        message: 'Elige un archivo de imagen (JPG, PNG, etc.).',
      })
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setAlertDialog({
        title: 'Foto de perfil',
        message: 'La imagen es demasiado grande (máx. 8 MB).',
      })
      return
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      localStorage.setItem(avatarStorageKey(datos.email), dataUrl)
      setAvatarStorageTick((t) => t + 1)
    } catch (err) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        setAlertDialog({
          title: 'Foto de perfil',
          message: 'No hay espacio suficiente para guardar la foto. Prueba con otra imagen más pequeña.',
        })
      } else {
        setAlertDialog({
          title: 'Foto de perfil',
          message: err?.message || 'No se pudo procesar la imagen.',
        })
      }
    }
  }

  const handleEliminarMarca = (id) => {
    confirmCbRef.current = async () => {
      try {
        await marcaService.eliminar(id)
        await recargarDatos()
      } catch (err) {
        setAlertDialog({
          title: 'Error',
          message: 'Error al eliminar la marca: ' + err.message,
        })
      }
    }
    setConfirmDialog({
      title: 'Eliminar registro',
      message: '¿Estás seguro de que quieres eliminar este registro?',
      variant: 'danger',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
    })
  }

  const handleEliminarCuentaClick = () => {
    confirmCbRef.current = async () => {
      try {
        await profileService.eliminarCuenta()
        removeToken()
        window.dispatchEvent(new Event('sportster-auth'))
        navigate('/')
      } catch (err) {
        setAlertDialog({
          title: 'Error',
          message: 'Error al eliminar la cuenta: ' + err.message,
        })
      }
    }
    setConfirmDialog({
      title: 'Eliminar cuenta',
      message:
        'Advertencia: esta acción es permanente y eliminará todos tus datos. ¿Deseas continuar?',
      variant: 'danger',
      confirmLabel: 'Sí, eliminar',
      cancelLabel: 'Cancelar',
    })
  }

  if (cargando) {
    return (
      <>
        <Header />
        <main className="profile-page">
          <div className="profile-shell profile-shell--with-back">
            <BackToHomeLink />
            <p className="profile-state-msg">Cargando perfil…</p>
          </div>
        </main>
      </>
    )
  }

  if (error || !datos) {
    return (
      <>
        <Header />
        <main className="profile-page">
          <div className="profile-shell profile-shell--with-back">
            <BackToHomeLink />
            <p className="profile-state-msg profile-state-msg--error">
              {error || 'No se pudo cargar el perfil.'}
            </p>
          </div>
        </main>
      </>
    )
  }

  const telefonoFmt = (() => {
    if (!datos.telefono) return null
    const d = String(datos.telefono).replace(/\D/g, '')
    if (d.length === 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
    return datos.telefono
  })()

  const isAdmin =
    (Array.isArray(datos.roles) && datos.roles.includes('ROLE_ADMIN')) || tokenHasRole('ROLE_ADMIN')

  return (
    <>
      <Header />

      <main className="profile-page">
        <div className="profile-shell">
          <BackToHomeLink />
          <div className="profile-page-header">
            <span className="profile-page-header__text">
              {isAdmin ? 'Panel de administración' : 'Perfil del Atleta'}
            </span>
            <span className="profile-page-header__line" aria-hidden />
          </div>

          <input
            ref={avatarFileRef}
            type="file"
            className="profile-hero__avatar-file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            tabIndex={-1}
            aria-hidden
          />
          <section className="profile-hero" aria-labelledby="profile-hero-name">
            <button
              type="button"
              className="profile-hero__avatar profile-hero__avatar--interactive"
              onClick={handleAvatarButtonClick}
              title={avatarDataUrl ? 'Pulsar para cambiar la foto' : 'Pulsar para añadir foto'}
              aria-label={avatarDataUrl ? 'Cambiar foto de perfil' : 'Añadir foto de perfil'}
            >
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="profile-hero__avatar-img" />
              ) : (
                <span className="profile-hero__avatar-initials">{getInitials(datos.nombre)}</span>
              )}
              <span className="profile-hero__avatar-overlay" aria-hidden>
                <span className="profile-hero__avatar-overlay-inner">
                  <IconCamera />
                  <span className="profile-hero__avatar-overlay-text">
                    {avatarDataUrl ? 'Pulsar para cambiar la foto' : 'Pulsar para añadir foto'}
                  </span>
                </span>
              </span>
            </button>
            <div className="profile-hero__info">
              <h1 id="profile-hero-name" className="profile-hero__name">
                {datos.nombre}
              </h1>
              <span className="profile-hero__badge">{isAdmin ? 'ADMINISTRADOR' : 'ATLETA'}</span>
              <blockquote className="profile-hero__quote">
                <IconQuote />
                <p>La disciplina de hoy es el rendimiento de mañana.</p>
              </blockquote>
            </div>
            <div className="profile-hero__visual">
              <img src={athleteHero} alt="" />
            </div>
          </section>

          <div className={`profile-grid${isAdmin ? ' profile-grid--admin' : ''}`}>
            <section>
              <h2 className="profile-block-title">
                <IconUser />
                Datos personales
              </h2>
              <div className="profile-card">
                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <div className="profile-info-row__icon">
                      <IconUser />
                    </div>
                    <div>
                      <span className="profile-info-row__label">Nombre completo</span>
                      <span className="profile-info-row__value">{datos.nombre}</span>
                    </div>
                  </div>
                  <div className="profile-info-row">
                    <div className="profile-info-row__icon">
                      <IconPhone />
                    </div>
                    <div>
                      <span className="profile-info-row__label">Teléfono</span>
                      <span className="profile-info-row__value">
                        {telefonoFmt || 'No proporcionado'}
                      </span>
                    </div>
                  </div>
                  <div className="profile-info-row">
                    <div className="profile-info-row__icon">
                      <IconMail />
                    </div>
                    <div>
                      <span className="profile-info-row__label">Correo electrónico</span>
                      <span className="profile-info-row__value">{datos.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {!isAdmin && (
              <section>
                <h2 className="profile-block-title">
                  <IconMedal />
                  Mejores marcas
                </h2>
                <div className="profile-card profile-card--records">
                  {deportesOrdenados.length === 0 ? (
                    <p className="profile-no-records">Aún no has registrado ninguna marca.</p>
                  ) : (
                    <>
                      <div className="profile-marcas-toolbar">
                        <label htmlFor="profile-deporte-select" className="profile-marcas-label">
                          Deporte
                        </label>
                        <div className="profile-select-wrap">
                          <select
                            id="profile-deporte-select"
                            className="profile-select"
                            value={deporteSeleccionado}
                            onChange={(e) => setDeporteSeleccionadoPreferido(e.target.value)}
                          >
                            {deportesOrdenados.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {marcasDelDeporte.length === 0 ? (
                        <p className="profile-no-records profile-no-records--tight">
                          No hay marcas en este deporte.
                        </p>
                      ) : (
                        marcasDelDeporte.map((m) => (
                          <div key={m.id} className="profile-record-row">
                            <span className="profile-record-row__run" aria-hidden>
                              <IconRun />
                            </span>
                            <span className="profile-record-row__name">{m.modalidad}</span>
                            <div className="profile-record-row__meta">
                              <span className="profile-record-row__value">{m.valor}</span>
                              {m.fecha && (
                                <span className="profile-record-row__date">
                                  {new Date(m.fecha).toLocaleDateString('es-ES')}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="profile-btn-delete"
                              onClick={() => handleEliminarMarca(m.id)}
                              title="Eliminar registro"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        ))
                      )}
                      <Link to="/marca" className="profile-btn-add">
                        + Añadir nueva marca
                      </Link>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>

          {isAdmin && (
            <section className="profile-admin-body" aria-labelledby="profile-admin-heading">
              <h2 id="profile-admin-heading" className="profile-block-title">
                <IconMedal />
                Gestión de la plataforma
              </h2>
              <div className="profile-card profile-card--records profile-card--admin-wide">
                <AdminPanel currentEmail={datos.email} />
              </div>
            </section>
          )}

          <div className="profile-actions">
            <button type="button" className="profile-btn-danger-outline" onClick={handleEliminarCuentaClick}>
              Eliminar cuenta
            </button>
          </div>
        </div>
      </main>

      <ModalDialog
        open={alertDialog != null}
        onClose={closeAlertDialog}
        title={alertDialog?.title}
        mode="alert"
      >
        <p className="modal-dialog-text">{alertDialog?.message}</p>
      </ModalDialog>

      <ModalDialog
        open={confirmDialog != null}
        onClose={closeConfirmDialog}
        title={confirmDialog?.title}
        mode="confirm"
        variant={confirmDialog?.variant ?? 'default'}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        onConfirm={runConfirmPrimary}
      >
        <p className="modal-dialog-text">{confirmDialog?.message}</p>
      </ModalDialog>
    </>
  )
}

export default Profile
