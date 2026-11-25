import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App.jsx'
import ActivatePage, { ActivationAccount } from '../src/features/auth/pages/ActivatePage.jsx'
import DashboardPage from '../src/features/auth/pages/DashboardPage.jsx'
import ReporteDetalleModal from '../src/features/reportes/components/ReporteDetalleModal.jsx'
import AsignacionesPage from '../src/features/asignaciones/pages/AsignacionesPage.jsx'
import BloquesList from '../src/features/espacios/components/BloquesList.jsx'
import BloquesPage from '../src/features/espacios/pages/BloquesPage.jsx'
import ImportarHorariosPage from '../src/features/franjas/pages/ImportarHorariosPage.jsx'
import VerifyEmailPage from '../src/features/auth/pages/VerifyEmailPage.jsx'
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
check('módulo de asignaciones muestra filtros y estructura del horario', () => {
  const html = renderToStaticMarkup(<AsignacionesPage token="jwt" sedeId={2} />)
  for (const text of ['Asignaciones', 'Franjas', 'Pendientes', 'Asignadas', 'Inicio', 'Fin', 'Buscar por nombre', 'Tipo de espacio', 'Bloque', 'Piso', 'Cargando horario…']) assert.ok(html.includes(text))
  assert.ok(!html.includes('Bearer jwt'))
})
check('módulo de horarios muestra plantilla, carga y conteos', () => {
  const html = renderToStaticMarkup(<ImportarHorariosPage token="jwt" />)
  for (const text of ['Importar horarios', 'Descargar plantilla Excel', 'horarios-archivo', '2. Sube el Excel', 'CATALOGO ASIGNATURA - SRA']) assert.ok(html.includes(text))
  assert.ok(!html.includes('Bearer jwt'))
})
check('el menú ofrece importar horarios debajo de importar usuarios', () => {
  const html = renderToStaticMarkup(<DashboardPage route="/dashboard/horarios" session={{ token: 'jwt', user: { nombre: 'Admin' } }} />)
  assert.ok(html.includes('href="#/dashboard/horarios"'))
  assert.ok(html.indexOf('href="#/dashboard/usuarios"') < html.indexOf('href="#/dashboard/horarios"'))
  assert.ok(html.includes('<span>Importar horarios</span>'))
})
check('el panel enlaza la sección de asignaciones', () => {
  const html = renderToStaticMarkup(<DashboardPage route="/dashboard/asignaciones" session={{ token: 'jwt', user: { nombre: 'Admin', sedeId: 2 } }} />)
  assert.ok(html.includes('href="#/dashboard/asignaciones"'))
  assert.ok(html.includes('Franjas'))
})
check('solicitud de enlace usa el layout de verificación con el formulario de correo', () => {
  const html = renderToStaticMarkup(<VerifyEmailPage pending={null} onEmail={() => {}} />)
  for (const text of ['verification-page', 'verification-card', 'Solicita un enlace', 'Correo institucional', 'Continuar', 'Volver al inicio de sesión']) assert.ok(html.includes(text))
  assert.ok(!html.includes('registration-shell'))
})
check('reenvío de enlace conserva correo, estado y acciones de la verificación', () => {
  const html = renderToStaticMarkup(<VerifyEmailPage pending={{ email: 'cuenta@correounivalle.edu.co' }} onEmail={() => {}} />)
  for (const text of ['verification-page', 'Revisa tu correo', 'cuenta@correounivalle.edu.co', 'Reenviar enlace', 'Usar otro correo', 'El enlace vence en 24 horas']) assert.ok(html.includes(text))
  assert.ok(!html.includes('Bearer'))
})
const reportePendiente = {
  id: 9,
  tipoAnomaliaNombre: 'FALTA DE ASEO',
  estado: 'PENDIENTE',
  creadoEn: '2026-11-15T10:00:00',
  tieneEvidencia: false,
}
const propsDetalle = {
  cargando: false,
  error: '',
  evidenciaUrl: null,
  evidenciaCargando: false,
  evidenciaError: '',
  puedeCompletar: true,
  completando: false,
  completarError: '',
  onCompletar: () => {},
  onCerrar: () => {},
  onReintentar: () => {},
}
check('el detalle permite al administrador completar un reporte pendiente', () => {
  const html = renderToStaticMarkup(<ReporteDetalleModal {...propsDetalle} reporte={reportePendiente} />)
  assert.ok(html.includes('Completar reporte'))
})
check('un reporte completado ya no ofrece la acción de completar', () => {
  const html = renderToStaticMarkup(
    <ReporteDetalleModal {...propsDetalle} reporte={{ ...reportePendiente, id: 10, estado: 'COMPLETADO' }} />,
  )
  assert.ok(!html.includes('Completar reporte'))
})

const sesionAdmin = { token: 'jwt', user: { nombre: 'Admin', sedeId: 2 } }

check('el módulo de espacios unifica encabezado y pestañas sin la pantalla intermedia', () => {
  const html = renderToStaticMarkup(
    <DashboardPage route="/dashboard/espacios" session={sesionAdmin} />,
  )
  assert.ok(html.includes('Infraestructura'))
  assert.ok(html.includes('Administrar espacios'))
  assert.ok(html.includes('href="#/dashboard/espacios/bloques"'))
  assert.ok(html.includes('Añadir espacio'))
  assert.ok(!html.includes('Elige qué quieres gestionar'))
  assert.ok(!html.includes('Gestionar bloques'))
})

