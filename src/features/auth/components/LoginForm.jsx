/**
 * Formulario de inicio de sesión.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Valida los campos, llama al backend, bloquea roles no administrativos y
 * guarda la sesión antes de avisar a la página para que continúe el flujo.
 */

import { useState } from 'react'
import { ALLOWED_EMAIL_DOMAINS } from '../constants'
import { isAdminRole, login } from '../services/authApi'
import { saveSession } from '../services/session'

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

function LoginForm({ onSuccess }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
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
        errors.correoInstitucional =
          'Solo se permiten correos institucionales.'
      }
    }

    if (!values.contrasenia) {
      errors.contrasenia = 'Ingresa tu contraseña.'
    }

    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const errors = validate()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const data = await login({
        correoInstitucional: values.correoInstitucional.trim(),
        contrasenia: values.contrasenia,
      })

      // La web es solo para administradores; el resto de roles usa la app móvil.
      if (!isAdminRole(data.rol)) {
        setServerError(
          'Esta plataforma es solo para administradores. Usa la aplicación móvil.',
        )
        return
      }

      saveSession({
        token: data.token,
        user: {
          id: data.id,
          correoInstitucional: data.correoInstitucional,
          nombre: data.nombre,
          rol: data.rol,
        },
      })

      onSuccess?.()
    } catch (error) {
      // En 401 se usa un mensaje genérico para no revelar si el correo existe.
      setServerError(
        error.status === 401
          ? 'Correo y/o contraseña incorrectos.'
          : error.message,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-field">
        <label className="sr-only" htmlFor="correoInstitucional">
          Correo institucional
        </label>
        <div className="login-field__control">
          <input
            id="correoInstitucional"
            className="login-field__input"
            type="email"
            name="correoInstitucional"
            placeholder="Correo institucional"
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
          <span className="login-field__icon" aria-hidden="true">
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
        <label className="sr-only" htmlFor="contrasenia">
          Contraseña
        </label>
        <div className="login-field__control">
          <input
            id="contrasenia"
            className="login-field__input"
            type={showPassword ? 'text' : 'password'}
            name="contrasenia"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={values.contrasenia}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.contrasenia)}
            aria-describedby={
              fieldErrors.contrasenia ? 'contrasenia-error' : undefined
            }
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="login-field__icon"
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
        <p className="login-form__error" role="alert">
          {serverError}
        </p>
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
          'Iniciar sesión'
        )}
      </button>
    </form>
  )
}

export default LoginForm
