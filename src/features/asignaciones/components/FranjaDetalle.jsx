import { colorDocente } from '../utils/horario.js'

export default function FranjaDetalle({ franja, onClose }) {
  if (!franja) return null

  return (
    <div className="franja-detalle" role="dialog" aria-modal="true" aria-label="Detalle de la franja">
      <div className="franja-detalle__contenido">
        <div className="franja-detalle__cabecera">
          <div>
            <p className="franja-detalle__estado">Pendiente de asignación</p>
            <h3>{franja.asignaturaNombre ?? 'Franja académica'}</h3>
          </div>
          <button
            type="button"
            className="franja-detalle__cerrar"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            ×
          </button>
        </div>

        <dl className="franja-detalle__datos">
          <div>
            <dt>Docente</dt>
            <dd>{franja.docenteNombre ?? 'Sin docente'}</dd>
          </div>
          <div>
            <dt>Asignatura</dt>
            <dd>
              {franja.asignaturaNombre ?? 'Sin asignatura'}
              {franja.asignaturaCodigo ? ` (${franja.asignaturaCodigo})` : ''}
            </dd>
          </div>
          <div>
            <dt>Grupo</dt>
            <dd>{franja.grupoCodigo ?? 'Sin grupo'}</dd>
          </div>
          <div>
            <dt>Programa</dt>
            <dd>{franja.programaNombre ?? 'Sin programa'}</dd>
          </div>
          <div>
            <dt>Día</dt>
            <dd>{franja.diaNombre ?? 'Sin día'}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{franja.etiqueta ?? 'Sin horario'}</dd>
          </div>
        </dl>

        <div className="franja-detalle__acciones">
          <span
            className="franja-detalle__color"
            style={{ background: colorDocente(franja.docenteNombre) }}
          />
          <button type="button" className="franja-detalle__boton" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
