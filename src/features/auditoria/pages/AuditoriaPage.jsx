import { useEffect, useState } from 'react'
import '../styles/auditoria.css'
import { listarAuditoriaReservas, exportarAuditoriaReservas } from '../services/auditoriaApi'
import { listarBloques } from '../../espacios/services/bloquesApi'
import { listarTiposEspacio, listarPisos } from '../../espacios/services/espaciosApi'

const TIPOS_EVENTO = [['CREADA', 'Creada'], ['CANCELADA', 'Cancelada'], ['LIBERADA', 'Liberada']]
const SITUACIONES = [
  ['PROXIMA', 'Próxima'], ['EN_PROCESO', 'En proceso'], ['FINALIZADA', 'Finalizada'],
  ['CANCELADA', 'Cancelada'], ['LIBERADA', 'Liberada'],
]
const ROLES = [['ESTUDIANTE', 'Estudiante'], ['DOCENTE', 'Docente']]
const EVENTO_LABEL = { CREADA: 'Creada', CANCELADA: 'Cancelada', LIBERADA: 'Liberada' }
const SIT = {
  PROXIMA: ['Próxima', 'sit--proxima'],
  EN_PROCESO: ['En proceso', 'sit--proceso'],
  FINALIZADA: ['Finalizada', 'sit--finalizada'],
  CANCELADA: ['Cancelada', 'sit--cancelada'],
  LIBERADA: ['Liberada', 'sit--liberada'],
}
const VACIO = {
  desde: '', hasta: '', bloqueId: '', pisoId: '', tipoEspacioId: '',
  rol: '', tipoEvento: '', situacion: '', q: '',
}
const POR_PAGINA = 10

function parseDt(v) {
  if (!v) return { fecha: '', hora: '' }
  const pad = (n) => String(n).padStart(2, '0')
  if (Array.isArray(v)) {
    const [y, m, d, h = 0, mi = 0] = v
    return { fecha: `${pad(d)}/${pad(m)}/${y}`, hora: `${pad(h)}:${pad(mi)}` }
  }
  const [d, t] = String(v).split('T')
  const [y, mo, da] = d.split('-')
  return { fecha: `${da}/${mo}/${y}`, hora: (t || '').slice(0, 5) }
}

