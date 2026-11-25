export default function BloquesList({ bloques, selectedId, onSelect }) {
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
              <span className="bloques-list__body">
                <span className="bloques-list__name">{bloque.nombre}</span>
                <span className="bloques-list__pisos">
                  {bloque.pisos} {bloque.pisos === 1 ? 'piso' : 'pisos'}
                </span>
              </span>
              <span className="bloques-list__chevron" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
