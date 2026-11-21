/**
 * lady vidal - HU-06: panel lateral con las franjas pendientes de asignación.
 * Las tarjetas se pueden arrastrar al horario y las asignaciones se pueden
 * devolver soltándolas sobre este panel.
 */
import { colorDocente, formatearHora } from '../utils/horario.js'

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

const HORAS = Array.from({ length: 18 }, (_, indice) => {
  const hora = String(indice + 6).padStart(2, '0')
  return `${hora}:00`
})

function etiquetaDia(diaSemana) {
  return DIAS.find((dia) => dia.value === Number(diaSemana))?.label ?? ''
}

function metaEspacio(espacio) {
  const partes = []
  if (espacio.bloqueNombre) partes.push(espacio.bloqueNombre)
  if (espacio.pisoNumero != null) partes.push(`Piso ${espacio.pisoNumero}`)
  return partes.join(' · ')
}

export default function FranjasPanel({
  franjas,
  asignaciones = [],
  vista = 'pendientes',
  filtros,
  onChange,
  onClear,
  onSeleccionar,
  cargando,
  mensaje,
  error,
  onArrastrar,
  onDragEnd,
  onDevolverAsignacion,
  onVistaChange,
  onEditarAsignacion,
  onQuitarAsignacion,
}) {
  function handleDrop(event) {
    event.preventDefault()
    const raw = event.dataTransfer.getData('application/json')
      || event.dataTransfer.getData('text/plain')
    if (!raw) return

    try {
      const payload = JSON.parse(raw)
      if (payload?.tipo === 'asignacion') {
        onDevolverAsignacion?.(payload.evento, payload.espacio)
      }
    } catch {
      /* El dato arrastrado no es una asignación válida. */
    }
  }

  const verAsignadas = vista === 'asignadas'

  return (
    <aside
      className="franjas"
      aria-label="Franjas del horario"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="franjas__cabecera">
        <h2 className="franjas__titulo">Franjas</h2>
        <div className="franjas__tabs" role="tablist" aria-label="Vista de franjas">
          <button
            type="button"
            role="tab"
            aria-selected={!verAsignadas}
            className={`franjas__tab${!verAsignadas ? ' franjas__tab--activa' : ''}`}
            onClick={() => onVistaChange?.('pendientes')}
          >
            Pendientes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={verAsignadas}
            className={`franjas__tab${verAsignadas ? ' franjas__tab--activa' : ''}`}
            onClick={() => onVistaChange?.('asignadas')}
          >
            Asignadas
          </button>
        </div>
      </div>

      <div className="franjas__filtros">
        <input
          type="search"
          name="docente"
          placeholder="Docente…"
          value={filtros.docente}
          onChange={(event) => onChange('docente', event.target.value)}
          aria-label="Buscar por docente"
        />
        <input
          type="search"
          name="asignatura"
          placeholder="Asignatura…"
          value={filtros.asignatura}
          onChange={(event) => onChange('asignatura', event.target.value)}
          aria-label="Buscar por asignatura"
        />
        <input
          type="search"
          name="grupo"
          placeholder="Grupo…"
          value={filtros.grupo}
          onChange={(event) => onChange('grupo', event.target.value)}
          aria-label="Buscar por grupo"
        />
        <input
          type="search"
          name="programa"
          placeholder="Programa…"
          value={filtros.programa}
          onChange={(event) => onChange('programa', event.target.value)}
          aria-label="Buscar por programa"
        />
        <select
          name="diaSemana"
          value={filtros.diaSemana}
          onChange={(event) => onChange('diaSemana', event.target.value)}
          aria-label="Filtrar por día"
        >
          <option value="">Todos los días</option>
          {DIAS.map((dia) => (
            <option key={dia.value} value={dia.value}>
              {dia.label}
            </option>
          ))}
        </select>
        <div className="franjas__horas">
          <select
            name="horaInicio"
            value={filtros.horaInicio}
            onChange={(event) => onChange('horaInicio', event.target.value)}
            aria-label="Hora inicial"
          >
            <option value="">Inicio</option>
            {HORAS.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
          <span>a</span>
          <select
            name="horaFin"
            value={filtros.horaFin}
            onChange={(event) => onChange('horaFin', event.target.value)}
            aria-label="Hora final"
          >
            <option value="">Fin</option>
            {HORAS.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="franjas__limpiar"
          onClick={onClear}
        >
          Limpiar filtros
        </button>
      </div>

      {verAsignadas ? (
        asignaciones.length === 0 ? (
          <p className="franjas__estado">
            No hay franjas asignadas que coincidan con los filtros seleccionados.
          </p>
        ) : (
          <ul className="franjas__lista">
            {asignaciones.map(({ espacio, ocupacion }) => (
              <li key={`${espacio.id}-${ocupacion.id}`}>
                <article
                  className={`asignada${
                    ocupacion.origen === 'local' ? ' asignada--pendiente' : ''
                  }`}
                  style={{ '--franja-color': colorDocente(ocupacion.docenteNombre) }}
                >
                  <span className="franja__cabecera">
                    <span className="franja__nombre">
                      {ocupacion.docenteNombre ?? 'Sin docente'}
                    </span>
                    <span className="franja__horas">
                      {formatearHora(ocupacion.horaInicio)} -{' '}
                      {formatearHora(ocupacion.horaFin)}
                    </span>
                  </span>
                  <span className="franja__asignatura">
                    {ocupacion.titulo ?? 'Asignación'}
                    {ocupacion.grupoCodigo ? ` · ${ocupacion.grupoCodigo}` : ''}
                  </span>
                  <span className="franja__meta">
                    {etiquetaDia(ocupacion.diaSemana)}
                    {ocupacion.programaNombre ? ` · ${ocupacion.programaNombre}` : ''}
                  </span>
                  <span className="asignada__espacio">
                    <span>
                      {espacio.nombre}
                      {metaEspacio(espacio) ? ` · ${metaEspacio(espacio)}` : ''}
                    </span>
                    {ocupacion.origen === 'local' && (
                      <span className="asignada__pendiente">Sin guardar</span>
                    )}
                  </span>
                  <span className="asignada__acciones">
                    <button
                      type="button"
                      className="asignada__boton"
                      onClick={() => onEditarAsignacion?.(ocupacion, espacio)}
                    >
                      Cambiar espacio
                    </button>
                    <button
                      type="button"
                      className="asignada__boton asignada__boton--quitar"
                      onClick={() => onQuitarAsignacion?.(ocupacion, espacio)}
                    >
                      Quitar
                    </button>
                  </span>
                </article>
              </li>
            ))}
          </ul>
        )
      ) : cargando ? (
        <p className="franjas__estado">Cargando franjas…</p>
      ) : error ? (
        <p className="franjas__estado franjas__estado--error" role="alert">
          {error}
        </p>
      ) : franjas.length === 0 ? (
        <p className="franjas__estado">
          {mensaje || 'No hay franjas pendientes para los filtros seleccionados.'}
        </p>
      ) : (
        <ul className="franjas__lista">
          {franjas.map((franja) => (
            <li key={franja.id}>
              <button
                type="button"
                className="franja"
                draggable
                style={{ '--franja-color': colorDocente(franja.docenteNombre) }}
                onClick={() => onSeleccionar?.(franja)}
                onDragStart={(event) => {
                  const payload = { tipo: 'franja', franja }
                  event.dataTransfer.setData('application/json', JSON.stringify(payload))
                  event.dataTransfer.setData('text/plain', JSON.stringify(payload))
                  event.dataTransfer.effectAllowed = 'move'
                  onArrastrar?.(franja)
                }}
                onDragEnd={onDragEnd}
                title={`Arrastrar ${franja.asignaturaNombre ?? 'franja'} al horario`}
              >
                <span className="franja__cabecera">
                  <span className="franja__nombre">{franja.docenteNombre}</span>
                  <span className="franja__horas">{franja.etiqueta}</span>
                </span>
                <span className="franja__asignatura">
                  {franja.asignaturaNombre}
                  {franja.grupoCodigo ? ` · ${franja.grupoCodigo}` : ''}
                </span>
                <span className="franja__meta">
                  {franja.diaNombre}
                  {franja.programaNombre ? ` · ${franja.programaNombre}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
