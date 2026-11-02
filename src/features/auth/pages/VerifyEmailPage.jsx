import { useEffect, useRef, useState } from 'react'
import RegistrationLayout from '../components/RegistrationLayout'
import { resendVerification } from '../services/authApi'
import {
  getPendingVerification,
  RESEND_WAIT_MS,
  resendSecondsRemaining,
  savePendingVerification,
} from '../services/verification.js'

export default function VerifyEmailPage({ pending }) {
  const [availableAt, setAvailableAt] = useState(
    pending?.resendAvailableAt ?? 0,
  )
  const [now, setNow] = useState(Date.now)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const busy = useRef(false)
  const seconds = resendSecondsRemaining(availableAt, now)
  const cooldownActive = seconds > 0

  useEffect(() => {
    if (!cooldownActive) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [cooldownActive])

  async function handleResend() {
    const saved = getPendingVerification()
    const deadline = Math.max(
      availableAt,
      saved?.email === pending.email ? saved.resendAvailableAt : 0,
    )
    if (busy.current || resendSecondsRemaining(deadline) > 0) return
    busy.current = true
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const response = await resendVerification(pending.email)
      const nextAvailableAt = Date.now() + RESEND_WAIT_MS
      savePendingVerification(pending.email, nextAvailableAt)
      setAvailableAt(nextAvailableAt)
      setNow(Date.now())
      setMessage(
        response?.message ||
          'Solicitud procesada. Si tu cuenta está pendiente de verificación, recibirás un nuevo enlace.',
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      busy.current = false
      setLoading(false)
    }
  }

  if (!pending) {
    return (
      <RegistrationLayout title="Verifica tu correo">
        <p className="verification-copy">
          Crea una cuenta o inicia sesión con tu cuenta pendiente para reenviar
          el enlace de verificación.
        </p>
        <a className="registration-primary" href="#/registro">
          Crear cuenta
        </a>
        <a className="registration-link" href="#/login">
          Volver al inicio de sesión
        </a>
      </RegistrationLayout>
    )
  }

  return (
    <RegistrationLayout
      title="Revisa tu correo"
      subtitle="Busca el enlace de verificación en:"
    >
      <p className="verification-email">{pending.email}</p>
      <p className="verification-copy">
        Abre el enlace desde tu correo para activar tu cuenta. Luego podrás
        iniciar sesión.
      </p>
      <p className="verification-hint">
        El enlace vence en 24 horas. Si no lo encuentras, revisa también el
        correo no deseado.
      </p>
      <div aria-live="polite" role="status">
        {message && <p className="registration-message">{message}</p>}
      </div>
      {error && (
        <p
          className="registration-message registration-message--error"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        className="registration-primary"
        type="button"
        disabled={loading || seconds > 0}
        onClick={handleResend}
        aria-busy={loading}
      >
        {loading
          ? 'Solicitando enlace…'
          : seconds > 0
            ? `Reenviar en ${seconds}s`
            : 'Reenviar enlace'}
      </button>
      <a className="registration-link" href="#/login">
        Volver al inicio de sesión
      </a>
      <p className="verification-hint verification-hint--last">
        Las cuentas de estudiantes acceden desde la aplicación móvil.
      </p>
    </RegistrationLayout>
  )
}
