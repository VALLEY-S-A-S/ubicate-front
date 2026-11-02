import { useEffect, useRef, useState } from 'react'
import { crearBloque, editarBloque } from '../services/bloquesApi'
import { validateBloque } from '../validation/bloques.js'

function initialValues(bloque) {
  return {
    nombre: bloque?.nombre ?? '',
    pisos: bloque ? String(bloque.pisos) : '',
  }
}

export default function BloqueForm({ token, bloque, onCreated, onUpdated, onLogout, onCancel }) {
  const [values, setValues] = useState(() => initialValues(bloque))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nombreRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    nombreRef.current?.focus()
  }, [])

  function handleChange({ target: { name, value } }) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateBloque(values)
    setErrors(nextErrors)
    setServerError('')

    if (Object.keys(nextErrors).length) {
      const firstField = Object.keys(nextErrors)[0]
      formRef.current?.elements.namedItem(firstField)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const payload = { nombre: values.nombre.trim(), pisos: Number(values.pisos) }

      if (bloque) {
        onUpdated?.(await editarBloque(bloque.id, payload, token))
      } else {
        onCreated?.(await crearBloque(payload, token))
      }
    } catch (error) {
      if (error.status === 401) {
        onLogout?.()
        return
      }

      if (error.status === 403) {
        setServerError('No tienes permiso para esta acción')
        return
      }

      const serverErrors = error.data?.errors ?? {}

      if (serverErrors.nombre || serverErrors.pisos) {
        setErrors({
          nombre: serverErrors.nombre,
          pisos: serverErrors.pisos,
        })
        const firstField = serverErrors.nombre ? 'nombre' : 'pisos'
        formRef.current?.elements.namedItem(firstField)?.focus()
      } else if (serverErrors.sede) {
        setServerError(serverErrors.sede)
      } else {
        setServerError(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      className="bloque-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="bloque-field">
        <label htmlFor="bloque-nombre">Nombre del bloque</label>
        <input
          ref={nombreRef}
          id="bloque-nombre"
          name="nombre"
          type="text"
          value={values.nombre}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={100}
          aria-invalid={Boolean(errors.nombre)}
          aria-describedby={errors.nombre ? 'bloque-nombre-error' : undefined}
        />
        {errors.nombre && (
          <p className="bloque-field__error" id="bloque-nombre-error">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="bloque-field">
        <label htmlFor="bloque-pisos">Cantidad de pisos</label>
        <input
          id="bloque-pisos"
          name="pisos"
          type="text"
          inputMode="numeric"
          value={values.pisos}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.pisos)}
          aria-describedby={errors.pisos ? 'bloque-pisos-error' : undefined}
        />
        {errors.pisos && (
          <p className="bloque-field__error" id="bloque-pisos-error">
            {errors.pisos}
          </p>
        )}
      </div>

      {serverError && (
        <p className="bloque-form__error" role="alert">
          {serverError}
        </p>
      )}

      <div className="bloque-form__actions">
        <button
          type="button"
          className="bloque-btn bloque-btn--cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bloque-btn bloque-btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (bloque ? 'Guardando…' : 'Creando…') : bloque ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
