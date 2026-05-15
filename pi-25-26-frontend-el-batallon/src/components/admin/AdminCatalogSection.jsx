import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deporteService, modalidadService } from '../../services/api'
import { ModalDialog } from '../ModalDialog'
import { getDeporteImagenUrl } from '../../utils/deporteImagenUrl'

const UNIDAD_OPCIONES = [
  { value: 's', label: 'Tiempo (s)' },
  { value: 'm', label: 'Distancia (m)' },
  { value: 'km', label: 'Distancia (km)' },
  { value: 'kg', label: 'Peso (kg)' },
]

function UnidadSelect({ value, onChange, id, disabled }) {
  return (
    <select
      id={id}
      className="admin-select-unidad"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {UNIDAD_OPCIONES.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function AdminCatalogSection() {
  const [deportes, setDeportes] = useState([])
  const [modalidades, setModalidades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [modalDeporteAbierto, setModalDeporteAbierto] = useState(false)
  const [nuevoDeporte, setNuevoDeporte] = useState('')

  const [modalModalidadAbierto, setModalModalidadAbierto] = useState(false)

  const [editDeporte, setEditDeporte] = useState(null)

  const [modalDeporteId, setModalDeporteId] = useState('')
  const [nuevaModNombre, setNuevaModNombre] = useState('')
  const [nuevaModUnidad, setNuevaModUnidad] = useState('s')
  const [editModalidad, setEditModalidad] = useState(null)

  const deporteABorrarRef = useRef(null)
  const [deporteABorrar, setDeporteABorrar] = useState(null)
  const modalidadABorrarRef = useRef(null)
  const [modalidadABorrar, setModalidadABorrar] = useState(null)

  const recargar = useCallback(async () => {
    const [d, m] = await Promise.all([deporteService.getAll({ todos: true }), modalidadService.getAll()])
    const listD = Array.isArray(d) ? d : []
    const listM = Array.isArray(m) ? m : []
    setDeportes(listD)
    setModalidades(listM)
    setModalDeporteId((prev) => {
      const ids = listD.map((x) => String(x.idDeporte))
      if (prev && ids.includes(prev)) return prev
      return listD[0] ? String(listD[0].idDeporte) : ''
    })
  }, [])

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        setCargando(true)
        setError(null)
        await recargar()
      } catch (e) {
        if (activo) setError(e?.message || 'No se pudo cargar el catálogo.')
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [recargar])

  const modalidadesFiltradas = useMemo(() => {
    const id = Number(modalDeporteId)
    if (!Number.isFinite(id)) return []
    return modalidades.filter((mo) => Number(mo.idDeporte) === id)
  }, [modalidades, modalDeporteId])

  const cerrarModalDeporte = () => {
    setModalDeporteAbierto(false)
    setNuevoDeporte('')
  }

  const puedeCrearDeporte = Boolean(nuevoDeporte.trim())

  const ejecutarCrearDeporte = async () => {
    const nombre = nuevoDeporte.trim()
    if (!nombre) return
    try {
      setError(null)
      const creado = await deporteService.create({
        nombre,
        imagenUrl: null,
        modalidadesIniciales: null,
      })
      cerrarModalDeporte()
      await recargar()
      if (creado?.idDeporte != null) {
        setModalDeporteId(String(creado.idDeporte))
      }
    } catch (err) {
      setError(err?.message || 'No se pudo crear el deporte.')
    }
  }

  const cerrarModalModalidad = () => {
    setModalModalidadAbierto(false)
    setNuevaModNombre('')
    setNuevaModUnidad('s')
  }

  const alternarVisibilidadDeporte = async (dep) => {
    if (editDeporte?.id === dep.idDeporte) return
    const visibleActual = dep.visible !== false
    try {
      setError(null)
      await deporteService.update(dep.idDeporte, {
        nombre: dep.nombre,
        imagenUrl: getDeporteImagenUrl(dep) || null,
        visible: !visibleActual,
      })
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar la visibilidad.')
    }
  }

  const handleGuardarDeporte = async (id) => {
    const nombre = (editDeporte?.nombre ?? '').trim()
    if (!nombre) return
    const depActual = deportes.find((d) => d.idDeporte === id)
    const imagenUrl = depActual ? getDeporteImagenUrl(depActual) || null : null
    try {
      setError(null)
      await deporteService.update(id, { nombre, imagenUrl, visible: Boolean(editDeporte.visible) })
      setEditDeporte(null)
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el deporte.')
    }
  }

  const ejecutarCrearModalidad = async () => {
    const nombre = nuevaModNombre.trim()
    const unidad = nuevaModUnidad.trim()
    const idDeporte = Number(modalDeporteId)
    if (!nombre) {
      setError('Indica el nombre de la modalidad.')
      return
    }
    if (!unidad) {
      setError('Elige la unidad de medida.')
      return
    }
    if (!Number.isFinite(idDeporte) || idDeporte <= 0) {
      setError('Selecciona un deporte válido.')
      return
    }
    try {
      setError(null)
      await modalidadService.create({ nombre, unidad, idDeporte })
      cerrarModalModalidad()
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo crear la modalidad.')
    }
  }

  const handleGuardarModalidad = async (id) => {
    const nombre = (editModalidad?.nombre ?? '').trim()
    const unidad = (editModalidad?.unidad ?? '').trim()
    if (!nombre || !unidad) return
    try {
      setError(null)
      await modalidadService.update(id, { nombre, unidad })
      setEditModalidad(null)
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la modalidad.')
    }
  }

  const abrirConfirmEliminarDeporte = (dep) => {
    deporteABorrarRef.current = dep
    setDeporteABorrar(dep)
  }

  const cerrarConfirmEliminarDeporte = () => {
    deporteABorrarRef.current = null
    setDeporteABorrar(null)
  }

  const confirmarEliminarDeporte = async () => {
    const dep = deporteABorrarRef.current
    deporteABorrarRef.current = null
    setDeporteABorrar(null)
    if (!dep) return
    try {
      setError(null)
      await deporteService.delete(dep.idDeporte)
      if (editDeporte?.id === dep.idDeporte) setEditDeporte(null)
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el deporte.')
    }
  }

  const abrirConfirmEliminarModalidad = (mo) => {
    modalidadABorrarRef.current = mo
    setModalidadABorrar(mo)
  }

  const cerrarConfirmEliminarModalidad = () => {
    modalidadABorrarRef.current = null
    setModalidadABorrar(null)
  }

  const confirmarEliminarModalidad = async () => {
    const mo = modalidadABorrarRef.current
    modalidadABorrarRef.current = null
    setModalidadABorrar(null)
    if (!mo) return
    try {
      setError(null)
      await modalidadService.delete(mo.idModalidad)
      if (editModalidad?.id === mo.idModalidad) setEditModalidad(null)
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar la modalidad.')
    }
  }

  if (cargando) {
    return <p className="admin-state">Cargando catálogo…</p>
  }

  const deporteSeleccionadoNombre = deportes.find((d) => String(d.idDeporte) === modalDeporteId)?.nombre ?? ''

  return (
    <div className="admin-catalog">
      <ModalDialog
        open={deporteABorrar != null}
        onClose={cerrarConfirmEliminarDeporte}
        title="Eliminar deporte"
        mode="confirm"
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => void confirmarEliminarDeporte()}
      >
        <p className="modal-dialog-text">
          ¿Borrar «{deporteABorrar?.nombre}» y todas sus modalidades? Se eliminarán también todas las marcas
          registradas en esas modalidades.
        </p>
      </ModalDialog>

      <ModalDialog
        open={modalidadABorrar != null}
        onClose={cerrarConfirmEliminarModalidad}
        title="Eliminar modalidad"
        mode="confirm"
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => void confirmarEliminarModalidad()}
      >
        <p className="modal-dialog-text">
          ¿Borrar «{modalidadABorrar?.nombre}»? Se eliminarán también todas las marcas registradas en esta modalidad.
        </p>
      </ModalDialog>

      {error && <p className="admin-state admin-state--error">{error}</p>}
      <p className="admin-panel__hint">
        Los deportes nuevos quedan ocultos en la web: pulsa en «Visible» / «Oculto» en la tabla para publicarlos. Las
        modalidades se añaden con «Añadir modalidad». (Subida de imagen desactivada.)
      </p>

      <ModalDialog
        open={modalDeporteAbierto}
        onClose={cerrarModalDeporte}
        title="Nuevo deporte"
        mode="alert"
        size="compact"
        footer={
          <div className="modal-dialog-actions">
            <button type="button" className="modal-dialog-btn modal-dialog-btn--secondary" onClick={cerrarModalDeporte}>
              Cancelar
            </button>
            <button
              type="button"
              className="modal-dialog-btn modal-dialog-btn--primary"
              disabled={!puedeCrearDeporte}
              onClick={() => void ejecutarCrearDeporte()}
            >
              Crear deporte
            </button>
          </div>
        }
      >
        <div className="admin-modal-form admin-modal-form--compact">
          <div className="admin-form-row admin-form-row--wrap">
            <input
              type="text"
              placeholder="Nombre del deporte"
              value={nuevoDeporte}
              onChange={(e) => setNuevoDeporte(e.target.value)}
              maxLength={100}
              aria-label="Nombre del nuevo deporte"
            />
            {/*
            <input type="file" accept="image/*" className="admin-file-input" />
            <button type="button" className="admin-btn admin-btn--ghost">Elegir imagen</button>
            */}
          </div>
          <p className="admin-panel__hint admin-panel__hint--tight">
            Solo nombre. El deporte se crea oculto en la web; haz clic en la columna Visibilidad para mostrarlo.
          </p>
        </div>
      </ModalDialog>

      <ModalDialog
        open={modalModalidadAbierto}
        onClose={cerrarModalModalidad}
        title="Nueva modalidad"
        mode="alert"
        size="compact"
        footer={
          <div className="modal-dialog-actions">
            <button type="button" className="modal-dialog-btn modal-dialog-btn--secondary" onClick={cerrarModalModalidad}>
              Cancelar
            </button>
            <button
              type="button"
              className="modal-dialog-btn modal-dialog-btn--primary"
              disabled={!nuevaModNombre.trim() || !modalDeporteId}
              onClick={() => void ejecutarCrearModalidad()}
            >
              Añadir modalidad
            </button>
          </div>
        }
      >
        <div className="admin-modal-form admin-modal-form--compact">
          <div className="admin-form-row admin-form-row--stack">
            <label htmlFor="admin-modal-mod-deporte" className="profile-marcas-label">
              Deporte
            </label>
            <select
              id="admin-modal-mod-deporte"
              value={modalDeporteId}
              onChange={(e) => setModalDeporteId(e.target.value)}
              disabled={deportes.length === 0}
            >
              {deportes.map((d) => (
                <option key={d.idDeporte} value={String(d.idDeporte)}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-row admin-form-row--stack">
            <label htmlFor="admin-modal-mod-nombre" className="profile-marcas-label">
              Nombre de la modalidad
            </label>
            <input
              id="admin-modal-mod-nombre"
              type="text"
              placeholder="Ej. 100 m lisos"
              value={nuevaModNombre}
              onChange={(e) => setNuevaModNombre(e.target.value)}
              maxLength={100}
              aria-label="Nombre de la nueva modalidad"
            />
          </div>
          <div className="admin-form-row admin-form-row--stack">
            <label htmlFor="admin-modal-mod-unidad" className="profile-marcas-label">
              Unidad de medida
            </label>
            <UnidadSelect id="admin-modal-mod-unidad" value={nuevaModUnidad} onChange={setNuevaModUnidad} />
          </div>
        </div>
      </ModalDialog>

      <div className="admin-subsection">
        <div className="admin-subsection__head">
          <h3 className="admin-subsection__title">Deportes</h3>
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModalDeporteAbierto(true)}>
            Añadir deporte
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Visibilidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deportes.map((dep) => (
                <tr key={dep.idDeporte}>
                  <td>{dep.idDeporte}</td>
                  <td>
                    {editDeporte?.id === dep.idDeporte ? (
                      <input
                        type="text"
                        value={editDeporte.nombre}
                        onChange={(e) => setEditDeporte({ ...editDeporte, nombre: e.target.value })}
                        maxLength={100}
                        aria-label="Editar nombre del deporte"
                      />
                    ) : (
                      dep.nombre
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-visibility-toggle${
                        dep.visible !== false ? ' admin-visibility-toggle--yes' : ' admin-visibility-toggle--no'
                      }`}
                      disabled={editDeporte?.id === dep.idDeporte}
                      title={
                        editDeporte?.id === dep.idDeporte
                          ? 'Guarda o cancela la edición del nombre antes de cambiar la visibilidad'
                          : 'Cambiar visibilidad en la web'
                      }
                      onClick={() => void alternarVisibilidadDeporte(dep)}
                    >
                      {dep.visible !== false ? 'Visible' : 'Oculto'}
                    </button>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      {editDeporte?.id === dep.idDeporte ? (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            onClick={() => handleGuardarDeporte(dep.idDeporte)}
                          >
                            Guardar
                          </button>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setEditDeporte(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost"
                            onClick={() =>
                              setEditDeporte({
                                id: dep.idDeporte,
                                nombre: dep.nombre,
                                visible: dep.visible !== false,
                              })
                            }
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            onClick={() => abrirConfirmEliminarDeporte(dep)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-subsection admin-subsection--modalidades">
        <div className="admin-modalidades-stack">
          <h3 className="admin-subsection__title admin-subsection__title--mod-compact">Modalidades</h3>
          <div className="admin-mod-filter-band">
            <div className="admin-inline-field admin-inline-field--in-band">
              <label htmlFor="admin-mod-deporte" className="profile-marcas-label">
                Filtrar por deporte
              </label>
              <select
                id="admin-mod-deporte"
                value={modalDeporteId}
                onChange={(e) => setModalDeporteId(e.target.value)}
                disabled={deportes.length === 0}
              >
                {deportes.map((d) => (
                  <option key={d.idDeporte} value={String(d.idDeporte)}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            {deporteSeleccionadoNombre ? (
              <p className="admin-mod-context-line">
                Mostrando modalidades de: <strong>{deporteSeleccionadoNombre}</strong>
              </p>
            ) : null}
          </div>
          <div className="admin-table-add-row">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={!modalDeporteId}
              onClick={() => setModalModalidadAbierto(true)}
            >
              Añadir modalidad
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modalidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-state">
                    No hay modalidades para este deporte.
                  </td>
                </tr>
              ) : (
                modalidadesFiltradas.map((mo) => (
                  <tr key={mo.idModalidad}>
                    <td>{mo.idModalidad}</td>
                    <td>
                      {editModalidad?.id === mo.idModalidad ? (
                        <input
                          type="text"
                          value={editModalidad.nombre}
                          onChange={(e) => setEditModalidad({ ...editModalidad, nombre: e.target.value })}
                          maxLength={100}
                          aria-label="Editar nombre de modalidad"
                        />
                      ) : (
                        mo.nombre
                      )}
                    </td>
                    <td>
                      {editModalidad?.id === mo.idModalidad ? (
                        <UnidadSelect
                          id={`edit-mod-unidad-${mo.idModalidad}`}
                          value={editModalidad.unidad}
                          onChange={(v) => setEditModalidad({ ...editModalidad, unidad: v })}
                        />
                      ) : (
                        UNIDAD_OPCIONES.find((o) => o.value === mo.unidad)?.label ?? mo.unidad
                      )}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {editModalidad?.id === mo.idModalidad ? (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn--primary"
                              onClick={() => handleGuardarModalidad(mo.idModalidad)}
                            >
                              Guardar
                            </button>
                            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setEditModalidad(null)}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost"
                              onClick={() =>
                                setEditModalidad({ id: mo.idModalidad, nombre: mo.nombre, unidad: mo.unidad })
                              }
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn--danger"
                              onClick={() => abrirConfirmEliminarModalidad(mo)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
