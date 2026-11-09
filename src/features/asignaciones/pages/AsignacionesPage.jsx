/**
 * lady vidal - HU-06: página de asignaciones. Permite consultar las franjas
 * pendientes, arrastrarlas al horario, devolverlas al panel izquierdo y
 * guardar todos los cambios en una sola operación.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import EspacioDetalle from '../components/EspacioDetalle'
import FiltrosHorario from '../components/FiltrosHorario'
import FranjaDetalle from '../components/FranjaDetalle'
import FranjasPanel from '../components/FranjasPanel'
import HorarioGrid from '../components/HorarioGrid'
import {
  guardarAsignaciones,
  listarBloquesHorario,
  listarPisosHorario,
  obtenerFranjasPendientes,
  obtenerHorario,
} from '../services/asignacionesApi'
import { listarTiposEspacio } from '../../espacios/services/espaciosApi'
import {
  aplicarCambiosHorario,
  crearOcupacionLocal,
  formatearFecha,
  franjaDesdeOcupacion,
  minutosDeHora,
  puedeAsignarFranja,
  tieneFiltros,
  tieneFiltrosFranjas,
} from '../utils/horario.js'
import '../styles/asignaciones.css'

const FILTROS_INICIALES = {
  q: '',
  docente: '',
  asignatura: '',
  tipoEspacioId: '',
  bloqueId: '',
  pisoId: '',
}

const FILTROS_FRANJAS_INICIALES = {
  docente: '',
  asignatura: '',
  grupo: '',
  programa: '',
  diaSemana: '',
  horaInicio: '',
  horaFin: '',
}

export default function AsignacionesPage({ token, sedeId, onLogout }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [filtrosFranjas, setFiltrosFranjas] = useState(FILTROS_FRANJAS_INICIALES)
  const [tipos, setTipos] = useState([])
  const [bloques, setBloques] = useState([])
  const [pisos, setPisos] = useState([])
  const [catalogError, setCatalogError] = useState('')
  const [horario, setHorario] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [franjaDetalle, setFranjaDetalle] = useState(null)
  const [pendientes, setPendientes] = useState({ franjas: [], mensaje: null })
  const [pendientesStatus, setPendientesStatus] = useState('loading')
  const [pendientesError, setPendientesError] = useState('')
  const [pendientesReload, setPendientesReload] = useState(0)
  const [franjaArrastrada, setFranjaArrastrada] = useState(null)
  const [asignacionesNuevas, setAsignacionesNuevas] = useState(() => new Map())
  const [eliminadas, setEliminadas] = useState(() => new Set())
  const [devoluciones, setDevoluciones] = useState(() => new Map())
  const [guardando, setGuardando] = useState(false)
  const [guardarError, setGuardarError] = useState('')
  // Se conserva la referencia para no repetir la consulta si el padre cambia.
  const logoutRef = useRef(onLogout)

  useEffect(() => {
    logoutRef.current = onLogout
  }, [onLogout])

  // lady vidal - HU-06: catálogos que alimentan los filtros combinables.
  useEffect(() => {
    let cancelled = false

    listarTiposEspacio(token)
      .then((data) => {
        if (!cancelled) setTipos(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setCatalogError('No se pudieron cargar todos los filtros.')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    let cancelled = false

    listarBloquesHorario(sedeId, token)
      .then((data) => {
        if (!cancelled) {
          setBloques(Array.isArray(data) ? data : [])
          setCatalogError('')
        }
      })
      .catch((failure) => {
        // Un 404 aquí significa que la sede no tiene bloques registrados.
        if (!cancelled && failure.status !== 404) {
          setCatalogError('No se pudieron cargar todos los filtros.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [sedeId, token])

  // Los pisos dependen del bloque elegido.
  useEffect(() => {
    if (!filtros.bloqueId) return undefined

    let cancelled = false

    listarPisosHorario(filtros.bloqueId, token)
      .then((data) => {
        if (!cancelled) setPisos(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setCatalogError('No se pudieron cargar todos los filtros.')
      })

    return () => {
      cancelled = true
    }
  }, [filtros.bloqueId, token])

  // lady vidal - HU-06: al aplicar o modificar filtros se actualiza el horario.
  // Se espera un instante para no consultar en cada tecla.
  useEffect(() => {
    if (!token) return undefined

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setStatus((actual) => (actual === 'ready' ? 'updating' : 'loading'))
      setError(null)

      try {
        const data = await obtenerHorario(
          { sedeId, ...filtros },
          token,
          controller.signal,
        )
        if (controller.signal.aborted) return

        setHorario(data)
        setStatus('ready')
        setDiaSeleccionado((actual) => {
          const dias = Array.isArray(data?.dias) ? data.dias : []
          return dias.some((dia) => dia.diaSemana === actual)
            ? actual
            : (dias[0]?.diaSemana ?? null)
        })
      } catch (failure) {
        if (controller.signal.aborted || failure.name === 'AbortError') return

        if (failure.status === 401) {
          logoutRef.current?.()
          return
        }

        // Sede o filtro inexistente / sede sin espacios: se informa ausencia
        // de resultados en lugar de bloquear la vista.
        if (failure.status === 404) {
          setHorario({
            dias: [],
            franjas: [],
            espacios: [],
            mensaje:
              failure.message ||
              'No existen espacios que cumplan con los criterios seleccionados.',
          })
          setStatus('ready')
          return
        }

        setError({
          message:
            failure.status === 403
              ? 'No tienes permiso para consultar el horario.'
              : 'No se pudo cargar el horario. Inténtalo de nuevo.',
          retryable: failure.status !== 403,
        })
        setStatus('error')
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [token, sedeId, filtros, reload])

  // Las franjas pendientes tienen sus propios filtros y se actualizan aparte
  // del horario de espacios.
  useEffect(() => {
    if (!token) return undefined

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setPendientesStatus((actual) => (actual === 'ready' ? 'updating' : 'loading'))
      setPendientesError('')

      try {
        const data = await obtenerFranjasPendientes(
          filtrosFranjas,
          token,
          controller.signal,
        )
        if (controller.signal.aborted) return
        setPendientes(data ?? { franjas: [], mensaje: null })
        setPendientesStatus('ready')
      } catch (failure) {
        if (controller.signal.aborted || failure.name === 'AbortError') return

        if (failure.status === 401) {
          logoutRef.current?.()
          return
        }

        setPendientesError(
          failure.status === 403
            ? 'No tienes permiso para consultar las franjas pendientes.'
            : failure.message || 'No se pudieron cargar las franjas pendientes.',
        )
        setPendientesStatus('error')
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [token, filtrosFranjas, pendientesReload])

  const horarioVista = useMemo(
    () => aplicarCambiosHorario(
      horario,
      [...asignacionesNuevas.values()],
      eliminadas,
    ),
    [horario, asignacionesNuevas, eliminadas],
  )

  const franjasVista = useMemo(() => {
    const mapa = new Map(
      (pendientes.franjas ?? []).map((franja) => [Number(franja.id), franja]),
    )

    for (const franjaId of asignacionesNuevas.keys()) {
      mapa.delete(Number(franjaId))
    }
    for (const [franjaId, franja] of devoluciones) {
      mapa.set(Number(franjaId), franja)
    }

    return [...mapa.values()].sort((a, b) => {
      const dia = Number(a.diaSemana) - Number(b.diaSemana)
      if (dia !== 0) return dia
      return String(a.horaInicio).localeCompare(String(b.horaInicio))
    })
  }, [pendientes, asignacionesNuevas, devoluciones])

  const hayFiltros = tieneFiltros(filtros)
  const hayFiltrosFranjas = tieneFiltrosFranjas(filtrosFranjas)
  const hayCambios = asignacionesNuevas.size > 0 || eliminadas.size > 0
  const mostrarHorario = Boolean(horarioVista) && (status === 'ready' || status === 'updating')

  function actualizarFiltro(campo, valor) {
    setFiltros((actual) => {
      const siguiente = { ...actual, [campo]: valor }
      // Al cambiar de bloque el piso anterior deja de ser válido.
      if (campo === 'bloqueId') siguiente.pisoId = ''
      return siguiente
    })
  }

  function actualizarFiltroFranja(campo, valor) {
    setFiltrosFranjas((actual) => ({ ...actual, [campo]: valor }))
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    setPisos([])
    setDetalle(null)
  }

  function limpiarFiltrosFranjas() {
    setFiltrosFranjas(FILTROS_FRANJAS_INICIALES)
  }

  function arrastrarFranja(franja) {
    setFranjaArrastrada(franja)
    setDiaSeleccionado(Number(franja.diaSemana))
  }

  function terminarArrastre() {
    setFranjaArrastrada(null)
  }

  function puedeSoltarEn(espacio, franjaCelda) {
    if (!franjaArrastrada || !franjaCelda) return false

    const celdaInicio = minutosDeHora(franjaCelda.horaInicio)
    const inicio = minutosDeHora(franjaArrastrada.horaInicio)
    const fin = minutosDeHora(franjaArrastrada.horaFin)

    if (celdaInicio == null || inicio == null || fin == null) return false
    if (celdaInicio < inicio || celdaInicio >= fin) return false

    return puedeAsignarFranja(
      espacio,
      franjaArrastrada,
      diaSeleccionado,
      horarioVista?.franjas ?? [],
    )
  }

  function asignarFranja(espacio, franja, horaCelda) {
    if (!franja || !espacio || !puedeSoltarEn(espacio, { horaInicio: horaCelda })) {
      return
    }

    const ocupacion = crearOcupacionLocal(franja, espacio.id)
    const franjaId = Number(franja.id)

    setAsignacionesNuevas((actual) => {
      const siguiente = new Map(actual)
      siguiente.set(franjaId, { franja, espacioId: espacio.id, ocupacion })
      return siguiente
    })
    setDevoluciones((actual) => {
      const siguiente = new Map(actual)
      siguiente.delete(franjaId)
      return siguiente
    })
    setDiaSeleccionado(Number(franja.diaSemana))
    setFranjaArrastrada(null)
  }

  function devolverAsignacion(evento) {
    if (!evento) return

    const franja = franjaDesdeOcupacion(evento, horarioVista?.dias ?? horario?.dias ?? [])
    if (!franja) return

    const franjaId = Number(franja.id)

    setAsignacionesNuevas((actual) => {
      const siguiente = new Map(actual)
      siguiente.delete(franjaId)
      return siguiente
    })

    if (!String(evento.id).startsWith('tmp-')) {
      setEliminadas((actual) => new Set(actual).add(evento.id))
    }

    setDevoluciones((actual) => {
      const siguiente = new Map(actual)
      siguiente.set(franjaId, franja)
      return siguiente
    })

    // Si había filtros activos, la tarjeta podría quedar oculta al volver.
    if (hayFiltrosFranjas) setFiltrosFranjas(FILTROS_FRANJAS_INICIALES)
    setFranjaArrastrada(null)
  }

  async function guardarCambios() {
    if (!hayCambios || guardando) return

    setGuardando(true)
    setGuardarError('')

    try {
      await guardarAsignaciones({
        crear: [...asignacionesNuevas.values()].map((cambio) => ({
          franjaId: Number(cambio.franja.id),
          espacioId: Number(cambio.espacioId),
        })),
        eliminar: [...eliminadas],
      }, token)

      setAsignacionesNuevas(new Map())
      setEliminadas(new Set())
      setDevoluciones(new Map())
      setReload((valor) => valor + 1)
      setPendientesReload((valor) => valor + 1)
    } catch (failure) {
      if (failure.status === 401) {
        logoutRef.current?.()
        return
      }
      setGuardarError(
        failure.message || 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="asignaciones">
      <header className="asignaciones__cabecera">
        <div>
          <h2 className="asignaciones__titulo">Asignaciones</h2>
          <p className="asignaciones__subtitulo">
            Asigna los espacios a los respectivos docentes acorde a los horarios
            designados por secretaría académica
          </p>
        </div>
        <div className="asignaciones__acciones">
          <button
            type="button"
            className="asignaciones__boton"
            disabled
            title="Disponible próximamente"
          >
            Importar
          </button>
          <button
            type="button"
            className="asignaciones__boton"
            disabled={!hayCambios || guardando}
            onClick={guardarCambios}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </header>

      {guardarError && (
        <p className="asignaciones__aviso asignaciones__aviso--error" role="alert">
          {guardarError}
        </p>
      )}

      <div className="asignaciones__layout">
        <FranjasPanel
          franjas={franjasVista}
          filtros={filtrosFranjas}
          onChange={actualizarFiltroFranja}
          onClear={limpiarFiltrosFranjas}
          onSeleccionar={setFranjaDetalle}
          cargando={pendientesStatus === 'loading'}
          mensaje={pendientes.mensaje}
          error={pendientesError}
          onArrastrar={arrastrarFranja}
          onDragEnd={terminarArrastre}
          onDevolverAsignacion={devolverAsignacion}
        />

        <div className="asignaciones__contenido">
          <FiltrosHorario
            filtros={filtros}
            tipos={tipos}
            bloques={bloques}
            pisos={pisos}
            onChange={actualizarFiltro}
            onClear={limpiarFiltros}
            disabled={status === 'loading'}
            hayFiltros={hayFiltros}
            catalogError={catalogError}
          />

          {status === 'updating' && (
            <p className="asignaciones__actualizando" role="status">
              Actualizando horario…
            </p>
          )}

          {status === 'loading' && (
            <p className="asignaciones__estado">Cargando horario…</p>
          )}

          {status === 'error' && (
            <div className="asignaciones__estado asignaciones__estado--error" role="alert">
              <p>{error?.message}</p>
              {error?.retryable && (
                <button
                  type="button"
                  className="asignaciones__reintentar"
                  onClick={() => setReload((valor) => valor + 1)}
                >
                  Reintentar
                </button>
              )}
            </div>
          )}

          {mostrarHorario && (
            <>
              <HorarioGrid
                horario={horarioVista}
                diaSeleccionado={diaSeleccionado}
                onDiaChange={setDiaSeleccionado}
                onVerEspacio={setDetalle}
                franjaArrastrada={franjaArrastrada}
                puedeSoltarEn={puedeSoltarEn}
                onAsignarFranja={asignarFranja}
                onDragEnd={terminarArrastre}
              />

              {horarioVista?.fechaInicioSemana && (
                <p className="asignaciones__semana">
                  Semana del {formatearFecha(horarioVista.fechaInicioSemana)} al{' '}
                  {formatearFecha(horarioVista.fechaFinSemana)}
                  {horarioVista.sedeNombre ? ` · ${horarioVista.sedeNombre}` : ''}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <EspacioDetalle
        espacio={detalle}
        dias={horarioVista?.dias}
        onClose={() => setDetalle(null)}
      />

      <FranjaDetalle
        franja={franjaDetalle}
        onClose={() => setFranjaDetalle(null)}
      />
    </section>
  )
}
