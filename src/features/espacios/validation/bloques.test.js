import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateBloque } from './bloques.js'

const valid = { nombre: 'Bloque A', pisos: '3' }

test('acepta un bloque válido con espacios alrededor y límites de pisos', () => {
  assert.deepEqual(validateBloque({ nombre: '  Bloque A  ', pisos: '3' }), {})
  assert.deepEqual(validateBloque({ nombre: 'Bloque', pisos: '1' }), {})
  assert.deepEqual(validateBloque({ nombre: 'Bloque', pisos: '50' }), {})
})

test('rechaza nombre vacío, solo espacios y mayor a 100 caracteres', () => {
  assert.equal(
    validateBloque({ nombre: '', pisos: '1' }).nombre,
    'Este campo es obligatorio',
  )
  assert.equal(
    validateBloque({ nombre: '   ', pisos: '1' }).nombre,
    'Este campo es obligatorio',
  )
  assert.equal(
    validateBloque({ nombre: 'a'.repeat(101), pisos: '1' }).nombre,
    'El nombre no puede superar los 100 caracteres',
  )
  assert.equal(
    validateBloque({ nombre: 'a'.repeat(100), pisos: '1' }).nombre,
    undefined,
  )
})

test('rechaza pisos vacío, 0, negativo, decimal, texto y mayor a 50', () => {
  for (const pisos of ['', '0', '-1', '2.5', 'dos', '51']) {
    assert.ok(validateBloque({ nombre: 'Bloque', pisos }).pisos, pisos)
  }
})
