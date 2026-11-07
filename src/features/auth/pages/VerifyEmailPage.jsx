import { useEffect, useRef, useState } from 'react'
import RegistrationLayout from '../components/RegistrationLayout'
import { isInstitutionalEmail } from '../validation/registration.js'
import { resendVerification } from '../services/authApi'
import {
  getPendingVerification,
  RESEND_WAIT_MS,
  resendSecondsRemaining,
  savePendingVerification,
} from '../services/verification.js'

export default function VerifyEmailPage({ pending, onEmail }) {
  const [email, setEmail] = useState(pending?.email ?? '')
  const [changing, setChanging] = useState(false)
  const [emailError, setEmailError] = useState('')
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

  if (!pending || changing) {
    return <RegistrationLayout title="Solicita un enlace" subtitle="Escribe el correo institucional asociado a tu cuenta.">
      <form className="registration-form" onSubmit={event => {
        event.preventDefault()
        if (!isInstitutionalEmail(email)) { setEmailError('Usa tu correo @correounivalle.edu.co.'); return }
        setChanging(false); onEmail(email)
      }} noValidate>
        <div className="registration-field"><label htmlFor="resend-email">Correo institucional</label>
          <input id="resend-email" type="email" maxLength={150} autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setEmailError('') }} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'resend-error' : undefined} required />
          {emailError && <p id="resend-error" role="alert">{emailError}</p>}
        </div>
        <button className="registration-primary" type="submit">Continuar</button>
      </form>
      <a className="registration-link" href="#/login">Volver al inicio de sesión</a>
    </RegistrationLayout>
  }

  return (
    <RegistrationLayout
      title="Revisa tu correo"
      subtitle="Solicita un enlace para esta cuenta:"
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
      <button className="registration-link" type="button" onClick={() => { setEmail(pending.email); setChanging(true) }}>Usar otro correo</button>
      <p className="verification-hint verification-hint--last">
        Las cuentas no administrativas acceden desde la aplicación móvil. La solicitud no garantiza entrega inmediata.
      </p>
    </RegistrationLayout>
  )
}
