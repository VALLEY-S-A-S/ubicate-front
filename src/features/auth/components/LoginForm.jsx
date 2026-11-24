/**
 * Formulario de inicio de sesión.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Valida los campos, llama al backend, bloquea roles no administrativos y
 * guarda la sesión antes de avisar a la página para que continúe el flujo.
 */

import { useEffect, useRef, useState } from 'react'
import { ALLOWED_EMAIL_DOMAINS } from '../constants'
import { isAdminRole, login, me } from '../services/authApi'
import { saveSession } from '../services/session'
import { normalizeEmail } from '../validation/registration.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_VALUES = {
  correoInstitucional: '',
  contrasenia: '',
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.2 19.2a6.8 6.8 0 0 1 13.6 0" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.2 12s3.5-6.2 9.8-6.2S21.8 12 21.8 12s-3.5 6.2-9.8 6.2S2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 4 16 16" />
      <path d="M9.9 5.9A10.6 10.6 0 0 1 12 5.8c6.3 0 9.8 6.2 9.8 6.2a17 17 0 0 1-3.1 3.8" />
      <path d="M6.2 7.5A17.4 17.4 0 0 0 2.2 12s3.5 6.2 9.8 6.2c1.2 0 2.3-.2 3.3-.6" />
      <path d="M10.2 10.2a2.8 2.8 0 0 0 3.6 3.6" />
    </svg>
  )
}

function SignInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8.5 14 12l-4 3.5" />
      <path d="M14 12H4" />
    </svg>
  )
}

function LoginForm({ onSuccess, onVerificationRequired }) {
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const busy = useRef(false)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
    setPendingEmail('')
  }

  const validate = () => {
    const errors = {}
    const email = values.correoInstitucional.trim()

    if (!email) {
      errors.correoInstitucional = 'Ingresa tu correo institucional.'
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.correoInstitucional = 'Ingresa un correo válido.'
    } else {
      const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase()

      if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        errors.correoInstitucional = 'Solo se permiten correos institucionales.'
      }
    }

    if (!values.contrasenia) {
      errors.contrasenia = 'Ingresa tu contraseña.'
    }

    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (busy.current) {
      return
    }

    const errors = validate()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    busy.current = true
    setIsSubmitting(true)
    setServerError('')
    setPendingEmail('')

    try {
      const data = await login({
        correoInstitucional: normalizeEmail(values.correoInstitucional),
        contrasenia: values.contrasenia,
      })

      if (!mounted.current) return
      // La web es solo para administradores; el resto de roles usa la app móvil.
      if (!isAdminRole(data.rol)) {
        setServerError(
          'Esta plataforma es solo para administradores. Usa la aplicación móvil.',
        )
        return
      }

      const profile = await me(data.token)
      if (!mounted.current) return
      if (!isAdminRole(profile?.rol)) throw new Error('Usa la aplicación móvil para acceder con esta cuenta.')
      const session = { token: data.token, user: profile }
      saveSession(session)
      setValues(INITIAL_VALUES)
      onSuccess?.(session)
    } catch (error) {
      if (!mounted.current) return
      if (error.status === 403 && error.data?.code === 'ACCOUNT_NOT_VERIFIED') {
        setPendingEmail(normalizeEmail(values.correoInstitucional))
      }
      // En 401 se usa un mensaje genérico para no revelar si el correo existe.
      setServerError(
        error.status === 401
          ? 'Correo y/o contraseña incorrectos.'
          : error.message,
      )
    } finally {
      busy.current = false
      if (mounted.current) setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-field">
        <label className="login-field__label" htmlFor="correoInstitucional">
          Correo institucional
        </label>
        <div className="login-field__control">
          <input
            id="correoInstitucional"
            className="login-field__input"
            type="email"
            name="correoInstitucional"
            placeholder="Ingresa tu correo institucional"
            autoComplete="username"
            inputMode="email"
            value={values.correoInstitucional}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.correoInstitucional)}
            aria-describedby={
              fieldErrors.correoInstitucional ? 'correo-error' : undefined
            }
            disabled={isSubmitting}
          />
          <span className="login-field__icon login-field__icon--start" aria-hidden="true">
            <UserIcon />
          </span>
        </div>
        {fieldErrors.correoInstitucional && (
          <p id="correo-error" className="login-field__error">
            {fieldErrors.correoInstitucional}
          </p>
        )}
      </div>

      <div className="login-field">
        <label className="login-field__label" htmlFor="contrasenia">
          Contraseña
        </label>
        <div className="login-field__control">
          <input
            id="contrasenia"
            className="login-field__input"
            type={showPassword ? 'text' : 'password'}
            name="contrasenia"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            value={values.contrasenia}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.contrasenia)}
            aria-describedby={
              fieldErrors.contrasenia ? 'contrasenia-error' : undefined
            }
            disabled={isSubmitting}
          />
          <span className="login-field__icon login-field__icon--start" aria-hidden="true">
            <LockIcon />
          </span>
          <button
            type="button"
            className="login-field__icon login-field__icon--end"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {fieldErrors.contrasenia && (
          <p id="contrasenia-error" className="login-field__error">
            {fieldErrors.contrasenia}
          </p>
        )}
      </div>

      {serverError && (
        <div className="login-form__error" role="alert">
          {serverError}
          {pendingEmail && (
            <a
              className="login-pending-link"
              href="#/verificar-correo"
              onClick={() => onVerificationRequired?.(pendingEmail)}
            >
              Verificar mi correo o reenviar el enlace
            </a>
          )}
        </div>
      )}

      <button
        className="login-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="login-form__spinner" aria-hidden="true" />
            Ingresando...
          </>
        ) : (
          <>
            <SignInIcon />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  )
}

export default LoginForm
