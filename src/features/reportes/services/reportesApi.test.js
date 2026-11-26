import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { completarReporte, obtenerEvidencia } from './reportesApi.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('completar reporte usa PATCH autenticado y sin cuerpo', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/reportes/7/completar'))
    assert.equal(options.method, 'PATCH')
    assert.equal(options.headers.Authorization, 'Bearer jwt')
    assert.equal(options.body, undefined)
    return Response.json({ id: 7, estado: 'COMPLETADO' })
  }
  assert.deepEqual(await completarReporte(7, 'jwt'), { id: 7, estado: 'COMPLETADO' })
})

test('obtener evidencia descarga el blob autenticado del proxy', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/reportes/7/evidencia'))
    assert.equal(options.headers.Authorization, 'Bearer jwt')
    assert.equal(options.headers.Accept, '*/*')
    return new Response(new Blob(['imagen'], { type: 'image/webp' }), {
      status: 200,
      headers: { 'Content-Type': 'image/webp' },
    })
  }

  const blob = await obtenerEvidencia(7, 'jwt')

  assert.equal(blob.type, 'image/webp')
  assert.equal(await blob.text(), 'imagen')
})
