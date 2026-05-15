import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import { BackToHomeLink } from '../components/BackToHomeLink'
import { ModalDialog } from '../components/ModalDialog'
import { deporteService, marcaService, modalidadService } from '../services/api'
import { tokenHasRole } from '../utils/jwtRoles'
import '../styles/marcas.css'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

const UNIDADES_TIEMPO    = ['s']
const UNIDADES_DISTANCIA = ['m', 'km']
const UNIDADES_PESO      = ['kg']

function unidadAModo(unidad) {
  if (UNIDADES_TIEMPO.includes(unidad))    return 'tiempo'
  if (UNIDADES_DISTANCIA.includes(unidad)) return 'distancia'
  if (UNIDADES_PESO.includes(unidad))      return 'peso'
  return null
}

function RegistrarMarca() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [deportes, setDeportes]       = useState([])
  const [modalidades, setModalidades] = useState([])

  const [deporteId, setDeporteId]           = useState('')
  const [modalidadId, setModalidadId]       = useState('')
  const [modoManual, setModoManual]         = useState('tiempo')

  const [minutos, setMinutos]               = useState('')
  const [segundos, setSegundos]             = useState('')
  const [centesimas, setCentesimas]         = useState('')
  const [valorPeso, setValorPeso]           = useState('')
  const [valorDistancia, setValorDistancia] = useState('')
  const [tipo, setTipo]                     = useState('entrenamiento')
  const [lugar, setLugar]                   = useState('')
  const [comentarios, setComentarios]       = useState('')

  const [cargando, setCargando] = useState(false)
  const [exito, setExito]       = useState(false)
  const [errores, setErrores]   = useState({})
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const fechaCapitalizada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)

  const modalidadActual = modalidades.find(m => m.idModalidad === Number(modalidadId))
  const unidad          = modalidadActual?.unidad ?? null
  const modoForzado     = modalidadId ? unidadAModo(unidad) : null
  const modo            = modoForzado ?? modoManual

  const esAdmin = tokenHasRole('ROLE_ADMIN')

  useEffect(() => {
    deporteService.getAll().then(data => {
      setDeportes(data)
      const deporteParam = searchParams.get('deporte')
      if (deporteParam) setDeporteId(deporteParam)
    }).catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!deporteId) return
    modalidadService.getByDeporte(deporteId)
      .then(data => { setModalidades(data); setModalidadId('') })
      .catch(console.error)
  }, [deporteId])

  function validar() {
    const e = {}
    if (!deporteId)   e.deporte   = 'Selecciona un deporte'
    if (!modalidadId) e.modalidad = 'Selecciona una modalidad'
    if (modo === 'tiempo') {
      if (segundos === '' && centesimas === '') e.tiempo = 'Introduce un tiempo válido'
    } else if (modo === 'distancia') {
      if (!valorDistancia || parseFloat(valorDistancia) <= 0) e.distancia = 'Introduce una distancia válida'
    } else if (modo === 'peso') {
      if (!valorPeso || parseFloat(valorPeso) <= 0) e.peso = 'Introduce un peso válido'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function tiempoASegundos() {
    return parseFloat(minutos || 0) * 60 + parseFloat(segundos || 0) + parseFloat(centesimas || 0) / 100
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (esAdmin) return
    if (!validar()) return
    const token = localStorage.getItem('sportster-token')
    const payload = parseJwt(token)
    if (!payload) { navigate('/login'); return }
    let valor
    if (modo === 'tiempo')    valor = tiempoASegundos()
    else if (modo === 'peso') valor = parseFloat(valorPeso)
    else                      valor = parseFloat(valorDistancia)
    setCargando(true)
    try {
      await marcaService.crear({
        modalidadId: Number(modalidadId),
        valor,
        userId: payload.id ?? payload.userId ?? payload.sub,
      })
      setExito(true)
      setTimeout(() => setExito(false), 3000)
      setDeporteId(''); setModalidadId(''); setModalidades([])
      setMinutos(''); setSegundos(''); setCentesimas('')
      setValorDistancia(''); setValorPeso('')
      setTipo('entrenamiento'); setLugar(''); setComentarios('')
      setModoManual('tiempo')
    } catch (err) {
      setErrores({ submit: err.message || 'Error al registrar la marca' })
    } finally {
      setCargando(false)
    }
  }

  function resetFormulario() {
    setDeporteId(''); setModalidadId(''); setModalidades([])
    setMinutos(''); setSegundos(''); setCentesimas('')
    setValorDistancia(''); setValorPeso('')
    setTipo('entrenamiento'); setLugar(''); setComentarios('')
    setModoManual('tiempo'); setErrores({})
  }

  function handleCancelClick() {
    setCancelModalOpen(true)
  }

  function confirmarCancelacion() {
    resetFormulario()
    setCancelModalOpen(false)
  }

  function handleTiempoInput(setter, maxLen, nextId) {
    return (e) => {
      const val = e.target.value.replace(/\D/g, '')
      setter(val)
      if (val.length >= maxLen && nextId) document.getElementById(nextId)?.focus()
    }
  }

  return (
    <>
      <Header />

      {/* ❌ sport-strip eliminado */}

      <div className="page">
        <BackToHomeLink />
        <div className="section-title section-title--sm">Nueva Marca</div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* ── DEPORTE ── */}
              <div className={`field${errores.deporte ? ' invalid' : ''}`}>
                <label>Deporte <span className="req">*</span></label>
                <select value={deporteId} onChange={e => setDeporteId(e.target.value)}>
                  <option value="">Selecciona deporte</option>
                  {deportes.map(d => (
                    <option key={d.idDeporte} value={d.idDeporte}>{d.nombre}</option>
                  ))}
                </select>
                <span className="err-msg">{errores.deporte}</span>
              </div>

              {/* ── MODALIDAD ── */}
              <div className={`field${errores.modalidad ? ' invalid' : ''}`}>
                <label>Modalidad <span className="req">*</span></label>
                <select
                  value={modalidadId}
                  onChange={e => setModalidadId(e.target.value)}
                  disabled={!deporteId}
                >
                  <option value="">
                    {deporteId ? 'Selecciona modalidad' : '— primero elige deporte —'}
                  </option>
                  {modalidades.map(m => (
                    <option key={m.idModalidad} value={m.idModalidad}>{m.nombre}</option>
                  ))}
                </select>
                <span className="err-msg">{errores.modalidad}</span>
              </div>

              {/* ❌ Tabs de Tipo de Marca eliminadas */}

              {/* ── ZONA DE ENTRADA DE VALOR — solo si hay modalidad elegida ── */}
              {modalidadId && (
                <div className="field span-2 marca-input-zone">

                  {/* TIEMPO */}
                  <div className={`marca-panel${modo === 'tiempo' ? ' active' : ''}`}>
                    <label>Tiempo <span className="req">*</span></label>
                    <div className="tiempo-row">
                      {[
                        { label: 'min',  val: minutos,    setter: setMinutos,    max: 3, id: 'tmin',  nextId: 'tseg'  },
                        { label: 'seg',  val: segundos,   setter: setSegundos,   max: 2, id: 'tseg',  nextId: 'tcent' },
                        { label: 'cent', val: centesimas, setter: setCentesimas, max: 2, id: 'tcent', nextId: null    },
                      ].map(({ label, val, setter, max, id, nextId }) => (
                        <div key={id} className="field">
                          <div className="sub-label">{label}</div>
                          <input
                            id={id} type="text" value={val} placeholder="00"
                            maxLength={max} inputMode="numeric"
                            onChange={handleTiempoInput(setter, max, nextId)}
                            style={errores.tiempo ? { borderColor: 'var(--error)' } : {}}
                          />
                        </div>
                      ))}
                    </div>
                    <span className="err-msg" style={{ display: errores.tiempo ? 'block' : 'none' }}>
                      {errores.tiempo}
                    </span>
                  </div>

                  {/* DISTANCIA */}
                  <div className={`marca-panel${modo === 'distancia' ? ' active' : ''}`}>
                    <label>Distancia <span className="req">*</span></label>
                    <div className="marca-row">
                      <div className="field" style={{ margin: 0 }}>
                        <input
                          type="text" value={valorDistancia} placeholder="0.00"
                          inputMode="decimal"
                          onChange={e => setValorDistancia(e.target.value)}
                          style={errores.distancia ? { borderColor: 'var(--error)' } : {}}
                        />
                      </div>
                      <span className="marca-unit">{unidad || 'm'}</span>
                    </div>
                    <span className="err-msg" style={{ display: errores.distancia ? 'block' : 'none' }}>
                      {errores.distancia}
                    </span>
                  </div>

                  {/* PESO */}
                  <div className={`marca-panel${modo === 'peso' ? ' active' : ''}`}>
                    <label>Peso <span className="req">*</span></label>
                    <div className="marca-row">
                      <div className="field" style={{ margin: 0 }}>
                        <input
                          type="text" value={valorPeso} placeholder="0.00"
                          inputMode="decimal"
                          onChange={e => setValorPeso(e.target.value)}
                          style={errores.peso ? { borderColor: 'var(--error)' } : {}}
                        />
                      </div>
                      <span className="marca-unit">kg</span>
                    </div>
                    <span className="err-msg" style={{ display: errores.peso ? 'block' : 'none' }}>
                      {errores.peso}
                    </span>
                  </div>

                </div>
              )}{/* /marca-input-zone */}

              {/* ── FECHA ── */}
              <div className="field">
                <label>Fecha de registro</label>
                <div className="fecha-display">
                  <span className="fecha-texto">{fechaCapitalizada}</span>
                  <span className="fecha-badge">Hoy</span>
                </div>
              </div>

              {/* ── TIPO COMPETICIÓN ── */}
              <div className="field">
                <label>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="entrenamiento">Entrenamiento</option>
                  <option value="competicion">Competición oficial</option>
                  <option value="personal">Personal Best</option>
                </select>
              </div>

              {/* ── LUGAR ── */}
              <div className="field span-2">
                <label>
                  Lugar / Evento{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
                </label>
                <input
                  type="text" value={lugar}
                  onChange={e => setLugar(e.target.value)}
                  placeholder="ej. Estadio Municipal, Campeonato…"
                />
              </div>

              {/* ── COMENTARIOS ── */}
              <div className="field span-2">
                <label>
                  Comentarios{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
                </label>
                <textarea
                  value={comentarios}
                  onChange={e => setComentarios(e.target.value)}
                  placeholder="Condiciones climáticas, observaciones…"
                  maxLength={250}
                  style={{ resize: 'none' }}
                />
                <div className="char-count"><span>{comentarios.length}</span> / 250</div>
              </div>

            </div>{/* /form-grid */}

            <div className="divider" />

            {errores.submit && (
              <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '.88rem' }}>
                {errores.submit}
              </p>
            )}

            {esAdmin && (
              <p className="marca-admin-hint" role="note">
                Vista de solo consulta: los administradores no pueden registrar marcas desde aquí.
              </p>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancelClick}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={cargando || esAdmin}
                title={esAdmin ? 'No disponible para cuentas de administración' : undefined}
              >
                {cargando ? 'Registrando…' : 'Registrar'}
              </button>
            </div>

          </form>
        </div>
      </div>

      <ModalDialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancelar registro"
        mode="confirm"
        confirmLabel="Sí, descartar"
        cancelLabel="Volver"
        onConfirm={confirmarCancelacion}
      >
        <p className="modal-dialog-text">¿Cancelar el registro? Los datos no guardados se perderán.</p>
      </ModalDialog>

      <div className={`toast${exito ? ' show' : ''}`}>
        ✓ Marca registrada con éxito
      </div>
    </>
  )
}

export default RegistrarMarca