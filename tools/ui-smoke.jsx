import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App.jsx'
import ActivatePage, { ActivationAccount } from '../src/features/auth/pages/ActivatePage.jsx'
import DashboardPage from '../src/features/auth/pages/DashboardPage.jsx'
import ReporteDetalleModal from '../src/features/reportes/components/ReporteDetalleModal.jsx'
import AsignacionesPage from '../src/features/asignaciones/pages/AsignacionesPage.jsx'
import BloquesList, { filtrarBloques } from '../src/features/espacios/components/BloquesList.jsx'
import BloqueDetalle from '../src/features/espacios/components/BloqueDetalle.jsx'
import { BLOQUES_ICONOS, iconoBloque } from '../src/features/espacios/components/bloquesVisual.jsx'
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
check('módulo de horarios muestra plantilla, carga y vistazo', () => {
  const html = renderToStaticMarkup(<ImportarHorariosPage token="jwt" />)
  for (const text of ['Importar horarios', 'Gestión académica', 'Descargar plantilla Excel', 'horarios-archivo', 'Carga el archivo de horarios', 'Arrastra y suelta aquí tu archivo Excel', 'Seleccionar archivo', 'Formatos permitidos', 'Horarios cargados']) assert.ok(html.includes(text))
  assert.ok(html.includes('aria-label="Calendario con archivo Excel"'))
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
  assert.ok(html.includes('Buscar bloque'))
})

check('la búsqueda de bloques ignora mayúsculas y tildes', () => {
  const bloques = [
    { id: 1, nombre: 'Bloque A', pisos: 2 },
    { id: 2, nombre: 'Zona Deportiva', pisos: 1 },
    { id: 3, nombre: 'Álgebra', pisos: 3 },
  ]
  assert.deepEqual(filtrarBloques(bloques, 'BLOQUE a').map((b) => b.id), [1])
  assert.deepEqual(filtrarBloques(bloques, 'deportiva').map((b) => b.id), [2])
  assert.deepEqual(filtrarBloques(bloques, 'algebra').map((b) => b.id), [3])
  assert.equal(filtrarBloques(bloques, 'inexistente').length, 0)
  assert.equal(filtrarBloques(bloques, '   ').length, 3)
})

check('el detalle muestra métricas, pisos y acción de edición', () => {
  const html = renderToStaticMarkup(
    <BloqueDetalle
      bloque={{ id: 1, nombre: 'Bloque A', pisos: 2 }}
      resumen={{ total: 18, porPiso: { 1: 9, 2: 9 } }}
      vacio="Selecciona un bloque"
      onEdit={() => {}}
    />,
  )
  for (const text of [
    'Bloque',
    'Bloque A',
    'Pisos',
    'Espacios',
    '18',
    'Piso 1',
    'Piso 2',
    '9 espacios',
    'Editar bloque',
    'icon-tile',
  ]) {
    assert.ok(html.includes(text), `falta: ${text}`)
  }

  const sinSeleccion = renderToStaticMarkup(
    <BloqueDetalle
      bloque={null}
      resumen={undefined}
      vacio="Selecciona un bloque de la lista para ver su información."
    />,
  )
  assert.ok(sinSeleccion.includes('Selecciona un bloque de la lista para ver su información.'))
  assert.ok(!sinSeleccion.includes('icon-tile'))
})

check('el detalle sin conteos no inventa números de espacios', () => {
  const html = renderToStaticMarkup(
    <BloqueDetalle
      bloque={{ id: 4, nombre: 'Bloque B', pisos: 1 }}
      resumen={{ total: null, porPiso: {} }}
      vacio="Selecciona un bloque"
      onEdit={() => {}}
    />,
  )
  assert.ok(html.includes('—'))
  assert.ok(html.includes('Piso 1'))
  assert.ok(!html.includes('undefined'))
})

check('la lista usa icon-tile y estado activo', () => {
  const html = renderToStaticMarkup(
    <BloquesList
      bloques={[
        { id: 1, nombre: 'Bloque A', pisos: 3 },
        { id: 2, nombre: 'Zona Deportiva', pisos: 1 },
      ]}
      selectedId={2}
      onSelect={() => {}}
    />,
  )
  assert.equal((html.match(/icon-tile--medio/g) ?? []).length, 2)
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1)
  assert.ok(html.includes('bloques-list__item--active'))
  assert.ok(html.includes('Zona Deportiva'))
})

