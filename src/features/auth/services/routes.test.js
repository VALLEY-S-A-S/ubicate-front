import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isDashboardRoute, parseRoute } from './routes.js'
const token = 'ab'.repeat(32)
test('reconoce activación con query en fragmento', () => {
  assert.deepEqual(parseRoute(`#/activar-cuenta?token=${token}`), { path: '/activar-cuenta', token })
  assert.deepEqual(parseRoute('#/activar-cuenta'), { path: '/activar-cuenta', token: null })
})
test('rechaza tokens duplicados, incompletos y otros formatos', () => {
  for(const query of [`token=${token}&token=${token}`, 'token=ab', 'token=%3Cscript%3E', 'token='+token.toUpperCase()])
    assert.equal(parseRoute('#/activar-cuenta?'+query).token,null)
})
test('query de lote no rompe las rutas del panel ni convierte URL externa en navegación', () => {
  assert.equal(parseRoute('#/dashboard/usuarios?lote=8').path,'/dashboard/usuarios')
  assert.equal(isDashboardRoute('/dashboard-falso'),false)
  assert.equal(parseRoute('#https://otro.ejemplo').path,'/login')
  assert.equal(parseRoute('#/login?token='+token).token,null)
})
