import { useRef, useState } from 'react'
import { register } from '../services/authApi'
import {
  normalizeEmail,
  passwordRequirements,
  validateRegistration,
} from '../validation/registration.js'

const INITIAL_VALUES = {
  nombre: '',
  correoInstitucional: '',
  contrasenia: '',
  confirmacion: '',
}

function RegistrationField({
  name,
  label,
  error,
  disabled,
  value,
  onChange,
  type = 'text',
  children,
  ...props
}) {
  return (
    <div className="registration-field">
      <div className="registration-field__control">
        <label htmlFor={`register-${name}`}>{label}</label>
        <input
          {...props}
          id={`register-${name}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={
            [
              error && `${name}-error`,
              name === 'contrasenia' && 'password-requirements',
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {children}
      </div>
      {error && (
        <p className="registration-field__error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function RegisterForm({ onRegistered }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState({})
  const busy = useRef(false)
  const form = useRef(null)

  function handleChange({ target: { name, value } }) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'contrasenia' ? { confirmacion: undefined } : {}),
    }))
    setServerError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy.current) return
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    setServerError('')
    if (Object.keys(nextErrors).length) {
      form.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    busy.current = true
    setSubmitting(true)
    try {
      const correoInstitucional = normalizeEmail(values.correoInstitucional)
      await register({
        nombre: values.nombre.trim(),
        correoInstitucional,
        contrasenia: values.contrasenia,
      })
      setValues(INITIAL_VALUES)
      onRegistered(correoInstitucional)
    } catch (error) {
      if (error.status === 409) {
        setErrors({
          correoInstitucional:
            'Este correo ya está registrado. Inicia sesión para continuar o reenviar la verificación.',
        })
      }
      setServerError(
        error.status === 409
          ? 'No se pudo crear la cuenta: el correo ya está registrado.'
          : error.message,
      )
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  const common = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    disabled: submitting,
    error: errors[name],
  })

  return (
    <form
      ref={form}
      className="registration-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
    >
      <RegistrationField
        {...common('nombre')}
        label="Nombre completo"
        autoComplete="name"
        maxLength={150}
      />
      <RegistrationField
        {...common('correoInstitucional')}
        label="Correo institucional"
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={150}
      />
      {['contrasenia', 'confirmacion'].map((name) => (
        <div key={name}>
          <RegistrationField
            {...common(name)}
            label={
              name === 'contrasenia' ? 'Contraseña' : 'Confirmar contraseña'
            }
            type={visible[name] ? 'text' : 'password'}
            autoComplete="new-password"
            className="registration-password"
          >
            <button
              className="registration-reveal"
              type="button"
              disabled={submitting}
              onClick={() =>
                setVisible((current) => ({
                  ...current,
                  [name]: !current[name],
                }))
              }
              aria-label={`${visible[name] ? 'Ocultar' : 'Mostrar'} ${name === 'contrasenia' ? 'contraseña' : 'confirmación de contraseña'}`}
              aria-pressed={Boolean(visible[name])}
            >
              {visible[name] ? 'Ocultar' : 'Mostrar'}
            </button>
          </RegistrationField>
          {name === 'contrasenia' && (
            <ul
              className="registration-requirements"
              id="password-requirements"
            >
              {passwordRequirements(values.contrasenia).map(
                ({ label, met }) => (
                  <li key={label} className={met ? 'is-met' : ''}>
                    <span aria-hidden="true">{met ? '✓' : '○'}</span> {label}
                    <span className="sr-only">
                      {met ? ': cumplido' : ': pendiente'}
                    </span>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      ))}
      {serverError && (
        <p
          className="registration-message registration-message--error"
          role="alert"
        >
          {serverError}
        </p>
      )}
      <button
        className="registration-primary"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
