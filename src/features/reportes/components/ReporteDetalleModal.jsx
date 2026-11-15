import { useEffect, useRef, useState } from 'react'
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

export default function ReporteDetalleModal({
  reporte,
  cargando,
  error,
  evidenciaUrl,
  evidenciaCargando,
  evidenciaError,
  puedeCompletar = false,
  completando = false,
  completarError = '',
  onCompletar,
  onCerrar,
  onReintentar,
}) {
  const cerrarRef = useRef(null)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()
    function alPresionar(event) {
      if (event.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = anterior
    }
  }, [onCerrar])

  if (!reporte) return null

  const visual = estiloAnomalia(reporte.tipoAnomaliaNombre)
  const puedeCerrarReporte = Boolean(
    puedeCompletar && onCompletar && claseEstado(reporte.estado) === 'pendiente' && !cargando && !error,
  )

  return (
    <div
      className="reportes-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reporte-detalle-titulo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar()
      }}
    >
      <div className="reportes-modal__panel">
        <header className="reportes-modal__cabecera">
          <div className="reportes-modal__marca">
            <span className="reportes-modal__escudo">U</span>
            <div>
              <strong>Ubícate Univalle</strong>
              <span>Detalle del reporte</span>
            </div>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            className="reportes-modal__cerrar"
            onClick={onCerrar}
            aria-label="Cerrar detalle del reporte"
          >
            <ReporteIcon nombre="cerrar" size={19} />
          </button>
        </header>

        <div className="reportes-modal__cuerpo">
          {error ? (
            <div className="reportes-alerta" role="alert">
              <ReporteIcon nombre="alerta" size={20} />
              <div>
                <strong>No se pudo cargar el detalle</strong>
                <p>{error}</p>
                <button type="button" className="reportes-boton reportes-boton--secundario" onClick={onReintentar}>
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="reportes-modal__banner" style={{ background: visual.fondo }}>
                <div className="reportes-modal__banner-icono" style={{ color: visual.color }}>
                  <ReporteIcon nombre={visual.icono} size={25} />
                </div>
                <div className="reportes-modal__banner-texto">
                  <span>Anomalía reportada</span>
                  <h2 id="reporte-detalle-titulo">{reporte.tipoAnomaliaNombre}</h2>
                  <p>
                    {formatoIdReporte(reporte.id)} · {formatoFecha(reporte.creadoEn)}
                  </p>
                </div>
                <span className={`reportes-estado reportes-estado--${claseEstado(reporte.estado)}`}>
                  <span className="reportes-estado__punto" />
                  {etiquetaEstado(reporte.estado)}
                </span>
              </div>

              {cargando && <p className="reportes-modal__cargando">Actualizando información del reporte...</p>}

              <div className="reportes-modal__grid">
                <section className="reportes-modal__dato">
                  <span className="reportes-modal__etiqueta">
                    <ReporteIcon nombre="edificio" size={16} />
                    Espacio
                  </span>
                  <strong>{reporte.espacioNombre || 'No registrado'}</strong>
                  <p>Código: {reporte.espacioCodigo || 'No registrado'}</p>
                  <p>{ubicacionReporte(reporte) || 'Ubicación no registrada'}</p>
                </section>

                <section className="reportes-modal__dato">
                  <span className="reportes-modal__etiqueta">
                    <ReporteIcon nombre="persona" size={16} />
                    Reportado por
                  </span>
                  <strong>{reporte.reportadoPorNombre || 'Dato restringido'}</strong>
                  <p>{etiquetaRol(reporte.reportadoPorRol)}</p>
                  {reporte.reportadoPorCorreo && <p>Correo: {reporte.reportadoPorCorreo}</p>}
                  {reporte.reportadoPorCodigoInstitucional && (
                    <p>Código: {reporte.reportadoPorCodigoInstitucional}</p>
                  )}
                  {reporte.reportadoPorPrograma && <p>Programa: {reporte.reportadoPorPrograma}</p>}
                </section>

                <section className="reportes-modal__dato">
                  <span className="reportes-modal__etiqueta">
                    <ReporteIcon nombre="monitor" size={16} />
                    Elemento afectado
                  </span>
                  <strong>{reporte.elementoNombre || 'No especificado'}</strong>
                  <p>{reporte.tipoAnomaliaNombre}</p>
                </section>

                <section className="reportes-modal__dato">
                  <span className="reportes-modal__etiqueta">
                    <ReporteIcon nombre="reloj" size={16} />
                    Fecha del reporte
                  </span>
                  <strong>{formatoFecha(reporte.creadoEn)}</strong>
                  <p>{reporte.sedeNombre || 'Sede principal'}</p>
                </section>

                <section className="reportes-modal__dato reportes-modal__dato--evidencia">
                  <span className="reportes-modal__etiqueta">
                    <ReporteIcon nombre="imagen" size={16} />
                    Evidencia
                  </span>
                  {reporte.tieneEvidencia ? (
                    <div className="reportes-evidencia">
                      {evidenciaUrl ? (
                        <img src={evidenciaUrl} alt="Evidencia fotográfica del reporte" />
                      ) : evidenciaError ? (
                        <p className="reportes-evidencia__error">{evidenciaError}</p>
                      ) : (
                        <p className="reportes-evidencia__cargando">
                          {evidenciaCargando ? 'Cargando evidencia...' : 'Preparando evidencia...'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="reportes-evidencia__vacia">Sin imagen adjunta</p>
                  )}
                </section>
              </div>

              <section className="reportes-modal__descripcion">
                <span className="reportes-modal__etiqueta">
                  <ReporteIcon nombre="reportes" size={16} />
                  Descripción
                </span>
                <p>{reporte.descripcion || 'El reporte no incluye una descripción adicional.'}</p>
              </section>

              {claseEstado(reporte.estado) === 'completado' && (
                <section className="reportes-modal__completado">
                  <ReporteIcon nombre="reloj" size={18} />
                  <div>
                    <strong>Reporte completado</strong>
                    <p>
                      {reporte.completadoPorNombre || 'Personal de atención'}
                      {reporte.completadoPorRol ? ` · ${etiquetaRol(reporte.completadoPorRol)}` : ''}
                    </p>
                    {reporte.completadoEn && <p>Fecha: {formatoFecha(reporte.completadoEn)}</p>}
                    {reporte.completadoPorCorreo && <p>Correo: {reporte.completadoPorCorreo}</p>}
                    {reporte.completadoPorCodigoInstitucional && (
                      <p>Código: {reporte.completadoPorCodigoInstitucional}</p>
                    )}
                    {reporte.completadoPorPrograma && <p>Programa: {reporte.completadoPorPrograma}</p>}
                  </div>
                </section>
              )}

              <div className="reportes-modal__aviso">
                <ReporteIcon nombre="info" size={18} />
                <p>
                  {puedeCerrarReporte
                    ? 'Puedes marcar este reporte como completado desde esta vista o desde la aplicación móvil.'
                    : 'Vista de solo lectura. La atención de reportes se realiza desde la aplicación móvil.'}
                </p>
              </div>
            </>
          )}
        </div>

        <footer className="reportes-modal__pie">
          {completarError && (
            <p className="reportes-modal__error" role="alert">
              {completarError}
            </p>
          )}
          {puedeCerrarReporte && confirmando ? (
            <>
              <span className="reportes-modal__pregunta">¿Confirmas que el reporte fue atendido?</span>
              <button
                type="button"
                className="reportes-boton reportes-boton--secundario"
                onClick={() => setConfirmando(false)}
                disabled={completando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="reportes-boton reportes-boton--primario"
                onClick={onCompletar}
                disabled={completando}
              >
                {completando ? 'Completando...' : 'Sí, completar'}
              </button>
            </>
          ) : (
            <>
              {puedeCerrarReporte && (
                <button
                  type="button"
                  className="reportes-boton reportes-boton--secundario"
                  onClick={() => setConfirmando(true)}
                  disabled={completando}
                >
                  Completar reporte
                </button>
              )}
              <button type="button" className="reportes-boton reportes-boton--primario" onClick={onCerrar}>
                Cerrar
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
