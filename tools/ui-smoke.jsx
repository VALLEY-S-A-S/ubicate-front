import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App.jsx'
import ActivatePage, { ActivationAccount } from '../src/features/auth/pages/ActivatePage.jsx'
import DashboardPage from '../src/features/auth/pages/DashboardPage.jsx'
import { clearSession, saveSession } from '../src/features/auth/services/session.js'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value), removeItem: key => storage.delete(key) }
globalThis.window = { location: { hash: '#/login' } }
clearSession()
let count = 0
function check(label, run) { run(); count++; console.log('OK:', label) }
check('configuración no se muestra antes de comprobar bootstrap-status', () => {
  window.location.hash = '#/registro'
  const html = renderToStaticMarkup(<App />)
  assert.ok(html.includes('Comprobando configuración'))
  assert.ok(!html.includes('register-bootstrapKey'))
})
check('sesión almacenada no permite abrir el panel sin /me', () => {
  saveSession({ token: 'jwt-no-verificado', user: { nombre: 'Falso', rol: 'ADMIN' } })
  window.location.hash = '#/dashboard/usuarios'
  const html = renderToStaticMarkup(<App />)
  assert.ok(html.includes('Comprobando tu sesión'))
  assert.ok(!html.includes('usuarios-archivo'))
})
check('activación pública sigue accesible con otra sesión y no imprime el token', () => {
  const token = 'ab'.repeat(32)
  window.location.hash = '#/activar-cuenta?token=' + token
  const html = renderToStaticMarkup(<App />)
  assert.ok(html.includes('Comprobando el enlace de activación'))
  assert.ok(!html.includes(token)); assert.ok(!html.includes('usuarios-archivo'))
})
check('enlace incompleto no ofrece formulario de activación', () => {
  const html = renderToStaticMarkup(<ActivatePage token={null} />)
  assert.ok(html.includes('Abre el enlace completo')); assert.ok(!html.includes('activate-contrasenia'))
})
check('módulo de usuarios renderiza navegación, carga y consulta', () => {
  window.location.hash = '#/dashboard/usuarios'
  const html = renderToStaticMarkup(<DashboardPage route="/dashboard/usuarios" session={{ token: 'jwt', user: { nombre: 'Admin' } }} />)
  for (const text of ['Descargar plantilla Excel', 'usuarios-archivo', 'Seguimiento de importación', 'CEDULA O CODIGO', 'AUXILIAR ADMINISTRATIVA' ]) assert.ok(html.includes(text))
  assert.ok(!html.includes('Bearer jwt'))
})
check('correo verificado se presenta en campo de solo lectura', () => {
  const html = renderToStaticMarkup(<ActivationAccount correo="cuenta@correounivalle.edu.co" />)
  assert.ok(html.includes('value="cuenta@correounivalle.edu.co"'))
  assert.match(html, /readonly=""/i)
  assert.ok(html.includes('Correo institucional de esta cuenta'))
})
clearSession()
console.log(`${count} comprobaciones de componentes aprobadas.`)
