/**
 * lady vidal - HU-06: consulta de la información del espacio desde su fila
 * del horario. No existe GET /api/espacios/{id}; se usa la fila devuelta.
 */
import { useEffect } from 'react'
import { formatearHora, nombreDia } from '../utils/horario.js'

export default function EspacioDetalle({ espacio, dias, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!espacio) return null

  const ocupaciones = [...(espacio.ocupaciones ?? [])].sort(
    (a, b) =>
      Number(a.diaSemana) - Number(b.diaSemana) ||
      String(a.horaInicio).localeCompare(String(b.horaInicio)),
  )

  return (
    <div
      className="horario-detalle"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className="horario-detalle__contenido"
        role="dialog"
        aria-modal="true"
        aria-labelledby="horario-detalle-titulo"
      >
        <header className="horario-detalle__cabecera">
          <div>
            <p className="horario-detalle__codigo">{espacio.codigo}</p>
            <h3 id="horario-detalle-titulo">{espacio.nombre}</h3>
          </div>
          <button
            type="button"
            className="horario-detalle__cerrar"
            onClick={onClose}
            aria-label="Cerrar información del espacio"
          >
            ×
          </button>
        </header>

        <dl className="horario-detalle__datos">
          <div>
            <dt>Tipo</dt>
            <dd>{espacio.tipoEspacioNombre ?? 'Sin tipo'}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{espacio.estado === 'DESHABILITADO' ? 'Deshabilitado' : 'Disponible'}</dd>
          </div>
          <div>
            <dt>Bloque</dt>
            <dd>{espacio.bloqueNombre ?? 'Sin bloque'}</dd>
          </div>
          <div>
            <dt>Piso</dt>
            <dd>{espacio.pisoNumero != null ? `Piso ${espacio.pisoNumero}` : 'Sin piso'}</dd>
          </div>
        </dl>

        <section className="horario-detalle__ocupaciones">
          <h4>Asignaciones</h4>
          {ocupaciones.length === 0 ? (
            <p>No hay asignaciones registradas para este espacio.</p>
          ) : (
            <ul>
              {ocupaciones.map((ocupacion) => (
                <li key={ocupacion.id}>
                  <span className="horario-detalle__dia">
                    {nombreDia(ocupacion.diaSemana, dias)}
                  </span>
                  <span className="horario-detalle__hora">
                    {formatearHora(ocupacion.horaInicio)} -{' '}
                    {formatearHora(ocupacion.horaFin)}
                  </span>
                  <span className="horario-detalle__titulo">
                    {ocupacion.titulo ?? 'Asignación'}
                  </span>
                  {ocupacion.docenteNombre && (
                    <span className="horario-detalle__docente">
                      {ocupacion.docenteNombre}
                    </span>
                  )}
                  {(ocupacion.asignaturaCodigo || ocupacion.grupoCodigo) && (
                    <span className="horario-detalle__meta">
                      {[ocupacion.asignaturaCodigo, ocupacion.grupoCodigo]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="horario-detalle__acciones">
          <button type="button" className="horario-detalle__boton" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
