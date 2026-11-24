import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { clearSession, getSession, saveSession } from './session.js'
let values
beforeEach(() => {
  values = new Map()
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) }
  clearSession()
})
test('solo persiste token y perfil, excluyendo otros campos de formulario', () => {
  saveSession({ token: 'jwt', user: { id: 1, rol: 'ADMIN' }, bootstrapKey: 'no-guardar', contrasenia: 'no-guardar' })
  const raw=values.get('ubicate.session')
  assert.equal(raw.includes('no-guardar'),false); assert.equal(getSession().token,'jwt')
})
test('dato corrupto no restaura una sesión previa de memoria', () => {
  saveSession({ token: 'jwt', user: {} }); values.set('ubicate.session','{malformado')
  assert.equal(getSession(),null)
  values.set('ubicate.session',JSON.stringify({ token: 123, user: {} })); assert.equal(getSession(),null)
})
test('mantiene sesión en memoria si storage falla y permite cerrarla', () => {
  globalThis.localStorage = { getItem: () => { throw new Error() }, setItem: () => { throw new Error() }, removeItem: () => { throw new Error() } }
  saveSession({ token: 'jwt', user: { id: 1 } }); assert.equal(getSession().token,'jwt')
  clearSession(); assert.equal(getSession(),null)
})
test('eliminación externa de storage elimina la sesión local', () => {
  saveSession({ token: 'jwt', user: {} }); values.delete('ubicate.session'); assert.equal(getSession(),null)
})
