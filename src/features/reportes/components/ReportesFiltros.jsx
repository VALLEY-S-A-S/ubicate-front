import { ReporteIcon } from './reportesIconos.jsx'
import { ROLES_REPORTANTE } from '../utils/reportes.js'

export default function ReportesFiltros({
  filtros,
  tipos,
  bloques,
  pisos,
  espacios,
  cargando,
  cargandoBloques,
  cargandoPisos,
  cargandoEspacios,
  onCambiar,
  onBuscar,
  onLimpiar,
}) {
  function actualizar(campo) {
    return (event) => {
      const siguientes = { ...filtros, [campo]: event.target.value }
      if (campo === 'bloqueId') {
        siguientes.pisoId = ''
        siguientes.espacioId = ''
      }
      if (campo === 'pisoId') siguientes.espacioId = ''
      onCambiar(siguientes)
    }
  }

  function enviar(event) {
    event.preventDefault()
    onBuscar()
  }

  return (
    <form className="reportes-filtros" onSubmit={enviar}>
      <div className="reportes-filtros__titulo">
        <span className="reportes-filtros__icono">
          <ReporteIcon nombre="filtro" size={19} />
        </span>
        <div>
          <h3>Filtros de búsqueda</h3>
          <p>Filtra por salón, bloque, piso, tipo de anomalía, persona o fecha.</p>
        </div>
      </div>

      <div className="reportes-filtros__grid">
        <label className="reportes-campo">
          <span>Bloque</span>
          <select
            value={filtros.bloqueId}
            onChange={actualizar('bloqueId')}
            disabled={cargandoBloques}
          >
            <option value="">{cargandoBloques ? 'Cargando bloques...' : 'Todos los bloques'}</option>
            {bloques.map((bloque) => (
              <option key={bloque.id} value={bloque.id}>
                {bloque.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="reportes-campo">
          <span>Piso</span>
          <select
            value={filtros.pisoId}
            onChange={actualizar('pisoId')}
            disabled={cargandoPisos}
          >
            <option value="">{cargandoPisos ? 'Cargando pisos...' : 'Todos los pisos'}</option>
            {pisos.map((piso) => (
              <option key={piso.id} value={piso.id}>
                Piso {piso.numero}
                {!filtros.bloqueId && piso.bloqueNombre ? ` · ${piso.bloqueNombre}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="reportes-campo">
          <span>Salón</span>
          <select
            value={filtros.espacioId}
            onChange={actualizar('espacioId')}
            disabled={cargandoEspacios}
          >
            <option value="">{cargandoEspacios ? 'Cargando salones...' : 'Todos los salones'}</option>
            {espacios.map((espacio) => (
              <option key={espacio.id} value={espacio.id}>
                {espacio.nombre}{espacio.codigo ? ` · ${espacio.codigo}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="reportes-campo">
          <span>Desde</span>
          <input type="date" value={filtros.desde} onChange={actualizar('desde')} max={filtros.hasta || undefined} />
        </label>

        <label className="reportes-campo">
          <span>Hasta</span>
          <input type="date" value={filtros.hasta} onChange={actualizar('hasta')} min={filtros.desde || undefined} />
        </label>

        <label className="reportes-campo">
          <span>Tipo de anomalía</span>
          <select value={filtros.tipoAnomaliaId} onChange={actualizar('tipoAnomaliaId')}>
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="reportes-campo">
          <span>Estado</span>
          <select value={filtros.estado} onChange={actualizar('estado')}>
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </label>

        <label className="reportes-campo">
          <span>Rol del reportante</span>
          <select value={filtros.rolReportante} onChange={actualizar('rolReportante')}>
            <option value="">Todos los roles</option>
            {ROLES_REPORTANTE.map((rol) => (
              <option key={rol.value} value={rol.value}>
                {rol.label}
              </option>
            ))}
          </select>
        </label>

        <label className="reportes-campo">
          <span>Reportado por</span>
          <div className="reportes-campo__control">
            <ReporteIcon nombre="persona" size={17} />
            <input
              type="search"
              value={filtros.responsable}
              onChange={actualizar('responsable')}
              placeholder="Nombre o código..."
              autoComplete="off"
            />
          </div>
        </label>

        <div className="reportes-filtros__acciones">
          <button type="button" className="reportes-boton reportes-boton--secundario" onClick={onLimpiar} disabled={cargando}>
            Limpiar
          </button>
          <button type="submit" className="reportes-boton reportes-boton--primario" disabled={cargando}>
            <ReporteIcon nombre="buscar" size={17} />
            Buscar
          </button>
        </div>
      </div>
    </form>
  )
}
