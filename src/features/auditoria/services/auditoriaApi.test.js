import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { exportarAuditoriaReservas, listarAuditoriaReservas } from './auditoriaApi.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const FILTROS = {
  desde: '2026-11-01', hasta: '2026-11-26', bloqueId: '3', pisoId: '2',
  tipoEspacioId: '5', rol: 'DOCENTE', tipoEvento: 'CREADA', situacion: 'PROXIMA', q: 'Ana',
}

test('listar auditoría conserva filtros y paginación', async () => {
  globalThis.fetch = async (url, options) => {
    const qs = new URL(url).searchParams
    assert.ok(url.includes('/api/auditoria/reservas?'))
    assert.equal(qs.get('desde'), '2026-11-01T00:00:00')
    assert.equal(qs.get('hasta'), '2026-11-26T23:59:59')
    assert.equal(qs.get('q'), 'Ana')
    assert.equal(qs.get('page'), '2')
    assert.equal(qs.get('size'), '10')
    assert.equal(options.headers.Authorization, 'Bearer jwt')
    return Response.json({ content: [] })
  }
  await listarAuditoriaReservas({ ...FILTROS, page: 2 }, 'jwt')
})

test('exportar auditoría usa los mismos filtros sin page ni size y devuelve blob', async () => {
  globalThis.fetch = async (url, options) => {
    const qs = new URL(url).searchParams
    assert.ok(url.includes('/api/auditoria/reservas/export?'))
    assert.equal(qs.get('desde'), '2026-11-01T00:00:00')
    assert.equal(qs.get('hasta'), '2026-11-26T23:59:59')
    for (const [key, value] of Object.entries(FILTROS)) {
      if (key !== 'desde' && key !== 'hasta') assert.equal(qs.get(key), value)
    }
    assert.equal(qs.has('page'), false)
    assert.equal(qs.has('size'), false)
    assert.equal(options.headers.Authorization, 'Bearer jwt')
    assert.equal(options.headers.Accept, '*/*')
    return new Response(new Blob(['xlsx'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  }

  const blob = await exportarAuditoriaReservas(FILTROS, 'jwt')
  assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  assert.equal(await blob.text(), 'xlsx')
})
