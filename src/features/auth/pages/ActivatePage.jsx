import { useEffect, useRef, useState } from 'react'
import RegistrationLayout from '../components/RegistrationLayout'
import { activate, activationInfo, isAdminRole } from '../services/authApi'
import { isInstitutionalEmail, passwordRequirements, validatePassword } from '../validation/registration.js'

const LINK_ERRORS = {
  ACTIVATION_EXPIRED: 'El enlace venció. Solicita uno nuevo.',
  ACTIVATION_USED: 'Este enlace ya fue utilizado. Si activaste tu cuenta, inicia sesión.',
  ACTIVATION_INVALID: 'El enlace no es válido para activar esta cuenta.',
}

export function ActivationAccount({ correo }) {
  return <div className="registration-field activation-account">
    <label htmlFor="activation-account-email">Correo institucional de esta cuenta</label>
    <input id="activation-account-email" type="email" autoComplete="username" value={correo} readOnly />
  </div>
}

export default function ActivatePage({ token }) {
  const [values, setValues] = useState({ contrasenia: '', confirmacion: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(!token)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState({ state: 'loading', correo: '' })
  const [revision, setRevision] = useState(0)
  const mounted = useRef(true)
  const busy = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    activationInfo(token, controller.signal).then(data => {
      if (controller.signal.aborted) return
      if (typeof data?.correoInstitucional !== 'string' || !isInstitutionalEmail(data.correoInstitucional))
        throw new Error('No se pudo comprobar la cuenta asociada al enlace.')
      setContext({ state: 'ready', correo: data.correoInstitucional })
    }).catch(failure => {
      if (controller.signal.aborted) return
      const message = LINK_ERRORS[failure.data?.code]
      if (message) {
        setInvalid(true); setError(message)
        window.history.replaceState(null, '', '#/activar-cuenta')
      } else {
        setContext({ state: 'error', correo: '', error: failure.message })
      }
    })
    return () => controller.abort()
  }, [token, revision])

  async function submit(event) {
    event.preventDefault()
    if (busy.current || invalid || context.state !== 'ready') return
    const next = validatePassword(values)
    setErrors(next); setError('')
    if (Object.keys(next).length) return
    busy.current = true; setLoading(true)
    try {
      const response = await activate(token, values.contrasenia)
      if (!mounted.current) return
      setResult(response); setValues({ contrasenia: '', confirmacion: '' })
      window.history.replaceState(null, '', '#/activar-cuenta')
    } catch (failure) {
      if (!mounted.current) return
      const message = LINK_ERRORS[failure.data?.code]
      setError(message ?? failure.message)
      if (message) {
        setInvalid(true); setValues({ contrasenia: '', confirmacion: '' })
        window.history.replaceState(null, '', '#/activar-cuenta')
      }
      if (failure.data?.errors?.contrasenia) setErrors({ contrasenia: failure.data.errors.contrasenia })
    } finally {
      busy.current = false
      if (mounted.current) setLoading(false)
    }
  }

  if (result) return <RegistrationLayout title="Cuenta activada" subtitle="Tu contraseña quedó definida.">
    <ActivationAccount correo={context.correo} />
    <p className="registration-message" role="status">{isAdminRole(result.rol) ? 'Ya puedes iniciar sesión en el portal administrativo.' : 'Ya puedes iniciar sesión en la aplicación móvil con tu correo y la contraseña que acabas de definir.'}</p>
    <a className="registration-primary" href="#/login">{isAdminRole(result.rol) ? 'Iniciar sesión' : 'Volver al portal'}</a>
  </RegistrationLayout>

  let content
  if (invalid) {
    content = <p className="registration-message registration-message--error" role="alert">{error || 'Abre el enlace completo recibido en tu correo para activar la cuenta.'}</p>
  } else if (context.state === 'loading') {
    content = <p className="verification-copy" role="status">Comprobando el enlace de activación…</p>
  } else if (context.state === 'error') {
    content = <>
      <p className="registration-message registration-message--error" role="alert">{context.error}</p>
      <button className="registration-primary" type="button" onClick={() => {
        setContext({ state: 'loading', correo: '' }); setRevision(value => value + 1)
      }}>Volver a comprobar el enlace</button>
    </>
  } else {
    content = <form className="registration-form" onSubmit={submit} noValidate aria-busy={loading}>
      <ActivationAccount correo={context.correo} />
      {['contrasenia', 'confirmacion'].map(name => <div className="registration-field" key={name}>
        <label htmlFor={`activate-${name}`}>{name === 'contrasenia' ? 'Nueva contraseña' : 'Confirmar contraseña'}</label>
        <input id={`activate-${name}`} name={name} type="password" autoComplete="new-password" required disabled={loading} value={values[name]}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : name === 'contrasenia' ? 'activation-requirements' : undefined}
          onChange={event => { setValues(current => ({ ...current, [name]: event.target.value })); setErrors({}); setError('') }} />
        {errors[name] && <p id={`${name}-error`} className="registration-field__error">{errors[name]}</p>}
      </div>)}
      <ul className="registration-requirements" id="activation-requirements">{passwordRequirements(values.contrasenia).map(({ label, met }) => <li key={label} className={met ? 'is-met' : ''}>{met ? '✓' : '○'} {label}</li>)}</ul>
      {error && <p className="registration-message registration-message--error" role="alert">{error}</p>}
      <button className="registration-primary" disabled={loading} type="submit">{loading ? 'Activando cuenta…' : 'Activar cuenta'}</button>
    </form>
  }
  return <RegistrationLayout title="Activa tu cuenta" subtitle="Define la contraseña con la que iniciarás sesión.">
    {content}
    <a className="registration-link" href="#/verificar-correo">Solicitar otro enlace</a>
    <a className="registration-link" href="#/login">Ir al inicio de sesión</a>
  </RegistrationLayout>
}
