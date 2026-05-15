import { useCallback, useEffect, useRef, useState } from 'react'
import { adminUserService } from '../../services/api'
import { ModalDialog } from '../ModalDialog'

function formatFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function AdminUsersSection({ currentEmail }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [usuarioABorrar, setUsuarioABorrar] = useState(null)
  const usuarioABorrarRef = useRef(null)

  const recargar = useCallback(async () => {
    const list = await adminUserService.list()
    setUsuarios(Array.isArray(list) ? list : [])
  }, [])

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        setCargando(true)
        setError(null)
        await recargar()
      } catch (e) {
        if (activo) setError(e?.message || 'No se pudo cargar la lista de usuarios.')
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [recargar])

  const abrirConfirmBorrar = (u) => {
    if (u.email?.toLowerCase() === currentEmail?.toLowerCase()) return
    usuarioABorrarRef.current = u
    setUsuarioABorrar(u)
  }

  const cerrarConfirmBorrar = () => {
    usuarioABorrarRef.current = null
    setUsuarioABorrar(null)
  }

  const confirmarBorrarUsuario = async () => {
    const u = usuarioABorrarRef.current
    usuarioABorrarRef.current = null
    setUsuarioABorrar(null)
    if (!u) return
    try {
      setError(null)
      await adminUserService.delete(u.id)
      await recargar()
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el usuario.')
    }
  }

  if (cargando) {
    return <p className="admin-state">Cargando usuarios…</p>
  }

  return (
    <div className="admin-users">
      <ModalDialog
        open={usuarioABorrar != null}
        onClose={cerrarConfirmBorrar}
        title="Eliminar usuario"
        mode="confirm"
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarBorrarUsuario}
      >
        <p className="modal-dialog-text">
          ¿Eliminar definitivamente la cuenta de {usuarioABorrar?.nombre} ({usuarioABorrar?.email})?
        </p>
      </ModalDialog>

      {error && <p className="admin-state admin-state--error">{error}</p>}
      <p className="admin-panel__hint">
        Listado de cuentas registradas. No puedes eliminar tu propia sesión desde aquí; usa «Eliminar cuenta» al final
        del perfil si lo necesitas.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Roles</th>
              <th>Alta</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esYo = u.email?.toLowerCase() === currentEmail?.toLowerCase()
              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || '—'}</td>
                  <td>
                    <span className="admin-roles">{(u.roles || []).join(', ') || '—'}</span>
                  </td>
                  <td>{formatFecha(u.fechaRegistro)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      disabled={esYo}
                      title={esYo ? 'No puedes eliminar tu propia cuenta aquí' : 'Eliminar usuario'}
                      onClick={() => abrirConfirmBorrar(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
