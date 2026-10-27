/**
 * Persistencia de la sesión del administrador.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Guarda el JWT y los datos del usuario en localStorage. Al no existir refresh
 * token en el backend, la sesión se recupera al recargar y se limpia al salir.
 */

const SESSION_KEY = 'ubicate.session'

export function getSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    // Si el dato está corrupto o el almacenamiento no está disponible, se ignora.
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...session, savedAt: new Date().toISOString() }),
  )
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
