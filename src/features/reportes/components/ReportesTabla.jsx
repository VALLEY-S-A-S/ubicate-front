import { ReporteIcon } from './reportesIconos.jsx'
import {
  claseEstado,
  estiloAnomalia,
  etiquetaEstado,
  etiquetaRol,
  formatoFecha,
  formatoIdReporte,
  ubicacionReporte,
} from '../utils/reportes.js'

export default function ReportesTabla({ reportes, onAbrir, onLimpiar }) {
  if (!reportes.length) {
    return (
      <div className="reportes-vacio">
        <span className="reportes-vacio__icono">
          <ReporteIcon nombre="reportes" size={30} />
        </span>
        <h3>No se encontraron reportes</h3>
        <p>Prueba con otros filtros o limpia la búsqueda para ver todo el historial.</p>
        <button type="button" className="reportes-boton reportes-boton--secundario" onClick={onLimpiar}>
          Limpiar filtros
        </button>
      </div>
    )
  }

  return (
    <div className="reportes-tabla-contenedor">
      <table className="reportes-tabla">
        <caption className="reportes-solo-lectores">Historial de reportes de la sede</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Espacio</th>
            <th scope="col">Tipo de anomalía</th>
            <th scope="col">Reportado por</th>
            <th scope="col">Rol</th>
            <th scope="col">Fecha</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => {
            const visual = estiloAnomalia(reporte.tipoAnomaliaNombre)
            return (
              <tr
                key={reporte.id}
                className="reportes-tabla__fila"
                tabIndex={0}
                onClick={() => onAbrir(reporte)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onAbrir(reporte)
                  }
                }}
                aria-label={`Ver detalle del reporte ${formatoIdReporte(reporte.id)}`}
              >
                <td>
                  <span className="reportes-id">{formatoIdReporte(reporte.id)}</span>
                </td>
                <td>
                  <span className="reportes-espacio">{reporte.espacioNombre}</span>
                  <span className="reportes-espacio__detalle">{ubicacionReporte(reporte)}</span>
                </td>
                <td>
                  <span className="reportes-anomalia">
                    <span className="reportes-anomalia__punto" style={{ background: visual.color }} />
                    <span>{reporte.tipoAnomaliaNombre}</span>
                  </span>
                </td>
                <td>
                  <span className="reportes-responsable">{reporte.reportadoPorNombre}</span>
                  <span className="reportes-responsable__codigo">
                    {reporte.reportadoPorCodigoInstitucional || 'Sin código'}
                  </span>
                </td>
                <td>
                  <span className="reportes-rol">{etiquetaRol(reporte.reportadoPorRol)}</span>
                </td>
                <td>
                  <span className="reportes-fecha">{formatoFecha(reporte.creadoEn)}</span>
                </td>
                <td>
                  <span className={`reportes-estado reportes-estado--${claseEstado(reporte.estado)}`}>
                    <span className="reportes-estado__punto" />
                    {etiquetaEstado(reporte.estado)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
