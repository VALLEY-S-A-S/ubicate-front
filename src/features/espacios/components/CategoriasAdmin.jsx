import { useEffect, useState } from 'react'
import {
  actualizarCategoria,
  crearCategoria,
  estadoCategoria,
  listarCategorias,
} from '../services/catalogoApi'
import {
  CategoriaBadge,
  CategoriaIcon,
  COLORES_DISPONIBLES,
  ICONOS_DISPONIBLES,
  colorPorToken,
} from './categoriaElementoVisual'

const VACIO = { nombre: '', color: 'azul', icono: 'caja' }

export default function CategoriasAdmin({ token }) {
  const [categorias, setCategorias] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState('')
  const [pendingId, setPendingId] = useState(null)

  function cargar() {
    setStatus('loading')
    setError('')
    listarCategorias(token, true)
      .then((data) => {
        setCategorias(data ?? [])
        setStatus('ready')
      })
      .catch((err) => {
        if (err.status === 401) return
        setError('No se pudieron cargar las categorías.')
        setStatus('error')
      })
  }
  useEffect(() => {
    cargar()
  }, [token])

  function abrirCrear() {
    setFormError('')
    setForm({ ...VACIO })
  }
  function abrirEditar(c) {
    setFormError('')
    setForm({ id: c.id, nombre: c.nombre, color: c.color ?? 'gris', icono: c.icono ?? 'caja' })
  }
  function cerrar() {
    setForm(null)
    setFormError('')
  }

  async function guardar(event) {
    event.preventDefault()
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    setGuardando(true)
    setFormError('')
    const body = { nombre: form.nombre.trim(), color: form.color, icono: form.icono }
    try {
      if (form.id) await actualizarCategoria(form.id, body, token)
      else await crearCategoria(body, token)
      cerrar()
      cargar()
    } catch (err) {
      if (err.status === 401) return
      setFormError(err.data?.errors?.nombre ?? err.message ?? 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  async function alternarEstado(c) {
    setPendingId(c.id)
    try {
      await estadoCategoria(c.id, !c.activo, token)
      cargar()
    } catch (err) {
      if (err.status === 401) return
      setError('No se pudo cambiar el estado.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="catalogo-layout">
      <div className="catalogo-panel">
        <div className="catalogo-panel__head">
          <p className="catalogo-admin__hint">Las categorías agrupan los elementos y definen su color e icono.</p>
          <button type="button" className="espacios-add" onClick={abrirCrear}>Nueva categoría</button>
        </div>

        {error && <p className="espacios-inline-error" role="alert">{error}</p>}
        {status === 'loading' && <p className="espacios-state">Cargando…</p>}

        {status === 'ready' && (
          <table className="inventario__tabla">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id} className={c.activo ? '' : 'catalogo-row--inactivo'}>
                  <td><CategoriaBadge nombre={c.nombre} color={c.color} icono={c.icono} /></td>
                  <td>{c.activo ? 'Activa' : 'Inactiva'}</td>
                  <td className="inventario__acciones">
                    <button type="button" className="espacios-action" disabled={pendingId === c.id} onClick={() => abrirEditar(c)}>Editar</button>
                    <button
                      type="button"
                      className={`espacios-action${c.activo ? ' espacios-action--danger' : ''}`}
                      disabled={pendingId === c.id}
                      onClick={() => alternarEstado(c)}
                    >
                      {c.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr><td colSpan={3} className="inventario__vacio">No hay categorías.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="catalogo-panel">
        {form ? (
          <form className="catalogo-form" onSubmit={guardar}>
            <h4 className="catalogo-form__title">{form.id ? 'Editar categoría' : 'Nueva categoría'}</h4>

            <div className="espacio-field">
              <label htmlFor="cat-nombre">Nombre</label>
              <input
                id="cat-nombre"
                value={form.nombre}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                disabled={guardando}
              />
            </div>

            <div className="espacio-field">
              <label>Icono</label>
              <div className="selector-iconos">
                {ICONOS_DISPONIBLES.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    className={`selector-icono${form.icono === ic ? ' selector-icono--sel' : ''}`}
                    style={{ color: colorPorToken(form.color).fg }}
                    onClick={() => setForm((f) => ({ ...f, icono: ic }))}
                    aria-label={ic}
                    aria-pressed={form.icono === ic}
                  >
                    <CategoriaIcon icono={ic} />
                  </button>
                ))}
              </div>
            </div>

            <div className="espacio-field">
              <label>Color</label>
              <div className="selector-colores">
                {COLORES_DISPONIBLES.map((col) => (
                  <button
                    type="button"
                    key={col}
                    className={`selector-color${form.color === col ? ' selector-color--sel' : ''}`}
                    style={{ background: colorPorToken(col).fg }}
                    onClick={() => setForm((f) => ({ ...f, color: col }))}
                    aria-label={col}
                    aria-pressed={form.color === col}
                  />
                ))}
              </div>
            </div>

            <div className="espacio-field">
              <label>Vista previa</label>
              <CategoriaBadge nombre={form.nombre || 'Categoría'} color={form.color} icono={form.icono} />
            </div>

            {formError && <p className="espacio-form__error" role="alert">{formError}</p>}

            <div className="espacio-form__actions">
              <button type="button" className="espacio-btn espacio-btn--cancel" onClick={cerrar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="espacio-btn espacio-btn--primary" disabled={guardando}>{form.id ? 'Guardar' : 'Crear'}</button>
            </div>
          </form>
        ) : (
          <div className="catalogo-placeholder">
            <p>Selecciona “Editar” en una categoría, o crea una nueva.</p>
          </div>
        )}
      </div>
    </div>
  )
}
