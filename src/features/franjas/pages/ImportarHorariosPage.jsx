import { useEffect, useRef, useState } from 'react'
import { descargarPlantilla, importarFranjas, validarArchivoFranjas } from '../services/franjasImportApi.js'
import '../styles/importarHorarios.css'

export default function ImportarHorariosPage({ token }) {
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState([])
  const [resultado, setResultado] = useState(null)
  const [busy, setBusy] = useState('')
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
    })
  }

  const conteos = [
    ['Grupos', 'totalGrupos'],
    ['Franjas', 'totalFranjas'],
    ['Con salón', 'conSalon'],
    ['Sin salón (pendientes)', 'sinSalon'],
    ['Virtuales', 'virtuales'],
  ]

  return (
    <section className="horarios-page" aria-labelledby="horarios-title">
      <header>
        <p className="horarios-eyebrow">Gestión académica</p>
        <h1 id="horarios-title" tabIndex={-1}>
          Importar horarios
        </h1>
        <p>
          Carga el Excel de franjas académicas del periodo vigente. Las franjas
          con salón quedan asignadas; las demás aparecen en el panel de
          asignaciones.
        </p>
      </header>

      <div className="horarios-grid">
        <section className="horarios-card">
          <h2>1. Descarga la plantilla</h2>
          <p>
            Una hoja con las columnas{' '}
            <strong>
              SEDE, PLAN, JOR, SEM, CODIGO, CATALOGO ASIGNATURA - SRA, PAT, CUPO,
              SALA SIST, DOCENTE, DIA, INICIO, FINAL, FRN, SALON
            </strong>
            . Máximo 10.000 filas y 5 MiB.
          </p>
          <p>
            Jornada: DIU o NOC. Día: LUN a DOM. Horas en formato 12h (ej.
            2:00:00 PM). Franja: AM, PM o XC. PAT y SALA SIST: SI o NO. La
            importación es atómica: si una fila tiene errores no se carga ningún
            horario.
          </p>
          <button
            className="horarios-button horarios-button--secondary"
            disabled={Boolean(busy)}
            onClick={descargar}
          >
            {busy === 'plantilla' ? 'Descargando…' : 'Descargar plantilla Excel'}
          </button>
        </section>

        <section className="horarios-card">
          <h2>2. Sube el Excel</h2>
          <form onSubmit={cargar} aria-busy={busy === 'importar'}>
            <label htmlFor="horarios-archivo">Archivo Excel (.xlsx)</label>
            <input
              ref={input}
              id="horarios-archivo"
              type="file"
              accept=".xlsx"
              disabled={Boolean(busy)}
              onChange={(event) => {
                setArchivo(event.target.files?.[0] ?? null)
                setError('')
                setErrores([])
              }}
            />
            <p>
              Revisa los datos antes de enviarlos. Necesitas un periodo académico
              activo, los docentes ya creados y la sede registrada.
            </p>
            <button
              className="horarios-button"
              type="submit"
              disabled={Boolean(busy) || !archivo}
            >
              {busy === 'importar' ? 'Importando…' : 'Importar horarios'}
            </button>
          </form>
        </section>
      </div>

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
        </div>
      )}

      {error && (
        <p role="alert" className="horarios-error">
          {error}
        </p>
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
    </section>
  )
}
