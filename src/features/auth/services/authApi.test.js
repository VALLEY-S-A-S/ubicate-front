import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { activate, activationInfo, bootstrapStatus, isAdminRole, logout, me, register } from './authApi.js'
const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
test('registro solo envía clave en X-Bootstrap-Key y no confirmación', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/auth/register'))
    assert.equal(options.headers['X-Bootstrap-Key'], 'secreto')
    assert.deepEqual(JSON.parse(options.body), { nombre: 'A', correoInstitucional: 'a@correounivalle.edu.co', contrasenia: 'Password1' })
    return Response.json({ message: 'Creado' }, { status: 201 })
  }
  await register({ nombre: 'A', correoInstitucional: 'a@correounivalle.edu.co', contrasenia: 'Password1', confirmacion: 'Password1' }, 'secreto')
})
test('activación no manda token por URL ni usa Bearer de otra sesión', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/auth/activate')); assert.ok(!url.includes('token='))
    assert.equal(options.headers.Authorization, undefined)
    assert.deepEqual(JSON.parse(options.body), { token: 'ab'.repeat(32), contrasenia: ' Password1 ' })
    return Response.json({ rol: 'ESTUDIANTE' })
  }
  await activate('ab'.repeat(32), ' Password1 ')
})
test('estado público, perfil protegido y logout con principal', async () => {
  const calls=[]
  globalThis.fetch = async (url, options) => { calls.push({url,options}); return Response.json({ requiresSetup: false }) }
  await bootstrapStatus(); await me('jwt'); await logout('jwt', 'admin@correounivalle.edu.co')
  assert.equal(calls[0].options.headers.Authorization, undefined)
  assert.equal(calls[1].options.headers.Authorization, 'Bearer jwt')
  assert.equal(calls[2].options.method, 'POST')
  assert.deepEqual(JSON.parse(calls[2].options.body), { correoInstitucional: 'admin@correounivalle.edu.co' })
})
test('solo los roles administrativos acceden al panel', () => {
  for(const role of ['ADMIN','ADMINISTRADOR','ROLE_ADMIN',' admin ']) assert.equal(isAdminRole(role),true)
  for(const role of ['ESTUDIANTE','DOCENTE','LOGISTICA','OPERARIO','INVITADO',null]) assert.equal(isAdminRole(role),false)
})

test('consulta correo del enlace por token sin correo en URL ni sesión administrativa', async () => {
  const controller = new AbortController()
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/auth/activation-info'))
    assert.equal(options.method, 'POST'); assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.signal, controller.signal)
    assert.deepEqual(JSON.parse(options.body), { token: 'ab'.repeat(32) })
    return Response.json({ correoInstitucional: 'cuenta@correounivalle.edu.co' })
  }
  assert.deepEqual(await activationInfo('ab'.repeat(32), controller.signal), { correoInstitucional: 'cuenta@correounivalle.edu.co' })
})
