import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validatePassword } from './registration.js'
test('validación de activación no exige nombre o correo y no modifica contraseña', () => {
  assert.deepEqual(validatePassword({ contrasenia:' Password1 ', confirmacion:' Password1 ' }),{})
  assert.ok(validatePassword({ contrasenia:'Password1 ', confirmacion:'Password1' }).confirmacion)
})
test('contraseña débil y confirmación vacía producen errores por campo', () => {
  const errors=validatePassword({ contrasenia:'corta',confirmacion:'' })
  assert.ok(errors.contrasenia); assert.ok(errors.confirmacion)
})
