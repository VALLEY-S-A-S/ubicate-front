import { useEffect, useRef } from 'react'
import '../styles/perfil.css'

// HU-1: consulta de solo lectura del perfil del administrador.
// Los datos salen de la sesión (GET /api/auth/me), no se editan ni se guardan.
export default function PerfilModal({ usuario, onCerrar }) {
  const cerrarRef = useRef(null)

  useEffect(() => {
    if (!usuario) return undefined
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()

    function alPresionar(event) {
      if (event.key === 'Escape') onCerrar?.()
    }
    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = anterior
    }
  }, [usuario, onCerrar])

  if (!usuario) return null

  const identificacion = usuario.cedulaOCodigo || usuario.codigoInstitucional || ''

  return (
    <div
      className="perfil-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfil-modal-titulo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar?.()
      }}
    >
      <div className="perfil-modal__panel">
        <header className="perfil-modal__cabecera">
          <h2 id="perfil-modal-titulo" className="perfil-modal__titulo">Mi perfil</h2>
          <button
            ref={cerrarRef}
            type="button"
            className="perfil-modal__cerrar"
            onClick={() => onCerrar?.()}
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <dl className="perfil-modal__cuerpo">
          <div className="perfil-modal__fila">
            <dt>Nombre</dt>
            <dd>{usuario.nombre ?? ''}</dd>
          </div>
          <div className="perfil-modal__fila">
            <dt>Correo electrónico</dt>
            <dd>{usuario.correoInstitucional ?? ''}</dd>
          </div>
          <div className="perfil-modal__fila">
            <dt>Identificación</dt>
            <dd>{identificacion}</dd>
          </div>
          <div className="perfil-modal__fila">
            <dt>Sede</dt>
            <dd>{usuario.sedeNombre ?? ''}</dd>
          </div>
          <div className="perfil-modal__fila">
            <dt>Rol</dt>
            <dd>{usuario.rol ?? ''}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
