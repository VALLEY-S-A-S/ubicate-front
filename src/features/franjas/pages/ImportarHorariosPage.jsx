import { useEffect, useRef, useState } from 'react'
import { descargarPlantilla, importarFranjas, validarArchivoFranjas } from '../services/franjasImportApi.js'
import ImportarHorariosIlustracion from '../components/ImportarHorariosIlustracion.jsx'
import VistazoHorarios from '../components/VistazoHorarios.jsx'
import '../styles/importarHorarios.css'

function formatoTamano(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImportarHorariosPage({ token }) {
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState([])
  const [resultado, setResultado] = useState(null)
  const [busy, setBusy] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const [vistazoRevision, setVistazoRevision] = useState(0)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const action = useRef(false)
  const input = useRef(null)

  async function ejecutar(tipo, operation) {
    if (action.current) return
    action.current = true
    setBusy(tipo)
    setError('')
    setErrores([])
    try {
      await operation()
    } catch (failure) {
      if (!mounted.current) return
      if (Array.isArray(failure.data?.errors)) setErrores(failure.data.errors)
      setError(
        failure.status === 401
          ? 'Tu sesión expiró. Vuelve a iniciar sesión para importar.'
          : failure.message || 'Ocurrió un error al cargar las franjas en el sistema',
      )
    } finally {
      action.current = false
      if (mounted.current) setBusy('')
    }
  }

  async function descargar() {
    await ejecutar('plantilla', async () => {
      const blob = await descargarPlantilla(token)
      if (!mounted.current) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla-franjas.xlsx'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }

  function aceptarArchivo(siguiente) {
    const invalido = validarArchivoFranjas(siguiente)
    if (invalido) {
      setArchivo(null)
      setError(invalido)
      setErrores([])
      return
    }
    setArchivo(siguiente)
    setError('')
    setErrores([])
  }

  function cambiarArchivo(event) {
    aceptarArchivo(event.target.files?.[0] ?? null)
  }

  function arrastrar(event) {
    event.preventDefault()
    if (busy) return
    if (event.dataTransfer?.types?.includes('Files')) setArrastrando(true)
  }

  function soltar(event) {
    event.preventDefault()
    setArrastrando(false)
    if (busy) return
    const siguiente = event.dataTransfer?.files?.[0]
    if (siguiente) {
      aceptarArchivo(siguiente)
      if (input.current) {
        try {
          const dt = new DataTransfer()
          dt.items.add(siguiente)
          input.current.files = dt.files
        } catch {
          // Firefox antiguos no exponen DataTransfer: el estado en memoria
          // sigue siendo válido para importar.
        }
      }
    }
  }

  function quitarArchivo() {
    setArchivo(null)
    setError('')
    setErrores([])
    if (input.current) input.current.value = ''
  }

  async function cargar(event) {
    event.preventDefault()
    const invalido = validarArchivoFranjas(archivo)
    if (invalido) {
      setError(invalido)
      return
    }
    await ejecutar('importar', async () => {
      const creada = await importarFranjas(archivo, token)
      if (!mounted.current) return
      setResultado(creada ?? {})
      setArchivo(null)
      if (input.current) input.current.value = ''
      setVistazoRevision((valor) => valor + 1)
    })
  }

  const conteos = [
    ['Grupos', 'totalGrupos'],
    ['Franjas', 'totalFranjas'],
    ['Con salón', 'conSalon'],
    ['Sin salón (pendientes)', 'sinSalon'],
    ['Virtuales', 'virtuales'],
    ['Filas omitidas', 'filasOmitidas'],
  ]

  const idAyuda = 'horarios-archivo-ayuda'
  const idError = 'horarios-archivo-error'

  return (
    <section className="horarios-page" aria-labelledby="horarios-title">
      <header className="horarios-encabezado">
        <p className="page-eyebrow">Gestión académica</p>
        <h1 id="horarios-title" tabIndex={-1}>
          Importar horarios
        </h1>
        <p className="horarios-subtitulo">
          Carga el archivo Excel de franjas académicas del periodo vigente. Las
          franjas con salón quedan asignadas; las demás aparecen en el panel de
          asignaciones.
        </p>
      </header>

      <form onSubmit={cargar} aria-busy={busy === 'importar'} noValidate>
        <section className="horarios-card horarios-carga" aria-labelledby="carga-title">
          <div className="horarios-carga__izq">
            <ImportarHorariosIlustracion className="horarios-ilustracion" />

            <button
              type="button"
              className="horarios-button horarios-button--secondary"
              disabled={Boolean(busy)}
              onClick={descargar}
            >
              <svg
                className="horarios-button__icono"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              {busy === 'plantilla' ? 'Descargando…' : 'Descargar plantilla Excel'}
            </button>

            <button
              type="submit"
              className="horarios-button"
              disabled={Boolean(busy) || !archivo}
            >
              <svg
                className="horarios-button__icono"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 21V9" />
                <path d="m7 14 5-5 5 5" />
                <path d="M5 3h14" />
              </svg>
              {busy === 'importar' ? 'Importando…' : 'Importar horarios'}
            </button>
          </div>

          <div className="horarios-carga__der">
            <h2 id="carga-title">Carga el archivo de horarios</h2>

            <input
              ref={input}
              id="horarios-archivo"
              className="horarios-archivo"
              type="file"
              accept=".xlsx"
              tabIndex={-1}
              aria-hidden="true"
              disabled={Boolean(busy)}
              onChange={cambiarArchivo}
            />

            <div
              className={`horarios-dropzone${arrastrando ? ' horarios-dropzone--activa' : ''}${
                archivo ? ' horarios-dropzone--con-archivo' : ''
              }${error ? ' horarios-dropzone--error' : ''}`}
              onDragOver={arrastrar}
              onDragEnter={arrastrar}
              onDragLeave={() => setArrastrando(false)}
              onDrop={soltar}
            >
              <button
                type="button"
                className="horarios-dropzone__zona"
                disabled={Boolean(busy)}
                aria-describedby={`${idAyuda}${error ? ` ${idError}` : ''}`}
                onClick={() => input.current?.click()}
              >
                <span className="horarios-dropzone__icono" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </span>

                {archivo ? (
                  <span className="horarios-dropzone__archivo">
                    <strong>{archivo.name}</strong>
                    <span className="horarios-dropzone__tamano">
                      {formatoTamano(archivo.size)}
                    </span>
                  </span>
                ) : (
                  <span className="horarios-dropzone__texto">
                    Arrastra y suelta aquí tu archivo Excel
                  </span>
                )}
              </button>

              {archivo && !busy && (
                <button
                  type="button"
                  className="horarios-dropzone__quitar"
                  onClick={quitarArchivo}
                >
                  Quitar archivo
                </button>
              )}
            </div>

            <div className="horarios-separador" aria-hidden="true">
              <span />
              <i>o</i>
              <span />
            </div>

            <button
              type="button"
              className="horarios-button horarios-button--primario"
              disabled={Boolean(busy)}
              onClick={() => input.current?.click()}
            >
              <svg
                className="horarios-button__icono"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Seleccionar archivo
            </button>

            <p className="horarios-ayuda" id={idAyuda}>
              Formatos permitidos: <strong>.xlsx</strong> | Tamaño máximo: 5 MB
            </p>

            {error && (
              <p className="horarios-error" id={idError} role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
      </form>

      {resultado && (
        <div role="status" className="horarios-message">
          <p>
            <strong>Horarios importados.</strong>
          </p>
          <dl className="horarios-counts">
            {conteos.map(([etiqueta, clave]) => (
              <div key={clave}>
                <dt>{etiqueta}</dt>
                <dd>{resultado[clave] ?? 0}</dd>
              </div>
            ))}
          </dl>
          <p>
            {resultado.sinSalon ?? 0} franja(s) sin salón quedaron pendientes de
            asignar en el panel de asignaciones.
          </p>
          {(resultado.detalleFilasOmitidas ?? []).length > 0 && (
            <p>
              Filas omitidas porque no pueden formar una clase (sin docente o con
              horario incoherente):{' '}
              {resultado.detalleFilasOmitidas.join(', ')}. Corrige esos renglones
              y vuelve a importar para incluirlos.
            </p>
          )}
          {(resultado.detalleColisiones ?? []).length > 0 && (
            <p>
              Clases cargadas sin salón porque el libro ya asignaba esa aula en
              ese día y horario (filas{' '}
              {resultado.detalleColisiones.join(', ')}). Resuélvelas en el panel
              de asignaciones.
            </p>
          )}
        </div>
      )}

      {errores.length > 0 && (
        <div className="horarios-table-wrap">
          <table>
            <caption>Errores del archivo: corrige las filas y vuelve a importar.</caption>
            <thead>
              <tr>
                <th>Fila</th>
                <th>Campo</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {errores.map((item, index) => (
                <tr key={index}>
                  <td>{item.fila === 0 || item.fila === 1 ? 'Archivo' : item.fila}</td>
                  <td>{item.campo}</td>
                  <td>{item.mensaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VistazoHorarios key={vistazoRevision} />
    </section>
  )
}
