/**
 * lady vidal - HU-06: pruebas del cliente del horario y de los catálogos.
 */
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  guardarAsignaciones,
  listarBloquesHorario,
  listarPisosHorario,
  obtenerFranjasPendientes,
  obtenerHorario,
} from './asignacionesApi.js'

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

test('consulta el horario con filtros combinados y token', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return Response.json({ espacios: [] })
  }

  await obtenerHorario(
    {
      sedeId: 2,
      tipoEspacioId: 1,
      bloqueId: 3,
      pisoId: 4,
      q: 'lab',
      docente: 'Andrea',
      asignatura: 'Programación',
    },
    'jwt',
  )

  const url = new URL(llamadas[0].url)
  assert.equal(url.pathname, '/api/espacios/horario')
  const esperados = {
    sedeId: '2',
    tipoEspacioId: '1',
    bloqueId: '3',
    pisoId: '4',
    q: 'lab',
    docente: 'Andrea',
    asignatura: 'Programación',
  }
  for (const [clave, valor] of Object.entries(esperados)) {
    assert.equal(url.searchParams.get(clave), valor)
  }
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
})

test('omite la query cuando no hay filtros', async () => {
  const llamadas = []
  globalThis.fetch = async (url) => {
    llamadas.push(url)
    return Response.json({ espacios: [] })
  }

  await obtenerHorario({ sedeId: null, q: '', tipoEspacioId: '' }, 'jwt')
  assert.equal(new URL(llamadas[0]).search, '')
})

test('carga bloques por sede y pisos por bloque con autenticación', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return Response.json([])
  }

  await listarBloquesHorario(2, 'jwt')
  await listarPisosHorario(3, 'jwt')

  const bloques = new URL(llamadas[0].url)
  const pisos = new URL(llamadas[1].url)
  assert.equal(bloques.pathname, '/api/espacios/bloques')
  assert.equal(bloques.searchParams.get('sedeId'), '2')
  assert.equal(pisos.pathname, '/api/pisos')
  assert.equal(pisos.searchParams.get('bloqueId'), '3')
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
  assert.equal(llamadas[1].options.headers.Authorization, 'Bearer jwt')
})

test('consulta franjas pendientes con filtros y autenticación', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return Response.json({ franjas: [] })
  }

  await obtenerFranjasPendientes({
    docente: 'Andrea',
    grupo: 'GRP-POO',
    diaSemana: 4,
    horaInicio: '08:00',
    horaFin: '',
  }, 'jwt')

  const url = new URL(llamadas[0].url)
  assert.equal(url.pathname, '/api/franjas/pendientes')
  assert.equal(url.searchParams.get('docente'), 'Andrea')
  assert.equal(url.searchParams.get('grupo'), 'GRP-POO')
  assert.equal(url.searchParams.get('diaSemana'), '4')
  assert.equal(url.searchParams.get('horaInicio'), '08:00')
  assert.equal(url.searchParams.get('horaFin'), null)
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
})

test('guarda cambios de asignaciones con PUT y token', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return Response.json({ creadas: 1, eliminadas: 1 })
  }

  await guardarAsignaciones({
    crear: [{ franjaId: 15, espacioId: 20 }],
    eliminar: [100],
  }, 'jwt')

  assert.ok(llamadas[0].url.endsWith('/api/asignaciones'))
  assert.equal(llamadas[0].options.method, 'PUT')
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
  assert.deepEqual(JSON.parse(llamadas[0].options.body), {
    crear: [{ franjaId: 15, espacioId: 20 }],
    eliminar: [100],
  })
})
