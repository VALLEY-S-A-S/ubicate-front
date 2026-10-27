/**
 * Composición principal de la aplicación.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Recupera la sesión guardada y decide entre el login y el placeholder del
 * panel. El placeholder es temporal hasta que se implemente el dashboard.
 */

import { useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage'
import { isAdminRole } from './features/auth/services/authApi'
import { clearSession, getSession } from './features/auth/services/session'

function App() {
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
    return <LoginPage onSuccess={() => setSession(getSession())} />
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
