const MAX_CODIGO = 50
const MAX_NOMBRE = 150

export function validateEspacio(values = {}) {
  const errors = {}

  if (values.tipoEspacioId == null || values.tipoEspacioId === '') {
    errors.tipoEspacioId = 'Selecciona un tipo de espacio'
  }

  const codigo = String(values.codigo ?? '').trim()
  if (!codigo) {
    errors.codigo = 'Este campo es obligatorio'
  } else if (codigo.length > MAX_CODIGO) {
    errors.codigo = 'El código no puede superar los 50 caracteres'
  }

  const nombre = String(values.nombre ?? '').trim()
  if (!nombre) {
    errors.nombre = 'Este campo es obligatorio'
  } else if (nombre.length > MAX_NOMBRE) {
    errors.nombre = 'El nombre no puede superar los 150 caracteres'
  }

  const bloqueId = values.bloqueId === '' ? null : values.bloqueId
  const piso = values.piso === '' ? null : values.piso

  if ((bloqueId != null) !== (piso != null)) {
    errors.piso = 'Debes indicar bloque y piso juntos'
  } else if (bloqueId != null) {
    const pisoNum = Number(piso)
    if (!Number.isInteger(pisoNum)) {
      errors.piso = 'El piso debe ser un número entero'
    } else if (pisoNum < 1) {
      errors.piso = 'El piso debe ser mayor que 0'
    } else if (values.maxPisos != null && pisoNum > Number(values.maxPisos)) {
      errors.piso = `El piso debe estar entre 1 y ${values.maxPisos}`
    }
  }

  return errors
}
