import { useEffect, useState } from 'react'
import {
  actualizarElemento,
  crearElemento,
  estadoElemento,
  listarCategorias,
  listarElementos,
} from '../services/catalogoApi'
import { CategoriaBadge } from './categoriaElementoVisual'

const VACIO = { nombre: '', categoriaId: '' }
const POR_PAGINA = 10

export default function ElementosAdmin({ token }) {
  const [elementos, setElementos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(0)
  const [form, setForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState('')
  const [pendingId, setPendingId] = useState(null)
  const [confirmar, setConfirmar] = useState(null)

  function cargar() {
    setStatus('loading')
    setError('')
    Promise.all([
      listarElementos(token, { incluirInactivos: true }),
      listarCategorias(token, false),
    ])
      .then(([els, cats]) => {
        setElementos(els ?? [])
        setCategorias(cats ?? [])
        setStatus('ready')
      })
      .catch((err) => {
        if (err.status === 401) return
        setError('No se pudieron cargar los elementos.')
        setStatus('error')
      })
  }
  useEffect(() => {
    cargar()
  }, [token])

  useEffect(() => {
    setPagina(0)
  }, [filtro])

  function abrirCrear() {
    setFormError('')
    setForm({ ...VACIO, categoriaId: categorias[0]?.id ?? '' })
  }
  function abrirEditar(e) {
    setFormError('')
    setForm({ id: e.id, nombre: e.nombre, categoriaId: e.categoriaId })
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
    if (!form.categoriaId) {
      setFormError('Selecciona una categoría')
      return
    }
    setGuardando(true)
    setFormError('')
    const body = { nombre: form.nombre.trim(), categoriaId: Number(form.categoriaId) }
    try {
      if (form.id) await actualizarElemento(form.id, body, token)
      else await crearElemento(body, token)
      cerrar()
      cargar()
    } catch (err) {
      if (err.status === 401) return
      setFormError(err.data?.errors?.nombre ?? err.message ?? 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  async function alternarEstado(e) {
    setPendingId(e.id)
    try {
      await estadoElemento(e.id, !e.activo, token)
      cargar()
    } catch (err) {
      if (err.status === 401) return
      setError('No se pudo cambiar el estado.')
    } finally {
      setPendingId(null)
      setConfirmar(null)
    }
  }

  const visibles = elementos.filter((e) =>
    e.nombre.toLowerCase().includes(filtro.trim().toLowerCase()),
  )
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas - 1)
  const pageItems = visibles.slice(paginaActual * POR_PAGINA, paginaActual * POR_PAGINA + POR_PAGINA)

  return (
    <div className="catalogo-layout">
      <div className="catalogo-panel">
        <div className="catalogo-panel__head">
          <p className="catalogo-admin__hint">Los elementos son los objetos que se agregan al inventario de cada espacio.</p>
          <button type="button" className="espacios-add" onClick={abrirCrear} disabled={categorias.length === 0}>Nuevo elemento</button>
        </div>

        {categorias.length === 0 && status === 'ready' && (
          <p className="espacios-inline-error">Primero crea al menos una categoría activa.</p>
        )}
        {error && <p className="espacios-inline-error" role="alert">{error}</p>}
        {status === 'loading' && <p className="espacios-state">Cargando…</p>}

        {status === 'ready' && (
          <>
            {elementos.length > 0 && (
              <input
                type="search"
                className="inventario__filtro"
                placeholder="Buscar elemento…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            )}
            <table className="inventario__tabla">
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((e) => (
                  <tr key={e.id} className={e.activo ? '' : 'catalogo-row--inactivo'}>
                    <td>{e.nombre}</td>
                    <td><CategoriaBadge nombre={e.categoriaNombre} color={e.categoriaColor} icono={e.categoriaIcono} /></td>
                    <td>{e.activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="inventario__acciones">
                      {e.activo && (
                        <button type="button" className="espacios-action" disabled={pendingId === e.id} onClick={() => abrirEditar(e)}>Editar</button>
                      )}
                      <button
                        type="button"
                        className={`espacios-action${e.activo ? ' espacios-action--danger' : ''}`}
                        disabled={pendingId === e.id}
                        onClick={() => (e.activo ? setConfirmar(e) : alternarEstado(e))}
                      >
                        {e.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {elementos.length === 0 && (
                  <tr><td colSpan={4} className="inventario__vacio">No hay elementos.</td></tr>
                )}
                {elementos.length > 0 && visibles.length === 0 && (
                  <tr><td colSpan={4} className="inventario__vacio">Ningún elemento coincide.</td></tr>
                )}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="catalogo-paginacion">
                <button type="button" className="espacios-action" disabled={paginaActual === 0} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
                <span>Página {paginaActual + 1} de {totalPaginas}</span>
                <button type="button" className="espacios-action" disabled={paginaActual >= totalPaginas - 1} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="catalogo-panel">
        {form ? (
          <form className="catalogo-form" onSubmit={guardar}>
            <h4 className="catalogo-form__title">{form.id ? 'Editar elemento' : 'Nuevo elemento'}</h4>
            <div className="espacio-field">
              <label htmlFor="el-nombre">Nombre</label>
              <input
                id="el-nombre"
                value={form.nombre}
                maxLength={150}
                onChange={(ev) => setForm((f) => ({ ...f, nombre: ev.target.value }))}
                disabled={guardando}
              />
            </div>
            <div className="espacio-field">
              <label htmlFor="el-cat">Categoría</label>
              <select
                id="el-cat"
                value={form.categoriaId}
                onChange={(ev) => setForm((f) => ({ ...f, categoriaId: ev.target.value }))}
                disabled={guardando}
              >
                <option value="">Selecciona…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            {formError && <p className="espacio-form__error" role="alert">{formError}</p>}
            <div className="espacio-form__actions">
              <button type="button" className="espacio-btn espacio-btn--cancel" onClick={cerrar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="espacio-btn espacio-btn--primary" disabled={guardando}>{form.id ? 'Guardar' : 'Crear'}</button>
            </div>
          </form>
        ) : (
          <div className="catalogo-placeholder">
            <p>Selecciona “Editar” en un elemento, o crea uno nuevo.</p>
          </div>
        )}
      </div>

      {confirmar && (
        <div className="espacios-modal" role="presentation" onClick={() => setConfirmar(null)}>
          <div className="espacios-modal__content" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <h4 className="catalogo-form__title">Desactivar elemento</h4>
            <p className="catalogo-admin__hint">
              ¿Seguro que deseas desactivar <strong>{confirmar.nombre}</strong>? Dejará de aparecer en el buscador y no podrá agregarse a más espacios. Podrás reactivarlo después.
            </p>
            <div className="espacio-form__actions">
              <button type="button" className="espacio-btn espacio-btn--cancel" onClick={() => setConfirmar(null)} disabled={pendingId === confirmar.id}>Cancelar</button>
              <button type="button" className="espacio-btn espacio-btn--primary" onClick={() => alternarEstado(confirmar)} disabled={pendingId === confirmar.id}>Desactivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
