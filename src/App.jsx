/**
 * Composición principal de la aplicación.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Recupera la sesión guardada y decide entre el login, el registro, la
 * verificación de correo y el panel administrativo.
 */

import { useEffect, useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import DashboardPage from './features/auth/pages/DashboardPage'
import { isAdminRole } from './features/auth/services/authApi'
import { clearSession, getSession } from './features/auth/services/session'
import {
  getPendingVerification,
  savePendingVerification,
} from './features/auth/services/verification.js'

const ROUTES = new Set(['/login', '/registro', '/verificar-correo'])
const DASHBOARD_BASE = '/dashboard'

function isDashboardRoute(route) {
  return route === DASHBOARD_BASE || route.startsWith(`${DASHBOARD_BASE}/`)
}

function getRoute() {
  const route = window.location.hash.slice(1)

  // Cualquier subruta de /dashboard se considera parte del panel.
  if (isDashboardRoute(route)) {
    return route
  }

  return ROUTES.has(route) ? route : '/login'
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [pending, setPending] = useState(getPendingVerification)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRoute())
      setPending(getPendingVerification())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const titles = {
      '/login': 'Iniciar sesión',
      '/registro': 'Crear cuenta',
      '/verificar-correo': 'Revisa tu correo',
    }
    document.title = `Ubícate | ${
      isDashboardRoute(route) ? 'Dashboard' : titles[route]
    }`
    document.querySelector('main [tabindex="-1"]')?.focus()
    window.scrollTo(0, 0)
  }, [route])

  const handleVerification = (email) => {
    setPending(savePendingVerification(email))
    window.location.hash = '/verificar-correo'
  }

  // Solo se restaura la sesión si sigue perteneciendo a un administrador.
  const [session, setSession] = useState(() => {
    const storedSession = getSession()

    if (!storedSession || !isAdminRole(storedSession.user?.rol)) {
      clearSession()
      return null
    }

    return storedSession
  })

  const handleLogin = () => {
    setSession(getSession())
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    window.history.replaceState(null, '', '#/login')
    setRoute('/login')
  }

  // Redirecciones de una sola pasada: cada condición deja de cumplirse tras
  // actualizar la ruta, por lo que no se producen bucles. El cambio de hash
  // dispara hashchange y actualiza el estado de la ruta.
  useEffect(() => {
    const isAdmin = session && isAdminRole(session.user?.rol)
    let target = null

    if (isAdmin && !isDashboardRoute(route)) {
      target = `#${DASHBOARD_BASE}`
    } else if (!session && isDashboardRoute(route)) {
      target = '#/login'
    }

    if (target) {
      window.location.replace(target)
    }
  }, [session, route])

  if (!session) {
    if (route === '/registro')
      return <RegisterPage onRegistered={handleVerification} />
    if (route === '/verificar-correo')
      return (
        <VerifyEmailPage key={pending?.email ?? 'missing'} pending={pending} />
      )
    return (
      <LoginPage
        onSuccess={handleLogin}
        onVerificationRequired={handleVerification}
      />
    )
  }

  if (isAdminRole(session.user?.rol)) {
    return <DashboardPage onLogout={handleLogout} session={session} />
  }

  clearSession()
  return (
    <main className="session-screen">
      <section className="session-card">
        <p className="session-card__eyebrow">Sesión iniciada</p>
        <h1>Hola, {session.user?.nombre ?? 'administrador'}</h1>
        <p>No tienes permiso para acceder al panel.</p>
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}

export default App
