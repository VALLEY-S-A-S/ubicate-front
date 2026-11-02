import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import {
  getPendingVerification,
  RESEND_WAIT_MS,
  resendSecondsRemaining,
  savePendingVerification,
} from './verification.js'

let storage
beforeEach(() => {
  storage = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  }
  // Un registro corrupto debe descartar cualquier respaldo previo en memoria.
  storage.set('ubicate.pendingVerification', 'null')
  getPendingVerification()
})

test('guarda únicamente correo normalizado y plazo; conserva el plazo del mismo usuario', () => {
  savePendingVerification(' NICOLE@CORREOUNIVALLE.EDU.CO ', 50_000)
  assert.deepEqual(savePendingVerification('nicole@correounivalle.edu.co'), {
    email: 'nicole@correounivalle.edu.co',
    resendAvailableAt: 50_000,
  })
  assert.deepEqual(
    Object.keys(JSON.parse(storage.get('ubicate.pendingVerification'))),
    ['email', 'resendAvailableAt'],
  )
})

test('otro correo no hereda el plazo anterior', () => {
  savePendingVerification('nicole@correounivalle.edu.co', 50_000)
  assert.equal(
    savePendingVerification('otro@correounivalle.edu.co').resendAvailableAt,
    0,
  )
})

test('correo ausente o inválido no habilita reenvíos', () => {
  assert.equal(getPendingVerification(), null)
  assert.equal(savePendingVerification('a@gmail.com'), null)
  storage.set('ubicate.pendingVerification', JSON.stringify({ email: 123 }))
  assert.equal(getPendingVerification(), null)
})

test('plazo usa tiempo absoluto y nunca muestra segundos negativos', () => {
  assert.equal(RESEND_WAIT_MS, 30_000)
  assert.equal(resendSecondsRemaining(31_000, 1_000), 30)
  assert.equal(resendSecondsRemaining(31_000, 30_001), 1)
  assert.equal(resendSecondsRemaining(31_000, 32_000), 0)
})

test('estado borrado o corrupto no recupera un correo anterior', () => {
  savePendingVerification('nicole@correounivalle.edu.co')
  storage.delete('ubicate.pendingVerification')
  assert.equal(getPendingVerification(), null)
  savePendingVerification('nicole@correounivalle.edu.co')
  storage.set('ubicate.pendingVerification', '{')
  assert.equal(getPendingVerification(), null)
})

test('almacenamiento bloqueado conserva el flujo en memoria', () => {
  globalThis.sessionStorage = {
    getItem() {
      throw new Error('Blocked')
    },
    setItem() {
      throw new Error('Blocked')
    },
  }
  savePendingVerification('nicole@correounivalle.edu.co', 40_000)
  assert.equal(getPendingVerification().resendAvailableAt, 40_000)
})

test('cuota de almacenamiento agotada conserva el correo nuevo en memoria', () => {
  globalThis.sessionStorage = {
    getItem: () => null,
    setItem() {
      throw new Error('Quota exceeded')
    },
  }
  savePendingVerification('otro@correounivalle.edu.co', 60_000)
  assert.deepEqual(getPendingVerification(), {
    email: 'otro@correounivalle.edu.co',
    resendAvailableAt: 60_000,
  })
})
