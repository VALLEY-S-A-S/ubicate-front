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
      className="espacio-detalle"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className="espacio-detalle__contenido"
        role="dialog"
        aria-modal="true"
        aria-labelledby="espacio-detalle-titulo"
      >
        <header className="espacio-detalle__cabecera">
          <div>
            <p className="espacio-detalle__codigo">{espacio.codigo}</p>
            <h3 id="espacio-detalle-titulo">{espacio.nombre}</h3>
          </div>
          <button
            type="button"
            className="espacio-detalle__cerrar"
            onClick={onClose}
            aria-label="Cerrar información del espacio"
          >
            ×
          </button>
        </header>

        <dl className="espacio-detalle__datos">
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

        <section className="espacio-detalle__ocupaciones">
          <h4>Asignaciones</h4>
          {ocupaciones.length === 0 ? (
            <p>No hay asignaciones registradas para este espacio.</p>
          ) : (
            <ul>
              {ocupaciones.map((ocupacion) => (
                <li key={ocupacion.id}>
                  <span className="espacio-detalle__dia">
                    {nombreDia(ocupacion.diaSemana, dias)}
                  </span>
                  <span className="espacio-detalle__hora">
                    {formatearHora(ocupacion.horaInicio)} -{' '}
                    {formatearHora(ocupacion.horaFin)}
                  </span>
                  <span className="espacio-detalle__titulo">
                    {ocupacion.titulo ?? 'Asignación'}
                  </span>
                  {ocupacion.docenteNombre && (
                    <span className="espacio-detalle__docente">
                      {ocupacion.docenteNombre}
                    </span>
                  )}
                  {(ocupacion.asignaturaCodigo || ocupacion.grupoCodigo) && (
                    <span className="espacio-detalle__meta">
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

        <div className="espacio-detalle__acciones">
          <button type="button" className="espacio-detalle__boton" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
