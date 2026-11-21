/**
 * lady vidal - HU-06: utilidades puras para filtrar y consultar el horario
 * de asignaciones de los espacios del campus.
 *
 * Se mantienen sin dependencias de React para poder probarlas con node:test.
 */

const PALETA_DOCENTES = [
  '#a11c1f',
  '#b45309',
  '#15803d',
  '#0f766e',
  '#1d4ed8',
  '#7e22ce',
  '#be123c',
  '#c2410c',
]

const CLAVES_FILTRO = [
  'sedeId',
  'tipoEspacioId',
  'pisoId',
  'bloqueId',
  'q',
  'docente',
  'asignatura',
  'fecha',
  'horaInicio',
  'horaFin',
]

const CLAVES_FILTRO_FRANJAS = [
  'docente',
  'asignatura',
  'grupo',
  'programa',
  'diaSemana',
  'horaInicio',
  'horaFin',
]

const NOMBRES_DIA = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

// Convierte una hora ISO (HH:mm o HH:mm:ss) a minutos desde medianoche.
export function minutosDeHora(hora) {
  if (hora == null || hora === '') return null
  const [horas, minutos = '0'] = String(hora).split(':')
  const valorHoras = Number(horas)
  const valorMinutos = Number(minutos)
  if (!Number.isFinite(valorHoras) || !Number.isFinite(valorMinutos)) return null
  return valorHoras * 60 + valorMinutos
}

// Devuelve solo la parte HH:mm para mostrarla en la grilla.
export function formatearHora(hora) {
  if (hora == null || hora === '') return ''
  return String(hora).slice(0, 5)
}

// Formatea YYYY-MM-DD como DD/MM/YYYY sin depender de la zona horaria.
export function formatearFecha(fecha) {
  if (!fecha) return ''
  const [anio, mes, dia] = String(fecha).split('-')
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : String(fecha)
}

export function nombreDia(diaSemana, dias = []) {
  const encontrado = dias.find((dia) => Number(dia.diaSemana) === Number(diaSemana))
  return encontrado?.nombre ?? NOMBRES_DIA[diaSemana] ?? `Día ${diaSemana}`
}

// Calcula en qué columna inicia una ocupación y cuántas franjas ocupa.
export function ubicarOcupacion(ocupacion, franjas = []) {
  const inicio = minutosDeHora(ocupacion?.horaInicio)
  const fin = minutosDeHora(ocupacion?.horaFin)
  if (inicio == null || fin == null || fin <= inicio) return null

  let desde = -1
  let hasta = -1

  franjas.forEach((franja, indice) => {
    const franjaInicio = minutosDeHora(franja.horaInicio)
    const franjaFin = minutosDeHora(franja.horaFin)
    if (franjaInicio == null || franjaFin == null) return
    if (franjaFin > inicio && franjaInicio < fin) {
      if (desde === -1) desde = indice
      hasta = indice
    }
  })

  if (desde === -1) return null
  return { desde, span: hasta - desde + 1 }
}

// Ocupaciones del día seleccionado listas para pintarse en la grilla.
export function ocupacionesDelDia(espacio, diaSemana, franjas = []) {
  return (espacio?.ocupaciones ?? [])
    .filter((ocupacion) => Number(ocupacion.diaSemana) === Number(diaSemana))
    .map((ocupacion) => ({ ...ocupacion, posicion: ubicarOcupacion(ocupacion, franjas) }))
    .filter((ocupacion) => ocupacion.posicion)
    .sort((a, b) => a.posicion.desde - b.posicion.desde)
}