export default function AuditoriaPage({ token }) {
  const [filtros, setFiltros] = useState(VACIO)
  const [aplicados, setAplicados] = useState(VACIO)
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 1 })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [errorExport, setErrorExport] = useState('')
  const [exportando, setExportando] = useState(false)
  const [bloques, setBloques] = useState([])
  const [tipos, setTipos] = useState([])
  const [pisos, setPisos] = useState([])

  useEffect(() => {
    Promise.all([listarBloques(token), listarTiposEspacio(token)])
      .then(([b, t]) => { setBloques(b ?? []); setTipos(t ?? []) })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!filtros.bloqueId) { setPisos([]); return undefined }
    let cancelled = false
    listarPisos(filtros.bloqueId)
      .then((p) => { if (!cancelled) setPisos(p ?? []) })
      .catch(() => { if (!cancelled) setPisos([]) })
    return () => { cancelled = true }
  }, [filtros.bloqueId])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')
    listarAuditoriaReservas({ ...aplicados, page, size: POR_PAGINA }, token)
      .then((d) => {
        if (cancelled) return
        setData(d ?? { content: [], totalElements: 0, totalPages: 1 })
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 401) return
        setError('No se pudo cargar la auditoría.')
        setStatus('error')
      })
    return () => { cancelled = true }
  }, [aplicados, page, token])

  function cambiar(patch) { setFiltros((f) => ({ ...f, ...patch })) }
  function aplicar() { setPage(0); setAplicados(filtros) }
  function limpiar() { setFiltros(VACIO); setPage(0); setAplicados(VACIO) }

  async function exportar() {
    setExportando(true)
    setErrorExport('')
    try {
      const blob = await exportarAuditoriaReservas(aplicados, token)
      const url = URL.createObjectURL(blob)
      const pad = (n) => String(n).padStart(2, '0')
      const ahora = new Date()
      const stamp = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}-${pad(ahora.getHours())}${pad(ahora.getMinutes())}`
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `auditoria-reservas-${stamp}.xlsx`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (err.status !== 401) {
        setErrorExport(err?.message ?? 'No se pudo exportar la auditoría.')
      }
    } finally {
      setExportando(false)
    }
  }

  const rows = data.content ?? []
  const totalPaginas = Math.max(1, data.totalPages ?? 1)

  return (
    <section className="auditoria-page">
      <header className="auditoria-header">
        <p className="page-eyebrow">Auditoría y trazabilidad</p>
        <h2 className="auditoria-titulo">Historial de reservas</h2>
        <p className="auditoria-sub">Consulta el historial completo de uso de espacios a lo largo del tiempo. Solo lectura.</p>
      </header>

      <div className="auditoria-filtros">
        <div className="auditoria-filtros__grid">
          <label className="auditoria-filtro">
            <span>Desde</span>
            <input type="date" value={filtros.desde} onChange={(e) => cambiar({ desde: e.target.value })} />
          </label>
          <label className="auditoria-filtro">
            <span>Hasta</span>
            <input type="date" value={filtros.hasta} onChange={(e) => cambiar({ hasta: e.target.value })} />
          </label>
          <label className="auditoria-filtro">
            <span>Torre / Bloque</span>
            <select value={filtros.bloqueId} onChange={(e) => cambiar({ bloqueId: e.target.value, pisoId: '' })}>
              <option value="">Todos</option>
              {bloques.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro">
            <span>Piso</span>
            <select value={filtros.pisoId} onChange={(e) => cambiar({ pisoId: e.target.value })} disabled={!filtros.bloqueId}>
              <option value="">Todos</option>
              {pisos.map((p) => <option key={p.id} value={p.id}>Piso {p.numero}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro">
            <span>Tipo de espacio</span>
            <select value={filtros.tipoEspacioId} onChange={(e) => cambiar({ tipoEspacioId: e.target.value })}>
              <option value="">Todos</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro">
            <span>Rol del responsable</span>
            <select value={filtros.rol} onChange={(e) => cambiar({ rol: e.target.value })}>
              <option value="">Todos</option>
              {ROLES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro">
            <span>Tipo de evento</span>
            <select value={filtros.tipoEvento} onChange={(e) => cambiar({ tipoEvento: e.target.value })}>
              <option value="">Todos</option>
              {TIPOS_EVENTO.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro">
            <span>Situación</span>
            <select value={filtros.situacion} onChange={(e) => cambiar({ situacion: e.target.value })}>
              <option value="">Todas</option>
              {SITUACIONES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className="auditoria-filtro auditoria-filtro--ancho">
            <span>Buscar por nombre o código</span>
            <input type="search" placeholder="Nombre o código del responsable…" value={filtros.q} onChange={(e) => cambiar({ q: e.target.value })} />
          </label>
        </div>
        <div className="auditoria-filtros__acciones">
          <button type="button" className="auditoria-btn" onClick={limpiar}>Limpiar filtros</button>
          <button type="button" className="auditoria-btn auditoria-btn--primary" onClick={aplicar}>Aplicar</button>
        </div>
      </div>

      <div className="auditoria-card">
        <div className="auditoria-card__head">
          <span className="auditoria-count">{data.totalElements ?? 0} <span>eventos</span></span>
          <div className="auditoria-card__head-actions">
            <button type="button" className="auditoria-btn auditoria-btn--export" onClick={exportar} disabled={exportando}>
              {exportando ? 'Exportando…' : 'Exportar a Excel'}
            </button>
            <span className="auditoria-readonly">Solo lectura</span>
          </div>
        </div>

        {status === 'loading' && <p className="auditoria-state">Cargando…</p>}
        {status === 'error' && <p className="auditoria-state auditoria-state--error" role="alert">{error}</p>}
        {errorExport && <p className="auditoria-state auditoria-state--error" role="alert">{errorExport}</p>}
        {status === 'ready' && (rows.length === 0 ? (
          <p className="auditoria-vacio">No hay eventos para los filtros seleccionados.</p>
        ) : (
          <div className="auditoria-scroll">
            <table className="auditoria-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Responsable</th>
                  <th>Rol</th>
                  <th>Fecha del evento</th>
                  <th>Horario de la reserva</th>
                  <th>Espacio</th>
                  <th>Descripción</th>
                  <th>Situación</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ev) => {
                  const fe = parseDt(ev.fechaEvento)
                  const ini = parseDt(ev.inicio)
                  const fin = parseDt(ev.fin)
                  const sit = SIT[ev.situacion] ?? [ev.situacion, 'sit--finalizada']
                  const ubic = [ev.torre, ev.piso != null ? `Piso ${ev.piso}` : null].filter(Boolean).join(' · ')
                  return (
                    <tr key={ev.eventoId}>
                      <td className="aud-id">#{ev.reservaId}</td>
                      <td><span className="aud-chip">{EVENTO_LABEL[ev.tipoEvento] ?? ev.tipoEvento}</span></td>
                      <td>
                        <div className="aud-resp">{ev.responsableNombre}</div>
                        <div className="aud-code">{ev.responsableCodigo}</div>
                      </td>
                      <td><span className="aud-chip">{ev.rol === 'DOCENTE' ? 'Docente' : ev.rol === 'ESTUDIANTE' ? 'Estudiante' : ev.rol}</span></td>
                      <td className="aud-when">{fe.fecha}<br />{fe.hora}</td>
                      <td className="aud-when">{ini.fecha}<br />{ini.hora} – {fin.hora}</td>
                      <td>
                        <div className="aud-esp">{ev.aula}</div>
                        <div className="aud-esp-sub">{ubic}</div>
                        {ev.tipoEspacio && <span className="aud-tipo">{ev.tipoEspacio}</span>}
                      </td>
                      <td className="aud-desc">{ev.descripcion}</td>
                      <td><span className={`aud-badge ${sit[1]}`}>{sit[0]}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}

        {status === 'ready' && rows.length > 0 && totalPaginas > 1 && (
          <div className="auditoria-pager">
            <span>Página {page + 1} de {totalPaginas}</span>
            <div className="auditoria-pager__btns">
              <button type="button" className="auditoria-btn" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Anterior</button>
              <button type="button" className="auditoria-btn" disabled={page >= totalPaginas - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
