import { useEffect, useState } from 'react'
import EspacioForm from '../components/EspacioForm'
import EspaciosList from '../components/EspaciosList'
import EspaciosFiltros from '../components/EspaciosFiltros'
import EspacioDetalle from '../components/EspacioDetalle'
import { listarBloques } from '../services/bloquesApi'
import {
  cambiarEstadoEspacio,
  eliminarEspacio,
  listarEspacios,
  listarPisos,
  listarTiposEspacio,
} from '../services/espaciosApi'
import '../styles/espacios.css'

const FILTROS_VACIOS = { q: '', tipoEspacioId: '', bloqueId: '', pisoId: '' }

export default function GestionEspaciosPage({ token, onLogout, sedeId }) {
  const [tipos, setTipos] = useState([])
  const [bloques, setBloques] = useState([])
  const [pisos, setPisos] = useState([])
  const [espacios, setEspacios] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [reload, setReload] = useState(0)

  // Catalogos para los filtros y el formulario (al montar / cambiar de sede)
  useEffect(() => {
    let cancelled = false
    Promise.all([listarTiposEspacio(), listarBloques(token)])
      .then(([tiposData, bloquesData]) => {
        if (cancelled) return
        setTipos(tiposData)
        setBloques(bloquesData)
      })
      .catch(() => {
        if (!cancelled) {
          setTipos([])
          setBloques([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, sedeId])

  // Pisos dependientes del bloque seleccionado en el filtro
  useEffect(() => {
    if (!filtros.bloqueId) {
      setPisos([])
      return undefined
    }
    let cancelled = false
    listarPisos(filtros.bloqueId)
      .then((data) => {
        if (!cancelled) setPisos(data)
      })
      .catch(() => {
        if (!cancelled) setPisos([])
      })
    return () => {
      cancelled = true
    }
  }, [filtros.bloqueId])

  // Lista de espacios, con debounce para busqueda y filtros
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    const timer = setTimeout(() => {
      listarEspacios({ sedeId, ...filtros })
        .then((data) => {
          if (cancelled) return
          setEspacios(data.content ?? data ?? [])
          setStatus('ready')
        })
        .catch((err) => {
          if (cancelled) return
          if (err.status === 401) {
            onLogout?.()
            return
          }
          setError(
            err.status === 403
              ? { message: 'No tienes permiso para esta acción', retryable: false }
              : { message: 'No se pudieron cargar los espacios. Inténtalo de nuevo.', retryable: true },
          )
          setStatus('error')
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [token, sedeId, filtros, reload, onLogout])

  const seleccionado = espacios.find((e) => e.id === selectedId) ?? null
  const campusNombre = espacios[0]?.sedeNombre

  function cambiarFiltros(parcial) {
    setFiltros((current) => ({ ...current, ...parcial }))
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS)
  }

  function handleCreated(nuevo) {
    setEspacios((current) => [...current, nuevo].sort((a, b) => a.codigo.localeCompare(b.codigo)))
    setSelectedId(nuevo.id)
    setEditing(null)
    setShowForm(false)
  }

  function handleUpdated(actualizado) {
    setEspacios((current) => current.map((e) => (e.id === actualizado.id ? actualizado : e)))
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(espacio) {
    setEditing(espacio)
    setShowForm(true)
  }

  function openCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  async function handleToggleEstado(espacio) {
    const nuevoEstado = espacio.estado === 'DESHABILITADO' ? 'DISPONIBLE' : 'DESHABILITADO'
    setActionError('')
    setPendingId(espacio.id)
    try {
      const actualizado = await cambiarEstadoEspacio(espacio.id, nuevoEstado, token)
      setEspacios((current) => current.map((e) => (e.id === actualizado.id ? actualizado : e)))
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setActionError('No se pudo cambiar el estado. Inténtalo de nuevo.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(espacio) {
    const confirmado = window.confirm(
      `¿Borrar el espacio "${espacio.codigo}"? Esta acción no se puede deshacer.`,
    )
    if (!confirmado) return
    setActionError('')
    setPendingId(espacio.id)
    try {
      await eliminarEspacio(espacio.id, token)
      setEspacios((current) => current.filter((e) => e.id !== espacio.id))
      if (selectedId === espacio.id) setSelectedId(null)
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setActionError(
        err.status === 409 ? err.message : 'No se pudo borrar el espacio. Inténtalo de nuevo.',
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="gestion-espacios-wrap">
      <header className="gestion-espacios__intro">
        <h2>Gestión de espacios e inventario</h2>
        <p>Consulta y filtra los espacios del campus y administra el inventario de cada uno.</p>
      </header>

      <section className="gestion-espacios">
      <div className="gestion-espacios__panel gestion-espacios__panel--lista">
        <header className="espacios-page__header">
          <h2 className="espacios-page__title">Espacios</h2>
          {!showForm && (
            <button type="button" className="espacios-add" onClick={openCreate}>
              Añadir espacio
            </button>
          )}
        </header>

        <EspaciosFiltros
          values={filtros}
          tipos={tipos}
          bloques={bloques}
          pisos={pisos}
          count={espacios.length}
          campusNombre={campusNombre}
          onChange={cambiarFiltros}
          onClear={limpiarFiltros}
        />

        {actionError && (
          <p className="espacios-inline-error" role="alert">
            {actionError}
          </p>
        )}

        {status === 'loading' && <p className="espacios-state">Cargando espacios…</p>}

        {status === 'error' && (
          <div className="espacios-state espacios-state--error" role="alert">
            <p>{error?.message}</p>
            {error?.retryable && (
              <button
                type="button"
                className="espacios-retry"
                onClick={() => setReload((n) => n + 1)}
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {status === 'ready' && (
          <EspaciosList
            espacios={espacios}
            selectedId={selectedId}
            onSelect={(espacio) => setSelectedId(espacio.id)}
          />
        )}
      </div>

      <div className="gestion-espacios__panel gestion-espacios__panel--detalle">
        <EspacioDetalle
          espacio={seleccionado}
          pendingId={pendingId}
          onEdit={handleEdit}
          onToggleEstado={handleToggleEstado}
          onDelete={handleDelete}
          token={token}
          onLogout={onLogout}
        />
      </div>

      {showForm && (
        <div className="espacios-modal" role="presentation" onClick={closeForm}>
          <div
            className="espacios-modal__content"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <EspacioForm
              token={token}
              tipos={tipos}
              bloques={bloques}
              espacio={editing}
              onCreated={handleCreated}
              onUpdated={handleUpdated}
              onLogout={onLogout}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
      </section>
    </div>
  )
}