check('el ícono arranca en edificio y el nombre no decide nada', () => {
  assert.deepEqual(BLOQUES_ICONOS, ['edificio', 'balon', 'zona'])
  assert.equal(iconoBloque(undefined), 'edificio')
  assert.equal(iconoBloque(''), 'edificio')
  assert.equal(iconoBloque('lapiz'), 'edificio')
  assert.equal(iconoBloque('inexistente'), 'edificio')
  assert.equal(iconoBloque('balon'), 'balon')
  assert.equal(iconoBloque('zona'), 'zona')
  // Sin reglas automáticas: el nombre del bloque no cambia el resultado.
  assert.equal(iconoBloque(undefined), iconoBloque('Zona Deportiva'))
  assert.equal(iconoBloque(undefined), iconoBloque('Cancha Múltiple'))
  assert.equal(iconoBloque(undefined), iconoBloque('Salón Multicultural'))
})

check('el detalle ofrece las tres opciones de ícono', () => {
  const html = renderToStaticMarkup(
    <BloqueDetalle
      bloque={{ id: 7, nombre: 'Salón Multicultural', pisos: 1 }}
      resumen={{ total: 4, porPiso: { 1: 4 } }}
      vacio="Selecciona un bloque"
      onEdit={() => {}}
    />,
  )
  for (const etiqueta of ['Edificio', 'Balón', 'Árbol']) {
    assert.equal((html.match(new RegExp(`aria-label="${etiqueta}"`, 'g')) ?? []).length, 1, etiqueta)
  }
  assert.equal((html.match(/selector-icono--sel/g) ?? []).length, 1)
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1)
  const presionado = html.match(/<button[^>]*aria-pressed="true"[^>]*>/)?.[0] ?? ''
  assert.ok(presionado.includes('Edificio'), presionado)

  // La cabecera muestra el mismo ícono por defecto (edificio).
  const cabecera = html.slice(html.indexOf('bloque-detalle__cabecera'), html.indexOf('</header>'))
  assert.ok(cabecera.includes('M5 9h14M5 13h14M5 17h14M10 3v18M15 3v18'))
})

check('la elección manual de ícono se respeta en cabecera y lista', () => {
  const detalle = renderToStaticMarkup(
    <BloqueDetalle
      bloque={{ id: 7, nombre: 'Salón Multicultural', pisos: 1 }}
      resumen={{ total: 4, porPiso: { 1: 4 } }}
      vacio="Selecciona un bloque"
      onEdit={() => {}}
      iconos={{ 7: 'zona' }}
      onCambiarIcono={() => {}}
    />,
  )
  const cabecera = detalle.slice(detalle.indexOf('bloque-detalle__cabecera'), detalle.indexOf('</header>'))
  assert.ok(cabecera.includes('M12 3 7 10h3l-4 6h12l-4-6h3z'), 'la cabecera debe mostrar el árbol')
  const presionado = detalle.match(/<button[^>]*aria-pressed="true"[^>]*>/)?.[0] ?? ''
  assert.ok(presionado.includes('Árbol'), presionado)

  const lista = renderToStaticMarkup(
    <BloquesList
      bloques={[
        { id: 7, nombre: 'Salón Multicultural', pisos: 1 },
        { id: 8, nombre: 'Bloque A', pisos: 2 },
      ]}
      selectedId={7}
      onSelect={() => {}}
      iconos={{ 7: 'balon' }}
    />,
  )
  // Cada bloque pinta exactamente un ícono: el 7 cambió a balón y el 8
  // se queda en edificio porque no tiene elección manual.
  assert.equal((lista.match(/M12 3v18M3 12h18/g) ?? []).length, 1, 'el bloque 7 debe usar el balón')
  assert.equal((lista.match(/M5 9h14M5 13h14M5 17h14/g) ?? []).length, 1, 'el bloque 8 sigue en edificio')
})

clearSession()
console.log(`${count} comprobaciones de componentes aprobadas.`)
