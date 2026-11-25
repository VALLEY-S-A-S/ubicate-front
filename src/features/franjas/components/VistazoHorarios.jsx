import { useEffect, useState } from 'react'
import { listarHorariosCargados } from '../services/franjasImportApi.js'

const COLUMNAS = [
  ['dia', 'DÍA'],
  ['hora', 'HORA'],
  ['asignatura', 'ASIGNATURA'],
  ['grupo', 'GR'],
  ['docente', 'DOCENTE'],
  ['salon', 'SALÓN'],
  ['sede', 'SEDE'],
]

const LIMITE = 8

function horaRango(inicio, fin) {
  const corta = (valor) => (typeof valor === 'string' ? valor.slice(0, 5) : valor)
  if (!inicio) return '—'
  const desde = corta(inicio)
  return fin ? `${desde} - ${corta(fin)}` : desde
}

// Vistazo de las clases ya importadas al backend. No lee el archivo elegido:
// consulta el horario general del periodo vigente para que el administrador vea
// qué quedó cargado antes de subir otro libro. El padre lo remonta con una key
// nueva después de cada importación para volver a consultar.
export default function VistazoHorarios() {
  const [clases, setClases] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    let vigente = true

    listarHorariosCargados(LIMITE, controlador.signal)
      .then((respuesta) => {
        if (!vigente || controlador.signal.aborted) return
        setClases(respuesta?.contenido ?? [])
        setEstado('listo')
        setMensaje(respuesta?.mensaje ?? '')
      })
      .catch((error) => {
        if (!vigente || controlador.signal.aborted || error.name === 'AbortError') return
        setClases([])
        setEstado('error')
        setMensaje(error.message || 'No se pudo cargar el horario del periodo vigente.')
      })

    return () => {
      vigente = false
      controlador.abort()
    }
  }, [])

  return (
    <section className="horarios-card horarios-vistazo" aria-labelledby="vistazo-title">
      <h2 id="vistazo-title">Horarios cargados</h2>
      <p>
        Vistazo de las primeras clases ya importadas al sistema en el periodo
        vigente. Verifica que se vean correctamente antes de cargar otro archivo.
      </p>

      {estado === 'cargando' && (
        <p className="horarios-vistazo__estado" role="status">
          Cargando horarios…
        </p>
      )}

      {estado === 'error' && (
        <p className="horarios-vistazo__estado horarios-vistazo__estado--error" role="alert">
          {mensaje}
        </p>
      )}

      {estado === 'listo' && clases.length === 0 && (
        <p className="horarios-vistazo__estado" role="status">
          {mensaje || 'Aún no hay horarios cargados para el periodo vigente.'}
        </p>
      )}

      {estado === 'listo' && clases.length > 0 && (
        <div className="horarios-table-wrap horarios-vistazo__tabla">
          <table>
            <caption className="sr-only">
              Primeras clases cargadas del periodo vigente
            </caption>
            <thead>
              <tr>
                {COLUMNAS.map(([, etiqueta]) => (
                  <th key={etiqueta} scope="col">
                    {etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clases.map((clase, index) => (
                <tr key={`${clase.grupoId ?? 'clase'}-${index}`}>
                  <td>{clase.diaNombre ?? '—'}</td>
                  <td>{horaRango(clase.horaInicio, clase.horaFin)}</td>
                  <td>
                    {clase.asignatura ?? '—'}
                    {clase.asignaturaCodigo ? (
                      <span className="horarios-vistazo__codigo">
                        {' '}
                        ({clase.asignaturaCodigo})
                      </span>
                    ) : null}
                  </td>
                  <td>{clase.grupo ?? clase.codigoGrupo ?? '—'}</td>
                  <td>{clase.docente ?? '—'}</td>
                  <td>{clase.salon ?? 'Sin salón'}</td>
                  <td>{clase.sede ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
