import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  descargarPlantilla,
  importarFranjas,
  validarArchivoFranjas,
} from './franjasImportApi.js'

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

test('descarga la plantilla como blob con token', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return new Response(new Uint8Array([1, 2, 3]))
  }

  const blob = await descargarPlantilla('jwt')

  assert.ok(llamadas[0].url.endsWith('/api/franjas/plantilla'))
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
  assert.ok(blob instanceof Blob)
})

test('sube el Excel como multipart con el campo archivo y sin cabecera json', async () => {
  const llamadas = []
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, options })
    return Response.json({ totalGrupos: 1, totalFranjas: 2, conSalon: 1, sinSalon: 1, virtuales: 0 })
  }

  const archivo = { name: 'horarios.xlsx', size: 100 }
  const creada = await importarFranjas(archivo, 'jwt')

  assert.ok(llamadas[0].url.endsWith('/api/franjas/importaciones'))
  assert.equal(llamadas[0].options.method, 'POST')
  assert.equal(llamadas[0].options.headers.Authorization, 'Bearer jwt')
  assert.equal(llamadas[0].options.headers['Content-Type'], undefined)
  assert.ok(llamadas[0].options.body instanceof FormData)
  assert.ok(llamadas[0].options.body.has('archivo'))
  assert.equal(creada.totalGrupos, 1)
})

test('valida el archivo antes de enviar', () => {
  assert.match(validarArchivoFranjas(null), /Selecciona un archivo/)
  assert.match(validarArchivoFranjas({ name: 'horarios.xls', size: 10 }), /\.xlsx/)
  assert.match(validarArchivoFranjas({ name: 'horarios.xlsx', size: 0 }), /vacío/)
  assert.match(
    validarArchivoFranjas({ name: 'horarios.xlsx', size: 6 * 1024 * 1024 }),
    /5 MiB/,
  )
  assert.equal(validarArchivoFranjas({ name: 'horarios.xlsx', size: 1024 }), '')
})
