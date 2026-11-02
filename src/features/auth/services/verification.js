import {
  isInstitutionalEmail,
  normalizeEmail,
} from '../validation/registration.js'

const KEY = 'ubicate.pendingVerification'
export const RESEND_WAIT_MS = 30_000

// Memoria de respaldo cuando el navegador bloquea sessionStorage.
let memory = null
let memoryOnly = false

export function getPendingVerification() {
  let saved
  try {
    if (!memoryOnly) saved = sessionStorage.getItem(KEY)
  } catch {
    // La navegación de la pestaña sigue funcionando sin almacenamiento.
  }
  if (saved !== undefined) {
    try {
      memory = saved ? JSON.parse(saved) : null
    } catch {
      memory = null
    }
  }
  if (
    !memory ||
    typeof memory.email !== 'string' ||
    !isInstitutionalEmail(memory.email)
  )
    return null
  return {
    email: normalizeEmail(memory.email),
    resendAvailableAt: Number.isFinite(memory.resendAvailableAt)
      ? memory.resendAvailableAt
      : 0,
  }
}

export function savePendingVerification(email, resendAvailableAt = 0) {
  if (!isInstitutionalEmail(email)) return null
  const previous = getPendingVerification()
  memory = {
    email: normalizeEmail(email),
    resendAvailableAt:
      previous?.email === normalizeEmail(email)
        ? Math.max(previous.resendAvailableAt, resendAvailableAt)
        : resendAvailableAt,
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(memory))
    memoryOnly = false
  } catch {
    // Nunca se guardan contraseñas ni tokens en este estado.
    memoryOnly = true
  }
  return memory
}

export function resendSecondsRemaining(availableAt, now = Date.now()) {
  return Math.max(0, Math.ceil((availableAt - now) / 1000))
}
