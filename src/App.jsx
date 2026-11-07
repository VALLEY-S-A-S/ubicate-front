import { useEffect, useState } from 'react'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import ActivatePage from './features/auth/pages/ActivatePage'
import DashboardPage from './features/auth/pages/DashboardPage'
import { bootstrapStatus, isAdminRole, logout, me } from './features/auth/services/authApi'
import { clearSession, getSession, saveSession, subscribeSessionChanges } from './features/auth/services/session'
import { getPendingVerification, savePendingVerification } from './features/auth/services/verification.js'
import { isDashboardRoute, parseRoute } from './features/auth/services/routes.js'

export default function App() {
  const [location, setLocation] = useState(() => parseRoute(window.location.hash))
  const [pending, setPending] = useState(getPendingVerification)
  const [session, setSession] = useState(getSession)
  const [sessionStatus, setSessionStatus] = useState(() => getSession() ? 'checking' : 'ready')
  const [sessionError, setSessionError] = useState('')
  const [revision, setRevision] = useState(0)
  const [setup, setSetup] = useState({ state: 'loading', requiresSetup: false })
  const [setupRevision, setSetupRevision] = useState(0)
  const [notice, setNotice] = useState('')
  const route = location.path
  const token = session?.token
  const publicAccountRoute = route === '/activar-cuenta' || route === '/verificar-correo'

  useEffect(() => {
    const changed = () => { setLocation(parseRoute(window.location.hash)); setPending(getPendingVerification()) }
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    bootstrapStatus(controller.signal).then(data => {
      if (controller.signal.aborted) return
      if (typeof data?.requiresSetup !== 'boolean') throw new Error('No se pudo comprobar la configuración inicial.')
      setSetup({ state: 'ready', requiresSetup: data.requiresSetup })
    }).catch(error => {
      if (!controller.signal.aborted) setSetup({ state: 'error', requiresSetup: false, error: error.message })
    })
    return () => controller.abort()
  }, [setupRevision])

  useEffect(() => {
    if (!token || publicAccountRoute) return
    const controller = new AbortController()
    me(token, controller.signal).then(profile => {
      if (controller.signal.aborted || getSession()?.token !== token) return
      if (!isAdminRole(profile?.rol)) {
        clearSession(); setSession(null)
        setNotice('El panel web es solo para administradores. Usa la aplicación móvil.')
      } else {
        const checked = { token, user: profile }
        saveSession(checked); setSession(checked)
      }
      setSessionStatus('ready'); setSessionError('')
    }).catch(error => {
      if (controller.signal.aborted || error.status === 401) return
      setSessionStatus(current => current === 'checking' ? 'error' : current); setSessionError(error.message)
    })
    return () => controller.abort()
  }, [token, revision, publicAccountRoute])

  useEffect(() => {
    const unauthorized = event => {
      if (event.detail?.token !== token || getSession()?.token !== token) return
      clearSession(); setSession(null); setSessionStatus('ready')
      setNotice('Tu sesión ya no está disponible. Inicia sesión nuevamente.')
    }
    const stopSessionChanges = subscribeSessionChanges(token, next => {
      setSession(next); setSessionStatus('checking'); setRevision(value => value + 1)
    })
    const recheck = () => { if (token && !publicAccountRoute) setRevision(value => value + 1) }
    const interval = token && !publicAccountRoute ? setInterval(recheck, 60000) : null
    window.addEventListener('ubicate:unauthorized', unauthorized)
    window.addEventListener('focus', recheck)
    return () => {
      clearInterval(interval)
      window.removeEventListener('ubicate:unauthorized', unauthorized)
      stopSessionChanges()
      window.removeEventListener('focus', recheck)
    }
  }, [token, publicAccountRoute])

  useEffect(() => {
    const titles = { '/login': 'Iniciar sesión', '/registro': 'Configuración inicial', '/verificar-correo': 'Solicitar enlace', '/activar-cuenta': 'Activar cuenta' }
    document.title = `Ubícate | ${isDashboardRoute(route) ? 'Administración' : titles[route]}`
    document.querySelector('main [tabindex="-1"]')?.focus()
    window.scrollTo(0, 0)
  }, [route])

  useEffect(() => {
    if (token && sessionStatus === 'ready' && ['/login', '/registro'].includes(route)) window.location.replace('#/dashboard')
    else if (!token && isDashboardRoute(route)) window.location.replace('#/login')
  }, [route, token, sessionStatus])

  function retrySetup() { setSetup({ state: 'loading', requiresSetup: false }); setSetupRevision(value => value + 1) }
  function expire() {
    clearSession(); setSession(null); setSessionStatus('ready')
    setNotice('Tu sesión ya no está disponible. Inicia sesión nuevamente.')
  }
  async function remoteLogout() {
    try { await logout(token, session.user.correoInstitucional) }
    catch (error) { if (error.status !== 401) throw error }
    clearSession(); setSession(null); setSessionStatus('ready'); setNotice('Sesión cerrada.')
    window.location.hash = '/login'
  }
  function verification(email) { setPending(savePendingVerification(email)); window.location.hash = '/verificar-correo' }

  // Activación y reenvío sirven a todos los roles, incluso con otra sesión abierta.
  if (route === '/activar-cuenta') return <ActivatePage key={location.token ?? 'missing'} token={location.token} />
  if (route === '/verificar-correo') return <VerifyEmailPage key={pending?.email ?? 'missing'} pending={pending} onEmail={verification} />
  if (session && sessionStatus !== 'ready') return (
    <main className="session-screen"><section className="session-card" aria-live="polite">
      <h1>Comprobando tu sesión</h1>
      {sessionStatus === 'checking' ? <p>Un momento…</p> : <><p role="alert">{sessionError}</p><button onClick={() => { setSessionStatus('checking'); setRevision(value => value + 1) }}>Reintentar</button></>}
    </section></main>
  )
  if (session) return <><div aria-live="polite">{sessionError && <p className="session-warning" role="alert">No se pudo volver a comprobar la sesión. {sessionError} <button type="button" onClick={() => setRevision(value => value + 1)}>Reintentar</button></p>}</div><DashboardPage onLogout={expire} onRequestLogout={remoteLogout} session={session} route={route} /></>
  if (route === '/registro') {
    if (setup.state === 'ready' && setup.requiresSetup) return <RegisterPage onClosed={() => setSetup({ state: 'ready', requiresSetup: false })} onRegistered={() => {
      setSetup({ state: 'ready', requiresSetup: false }); setNotice('Administrador creado. Ya puedes iniciar sesión.'); window.location.hash = '/login'
    }} />
    return <main className="session-screen"><section className="session-card">
      <h1>{setup.state === 'loading' ? 'Comprobando configuración…' : setup.state === 'error' ? 'No se pudo comprobar el acceso' : 'Configuración inicial completada'}</h1>
      <p>{setup.state === 'error' ? setup.error : setup.state === 'loading' ? 'Espera un momento.' : 'Las cuentas nuevas se crean desde el panel de administración.'}</p>
      {setup.state === 'error' && <button onClick={retrySetup}>Reintentar</button>}
      <a className="registration-link" href="#/login">Ir al inicio de sesión</a>
    </section></main>
  }
  return <LoginPage notice={notice} setup={setup} onRetrySetup={retrySetup} onSuccess={next => {
    setSessionStatus('checking'); setSession(next); setNotice('')
  }} onVerificationRequired={verification} />
}
