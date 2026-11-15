import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { completarReporte } from './reportesApi.js'

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
