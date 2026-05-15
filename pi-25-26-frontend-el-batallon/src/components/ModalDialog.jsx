import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../styles/modal-dialog.css'

/**
 * Diálogo modal in-page (sustituye alert/confirm del navegador).
 * - mode "alert": un botón que llama a onClose.
 * - mode "confirm": cancelar llama a onClose; el botón principal llama a onConfirm (el padre cierra si hace falta).
 * - Si se pasa `footer`, sustituye la fila de botones por defecto (formularios propios).
 */
export function ModalDialog({
  open,
  onClose,
  title,
  children,
  mode = 'alert',
  variant = 'default',
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  footer,
  size,
}) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const primaryLabel = confirmLabel ?? (mode === 'alert' ? 'Aceptar' : 'Confirmar')

  const handlePrimary = () => {
    if (mode === 'alert') onClose()
    else onConfirm?.()
  }

  const panelClass =
    size === 'wide'
      ? 'modal-dialog-panel modal-dialog-panel--wide'
      : size === 'compact'
        ? 'modal-dialog-panel modal-dialog-panel--compact'
        : 'modal-dialog-panel'

  const defaultActions = (
    <div className="modal-dialog-actions">
      {mode === 'confirm' ? (
        <button type="button" className="modal-dialog-btn modal-dialog-btn--secondary" onClick={onClose}>
          {cancelLabel}
        </button>
      ) : null}
      <button
        type="button"
        className={`modal-dialog-btn modal-dialog-btn--primary${variant === 'danger' ? ' modal-dialog-btn--danger' : ''}`}
        onClick={handlePrimary}
      >
        {primaryLabel}
      </button>
    </div>
  )

  return createPortal(
    <div className="modal-dialog-root">
      <button type="button" className="modal-dialog-backdrop" aria-label="Cerrar" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-dialog-title' : undefined}
        className={panelClass}
      >
        {title ? (
          <h2 id="modal-dialog-title" className="modal-dialog-title">
            {title}
          </h2>
        ) : null}
        <div className="modal-dialog-body">{children}</div>
        {footer != null ? footer : defaultActions}
      </div>
    </div>,
    document.body,
  )
}
