import { ALLOWED_EMAIL_DOMAINS } from '../constants.js'

export function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

export function isInstitutionalEmail(value) {
  const email = normalizeEmail(value)
  return (
    email.length <= 150 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    ALLOWED_EMAIL_DOMAINS.includes(email.split('@')[1])
  )
}

export function passwordRequirements(password) {
  return [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Una letra mayúscula', met: /\p{Lu}/u.test(password) },
    { label: 'Un número', met: /\p{Nd}/u.test(password) },
  ]
}

export function validateRegistration(values) {
  const errors = {}
  const nombre = values.nombre.trim()
  if (!nombre) errors.nombre = 'Ingresa tu nombre completo.'
  else if (nombre.length > 150)
    errors.nombre = 'El nombre debe tener máximo 150 caracteres.'

  if (!isInstitutionalEmail(values.correoInstitucional)) {
    errors.correoInstitucional =
      'Usa tu correo institucional @correounivalle.edu.co (máximo 150 caracteres).'
  }

  if (
    passwordRequirements(values.contrasenia).some(
      (requirement) => !requirement.met,
    )
  ) {
    errors.contrasenia =
      'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.'
  }
  if (!values.confirmacion) errors.confirmacion = 'Confirma tu contraseña.'
  else if (values.contrasenia !== values.confirmacion)
    errors.confirmacion = 'Las contraseñas no coinciden.'
  return errors
}
