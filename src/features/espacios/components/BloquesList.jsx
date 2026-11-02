export default function BloquesList({ bloques, onEdit }) {
  return (
    <ul className="bloques-list">
      {bloques.map((bloque) => (
        <li key={bloque.id} className="bloques-list__item">
          <span className="bloques-list__name">{bloque.nombre}</span>
          <span className="bloques-list__pisos">
            {bloque.pisos} {bloque.pisos === 1 ? 'piso' : 'pisos'}
          </span>
          <button
            type="button"
            className="bloques-edit"
            onClick={() => onEdit?.(bloque)}
          >
            Editar
          </button>
        </li>
      ))}
    </ul>
  )
}
