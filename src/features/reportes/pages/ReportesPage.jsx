import { useCallback, useEffect, useRef, useState } from 'react'
import ReporteDetalleModal from '../components/ReporteDetalleModal.jsx'
import ReportesFiltros from '../components/ReportesFiltros.jsx'
import ReportesTabla from '../components/ReportesTabla.jsx'
import { ReporteIcon } from '../components/reportesIconos.jsx'
import { isAdminRole } from '../../auth/services/authApi.js'
import {
  completarReporte,
  listarBloques,
  listarEspacios,
  listarPisos,
  listarReportes,
  listarTiposAnomalia,
  obtenerEvidencia,
  obtenerReporte,
} from '../services/reportesApi.js'
import { FILTROS_VACIOS } from '../utils/reportes.js'
import '../styles/reportes.css'

const TAMANO = 20
const PAGINA_VACIA = { content: [], totalElements: 0, totalPages: 0, page: 0 }

export default function ReportesPage({ token, sedeId, rol }) {
  const puedeCompletar = isAdminRole(rol)
  const [filtros, setFiltros] = useState({ ...FILTROS_VACIOS })
  const [aplicados, setAplicados] = useState({ ...FILTROS_VACIOS })
  const [pagina, setPagina] = useState(0)
  const [datos, setDatos] = useState(PAGINA_VACIA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [tipos, setTipos] = useState([])
  const [bloques, setBloques] = useState([])
  const [pisos, setPisos] = useState([])
  const [espacios, setEspacios] = useState([])
  const [cargandoBloques, setCargandoBloques] = useState(true)
  const [cargandoPisos, setCargandoPisos] = useState(false)
  const [cargandoEspacios, setCargandoEspacios] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [detalleCargando, setDetalleCargando] = useState(false)
  const [detalleError, setDetalleError] = useState('')
  const [completando, setCompletando] = useState(false)
  const [completarError, setCompletarError] = useState('')
  const [evidenciaUrl, setEvidenciaUrl] = useState(null)
  const [evidenciaCargando, setEvidenciaCargando] = useState(false)
  const [evidenciaError, setEvidenciaError] = useState('')
  const detalleAbortRef = useRef(null)
  const evidenciaAbortRef = useRef(null)
  const urlEvidenciaRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    listarTiposAnomalia(token, controller.signal)
      .then((respuesta) => setTipos(Array.isArray(respuesta) ? respuesta : []))
      .catch((fallo) => {
        if (fallo.name !== 'AbortError') setTipos([])
      })
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    setCargandoBloques(true)
    listarBloques(sedeId, token, controller.signal)
      .then((respuesta) => setBloques(Array.isArray(respuesta) ? respuesta : []))
      .catch((fallo) => {
        if (fallo.name !== 'AbortError') setBloques([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoBloques(false)
      })
    return () => controller.abort()
  }, [sedeId, token])

  useEffect(() => {
    const controller = new AbortController()
    setPisos([])
    setCargandoPisos(true)
    listarPisos(filtros.bloqueId, sedeId, token, controller.signal)
      .then((respuesta) => setPisos(Array.isArray(respuesta) ? respuesta : []))
      .catch((fallo) => {
        if (fallo.name !== 'AbortError') setPisos([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoPisos(false)
      })
    return () => controller.abort()
  }, [filtros.bloqueId, sedeId, token])

  useEffect(() => {
    const controller = new AbortController()
    setEspacios([])
    setCargandoEspacios(true)
    listarEspacios({ sedeId, bloqueId: filtros.bloqueId, pisoId: filtros.pisoId }, token, controller.signal)
      .then((respuesta) => setEspacios(Array.isArray(respuesta?.content) ? respuesta.content : []))
      .catch((fallo) => {
        if (fallo.name !== 'AbortError') setEspacios([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoEspacios(false)
      })
    return () => controller.abort()
  }, [filtros.bloqueId, filtros.pisoId, sedeId, token])

  useEffect(() => {
    const controller = new AbortController()
    setCargando(true)
    setError('')
    listarReportes(aplicados, pagina, TAMANO, token, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setDatos({
          content: respuesta?.content ?? [],
          totalElements: respuesta?.totalElements ?? 0,
          totalPages: respuesta?.totalPages ?? 0,
          page: respuesta?.page ?? pagina,
        })
      })
      .catch((fallo) => {
        if (fallo.name === 'AbortError') return
        setError(fallo.message || 'No se pudo cargar el historial de reportes.')
        setDatos(PAGINA_VACIA)
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })
    return () => controller.abort()
  }, [aplicados, pagina, token, intento])

  const liberarEvidencia = useCallback(() => {
    if (urlEvidenciaRef.current) {
      URL.revokeObjectURL(urlEvidenciaRef.current)
      urlEvidenciaRef.current = null
    }
    setEvidenciaUrl(null)
  }, [])

  useEffect(() => () => {
    detalleAbortRef.current?.abort()
    evidenciaAbortRef.current?.abort()
    if (urlEvidenciaRef.current) URL.revokeObjectURL(urlEvidenciaRef.current)
  }, [])

  const cargarEvidencia = useCallback(async (id) => {
    evidenciaAbortRef.current?.abort()
    liberarEvidencia()
    const controller = new AbortController()
    evidenciaAbortRef.current = controller
    setEvidenciaCargando(true)
    setEvidenciaError('')
    try {
      const blob = await obtenerEvidencia(id, token, controller.signal)
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(blob)
      urlEvidenciaRef.current = url
      setEvidenciaUrl(url)
    } catch (fallo) {
      if (fallo.name !== 'AbortError') setEvidenciaError('No se pudo cargar la imagen de evidencia.')
    } finally {
      if (!controller.signal.aborted) setEvidenciaCargando(false)
    }
  }, [token, liberarEvidencia])

  const abrirDetalle = useCallback(async (reporte) => {
    detalleAbortRef.current?.abort()
    evidenciaAbortRef.current?.abort()
    liberarEvidencia()
    setDetalle(reporte)
    setDetalleCargando(true)
    setDetalleError('')
    setCompletarError('')
    setEvidenciaError('')
    setEvidenciaCargando(Boolean(reporte?.tieneEvidencia))
    const controller = new AbortController()
    detalleAbortRef.current = controller
    try {
      const completo = await obtenerReporte(reporte.id, token, controller.signal)
      if (controller.signal.aborted) return
      setDetalle(completo)
      if (completo?.tieneEvidencia) {
        await cargarEvidencia(completo.id)
      } else {
        setEvidenciaCargando(false)
      }
    } catch (fallo) {
      if (fallo.name !== 'AbortError') {
        setDetalleError(fallo.message || 'No se pudo cargar el detalle del reporte.')
        setEvidenciaCargando(false)
      }
    } finally {
      if (!controller.signal.aborted) setDetalleCargando(false)
    }
  }, [token, cargarEvidencia, liberarEvidencia])

  const cerrarDetalle = useCallback(() => {
    detalleAbortRef.current?.abort()
    evidenciaAbortRef.current?.abort()
    liberarEvidencia()
    setDetalle(null)
    setDetalleCargando(false)
    setDetalleError('')
    setCompletarError('')
    setEvidenciaCargando(false)
    setEvidenciaError('')
  }, [liberarEvidencia])

  const detalleId = detalle?.id
  const completarDetalle = useCallback(async () => {
    if (!detalleId || completando) return
    setCompletando(true)
    setCompletarError('')
    try {
      const actualizado = await completarReporte(detalleId, token)
      setDatos((previos) => ({
        ...previos,
        content: previos.content.map((reporte) =>
          reporte.id === actualizado.id ? { ...reporte, ...actualizado } : reporte,
        ),
      }))
      setIntento((valor) => valor + 1)
      await abrirDetalle(actualizado)
    } catch (fallo) {
      if (fallo.name !== 'AbortError') setCompletarError(fallo.message || 'No se pudo completar el reporte.')
    } finally {
      setCompletando(false)
    }
  }, [abrirDetalle, completando, detalleId, token])

  function buscar() {
    setAplicados({ ...filtros })
    setPagina(0)
  }

  function limpiar() {
    setFiltros({ ...FILTROS_VACIOS })
    setAplicados({ ...FILTROS_VACIOS })
    setPagina(0)
  }

  const totalPaginas = datos.totalPages ?? 0
  const totalElementos = datos.totalElements ?? 0
  const inicio = totalElementos === 0 ? 0 : pagina * TAMANO + 1
  const fin = Math.min((pagina + 1) * TAMANO, totalElementos)

  return (
    <section className="reportes-pagina">
      <header className="reportes-cabecera">
        <div>
          <h2>Gestión de reportes</h2>
          <p>
            Consulta el historial de anomalías de la sede, filtra por salón, bloque, piso, persona o fecha y revisa la
            evidencia adjunta.{puedeCompletar ? ' También puedes marcar reportes pendientes como completados.' : ''}
          </p>
        </div>
        <span className="reportes-cabecera__solo-lectura">
          <ReporteIcon nombre="info" size={16} />
          {puedeCompletar ? 'Historial y atención' : 'Solo lectura'}
        </span>
      </header>

      <ReportesFiltros
        filtros={filtros}
        tipos={tipos}
        bloques={bloques}
        pisos={pisos}
        espacios={espacios}
        cargando={cargando}
        cargandoBloques={cargandoBloques}
        cargandoPisos={cargandoPisos}
        cargandoEspacios={cargandoEspacios}
        onCambiar={setFiltros}
        onBuscar={buscar}
        onLimpiar={limpiar}
      />

      <div className="reportes-panel">
        <div className="reportes-panel__cabecera">
          <div>
            <h3>Historial de reportes</h3>
            <p>
              {totalElementos === 0 ? 'Sin resultados' : `${totalElementos} reporte${totalElementos === 1 ? '' : 's'} encontrado${totalElementos === 1 ? '' : 's'}`}
            </p>
          </div>
          {totalElementos > 0 && (
            <span className="reportes-panel__contador">
              {inicio}–{fin} de {totalElementos}
            </span>
          )}
        </div>

        {error ? (
          <div className="reportes-alerta" role="alert">
            <ReporteIcon nombre="alerta" size={20} />
            <div>
              <strong>No se pudo cargar el historial</strong>
              <p>{error}</p>
              <button type="button" className="reportes-boton reportes-boton--secundario" onClick={() => setIntento((valor) => valor + 1)}>
                Reintentar
              </button>
            </div>
          </div>
        ) : cargando ? (
          <div className="reportes-cargando" role="status" aria-live="polite">
            <span className="reportes-cargando__spinner" />
            <p>Cargando reportes...</p>
          </div>
        ) : (
          <ReportesTabla reportes={datos.content} onAbrir={abrirDetalle} onLimpiar={limpiar} />
        )}

        {!error && totalPaginas > 1 && (
          <nav className="reportes-paginacion" aria-label="Paginación de reportes">
            <button
              type="button"
              className="reportes-paginacion__boton"
              onClick={() => setPagina((valor) => Math.max(0, valor - 1))}
              disabled={pagina === 0 || cargando}
            >
              <ReporteIcon nombre="chevronIzquierda" size={17} />
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              type="button"
              className="reportes-paginacion__boton"
              onClick={() => setPagina((valor) => Math.min(totalPaginas - 1, valor + 1))}
              disabled={pagina >= totalPaginas - 1 || cargando}
            >
              Siguiente
              <ReporteIcon nombre="chevronDerecha" size={17} />
            </button>
          </nav>
        )}
      </div>

      {detalle && (
        <ReporteDetalleModal
          reporte={detalle}
          cargando={detalleCargando}
          error={detalleError}
          evidenciaUrl={evidenciaUrl}
          evidenciaCargando={evidenciaCargando}
          evidenciaError={evidenciaError}
          puedeCompletar={puedeCompletar}
          completando={completando}
          completarError={completarError}
          onCompletar={completarDetalle}
          onCerrar={cerrarDetalle}
          onReintentar={() => abrirDetalle(detalle)}
        />
      )}
    </section>
  )
}
