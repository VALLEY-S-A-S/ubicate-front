import { useEffect, useMemo, useState } from 'react'
import BloqueForm from '../components/BloqueForm'
import BloqueDetalle from '../components/BloqueDetalle'
import BloquesList, { filtrarBloques } from '../components/BloquesList'
import IconTile from '../components/IconTile'
import { BloquesIcono } from '../components/bloquesVisual'
import { listarBloques } from '../services/bloquesApi'
import { apiRequest } from '../../../shared/api/client'
import '../styles/espacios.css'

const LIMITE_PAGINAS = 20

// Total de espacios del bloque y conteo por piso usando el listado paginado
// existente: agrupa pisoNumero en el cliente y toma totalElements del sobre.
// No requiere cambios en el backend.
async function obtenerResumenBloque(bloqueId, sedeId, signal) {
  const porPiso = {}
  let total = 0
  let pagina = 0
  let totalPaginas = 1

  do {
    const consulta = new URLSearchParams({
      bloqueId: String(bloqueId),
      page: String(pagina),
      size: '100',
    })
    if (sedeId != null && sedeId !== '') consulta.set('sedeId', String(sedeId))

    const datos = await apiRequest(`/api/espacios?${consulta}`, { signal })
    const contenido = Array.isArray(datos?.content) ? datos.content : []
    total = datos?.totalElements ?? contenido.length
    totalPaginas = datos?.totalPages ?? 1

    for (const espacio of contenido) {
      const numero = espacio?.pisoNumero
      if (numero != null) porPiso[numero] = (porPiso[numero] ?? 0) + 1
    }

    pagina += 1
  } while (pagina < totalPaginas && pagina < LIMITE_PAGINAS)

  return { total, porPiso }
}

export default function BloquesPage({ token, onLogout, sedeId }) {
  const [bloques, setBloques] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [reload, setReload] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [resumenes, setResumenes] = useState({})
  // Elección visual del ícono: solo en memoria, sin backend ni almacenamiento.
  const [iconos, setIconos] = useState({})

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
  const visibles = useMemo(() => filtrarBloques(bloques, busqueda), [bloques, busqueda])

  // Resumen (espacios totales y por piso) del bloque activo, cacheado por id.
  useEffect(() => {
    if (status !== 'ready' || !bloqueSeleccionado || showForm) return undefined
    const id = bloqueSeleccionado.id
    if (resumenes[id]) return undefined

    const control = new AbortController()
    let vigente = true

    obtenerResumenBloque(id, sedeId, control.signal)
      .then((resumen) => {
        if (vigente) setResumenes((actual) => ({ ...actual, [id]: resumen }))
      })
      .catch((err) => {
        if (!vigente || err?.name === 'AbortError') return
        // Sin conteos disponibles: se muestra "—" en lugar de inventar cifras.
        setResumenes((actual) => ({ ...actual, [id]: { total: null, porPiso: {} } }))
      })

    return () => {
      vigente = false
      control.abort()
    }
  }, [status, bloqueSeleccionado, showForm, resumenes, sedeId])

  function limpiarResumen(id) {
    setResumenes((actual) => {
      if (!(id in actual)) return actual
      const siguiente = { ...actual }
      delete siguiente[id]
      return siguiente
    })
  }

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
    limpiarResumen(bloqueActualizado.id)
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

  function cambiarIcono(id, icono) {
    setIconos((actual) => ({ ...actual, [id]: icono }))
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

  const conteo = busqueda.trim()
    ? `${visibles.length} ${visibles.length === 1 ? 'bloque que coincide' : 'bloques que coinciden'}`
    : `${bloques.length} ${bloques.length === 1 ? 'bloque' : 'bloques'} en esta sede`

  return (
    <section className="bloques-page">
      <div className="bloques-layout">
        <div className="bloques-layout__panel bloques-layout__panel--lista">
          <header className="bloques-layout__cabecera">
            <IconTile size="grande">
              <BloquesIcono nombre="capas" />
            </IconTile>
            <div className="bloques-layout__cabecera-texto">
              <h3>Bloques registrados</h3>
              <p className="bloques-layout__contador">{conteo}</p>
            </div>
            {!showForm && (
              <button type="button" className="bloques-add" onClick={openCreate}>
                <BloquesIcono nombre="mas" />
                Añadir bloque
              </button>
            )}
          </header>

          <div className="bloques-busqueda">
            <BloquesIcono nombre="buscar" className="bloques-busqueda__icono" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar bloque..."
              aria-label="Buscar bloque"
            />
          </div>

          {status === 'loading' && (
            <div className="bloques-skeleton" role="status" aria-busy="true">
              <span className="sr-only">Cargando bloques…</span>
              <span className="bloques-skeleton__fila" />
              <span className="bloques-skeleton__fila" />
              <span className="bloques-skeleton__fila" />
            </div>
          )}

          {status === 'ready' && bloques.length === 0 && (
            <div className="bloques-layout__vacio">
              <p>Aún no hay bloques registrados</p>
              <button type="button" className="bloques-add" onClick={openCreate}>
                <BloquesIcono nombre="mas" />
                Añadir bloque
              </button>
            </div>
          )}

          {status === 'ready' && bloques.length > 0 && visibles.length === 0 && (
            <p className="bloques-layout__vacio">No se encontraron bloques</p>
          )}

          {status === 'ready' && visibles.length > 0 && (
            <BloquesList
              bloques={visibles}
              selectedId={selectedId}
              onSelect={setSelectedId}
              iconos={iconos}
            />
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

          {status === 'ready' && !showForm && (
            <BloqueDetalle
              bloque={bloqueSeleccionado}
              resumen={resumenes[bloqueSeleccionado?.id]}
              vacio={
                bloques.length === 0
                  ? 'Cuando añadas un bloque, aquí verás su información.'
                  : 'Selecciona un bloque de la lista para ver su información.'
              }
              onEdit={handleEdit}
              iconos={iconos}
              onCambiarIcono={cambiarIcono}
            />
          )}
        </div>
      </div>
    </section>
  )
}
