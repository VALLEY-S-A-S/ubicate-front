import { TipoEspacioIcon, tipoColor } from './tipoEspacioVisual'

function ubicacionDe(espacio) {
  return [
    espacio.bloqueNombre,
    espacio.pisoNumero != null ? `Piso ${espacio.pisoNumero}` : null,
    espacio.sedeNombre,
  ]
    .filter(Boolean)
    .join(' · ') || 'Sin ubicación'
}

export default function EspaciosList({ espacios, selectedId, onSelect }) {
  if (espacios.length === 0) {
    return (
      <p className="espacios-empty">
        No se encuentran espacios en el sistema bajo los parámetros de búsqueda
      </p>
    )
  }

  return (
    <ul className="espacios-list">
      {espacios.map((espacio) => {
        const activo = espacio.id === selectedId
        const deshabilitado = espacio.estado === 'DESHABILITADO'
        const color = tipoColor(espacio.tipoEspacioId, deshabilitado)

        return (
          <li key={espacio.id}>
            <button
              type="button"
              className={`espacio-item${activo ? ' espacio-item--active' : ''}`}
              onClick={() => onSelect?.(espacio)}
              aria-pressed={activo}
            >
              <span
                className="espacio-item__icono"
                style={{ color: color.fg, background: color.bg }}
              >
                <TipoEspacioIcon nombre={espacio.tipoEspacioNombre} />
              </span>
              <span className="espacio-item__body">
                <span className="espacio-item__nombre">{espacio.nombre}</span>
                <span className="espacio-item__meta">{ubicacionDe(espacio)}</span>
              </span>
              <span
                className="espacio-item__tipo"
                style={{ color: color.fg, background: color.bg }}
              >
                {espacio.tipoEspacioNombre}
              </span>
              <span className="espacio-item__chevron" aria-hidden="true">›</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