// Resume las franjas por docente para el panel lateral del prototipo.
export function resumenDocentes(espacios = []) {
  const mapa = new Map()

  for (const espacio of espacios) {
    for (const ocupacion of espacio.ocupaciones ?? []) {
      const nombre = String(ocupacion.docenteNombre ?? '').trim()
      if (!nombre) continue

      const clave = nombre.toLowerCase()
      let resumen = mapa.get(clave)
      if (!resumen) {
        resumen = {
          nombre,
          totalMinutos: 0,
          asignaturas: new Set(),
          espacios: new Set(),
          color: colorDocente(nombre),
        }
        mapa.set(clave, resumen)
      }

      const inicio = minutosDeHora(ocupacion.horaInicio)
      const fin = minutosDeHora(ocupacion.horaFin)
      if (inicio != null && fin != null && fin > inicio) {
        resumen.totalMinutos += fin - inicio
      }

      const titulo = String(ocupacion.titulo ?? '').trim()
      if (titulo) resumen.asignaturas.add(titulo)
      if (espacio.nombre) resumen.espacios.add(espacio.nombre)
    }
  }

  return [...mapa.values()]
    .map((resumen) => ({
      nombre: resumen.nombre,
      totalMinutos: resumen.totalMinutos,
      color: resumen.color,
      asignaturas: [...resumen.asignaturas],
      espacios: [...resumen.espacios],
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

// Color estable por docente para identificar sus franjas en toda la vista.
export function colorDocente(nombre = '') {
  let hash = 0
  for (const caracter of String(nombre)) {
    hash = (hash * 31 + (caracter.codePointAt(0) ?? 0)) >>> 0
  }
  return PALETA_DOCENTES[hash % PALETA_DOCENTES.length]
}

export function formatearDuracion(totalMinutos = 0) {
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  return minutos ? `${horas} h ${minutos} min` : `${horas} h`
}

// Construye la query de GET /api/espacios/horario omitiendo filtros vacíos.
export function construirParametros(filtros = {}) {
  const parametros = new URLSearchParams()

  for (const clave of CLAVES_FILTRO) {
    const valor = filtros[clave]
    if (valor === '' || valor == null) continue
    parametros.set(clave, String(valor).trim())
  }

  return parametros
}

export function tieneFiltros(filtros = {}) {
  return ['q', 'docente', 'asignatura', 'tipoEspacioId', 'bloqueId', 'pisoId'].some(
    (clave) => String(filtros[clave] ?? '').trim() !== '',
  )
}

// Construye la query de GET /api/franjas/pendientes.
export function construirParametrosFranjas(filtros = {}) {
  const parametros = new URLSearchParams()

  for (const clave of CLAVES_FILTRO_FRANJAS) {
    const valor = filtros[clave]
    if (valor === '' || valor == null) continue
    parametros.set(clave, String(valor).trim())
  }

  return parametros
}

export function tieneFiltrosFranjas(filtros = {}) {
  return CLAVES_FILTRO_FRANJAS.some((clave) => String(filtros[clave] ?? '').trim() !== '')
}

// Comprueba si una franja puede colocarse en un espacio para el día mostrado.
export function puedeAsignarFranja(espacio, franja, diaSemana, franjas = []) {
  if (!espacio || !franja) return false
  if (espacio.estado === 'DESHABILITADO') return false
  if (Number(franja.diaSemana) !== Number(diaSemana)) return false

  const inicio = minutosDeHora(franja.horaInicio)
  const fin = minutosDeHora(franja.horaFin)
  if (inicio == null || fin == null || fin <= inicio) return false
  if (!ubicarOcupacion(franja, franjas)) return false

  return !(espacio.ocupaciones ?? []).some((ocupacion) => {
    if (Number(ocupacion.diaSemana) !== Number(diaSemana)) return false
    const ocupacionInicio = minutosDeHora(ocupacion.horaInicio)
    const ocupacionFin = minutosDeHora(ocupacion.horaFin)
    return ocupacionInicio != null && ocupacionFin != null
      && ocupacionInicio < fin && ocupacionFin > inicio
  })
}

// Convierte una ocupación del grid en la franja que vuelve al panel izquierdo.
export function franjaDesdeOcupacion(ocupacion, dias = []) {
  if (!ocupacion) return null
  return {
    id: ocupacion.franjaId ?? `asignacion-${ocupacion.id}`,
    docenteNombre: ocupacion.docenteNombre,
    asignaturaCodigo: ocupacion.asignaturaCodigo,
    asignaturaNombre: ocupacion.titulo,
    grupoCodigo: ocupacion.grupoCodigo,
    programaNombre: ocupacion.programaNombre,
    diaSemana: Number(ocupacion.diaSemana),
    diaNombre: nombreDia(ocupacion.diaSemana, dias),
    horaInicio: ocupacion.horaInicio,
    horaFin: ocupacion.horaFin,
    etiqueta: `${formatearHora(ocupacion.horaInicio)} - ${formatearHora(ocupacion.horaFin)}`,
    estado: 'PENDIENTE',
  }
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase()
}

// Lista plana de las asignaciones del horario para la pestaña "Asignadas".
export function listaAsignaciones(horario) {
  const lista = []

  for (const espacio of horario?.espacios ?? []) {
    for (const ocupacion of espacio.ocupaciones ?? []) {
      lista.push({ espacio, ocupacion })
    }
  }

  return lista.sort((a, b) => {
    const dia = Number(a.ocupacion.diaSemana) - Number(b.ocupacion.diaSemana)
    if (dia !== 0) return dia
    const hora = String(a.ocupacion.horaInicio).localeCompare(String(b.ocupacion.horaInicio))
    if (hora !== 0) return hora
    return String(a.espacio.nombre ?? '').localeCompare(String(b.espacio.nombre ?? ''), 'es')
  })
}

// Filtra las asignaciones ya existentes con los mismos criterios del panel.
export function filtrarAsignaciones(lista = [], filtros = {}) {
  const docente = normalizarTexto(filtros.docente)
  const asignatura = normalizarTexto(filtros.asignatura)
  const grupo = normalizarTexto(filtros.grupo)
  const programa = normalizarTexto(filtros.programa)
  const diaSemana = String(filtros.diaSemana ?? '').trim()
  const horaInicio = minutosDeHora(filtros.horaInicio)
  const horaFin = minutosDeHora(filtros.horaFin)

  return lista.filter(({ ocupacion }) => {
    if (docente && !normalizarTexto(ocupacion.docenteNombre).includes(docente)) return false
    if (asignatura) {
      const texto = normalizarTexto(ocupacion.titulo)
      const codigo = normalizarTexto(ocupacion.asignaturaCodigo)
      if (!texto.includes(asignatura) && !codigo.includes(asignatura)) return false
    }
    if (grupo && !normalizarTexto(ocupacion.grupoCodigo).includes(grupo)) return false
    if (programa && !normalizarTexto(ocupacion.programaNombre).includes(programa)) return false
    if (diaSemana && Number(ocupacion.diaSemana) !== Number(diaSemana)) return false

    const inicio = minutosDeHora(ocupacion.horaInicio)
    const fin = minutosDeHora(ocupacion.horaFin)
    if (horaInicio != null && fin != null && fin <= horaInicio) return false
    if (horaFin != null && inicio != null && inicio >= horaFin) return false

    return true
  })
}

// Espacios visibles donde la franja puede ubicarse, sin repetir el actual.
export function espaciosDisponibles(horario, franja, espacioActualId) {
  if (!franja) return []

  return (horario?.espacios ?? [])
    .filter((espacio) => Number(espacio.id) !== Number(espacioActualId))
    .filter((espacio) =>
      puedeAsignarFranja(espacio, franja, franja.diaSemana, horario?.franjas ?? []),
    )
    .sort((a, b) => {
      const bloque = String(a.bloqueNombre ?? '').localeCompare(
        String(b.bloqueNombre ?? ''),
        'es',
      )
      if (bloque !== 0) return bloque
      const piso = Number(a.pisoNumero ?? 0) - Number(b.pisoNumero ?? 0)
      if (piso !== 0) return piso
      return String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es')
    })
}

// Crea la ocupación temporal que se pinta en el grid antes de guardar.
export function crearOcupacionLocal(franja, espacioId) {
  return {
    id: `tmp-${franja.id}`,
    franjaId: Number(franja.id),
    tipo: 'ASIGNACION',
    diaSemana: Number(franja.diaSemana),
    horaInicio: franja.horaInicio,
    horaFin: franja.horaFin,
    titulo: franja.asignaturaNombre ?? 'Asignación académica',
    descripcion: franja.grupoCodigo,
    asignaturaCodigo: franja.asignaturaCodigo,
    grupoCodigo: franja.grupoCodigo,
    docenteNombre: franja.docenteNombre,
    programaNombre: franja.programaNombre,
    origen: 'local',
    espacioId,
  }
}

// Aplica los cambios locales al horario recibido del backend.
export function aplicarCambiosHorario(horario, nuevas = [], eliminadas = new Set()) {
  if (!horario) return horario

  const nuevasPorEspacio = new Map()
  for (const cambio of nuevas) {
    const lista = nuevasPorEspacio.get(Number(cambio.espacioId)) ?? []
    lista.push(cambio.ocupacion)
    nuevasPorEspacio.set(Number(cambio.espacioId), lista)
  }

  return {
    ...horario,
    espacios: (horario.espacios ?? []).map((espacio) => {
      const existentes = (espacio.ocupaciones ?? [])
        .filter((ocupacion) => !eliminadas.has(ocupacion.id))
      const locales = nuevasPorEspacio.get(Number(espacio.id)) ?? []
      return { ...espacio, ocupaciones: [...existentes, ...locales] }
    }),
  }
}
