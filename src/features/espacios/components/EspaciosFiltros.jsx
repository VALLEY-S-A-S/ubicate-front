export default function EspaciosFiltros({
  values,
  tipos,
  bloques,
  pisos,
  count,
  campusNombre,
  onChange,
  onClear,
}) {
  const hayFiltros = Boolean(
    values.q || values.tipoEspacioId || values.bloqueId || values.pisoId,
  )

  return (
    <div className="espacios-filtros">
      <input
        type="search"
        className="espacios-buscador"
        placeholder="Buscar espacio..."
        value={values.q}
        onChange={(event) => onChange({ q: event.target.value })}
        aria-label="Buscar espacio por nombre o código"
      />

      <div className="espacios-filtros__grid">
        <label className="espacios-filtro">
          <span>Campus</span>
          <select value="" disabled>
            <option>{campusNombre ?? 'Sede'}</option>
          </select>
        </label>

        <label className="espacios-filtro">
          <span>Bloque</span>
          <select
            value={values.bloqueId}
            onChange={(event) => onChange({ bloqueId: event.target.value, pisoId: '' })}
          >
            <option value="">Todos</option>
            {bloques.map((bloque) => (
              <option key={bloque.id} value={bloque.id}>
                {bloque.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="espacios-filtro">
          <span>Piso</span>
          <select
            value={values.pisoId}
            onChange={(event) => onChange({ pisoId: event.target.value })}
            disabled={!values.bloqueId}
          >
            <option value="">Todos</option>
            {pisos.map((piso) => (
              <option key={piso.id} value={piso.id}>
                Piso {piso.numero}
              </option>
            ))}
          </select>
        </label>

        <label className="espacios-filtro">
          <span>Tipo de espacio</span>
          <select
            value={values.tipoEspacioId}
            onChange={(event) => onChange({ tipoEspacioId: event.target.value })}
          >
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="espacios-filtros__footer">
        <span className="espacios-count">
          {count} {count === 1 ? 'espacio encontrado' : 'espacios encontrados'}
        </span>
        {hayFiltros && (
          <button type="button" className="espacios-limpiar" onClick={onClear}>
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
