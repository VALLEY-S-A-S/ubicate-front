import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ROLES_REPORTANTE, etiquetaRol } from './reportes.js'

test('los filtros usan los roles vigentes de la matriz', () => {
  const roles = ROLES_REPORTANTE.map((rol) => rol.value)
  assert.ok(roles.includes('LOGISTICA'))
  assert.ok(roles.includes('PERSONAL'))
  assert.ok(!roles.includes('OPERARIO'))
})

test('las etiquetas distinguen Logística y Personal', () => {
  assert.equal(etiquetaRol('LOGISTICA'), 'Logística')
  assert.equal(etiquetaRol('PERSONAL'), 'Personal')
  assert.equal(etiquetaRol('ADMINISTRADOR'), 'Administrador')
})
