import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isInstitutionalEmail,
  normalizeEmail,
  passwordRequirements,
  validateRegistration,
} from './registration.js'

const valid = {
  nombre: 'Nicole Cuéllar',
  correoInstitucional: 'nicole@correounivalle.edu.co',
  contrasenia: 'Password1',
  confirmacion: 'Password1',
}

test('acepta registro válido y normaliza solamente el correo', () => {
  assert.deepEqual(validateRegistration(valid), {})
  assert.equal(
    normalizeEmail('  NICOLE@CORREOUNIVALLE.EDU.CO '),
    valid.correoInstitucional,
  )
})

test('rechaza campos vacíos, espacios y nombre mayor al límite de la base de datos', () => {
  const errors = validateRegistration({
    nombre: '  ',
    correoInstitucional: '',
    contrasenia: '',
    confirmacion: '',
  })
  assert.deepEqual(Object.keys(errors), [
    'nombre',
    'correoInstitucional',
    'contrasenia',
    'confirmacion',
  ])
  assert.ok(validateRegistration({ ...valid, nombre: 'a'.repeat(151) }).nombre)
  assert.equal(
    validateRegistration({ ...valid, nombre: 'a'.repeat(150) }).nombre,
    undefined,
  )
})

test('rechaza dominios externos, subdominios, sufijos falsos y direcciones malformadas', () => {
  for (const email of [
    'nicole@gmail.com',
    'a@sub.correounivalle.edu.co',
    'a@correounivalle.edu.co.evil.com',
    'a@@correounivalle.edu.co',
    '@correounivalle.edu.co',
    'a b@correounivalle.edu.co',
    `${'a'.repeat(131)}@correounivalle.edu.co`,
  ]) {
    assert.equal(isInstitutionalEmail(email), false, email)
  }
  assert.equal(isInstitutionalEmail(' NICOLE@CORREOUNIVALLE.EDU.CO '), true)
})

test('contraseña exige ocho caracteres, mayúscula y número como el backend', () => {
  for (const contrasenia of ['Passwo1', 'password1', 'Password']) {
    assert.ok(
      validateRegistration({ ...valid, contrasenia, confirmacion: contrasenia })
        .contrasenia,
    )
  }
  assert.ok(passwordRequirements('Ábcdefg1').every(({ met }) => met))
})

test('confirmación distingue mayúsculas y espacios y no modifica la contraseña', () => {
  for (const confirmacion of ['password1', 'Password1 ', '']) {
    assert.ok(validateRegistration({ ...valid, confirmacion }).confirmacion)
  }
  assert.deepEqual(
    validateRegistration({
      ...valid,
      contrasenia: ' Password1 ',
      confirmacion: ' Password1 ',
    }),
    {},
  )
})
