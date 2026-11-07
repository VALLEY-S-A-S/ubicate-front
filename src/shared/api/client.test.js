import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { apiRequest, ApiError } from './client.js'

const originalFetch = globalThis.fetch
const originalWindow = globalThis.window
afterEach(() => { globalThis.fetch = originalFetch; if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow })
function reply(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }

test('serializa JSON y permite cabecera de bootstrap sin enviar secretos en URL', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:8080/api/auth/register')
    assert.equal(options.headers['X-Bootstrap-Key'], 'clave-secreta')
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { nombre: 'Admin' })
    assert.equal(options.cache, 'no-store'); assert.equal(options.credentials, 'omit')
    return reply({ message: 'Creado' }, 201)
  }
  assert.deepEqual(await apiRequest('/api/auth/register', { method: 'POST', headers: { 'X-Bootstrap-Key': 'clave-secreta' }, body: { nombre: 'Admin' } }), { message: 'Creado' })
})
test('multipart conserva FormData y deja que fetch establezca boundary', async () => {
  const body = new FormData(); body.append('archivo', new Blob(['xlsx']), 'usuarios.xlsx')
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.body, body); assert.equal(options.headers['Content-Type'], undefined)
    assert.equal(options.headers.Authorization, 'Bearer jwt-prueba')
    return reply({ id: 8, totalUsuarios: 2 }, 201)
  }
  assert.equal((await apiRequest('/importar', { method: 'POST', body, token: 'jwt-prueba' })).id, 8)
})
test('descarga binario y acepta respuesta 204', async () => {
  globalThis.fetch = async () => new Response(new Uint8Array([80, 75]), { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } })
  const blob = await apiRequest('/plantilla', { responseType: 'blob' })
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), new Uint8Array([80, 75]))
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await apiRequest('/eliminar', { method: 'DELETE' }), null)
})
test('preserva errores de archivo 422 aunque se espere binario', async () => {
  const data = { message: 'Archivo inválido', errors: [{ fila: 3, campo: 'rol', mensaje: 'Rol inválido' }] }
  globalThis.fetch = async () => reply(data, 422)
  await assert.rejects(apiRequest('/plantilla', { responseType: 'blob' }), error => error instanceof ApiError && error.status === 422 && error.data.errors[0].fila === 3)
})
test('401 solo notifica invalidación cuando la solicitud usó token', async () => {
  const events = []; globalThis.window = { dispatchEvent: event => events.push(event) }
  globalThis.fetch = async () => reply({ message: 'No autenticado' }, 401)
  await assert.rejects(apiRequest('/login', { method: 'POST' }))
  assert.equal(events.length, 0)
  await assert.rejects(apiRequest('/me', { token: 'jwt-prueba' }))
  assert.equal(events.length, 1); assert.equal(events[0].type, 'ubicate:unauthorized'); assert.equal(events[0].detail.token, 'jwt-prueba')
})
test('403 no borra sesión; error no JSON usa mensaje comprensible', async () => {
  const events = []; globalThis.window = { dispatchEvent: event => events.push(event) }
  globalThis.fetch = async () => new Response('Sin permisos', { status: 403 })
  await assert.rejects(apiRequest('/admin', { token: 'jwt' }), error => error.status === 403 && error.data === null)
  assert.equal(events.length, 0)
})
test('abort no se convierte en error de red y se propaga signal', async () => {
  const controller = new AbortController(); controller.abort()
  globalThis.fetch = async (_url, options) => { assert.equal(options.signal, controller.signal); throw new DOMException('Cancelado', 'AbortError') }
  await assert.rejects(apiRequest('/me', { signal: controller.signal }), error => error.name === 'AbortError')
})
test('red no disponible produce ApiError de resultado no confirmado', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(apiRequest('/importar'), error => error instanceof ApiError && error.status === 0)
})
