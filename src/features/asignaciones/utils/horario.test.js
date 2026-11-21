/**
 * lady vidal - HU-06: pruebas de las utilidades del horario de asignaciones.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  aplicarCambiosHorario,
  colorDocente,
  construirParametros,
  construirParametrosFranjas,
  crearOcupacionLocal,
  espaciosDisponibles,
  filtrarAsignaciones,
  formatearDuracion,
  formatearFecha,
  formatearHora,
  franjaDesdeOcupacion,
  listaAsignaciones,
  minutosDeHora,
  ocupacionesDelDia,
  puedeAsignarFranja,
  resumenDocentes,
  tieneFiltros,
  tieneFiltrosFranjas,
  ubicarOcupacion,
} from './horario.js'

const FRANJAS = [
  { horaInicio: '07:00:00', horaFin: '08:00:00', etiqueta: '07:00 - 08:00' },
  { horaInicio: '08:00:00', horaFin: '09:00:00', etiqueta: '08:00 - 09:00' },
  { horaInicio: '09:00:00', horaFin: '10:00:00', etiqueta: '09:00 - 10:00' },
  { horaInicio: '10:00:00', horaFin: '11:00:00', etiqueta: '10:00 - 11:00' },
]

test('convierte y formatea horas del contrato del backend', () => {
  assert.equal(minutosDeHora('07:30:00'), 450)
  assert.equal(minutosDeHora('07:30'), 450)
  assert.equal(minutosDeHora(''), null)
  assert.equal(minutosDeHora('texto'), null)
  assert.equal(formatearHora('07:00:00'), '07:00')
  assert.equal(formatearHora(null), '')
  assert.equal(formatearFecha('2026-11-02'), '02/11/2026')
  assert.equal(formatearFecha(null), '')
})

test('ubica una ocupación de varias franjas en la grilla', () => {
  assert.deepEqual(
    ubicarOcupacion({ horaInicio: '07:00:00', horaFin: '09:00:00' }, FRANJAS),
    { desde: 0, span: 2 },
  )
  assert.deepEqual(
    ubicarOcupacion({ horaInicio: '07:30:00', horaFin: '08:30:00' }, FRANJAS),
    { desde: 0, span: 2 },
  )
  assert.deepEqual(
    ubicarOcupacion({ horaInicio: '10:30:00', horaFin: '11:30:00' }, FRANJAS),
    { desde: 3, span: 1 },
  )
})

test('descarta ocupaciones fuera de la ventana consultada o inválidas', () => {
  assert.equal(
    ubicarOcupacion({ horaInicio: '06:00:00', horaFin: '07:00:00' }, FRANJAS),
    null,
  )
  assert.equal(
    ubicarOcupacion({ horaInicio: '09:00:00', horaFin: '09:00:00' }, FRANJAS),
    null,
  )
  assert.equal(ubicarOcupacion({}, FRANJAS), null)
})

test('filtra por día y ordena las ocupaciones por hora de inicio', () => {
  const espacio = {
    ocupaciones: [
      { id: 1, diaSemana: 1, horaInicio: '09:00:00', horaFin: '10:00:00' },
      { id: 2, diaSemana: 2, horaInicio: '07:00:00', horaFin: '08:00:00' },
      { id: 3, diaSemana: 1, horaInicio: '07:00:00', horaFin: '08:00:00' },
    ],
  }

  const lunes = ocupacionesDelDia(espacio, 1, FRANJAS)
  assert.deepEqual(
    lunes.map((ocupacion) => ocupacion.id),
    [3, 1],
  )
  assert.deepEqual(lunes[0].posicion, { desde: 0, span: 1 })
  assert.deepEqual(lunes[1].posicion, { desde: 2, span: 1 })
})

test('resume las franjas por docente sin duplicar asignaturas', () => {
  const espacios = [
    {
      nombre: 'Salón 101',
      ocupaciones: [
        {
          docenteNombre: 'Andrea Valle',
          titulo: 'Programación',
          horaInicio: '07:00:00',
          horaFin: '09:00:00',
        },
        {
          docenteNombre: 'Andrea Valle',
          titulo: 'Programación',
          horaInicio: '09:00:00',
          horaFin: '10:00:00',
        },
      ],
    },
    {
      nombre: 'Laboratorio 105',
      ocupaciones: [
        {
          docenteNombre: 'andrea valle',
          titulo: 'Bases de datos',
          horaInicio: '10:00:00',
          horaFin: '12:00:00',
        },
      ],
    },
  ]

  const [docente] = resumenDocentes(espacios)
  assert.equal(docente.nombre, 'Andrea Valle')
  assert.equal(docente.totalMinutos, 300)
  assert.deepEqual(docente.asignaturas, ['Programación', 'Bases de datos'])
  assert.deepEqual(docente.espacios, ['Salón 101', 'Laboratorio 105'])
  assert.match(docente.color, /^#[0-9a-f]{6}$/i)
  assert.equal(colorDocente('Andrea Valle'), colorDocente('Andrea Valle'))
})

test('construye la query omitiendo filtros vacíos y conserva los combinados', () => {
  const parametros = construirParametros({
    sedeId: 2,
    tipoEspacioId: '',
    pisoId: null,
    bloqueId: 3,
    q: ' lab ',
    docente: 'Andrea',
    asignatura: '',
  })

  assert.equal(parametros.get('sedeId'), '2')
  assert.equal(parametros.get('bloqueId'), '3')
  assert.equal(parametros.get('q'), 'lab')
  assert.equal(parametros.get('docente'), 'Andrea')
  assert.equal(parametros.get('tipoEspacioId'), null)
  assert.equal(parametros.get('pisoId'), null)
  assert.equal(parametros.get('asignatura'), null)
})

test('detecta si hay filtros activos y formatea duraciones', () => {
  assert.equal(tieneFiltros({}), false)
  assert.equal(tieneFiltros({ q: '   ' }), false)
  assert.equal(tieneFiltros({ tipoEspacioId: '1' }), true)
  assert.equal(formatearDuracion(90), '1 h 30 min')
  assert.equal(formatearDuracion(120), '2 h')
  assert.equal(formatearDuracion(0), '0 h')
})

test('construye la query de franjas pendientes sin filtros vacíos', () => {
  const parametros = construirParametrosFranjas({
    docente: ' Andrea ',
    asignatura: '',
    grupo: 'GRP-POO',
    programa: null,
    diaSemana: 4,
    horaInicio: '08:00',
    horaFin: '',
  })

  assert.equal(parametros.get('docente'), 'Andrea')
  assert.equal(parametros.get('grupo'), 'GRP-POO')
  assert.equal(parametros.get('diaSemana'), '4')
  assert.equal(parametros.get('horaInicio'), '08:00')
  assert.equal(parametros.get('asignatura'), null)
  assert.equal(parametros.get('programa'), null)
  assert.equal(parametros.get('horaFin'), null)
  assert.equal(tieneFiltrosFranjas({}), false)
  assert.equal(tieneFiltrosFranjas({ docente: '  ' }), false)
  assert.equal(tieneFiltrosFranjas({ diaSemana: '4' }), true)
})

test('valida si una franja puede soltarse en un espacio', () => {
  const franja = {
    id: 15,
    diaSemana: 4,
    horaInicio: '08:00:00',
    horaFin: '10:00:00',
  }
  const espacio = {
    id: 20,
    estado: 'DISPONIBLE',
    ocupaciones: [
      { id: 100, diaSemana: 4, horaInicio: '10:00:00', horaFin: '12:00:00' },
    ],
  }

  assert.equal(puedeAsignarFranja(espacio, franja, 4, FRANJAS), true)
  assert.equal(puedeAsignarFranja(espacio, franja, 3, FRANJAS), false)
  assert.equal(puedeAsignarFranja({ ...espacio, estado: 'DESHABILITADO' }, franja, 4, FRANJAS), false)
  assert.equal(
    puedeAsignarFranja({
      ...espacio,
      ocupaciones: [
        { id: 101, diaSemana: 4, horaInicio: '09:00:00', horaFin: '11:00:00' },
      ],
    }, franja, 4, FRANJAS),
    false,
  )
})

test('convierte una asignación del grid en una franja pendiente', () => {
  const franja = franjaDesdeOcupacion({
    id: 100,
    franjaId: 15,
    docenteNombre: 'Andrea Valle',
    titulo: 'Programación',
    asignaturaCodigo: 'IS-201',
    grupoCodigo: 'GRP-POO-2026-2',
    programaNombre: 'Ingeniería de Sistemas',
    diaSemana: 4,
    horaInicio: '08:00:00',
    horaFin: '10:00:00',
  }, [{ diaSemana: 4, nombre: 'Jueves' }])

  assert.equal(franja.id, 15)
  assert.equal(franja.diaNombre, 'Jueves')
  assert.equal(franja.etiqueta, '08:00 - 10:00')
  assert.equal(franja.estado, 'PENDIENTE')
})

test('aplica asignaciones locales y eliminaciones al horario', () => {
  const ocupacionServidor = {
    id: 100,
    diaSemana: 4,
    horaInicio: '07:00:00',
    horaFin: '08:00:00',
  }
  const nueva = crearOcupacionLocal({
    id: 15,
    diaSemana: 4,
    horaInicio: '08:00:00',
    horaFin: '10:00:00',
    docenteNombre: 'Andrea Valle',
    asignaturaNombre: 'Programación',
    grupoCodigo: 'GRP-POO-2026-2',
  }, 20)
  const horario = {
    espacios: [
      { id: 20, ocupaciones: [ocupacionServidor] },
      { id: 21, ocupaciones: [] },
    ],
  }

  const resultado = aplicarCambiosHorario(
    horario,
    [{ espacioId: 20, ocupacion: nueva }],
    new Set([100]),
  )

  assert.deepEqual(resultado.espacios[0].ocupaciones, [nueva])
  assert.deepEqual(resultado.espacios[1].ocupaciones, [])
})

const HORARIO_ASIGNADO = {
  dias: [
    { diaSemana: 3, nombre: 'Miércoles' },
    { diaSemana: 4, nombre: 'Jueves' },
  ],
  franjas: FRANJAS,
  espacios: [
    {
      id: 20,
      nombre: 'Aula 102',
      codigo: 'AULA-102',
      bloqueNombre: 'Bloque A',
      pisoNumero: 1,
      estado: 'DISPONIBLE',
      ocupaciones: [
        {
          id: 200,
          franjaId: 30,
          diaSemana: 3,
          horaInicio: '07:00:00',
          horaFin: '09:00:00',
          titulo: 'Programación',
          asignaturaCodigo: 'IS-201',
          grupoCodigo: 'GRP-POO',
          docenteNombre: 'Andrea Valle',
          programaNombre: 'Ingeniería de Sistemas',
        },
      ],
    },
    {
      id: 21,
      nombre: 'Aula 201',
      codigo: 'AULA-201',
      bloqueNombre: 'Bloque B',
      pisoNumero: 2,
      estado: 'DISPONIBLE',
      ocupaciones: [
        {
          id: 210,
          franjaId: 31,
          diaSemana: 4,
          horaInicio: '09:00:00',
          horaFin: '10:00:00',
          titulo: 'Bases de Datos',
          asignaturaCodigo: 'IS-301',
          grupoCodigo: 'GRP-BD',
          docenteNombre: 'Carlos Ruiz',
          programaNombre: 'Ingeniería de Sistemas',
        },
      ],
    },
    {
      id: 22,
      nombre: 'Laboratorio 105',
      codigo: 'LAB-105',
      bloqueNombre: 'Bloque C',
      pisoNumero: 1,
      estado: 'DISPONIBLE',
      ocupaciones: [],
    },
  ],
}

test('aplana y ordena las asignaciones del horario para la lista', () => {
  const lista = listaAsignaciones(HORARIO_ASIGNADO)

  assert.equal(lista.length, 2)
  assert.deepEqual(lista.map((item) => item.espacio.id), [20, 21])
  assert.deepEqual(lista.map((item) => item.ocupacion.id), [200, 210])
})

test('filtra las asignaciones por docente, asignatura, grupo, programa, día y rango', () => {
  const lista = listaAsignaciones(HORARIO_ASIGNADO)

  assert.deepEqual(
    filtrarAsignaciones(lista, { docente: 'andrea' }).map((item) => item.ocupacion.id),
    [200],
  )
  assert.deepEqual(
    filtrarAsignaciones(lista, { asignatura: 'is-301' }).map((item) => item.ocupacion.id),
    [210],
  )
  assert.deepEqual(
    filtrarAsignaciones(lista, { grupo: 'poo' }).map((item) => item.ocupacion.id),
    [200],
  )
  assert.deepEqual(
    filtrarAsignaciones(lista, { programa: 'sistemas' }).map((item) => item.ocupacion.id),
    [200, 210],
  )
  assert.deepEqual(
    filtrarAsignaciones(lista, { diaSemana: '4' }).map((item) => item.ocupacion.id),
    [210],
  )
  assert.deepEqual(
    filtrarAsignaciones(lista, { horaInicio: '09:30' }).map((item) => item.ocupacion.id),
    [210],
  )
  assert.deepEqual(filtrarAsignaciones(lista, { docente: 'andrea', diaSemana: '4' }), [])
})

test('sugiere solo espacios libres y distintos del actual', () => {
  const franja = {
    id: 30,
    diaSemana: 3,
    horaInicio: '07:00:00',
    horaFin: '09:00:00',
  }

  assert.deepEqual(
    espaciosDisponibles(HORARIO_ASIGNADO, franja, 20).map((espacio) => espacio.id),
    [21, 22],
  )
  assert.deepEqual(
    espaciosDisponibles(HORARIO_ASIGNADO, franja, 21).map((espacio) => espacio.id),
    [22],
  )

  const conBloqueado = {
    ...HORARIO_ASIGNADO,
    espacios: HORARIO_ASIGNADO.espacios.map((espacio) =>
      espacio.id === 22 ? { ...espacio, estado: 'DESHABILITADO' } : espacio,
    ),
  }
  assert.deepEqual(
    espaciosDisponibles(conBloqueado, franja, 20).map((espacio) => espacio.id),
    [21],
  )

  const conSolape = {
    ...HORARIO_ASIGNADO,
    espacios: HORARIO_ASIGNADO.espacios.map((espacio) =>
      espacio.id === 22
        ? {
            ...espacio,
            ocupaciones: [
              { id: 220, diaSemana: 3, horaInicio: '08:00:00', horaFin: '10:00:00' },
            ],
          }
        : espacio,
    ),
  }
  assert.deepEqual(
    espaciosDisponibles(conSolape, franja, 20).map((espacio) => espacio.id),
    [21],
  )
})
