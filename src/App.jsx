/**
 * Composición principal de la aplicación.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Recupera la sesión guardada y decide entre el login y el placeholder del
 * panel. El placeholder es temporal hasta que se implemente el dashboard.
 */

import { useEffect, useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import { isAdminRole } from './features/auth/services/authApi'
import { clearSession, getSession } from './features/auth/services/session'
import {
  getPendingVerification,
  savePendingVerification,
} from './features/auth/services/verification.js'

const ROUTES = new Set(['/login', '/registro', '/verificar-correo'])

function getRoute() {
  const route = window.location.hash.slice(1)
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
    document.title = `Ubícate | ${titles[route]}`
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

  const handleLogout = () => {
    clearSession()
    setSession(null)
  }

  if (!session) {
    if (route === '/registro')
      return <RegisterPage onRegistered={handleVerification} />
    if (route === '/verificar-correo')
      return (
        <VerifyEmailPage key={pending?.email ?? 'missing'} pending={pending} />
      )
    return (
      <LoginPage
        onSuccess={() => setSession(getSession())}
        onVerificationRequired={handleVerification}
      />
    )
  }

  return (
    <main className="session-screen">
      <section className="session-card">
        <p className="session-card__eyebrow">Sesión iniciada</p>
        <h1>Hola, {session.user?.nombre ?? 'administrador'}</h1>
        <p>El panel de administración se está construyendo.</p>
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}

export default App
