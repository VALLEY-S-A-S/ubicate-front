/**
 * lady vidal - HU-06: filtros combinables del horario (nombre, tipo de
 * espacio, bloque y piso) con acción para limpiarlos.
 */
export default function FiltrosHorario({
  filtros,
  tipos,
  bloques,
  pisos,
  onChange,
  onClear,
  disabled,
  hayFiltros,
  catalogError,
}) {
  return (
    <div className="horario-filtros">
      <label className="horario-campo horario-campo--buscar">
        <span className="horario-campo__label">Buscar por nombre</span>
        <input
          type="search"
          name="q"
          placeholder="Nombre del espacio…"
          value={filtros.q}
          onChange={(event) => onChange('q', event.target.value)}
          disabled={disabled}
        />
      </label>

      <label className="horario-campo">
        <span className="horario-campo__label">Tipo de espacio</span>
        <select
          name="tipoEspacioId"
          value={filtros.tipoEspacioId}
          onChange={(event) => onChange('tipoEspacioId', event.target.value)}
          disabled={disabled}
        >
          <option value="">Todos</option>
          {tipos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="horario-campo">
        <span className="horario-campo__label">Bloque</span>
        <select
          name="bloqueId"
          value={filtros.bloqueId}
          onChange={(event) => onChange('bloqueId', event.target.value)}
          disabled={disabled}
        >
          <option value="">Todos</option>
          {bloques.map((bloque) => (
            <option key={bloque.id} value={bloque.id}>
              {bloque.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="horario-campo">
        <span className="horario-campo__label">Piso</span>
        <select
          name="pisoId"
          value={filtros.pisoId}
          onChange={(event) => onChange('pisoId', event.target.value)}
          disabled={disabled || !filtros.bloqueId}
        >
          <option value="">Todos</option>
          {pisos.map((piso) => (
            <option key={piso.id} value={piso.id}>
              Piso {piso.numero}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="horario-limpiar"
        onClick={onClear}
        disabled={disabled || !hayFiltros}
      >
        Limpiar filtros
      </button>

      {catalogError && (
        <p className="horario-filtros__error" role="alert">
          {catalogError}
        </p>
      )}
    </div>
  )
}
