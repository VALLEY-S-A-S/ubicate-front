import { useEffect, useState } from 'react'
import EspacioForm from '../components/EspacioForm'
import EspaciosList from '../components/EspaciosList'
import { listarBloques } from '../services/bloquesApi'
import {
  cambiarEstadoEspacio,
  eliminarEspacio,
  listarEspacios,
  listarTiposEspacio,
} from '../services/espaciosApi'
import '../styles/espacios.css'

export default function GestionEspaciosPage({ token, onLogout, sedeId }) {
  const [tipos, setTipos] = useState([])
  const [bloques, setBloques] = useState([])
  const [espacios, setEspacios] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function cargar() {
      setStatus('loading')
      setError(null)

      try {
        const [tiposData, bloquesData, espaciosData] = await Promise.all([
          listarTiposEspacio(),
          listarBloques(token),
          listarEspacios({ sedeId }),
        ])
        if (cancelled) return
        setTipos(tiposData)
        setBloques(bloquesData)
        setEspacios(espaciosData.content ?? espaciosData)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return

        if (err.status === 401) {
          onLogout?.()
          return
        }

        if (err.status === 403) {
          setError({
            message: 'No tienes permiso para esta acción',
            retryable: false,
          })
        } else {
          setError({
            message: 'No se pudieron cargar los espacios. Inténtalo de nuevo.',
            retryable: true,
          })
        }
        setStatus('error')
      }
    }

    cargar()
    return () => {
      cancelled = true
    }
  }, [token, sedeId, reload])

  function handleCreated(nuevo) {
    setEspacios((current) =>
      [...current, nuevo].sort((a, b) => a.codigo.localeCompare(b.codigo)),
    )
    setEditing(null)
    setShowForm(false)
  }

  function handleUpdated(actualizado) {
    setEspacios((current) =>
      current.map((e) => (e.id === actualizado.id ? actualizado : e)),
    )
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
      setEspacios((current) =>
        current.map((e) => (e.id === actualizado.id ? actualizado : e)),
      )
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
    } catch (err) {
      if (err.status === 401) {
        onLogout?.()
        return
      }
      setActionError(
        err.status === 409
          ? err.message
          : 'No se pudo borrar el espacio. Inténtalo de nuevo.',
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="espacios-page">
      <header className="espacios-page__header">
        <h2 className="espacios-page__title">Gestionar espacios</h2>
        {status === 'ready' && !showForm && (
          <button type="button" className="espacios-add" onClick={openCreate}>
            Añadir espacio
          </button>
        )}
      </header>

      {showForm && (
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
      )}

      {status === 'loading' && (
        <p className="espacios-state">Cargando espacios…</p>
      )}

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

      {actionError && (
        <p className="espacios-inline-error" role="alert">
          {actionError}
        </p>
      )}

      {status === 'ready' && (
        <EspaciosList
          espacios={espacios}
          pendingId={pendingId}
          onToggleEstado={handleToggleEstado}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  )
}
