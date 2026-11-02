import { useEffect, useRef, useState } from 'react'
import { crearEspacio, editarEspacio } from '../services/espaciosApi'
import { validateEspacio } from '../validation/espacios.js'

function initialValues(espacio) {
  return {
    tipoEspacioId: espacio?.tipoEspacioId ?? '',
    codigo: espacio?.codigo ?? '',
    nombre: espacio?.nombre ?? '',
    bloqueId: espacio?.bloqueId ?? '',
    piso: espacio?.pisoNumero != null ? String(espacio.pisoNumero) : '',
  }
}

export default function EspacioForm({
  token,
  tipos,
  bloques,
  espacio,
  onCreated,
  onUpdated,
  onLogout,
  onCancel,
}) {
  const [values, setValues] = useState(() => initialValues(espacio))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tipoRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    tipoRef.current?.focus()
  }, [])

  function maxPisosDelBloque(bloqueId) {
    if (bloqueId === '' || bloqueId == null) return null
    const bloque = bloques.find((b) => String(b.id) === String(bloqueId))
    return bloque?.pisos ?? null
  }

  function handleChange({ target: { name, value } }) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateEspacio({
      ...values,
      maxPisos: maxPisosDelBloque(values.bloqueId),
    })
    setErrors(nextErrors)
    setServerError('')

    if (Object.keys(nextErrors).length) {
      const firstField = Object.keys(nextErrors)[0]
      formRef.current?.elements.namedItem(firstField)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const body = {
        tipoEspacioId: Number(values.tipoEspacioId),
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
      }

      if (values.bloqueId !== '') {
        body.bloqueId = Number(values.bloqueId)
        body.piso = Number(values.piso)
      }

      if (espacio) {
        onUpdated?.(await editarEspacio(espacio.id, body, token))
      } else {
        onCreated?.(await crearEspacio(body, token))
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
      const fieldKeys = ['tipoEspacioId', 'codigo', 'nombre', 'piso', 'bloqueId']
      const fieldErrors = {}

      for (const key of fieldKeys) {
        if (serverErrors[key]) {
          fieldErrors[key] = serverErrors[key]
        }
      }

      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
        const firstField = Object.keys(fieldErrors)[0]
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
      className="espacio-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="espacio-field">
        <label htmlFor="espacio-tipo">Tipo de espacio</label>
        <select
          ref={tipoRef}
          id="espacio-tipo"
          name="tipoEspacioId"
          value={values.tipoEspacioId}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.tipoEspacioId)}
          aria-describedby={errors.tipoEspacioId ? 'espacio-tipo-error' : undefined}
        >
          <option value="">Selecciona un tipo</option>
          {tipos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
        {errors.tipoEspacioId && (
          <p className="espacio-field__error" id="espacio-tipo-error">
            {errors.tipoEspacioId}
          </p>
        )}
      </div>

      <div className="espacio-field">
        <label htmlFor="espacio-codigo">Código</label>
        <input
          id="espacio-codigo"
          name="codigo"
          type="text"
          value={values.codigo}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={50}
          aria-invalid={Boolean(errors.codigo)}
          aria-describedby={errors.codigo ? 'espacio-codigo-error' : undefined}
        />
        {errors.codigo && (
          <p className="espacio-field__error" id="espacio-codigo-error">
            {errors.codigo}
          </p>
        )}
      </div>

      <div className="espacio-field">
        <label htmlFor="espacio-nombre">Nombre</label>
        <input
          id="espacio-nombre"
          name="nombre"
          type="text"
          value={values.nombre}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={150}
          aria-invalid={Boolean(errors.nombre)}
          aria-describedby={errors.nombre ? 'espacio-nombre-error' : undefined}
        />
        {errors.nombre && (
          <p className="espacio-field__error" id="espacio-nombre-error">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="espacio-field">
        <label htmlFor="espacio-bloque">Bloque (opcional)</label>
        <select
          id="espacio-bloque"
          name="bloqueId"
          value={values.bloqueId}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.bloqueId)}
        >
          <option value="">Sin ubicación</option>
          {bloques.map((bloque) => (
            <option key={bloque.id} value={bloque.id}>
              {bloque.nombre} ({bloque.pisos} {bloque.pisos === 1 ? 'piso' : 'pisos'})
            </option>
          ))}
        </select>
        {errors.bloqueId && (
          <p className="espacio-field__error" id="espacio-bloque-error">
            {errors.bloqueId}
          </p>
        )}
      </div>

      <div className="espacio-field">
        <label htmlFor="espacio-piso">Piso (solo si eliges bloque)</label>
        <input
          id="espacio-piso"
          name="piso"
          type="text"
          inputMode="numeric"
          value={values.piso}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.piso)}
          aria-describedby={errors.piso ? 'espacio-piso-error' : undefined}
        />
        {errors.piso && (
          <p className="espacio-field__error" id="espacio-piso-error">
            {errors.piso}
          </p>
        )}
      </div>

      {serverError && (
        <p className="espacio-form__error" role="alert">
          {serverError}
        </p>
      )}

      <div className="espacio-form__actions">
        <button
          type="button"
          className="espacio-btn espacio-btn--cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="espacio-btn espacio-btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? espacio
              ? 'Guardando…'
              : 'Creando…'
            : espacio
              ? 'Guardar'
              : 'Crear'}
        </button>
      </div>
    </form>
  )
}