check('la pestaña activa refleja la ruta de espacios y de bloques', () => {
  const pestanaActiva = (html, destino) =>
    new RegExp(`<a[^>]*href="${destino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*aria-current="page"`).test(html)

  const enEspacios = renderToStaticMarkup(
    <DashboardPage route="/dashboard/espacios" session={sesionAdmin} />,
  )
  assert.ok(pestanaActiva(enEspacios, '#/dashboard/espacios'))
  assert.ok(!pestanaActiva(enEspacios, '#/dashboard/espacios/bloques'))

  const enBloques = renderToStaticMarkup(
    <DashboardPage route="/dashboard/espacios/bloques" session={sesionAdmin} />,
  )
  assert.ok(pestanaActiva(enBloques, '#/dashboard/espacios/bloques'))
  assert.ok(!pestanaActiva(enBloques, '#/dashboard/espacios'))
  assert.ok(enBloques.includes('Añadir bloque'))
  assert.ok(enBloques.includes('Bloques registrados'))
})

check('la ruta heredada de espacios abre la pestaña de espacios', () => {
  const html = renderToStaticMarkup(
    <DashboardPage route="/dashboard/espacios/espacios" session={sesionAdmin} />,
  )
  assert.ok(/<a[^>]*href="#\/dashboard\/espacios"[^>]*aria-current="page"/.test(html))
  assert.ok(html.includes('Añadir espacio'))
})

check('el enlace lateral de espacios sigue activo en las tres rutas', () => {
  for (const ruta of ['/dashboard/espacios', '/dashboard/espacios/espacios', '/dashboard/espacios/bloques']) {
    const html = renderToStaticMarkup(<DashboardPage route={ruta} session={sesionAdmin} />)
    const enlace = html.match(/<a[^>]*href="#\/dashboard\/espacios"[^>]*class="sidebar-link active"/)?.[0] ?? ''
    assert.ok(enlace, ruta)
  }
})

const inicialesEn = (html) =>
  html.match(/<span class="user-avatar"[^>]*>([^<]*)<\/span>/)?.[1]?.trim() ?? ''

check('el avatar toma las iniciales del nombre del administrador', () => {
  const html = renderToStaticMarkup(
    <DashboardPage
      route="/dashboard/asignaciones"
      session={{ token: 'jwt', user: { nombre: 'Esteban Moreno Roa', correoInstitucional: 'esteban.moreno@correounivalle.edu.co' } }}
    />,
  )
  assert.equal(inicialesEn(html), 'EM')
  assert.ok(html.includes('Esteban Moreno Roa'))
  assert.ok(html.includes('aria-haspopup="menu"'))
  assert.ok(html.includes('aria-expanded="false"'))
  assert.ok(/<span class="user-avatar" aria-hidden="true">/.test(html))
})

check('el avatar usa el correo cuando falta el nombre', () => {
  const html = renderToStaticMarkup(
    <DashboardPage
      route="/dashboard/horarios"
      session={{ token: 'jwt', user: { correoInstitucional: 'lady.vidal@correounivalle.edu.co' } }}
    />,
  )
  assert.equal(inicialesEn(html), 'LV')
  assert.ok(html.includes('Administrador'))
})

check('el avatar cae a iniciales fiables sin nombre ni correo', () => {
  const html = renderToStaticMarkup(
    <DashboardPage route="/dashboard/reportes" session={{ token: 'jwt', user: {} }} />,
  )
  assert.equal(inicialesEn(html), 'AD')
  assert.ok(html.includes('Administrador'))
})

check('la lista de bloques muestra nombre, pisos y selección accesible', () => {
  const html = renderToStaticMarkup(
    <BloquesList
      bloques={[
        { id: 1, nombre: 'Bloque A', pisos: 3 },
        { id: 2, nombre: 'Bloque B', pisos: 1 },
      ]}
      selectedId={1}
      onSelect={() => {}}
    />,
  )
  assert.ok(html.includes('Bloque A'))
  assert.ok(html.includes('Bloque B'))
  assert.ok(html.includes('3 pisos'))
  assert.ok(html.includes('1 piso'))

  const seleccionado = html.match(/<button[^>]*aria-pressed="true"[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? ''
  const sinSeleccionar = html.match(/<button[^>]*aria-pressed="false"[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? ''
  assert.ok(seleccionado.includes('Bloque A'))
  assert.ok(sinSeleccionar.includes('Bloque B'))
})

check('la pestaña de bloques conserva encabezado, alta y estados', () => {
  const html = renderToStaticMarkup(<BloquesPage token="jwt" />)
  assert.ok(html.includes('Bloques registrados'))
  assert.ok(html.includes('Añadir bloque'))
  assert.ok(html.includes('Cargando bloques…'))
  assert.ok(!html.includes('bloques-list'))
})

clearSession()
console.log(`${count} comprobaciones de componentes aprobadas.`)
