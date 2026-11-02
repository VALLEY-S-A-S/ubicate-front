import { useEffect, useState } from 'react'
import BloqueForm from '../components/BloqueForm'
import BloquesList from '../components/BloquesList'
import { listarBloques } from '../services/bloquesApi'
import '../styles/espacios.css'

export default function BloquesPage({ token, onLogout }) {
  const [bloques, setBloques] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function cargar() {
      setStatus('loading')
      setError(null)

      try {
        const data = await listarBloques(token)
        if (cancelled) return
        setBloques(data)
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
            message: 'No se pudieron cargar los bloques. Inténtalo de nuevo.',
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
  }, [token, reload])

  function handleCreated(nuevoBloque) {
    setBloques((current) =>
      [...current, nuevoBloque].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      ),
    )
    setEditing(null)
    setShowForm(false)
  }

  function handleUpdated(bloqueActualizado) {
    setBloques((current) =>
      current
        .map((b) => (b.id === bloqueActualizado.id ? bloqueActualizado : b))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    )
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(bloque) {
    setEditing(bloque)
    setShowForm(true)
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  return (
    <section className="bloques-page">
      <header className="bloques-page__header">
        <h2 className="bloques-page__title">Gestionar bloques</h2>
        {!showForm && (
          <button
            type="button"
            className="bloques-add"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            Añadir bloque
          </button>
        )}
      </header>

      {showForm && (
        <BloqueForm
          token={token}
          bloque={editing}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          onLogout={onLogout}
          onCancel={closeForm}
        />
      )}

      {status === 'loading' && (
        <p className="bloques-state">Cargando bloques…</p>
      )}

      {status === 'error' && (
        <div className="bloques-state bloques-state--error" role="alert">
          <p>{error?.message}</p>
          {error?.retryable && (
            <button
              type="button"
              className="bloques-retry"
              onClick={() => setReload((n) => n + 1)}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {status === 'ready' && bloques.length === 0 && (
        <p className="bloques-state">Aún no hay bloques registrados</p>
      )}

      {status === 'ready' && bloques.length > 0 && (
        <BloquesList bloques={bloques} onEdit={handleEdit} />
      )}
    </section>
  )
}
