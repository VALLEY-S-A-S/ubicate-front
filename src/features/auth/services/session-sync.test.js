import assert from 'node:assert/strict'
import { test } from 'node:test'

const KEY = 'ubicate.session'
const PROFILE = { id: 1, nombre: 'Admin', correoInstitucional: 'admin@correounivalle.edu.co', rol: 'ADMIN', sedeId: 2 }
let instance = 0

// Dos módulos independientes representan dos pestañas; comparten únicamente
// localStorage y reciben storage solo cuando cambia el valor, como el navegador.
async function twoTabs(run) {
  const previousStorage = globalThis.localStorage
  const NativeDate = globalThis.Date
  let tick = 0
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [1794000000000 + tick++ * 1000])) }
  }
  const values = new Map([[KEY, JSON.stringify({ token: 'jwt-a', user: PROFILE, savedAt: '2026-11-06T12:00:00.000Z' })]])
  const pending = []
  const tabs = []
  let writes = 0
  function inside(tab, action) {
    globalThis.localStorage = tab.storage
    return action()
  }
  function notify(source, key) {
    for (const tab of tabs) if (tab !== source) pending.push({ tab, key })
  }
  function bind(tab, token) {
    tab.stop?.()
    tab.token = token
    tab.stop = tab.session.subscribeSessionChanges(token, next => {
      bind(tab, next?.token ?? null)
      if (next) {
        tab.validations++
        // Respuesta equivalente a /me: misma identidad obtenida del servidor.
        tab.session.saveSession({ token: next.token, user: PROFILE })
      }
    }, tab.events)
  }
  try {
    for (let i = 0; i < 2; i++) {
      const tab = { session: await import(`./session.js?regression-tab=${++instance}`), events: new EventTarget(), validations: 0 }
      tab.storage = {
        getItem: key => values.get(key) ?? null,
        setItem(key, value) {
          if (values.get(key) === value) return
          writes++; values.set(key, value); notify(tab, key)
        },
        removeItem(key) { if (values.delete(key)) notify(tab, key) },
      }
      tabs.push(tab)
      inside(tab, () => bind(tab, 'jwt-a'))
    }
    const flush = () => {
      let delivered = 0
      while (pending.length) {
        assert.ok(delivered++ < 20, 'Las pestañas entraron en un ciclo de validación de sesión')
        const { tab, key } = pending.shift()
        const event = new Event('storage')
        Object.defineProperty(event, 'key', { value: key })
        inside(tab, () => tab.events.dispatchEvent(event))
      }
    }
    await run({ tabs, inside, bind, flush, values, writes: () => writes })
  } finally {
    for (const tab of tabs) tab.stop?.()
    globalThis.Date = NativeDate
    if (previousStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = previousStorage
  }
}

test('consultas de /me en dos pestañas no se realimentan ni reescriben la fecha', async () => {
  await twoTabs(({ tabs, inside, flush, values, writes }) => {
    const original = values.get(KEY)
    for (let i = 0; i < 3; i++) for (const tab of tabs) inside(tab, () => tab.session.saveSession({ token: 'jwt-a', user: PROFILE }))
    flush()
    assert.equal(writes(), 0)
    assert.equal(values.get(KEY), original)
    assert.deepEqual(tabs.map(tab => tab.validations), [0, 0])
  })
})

test('actualizar perfil del mismo token no dispara /me ni adopta permisos locales en la otra pestaña', async () => {
  await twoTabs(({ tabs, inside, flush, values, writes }) => {
    inside(tabs[0], () => tabs[0].session.saveSession({ token: 'jwt-a', user: { ...PROFILE, rol: 'LOGISTICA' } }))
    flush()
    assert.equal(writes(), 1)
    assert.equal(JSON.parse(values.get(KEY)).savedAt, '2026-11-06T12:00:00.000Z')
    assert.deepEqual(tabs.map(tab => tab.validations), [0, 0])
    assert.deepEqual(tabs.map(tab => tab.token), ['jwt-a', 'jwt-a'])
  })
})

test('un token nuevo se valida una sola vez en la otra pestaña y no rebota', async () => {
  await twoTabs(({ tabs, inside, bind, flush, writes }) => {
    inside(tabs[0], () => {
      bind(tabs[0], 'jwt-b')
      tabs[0].session.saveSession({ token: 'jwt-b', user: PROFILE })
    })
    flush()
    assert.deepEqual(tabs.map(tab => tab.token), ['jwt-b', 'jwt-b'])
    assert.deepEqual(tabs.map(tab => tab.validations), [0, 1])
    assert.equal(writes(), 1)
  })
})

test('logout se propaga y limpiar el listener detiene notificaciones posteriores', async () => {
  await twoTabs(({ tabs, inside, flush }) => {
    inside(tabs[0], () => tabs[0].session.clearSession())
    flush()
    assert.equal(tabs[1].token, null)
    assert.deepEqual(tabs.map(tab => tab.validations), [0, 0])
    tabs[1].stop()
    inside(tabs[0], () => tabs[0].session.saveSession({ token: 'jwt-c', user: PROFILE }))
    flush()
    assert.equal(tabs[1].token, null)
  })
})
