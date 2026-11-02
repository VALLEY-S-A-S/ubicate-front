import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateEspacio } from './espacios.js'

const valid = {
  tipoEspacioId: 1,
  codigo: 'SAL-101',
  nombre: 'Salón 101',
  bloqueId: '',
  piso: '',
}

test('acepta un espacio válido sin ubicación', () => {
  assert.deepEqual(validateEspacio(valid), {})
})

test('acepta un espacio con bloque y piso válidos', () => {
  assert.deepEqual(
    validateEspacio({ ...valid, bloqueId: 3, piso: '2', maxPisos: 4 }),
    {},
  )
})

test('rechaza tipo vacío, código y nombre obligatorios', () => {
  assert.equal(
    validateEspacio({ ...valid, tipoEspacioId: '' }).tipoEspacioId,
    'Selecciona un tipo de espacio',
  )
  assert.equal(
    validateEspacio({ ...valid, codigo: '' }).codigo,
    'Este campo es obligatorio',
  )
  assert.equal(
    validateEspacio({ ...valid, nombre: '  ' }).nombre,
    'Este campo es obligatorio',
  )
})

test('rechaza código y nombre que superan el límite', () => {
  assert.equal(
    validateEspacio({ ...valid, codigo: 'a'.repeat(51) }).codigo,
    'El código no puede superar los 50 caracteres',
  )
  assert.equal(
    validateEspacio({ ...valid, nombre: 'a'.repeat(151) }).nombre,
    'El nombre no puede superar los 150 caracteres',
  )
})

test('exige bloque y piso juntos', () => {
  assert.equal(
    validateEspacio({ ...valid, bloqueId: 3 }).piso,
    'Debes indicar bloque y piso juntos',
  )
  assert.equal(
    validateEspacio({ ...valid, piso: '2' }).piso,
    'Debes indicar bloque y piso juntos',
  )
})

test('rechaza piso no entero, menor a 1 y mayor al máximo del bloque', () => {
  assert.equal(
    validateEspacio({ ...valid, bloqueId: 3, piso: '2.5' }).piso,
    'El piso debe ser un número entero',
  )
  assert.equal(
    validateEspacio({ ...valid, bloqueId: 3, piso: '0' }).piso,
    'El piso debe ser mayor que 0',
  )
  assert.equal(
    validateEspacio({ ...valid, bloqueId: 3, piso: '5', maxPisos: 4 }).piso,
    'El piso debe estar entre 1 y 4',
  )
})
