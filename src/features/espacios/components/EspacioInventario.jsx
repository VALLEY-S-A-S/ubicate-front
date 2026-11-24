import { useEffect, useRef, useState } from 'react'
import {
  actualizarCantidad,
  agregarInventario,
  buscarCatalogo,
  listarInventario,
  retirarInventario,
} from '../services/inventarioApi'
import { CategoriaBadge } from './categoriaElementoVisual'

export default function EspacioInventario({ espacioId, token, onLogout }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pendingId, setPendingId] = useState(null)

  // Agregar elemento desde el catálogo
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState('1')
  const [abierto, setAbierto] = useState(false)
  const [agregando, setAgregando] = useState(false)
  const addBoxRef = useRef(null)
  const feedbackTimer = useRef(null)

  // Edición inline de cantidad
  const [editId, setEditId] = useState(null)
  const [editCantidad, setEditCantidad] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')
    setFiltro('')
    setEditId(null)
    listarInventario(espacioId, token)
      .then((data) => {
        if (cancelled) return
        setItems(data ?? [])
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 401) {
          onLogout?.()
          return
        }
        setError('No se pudo cargar el inventario.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [espacioId, token, onLogout])

  useEffect(() => {
    if (seleccionado && seleccionado.nombre === busqueda) return undefined
    let cancelled = false
    const timer = setTimeout(() => {
      buscarCatalogo(busqueda, token)
        .then((data) => {
          if (!cancelled) setResultados(data ?? [])
        })
        .catch(() => {
          if (!cancelled) setResultados([])
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [busqueda, token, seleccionado])

  useEffect(() => {
    function onDown(event) {
      if (addBoxRef.current && !addBoxRef.current.contains(event.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function notificar(msg) {
    setFeedback(msg)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(''), 2500)
  }

  function elegirElemento(el) {
    setSeleccionado({ id: el.id, nombre: el.nombre })
    setBusqueda(el.nombre)
    setAbierto(false)
  }

  async function handleAgregar() {
    const cant = Number(cantidad)
    if (!seleccionado || !Number.isInteger(cant) || cant < 1) return
    setAgregando(true)
    setError('')
    try {
      const item = await agregarInventario(espacioId, seleccionado.id, cant, token)
      setItems((cur) => {
        const resto = cur.filter((i) => i.elementoId !== item.elementoId)
        return [...resto, item].sort((a, b) => a.nombre.localeCompare(b.nombre))
      })
      notificar(`${item.nombre}: cantidad ${item.cantidad}`)
      setSeleccionado(null)
      setBusqueda('')
      setCantidad('1')
      setAbierto(false)
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setError(err.message || 'No se pudo agregar el elemento.')
    } finally {
      setAgregando(false)
    }
  }

  function iniciarEdicion(item) {
    setEditId(item.elementoId)
    setEditCantidad(String(item.cantidad))
  }

  function cancelarEdicion() {
    setEditId(null)
    setEditCantidad('')
  }

  async function guardarEdicion(item) {
    const cant = Number(editCantidad)
    if (!Number.isInteger(cant) || cant < 0) return
    setPendingId(item.elementoId)
    setError('')
    try {
      const actualizado = await actualizarCantidad(espacioId, item.elementoId, cant, token)
      if (actualizado == null) {
        setItems((cur) => cur.filter((i) => i.elementoId !== item.elementoId))
        notificar(`${item.nombre} retirado`)
      } else {
        setItems((cur) => cur.map((i) => (i.elementoId === actualizado.elementoId ? actualizado : i)))
        notificar(`${actualizado.nombre}: cantidad ${actualizado.cantidad}`)
      }
      cancelarEdicion()
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setError(err.message || 'No se pudo actualizar la cantidad.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleRetirar(item) {
    if (!window.confirm(`¿Retirar "${item.nombre}" del inventario?`)) return
    setPendingId(item.elementoId)
    setError('')
    try {
      await retirarInventario(espacioId, item.elementoId, token)
      setItems((cur) => cur.filter((i) => i.elementoId !== item.elementoId))
      notificar(`${item.nombre} retirado`)
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setError(err.message || 'No se pudo retirar el elemento.')
    } finally {
      setPendingId(null)
    }
  }

  const visibles = items.filter((i) =>
    i.nombre.toLowerCase().includes(filtro.trim().toLowerCase()),
  )
  const cantValida = Number.isInteger(Number(cantidad)) && Number(cantidad) >= 1

  return (
    <section className="inventario">
      <div className="inventario__header">
        <h4>Inventario del espacio</h4>
        {feedback && (
          <span className="inventario__feedback" role="status">
            {feedback}
          </span>
        )}
      </div>

      <div className="inventario__add" ref={addBoxRef}>
        <div className="inventario__buscador">
          <input
            type="text"
            placeholder="Buscar elemento para agregar..."
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value)
              setSeleccionado(null)
              setAbierto(true)
            }}
            onFocus={() => setAbierto(true)}
            aria-label="Buscar elemento en el catálogo"
          />
          {abierto && resultados.length > 0 && (
            <ul className="inventario__dropdown">
              {resultados.map((el) => (
                <li key={el.id}>
                  <button type="button" onClick={() => elegirElemento(el)}>
                    <span>{el.nombre}</span>
                    <CategoriaBadge nombre={el.categoriaNombre} color={el.categoriaColor} icono={el.categoriaIcono} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="number"
          min="1"
          className="inventario__cantidad"
          value={cantidad}
          onChange={(event) => setCantidad(event.target.value)}
          aria-label="Cantidad a agregar"
        />
        <button
          type="button"
          className="inventario__agregar"
          onClick={handleAgregar}
          disabled={!seleccionado || agregando || !cantValida}
        >
          + Agregar
        </button>
      </div>

      {error && (
        <p className="espacios-inline-error" role="alert">
          {error}
        </p>
      )}

      {status === 'loading' && <p className="espacios-state">Cargando inventario…</p>}
      {status === 'error' && (
        <p className="espacios-state espacios-state--error">No se pudo cargar el inventario.</p>
      )}

      {status === 'ready' && (
        <>
          {items.length > 0 && (
            <input
              type="search"
              className="inventario__filtro"
              placeholder="Buscar en el inventario..."
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              aria-label="Filtrar inventario"
            />
          )}

          {items.length === 0 ? (
            <p className="inventario__vacio">Este espacio no tiene elementos en el inventario.</p>
          ) : visibles.length === 0 ? (
            <p className="inventario__vacio">Ningún elemento coincide con la búsqueda.</p>
          ) : (
            <table className="inventario__tabla">
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((item) => {
                  const editando = editId === item.elementoId
                  const busy = pendingId === item.elementoId
                  return (
                    <tr key={item.elementoId}>
                      <td>{item.nombre}</td>
                      <td>
                        <CategoriaBadge nombre={item.categoriaNombre} color={item.categoriaColor} icono={item.categoriaIcono} />
                      </td>
                      <td>
                        {editando ? (
                          <input
                            type="number"
                            min="0"
                            className="inventario__cantidad"
                            value={editCantidad}
                            onChange={(event) => setEditCantidad(event.target.value)}
                            aria-label={`Nueva cantidad de ${item.nombre}`}
                          />
                        ) : (
                          item.cantidad
                        )}
                      </td>
                      <td className="inventario__acciones">
                        {editando ? (
                          <>
                            <button type="button" className="espacios-action" disabled={busy} onClick={() => guardarEdicion(item)}>
                              Guardar
                            </button>
                            <button type="button" className="espacios-action" disabled={busy} onClick={cancelarEdicion}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="espacios-action" disabled={busy} onClick={() => iniciarEdicion(item)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className="espacios-action espacios-action--danger"
                              disabled={busy}
                              onClick={() => handleRetirar(item)}
                            >
                              Retirar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}
