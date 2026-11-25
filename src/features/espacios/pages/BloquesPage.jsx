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
  const [selectedId, setSelectedId] = useState(null)
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
        // Tras cargar, el detalle muestra el primer bloque si sigue existiendo.
        setSelectedId((actual) =>
          data.some((b) => b.id === actual) ? actual : (data[0]?.id ?? null),
        )
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

  const bloqueSeleccionado = bloques.find((b) => b.id === selectedId) ?? null

  function handleCreated(nuevoBloque) {
    setBloques((current) =>
      [...current, nuevoBloque].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    )
    setSelectedId(nuevoBloque.id)
    setEditing(null)
    setShowForm(false)
  }

  function handleUpdated(bloqueActualizado) {
    setBloques((current) =>
      current
        .map((b) => (b.id === bloqueActualizado.id ? bloqueActualizado : b))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    )
    setSelectedId(bloqueActualizado.id)
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(bloque) {
    setEditing(bloque)
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

  if (status === 'error') {
    return (
      <section className="bloques-page">
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
      </section>
    )
  }

  return (
    <section className="bloques-page">
      <div className="bloques-layout">
        <div className="bloques-layout__panel bloques-layout__panel--lista">
          <header className="bloques-layout__cabecera">
            <h3>Bloques registrados</h3>
            {!showForm && (
              <button type="button" className="bloques-add" onClick={openCreate}>
                Añadir bloque
              </button>
            )}
          </header>

          {status === 'loading' && (
            <p className="bloques-layout__vacio">Cargando bloques…</p>
          )}

          {status === 'ready' && bloques.length === 0 && (
            <p className="bloques-layout__vacio">Aún no hay bloques registrados.</p>
          )}

          {status === 'ready' && bloques.length > 0 && (
            <>
              <p className="bloques-layout__contador">
                {bloques.length} {bloques.length === 1 ? 'bloque' : 'bloques'} en esta sede
              </p>
              <BloquesList
                bloques={bloques}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </>
          )}
        </div>

        <div className="bloques-layout__panel bloques-layout__panel--detalle">
          {status === 'loading' && (
            <p className="bloques-layout__vacio">Cargando bloques…</p>
          )}

          {status === 'ready' && showForm && (
            <BloqueForm
              token={token}
              bloque={editing}
              onCreated={handleCreated}
              onUpdated={handleUpdated}
              onLogout={onLogout}
              onCancel={closeForm}
            />
          )}

          {status === 'ready' && !showForm && bloqueSeleccionado && (
            <div className="bloque-detalle">
              <header className="bloque-detalle__cabecera">
                <div>
                  <p className="bloque-detalle__eyebrow">Bloque</p>
                  <h3>{bloqueSeleccionado.nombre}</h3>
                </div>
                <button
                  type="button"
                  className="bloques-edit"
                  onClick={() => handleEdit(bloqueSeleccionado)}
                >
                  Editar bloque
                </button>
              </header>

              <dl className="bloque-detalle__datos">
                <div>
                  <dt>Pisos</dt>
                  <dd>{bloqueSeleccionado.pisos}</dd>
                </div>
              </dl>
            </div>
          )}

          {status === 'ready' && !showForm && !bloqueSeleccionado && (
            <p className="bloques-layout__vacio">
              {bloques.length === 0
                ? 'Cuando añadas un bloque, aquí verás su información.'
                : 'Selecciona un bloque de la lista para ver su información.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
