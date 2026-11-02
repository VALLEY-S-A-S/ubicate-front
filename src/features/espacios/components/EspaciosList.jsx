export default function EspaciosList({
  espacios,
  pendingId,
  onToggleEstado,
  onEdit,
  onDelete,
}) {
  if (espacios.length === 0) {
    return <p className="espacios-state">Aún no hay espacios registrados</p>
  }

  return (
    <ul className="espacios-list">
      {espacios.map((espacio) => {
        const deshabilitado = espacio.estado === 'DESHABILITADO'
        const busy = pendingId === espacio.id
        const ubicacion = espacio.bloqueNombre
          ? `${espacio.bloqueNombre}, piso ${espacio.pisoNumero}`
          : 'Sin ubicación'

        return (
          <li key={espacio.id} className="espacios-list__item">
            <div className="espacios-list__info">
              <span className="espacios-list__codigo">{espacio.codigo}</span>
              <span className="espacios-list__nombre">{espacio.nombre}</span>
              <span className="espacios-list__meta">
                {espacio.tipoEspacioNombre} · {ubicacion}
              </span>
            </div>

            <span
              className={`espacios-estado${deshabilitado ? ' espacios-estado--inactivo' : ''}`}
            >
              {deshabilitado ? 'Deshabilitado' : 'Disponible'}
            </span>

            <div className="espacios-list__actions">
              <button
                type="button"
                className="espacios-action"
                disabled={busy}
                onClick={() => onToggleEstado?.(espacio)}
              >
                {deshabilitado ? 'Habilitar' : 'Deshabilitar'}
              </button>
              <button
                type="button"
                className="espacios-action"
                disabled={busy}
                onClick={() => onEdit?.(espacio)}
              >
                Editar
              </button>
              <button
                type="button"
                className="espacios-action espacios-action--danger"
                disabled={busy}
                onClick={() => onDelete?.(espacio)}
              >
                Borrar
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
