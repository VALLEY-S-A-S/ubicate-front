import { TipoEspacioIcon, tipoColor } from './tipoEspacioVisual'
import EspacioInventario from './EspacioInventario'

function ubicacionDe(espacio) {
  return [
    espacio.bloqueNombre,
    espacio.pisoNumero != null ? `Piso ${espacio.pisoNumero}` : null,
    espacio.sedeNombre,
  ]
    .filter(Boolean)
    .join(' · ') || 'Sin ubicación'
}

export default function EspacioDetalle({
  espacio,
  pendingId,
  onEdit,
  onToggleEstado,
  onDelete,
  token,
  onLogout,
}) {
  if (!espacio) {
    return (
      <div className="espacio-detalle espacio-detalle--vacio">
        <p>Selecciona un espacio de la lista para ver su información e inventario.</p>
      </div>
    )
  }

  const deshabilitado = espacio.estado === 'DESHABILITADO'
  const busy = pendingId === espacio.id
  const color = tipoColor(espacio.tipoEspacioId, deshabilitado)

  return (
    <div className="espacio-detalle">
      <header className="espacio-detalle__header">
        <div className="espacio-detalle__titular">
          <span
            className="espacio-detalle__icono"
            style={{ color: color.fg, background: color.bg }}
          >
            <TipoEspacioIcon nombre={espacio.tipoEspacioNombre} />
          </span>
          <div>
            <div className="espacio-detalle__titulo">
              <h3>{espacio.nombre}</h3>
              <span
                className="espacio-item__tipo"
                style={{ color: color.fg, background: color.bg }}
              >
                {espacio.tipoEspacioNombre}
              </span>
            </div>
            <p className="espacio-detalle__ubicacion">{ubicacionDe(espacio)}</p>
          </div>
        </div>
        <div className="espacio-detalle__acciones">
          <button type="button" className="espacios-action" disabled={busy} onClick={() => onEdit?.(espacio)}>
            Editar
          </button>
          <button type="button" className="espacios-action" disabled={busy} onClick={() => onToggleEstado?.(espacio)}>
            {deshabilitado ? 'Habilitar' : 'Deshabilitar'}
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
      </header>

      <EspacioInventario espacioId={espacio.id} token={token} onLogout={onLogout} />

      <section className="espacio-info">
        <h4>Información del espacio</h4>
        <dl className="espacio-info__grid">
          <div><dt>Código</dt><dd>{espacio.codigo}</dd></div>
          <div><dt>Tipo de espacio</dt><dd>{espacio.tipoEspacioNombre}</dd></div>
          <div><dt>Bloque</dt><dd>{espacio.bloqueNombre ?? '—'}</dd></div>
          <div><dt>Campus</dt><dd>{espacio.sedeNombre ?? '—'}</dd></div>
          <div><dt>Piso</dt><dd>{espacio.pisoNumero ?? '—'}</dd></div>
          <div><dt>Capacidad</dt><dd>{espacio.capacidad != null ? `${espacio.capacidad} estudiantes` : '—'}</dd></div>
        </dl>
      </section>
    </div>
  )
}
