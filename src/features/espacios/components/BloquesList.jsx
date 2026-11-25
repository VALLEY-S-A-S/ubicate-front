import IconTile from './IconTile'
import { BloquesIcono, iconoBloque } from './bloquesVisual'

function normalizar(texto) {
  return (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Búsqueda por nombre sin distinguir mayúsculas ni tildes.
export function filtrarBloques(bloques, busqueda) {
  const termino = normalizar(busqueda).trim()
  if (!termino) return bloques
  return bloques.filter((bloque) => normalizar(bloque.nombre).includes(termino))
}

export default function BloquesList({ bloques, selectedId, onSelect, iconos = {} }) {
  return (
    <ul className="bloques-list">
      {bloques.map((bloque) => {
        const activo = bloque.id === selectedId

        return (
          <li key={bloque.id}>
            <button
              type="button"
              className={`bloques-list__item${activo ? ' bloques-list__item--active' : ''}`}
              aria-pressed={activo}
              onClick={() => onSelect?.(bloque.id)}
            >
              <IconTile size="medio">
                <BloquesIcono nombre={iconoBloque(iconos[bloque.id])} />
              </IconTile>
              <span className="bloques-list__body">
                <span className="bloques-list__name">{bloque.nombre}</span>
                <span className="bloques-list__pisos">
                  {bloque.pisos} {bloque.pisos === 1 ? 'piso' : 'pisos'}
                </span>
              </span>
              <span className="bloques-list__chevron">
                <BloquesIcono nombre="chevronDerecha" />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
