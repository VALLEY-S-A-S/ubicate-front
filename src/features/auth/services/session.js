const SESSION_KEY = 'ubicate.session'
let memory = null
let memoryOnly = false

export function getSession() {
  try {
    if (!memoryOnly) {
      const raw = localStorage.getItem(SESSION_KEY)
      try { memory = raw ? JSON.parse(raw) : null } catch { memory = null }
    }
  } catch { /* La sesión puede continuar en memoria si el almacenamiento está bloqueado. */ }
  return typeof memory?.token === 'string' && memory.token ? memory : null
}
export function saveSession(session) {
  const previous = getSession()
  // Una verificación del mismo perfil no es una sesión nueva. Escribir una
  // fecha distinta en cada /me notificaba a las otras pestañas indefinidamente.
  if (previous?.token === session.token && JSON.stringify(previous.user) === JSON.stringify(session.user)) return
  memory = {
    token: session.token,
    user: session.user,
    savedAt: previous?.token === session.token ? previous.savedAt : new Date().toISOString(),
  }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(memory)); memoryOnly = false }
  catch { memoryOnly = true }
}
export function clearSession() {
  memory = null
  try { localStorage.removeItem(SESSION_KEY); memoryOnly = false }
  catch { memoryOnly = true }
}

export function subscribeSessionChanges(currentToken, onChange, target = window) {
  const changed = event => {
    if (event.key !== SESSION_KEY && event.key !== null) return
    const next = getSession()
    // El perfil local no concede permisos. Solo un login/logout diferente debe
    // disparar otra validación; un perfil del mismo token se refresca desde /me.
    if ((next?.token ?? null) === (currentToken ?? null)) return
    onChange(next)
  }
  target.addEventListener('storage', changed)
  return () => target.removeEventListener('storage', changed)
}
