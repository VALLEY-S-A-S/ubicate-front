const MAX_NOMBRE = 100
const MAX_PISOS = 50

export function validateBloque(values = {}) {
  const errors = {}
  const nombreNormalizado = String(values.nombre ?? '').trim()

  if (!nombreNormalizado) {
    errors.nombre = 'Este campo es obligatorio'
  } else if (nombreNormalizado.length > MAX_NOMBRE) {
    errors.nombre = 'El nombre no puede superar los 100 caracteres'
  }

  const pisosTexto = String(values.pisos ?? '').trim()

  if (!pisosTexto) {
    errors.pisos = 'Este campo es obligatorio'
  } else if (!/^-?\d+$/.test(pisosTexto)) {
    errors.pisos = 'El número de pisos debe ser un número entero'
  } else if (Number(pisosTexto) < 1) {
    errors.pisos = 'El número de pisos debe ser mayor que 0'
  } else if (Number(pisosTexto) > MAX_PISOS) {
    errors.pisos = 'El número de pisos no puede superar 50'
  }

  return errors
}
