import { useEffect, useRef, useState } from 'react'
import { detalle, importar, loteDesdeHash, plantilla, reintentar, tieneTareasActivas, validarArchivo } from '../services/usuariosApi.js'
import '../styles/usuarios.css'

const CUENTAS = { CREADO: 'Pendiente de activar', VERIFICADO: 'Activa', SUSPENDIDO: 'Suspendida' }
const CORREOS = { PENDIENTE: 'Pendiente', ENVIANDO: 'Enviando', ENVIADO: 'Enviado', FALLIDO: 'Fallido', CANCELADO: 'Cancelado', SIN_ENVIO: 'Sin envío' }
const ESTADOS = { PENDIENTE: 'Pendientes', ENVIANDO: 'Enviando', ENVIADO: 'Enviados', FALLIDO: 'Fallidos', CANCELADO: 'Cancelados', SIN_ENVIO: 'Sin envío' }
export default function UsuariosPage({ token }) {
  const [archivo, setArchivo] = useState(null)
  const [loteId, setLoteId] = useState(() => loteDesdeHash(window.location.hash))
  const [consulta, setConsulta] = useState(loteId)
  const [lote, setLote] = useState(null)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState('')
  const [revision, setRevision] = useState(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const action = useRef(false)
  const input = useRef(null)

  useEffect(() => {
    const changed = () => { const id = loteDesdeHash(window.location.hash); if (id === loteId) return; setLoteId(id); setConsulta(id); setLote(null); setError('') }
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [loteId])
  useEffect(() => {
    if (!loteId) return
    const controller = new AbortController()
    let timer
    async function refresh() {
      try {
        const next = await detalle(loteId, token, controller.signal)
        if (controller.signal.aborted) return
        setLote(next)
        if (tieneTareasActivas(next)) timer = setTimeout(refresh, 5000)
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.status === 404 ? 'No se encontró esa importación en tu sede.' : failure.message)
      }
    }
    refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [loteId, token, revision])

  function abrir(id) {
    setLoteId(String(id)); setConsulta(String(id)); setLote(null); setError('')
    window.location.hash = `/dashboard/usuarios?lote=${id}`
    setRevision(value => value + 1)
  }
  async function ejecutar(tipo, operation) {
    if (action.current) return
    action.current = true; setBusy(tipo); setError(''); setErrores([]); setMessage('')
    try { await operation() }
    catch (failure) {
      if (!mounted.current) return
      if (Array.isArray(failure.data?.errors)) setErrores(failure.data.errors)
      setError(failure.status === 409 ? 'La importación tuvo un conflicto de datos. No se creó ningún usuario; revisa el archivo antes de volver a enviarlo.'
        : failure.status === 0 && tipo === 'importar' ? 'No se pudo confirmar el resultado. Consulta el lote o verifica las cuentas antes de volver a importar el archivo.'
        : failure.message)
    } finally { action.current = false; if (mounted.current) setBusy('') }
  }
  async function descargar() {
    await ejecutar('plantilla', async () => {
      const blob = await plantilla(token)
      if (!mounted.current) return
      const url = URL.createObjectURL(blob); const link = document.createElement('a')
      link.href = url; link.download = 'plantilla-usuarios.xlsx'; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }
  async function cargar(event) {
    event.preventDefault()
    const invalid = validarArchivo(archivo)
    if (invalid) { setError(invalid); return }
    await ejecutar('importar', async () => {
      const created = await importar(archivo, token)
      if (!mounted.current) return
      setMessage(`Importación ${created.id}: ${created.totalUsuarios} cuentas creadas. Los correos quedaron en cola.`)
      setArchivo(null); if (input.current) input.current.value = ''
      abrir(created.id)
    })
  }
  return <section className="usuarios-page" aria-labelledby="usuarios-title">
    <header><p className="usuarios-eyebrow">Gestión de acceso</p><h1 id="usuarios-title" tabIndex={-1}>Importar usuarios</h1>
      <p>Crea cuentas institucionales con una plantilla Excel. Cada persona recibirá un enlace para definir su contraseña.</p></header>
    <div className="usuarios-grid">
      <section className="usuarios-card"><h2>1. Prepara el archivo</h2><p>Una hoja con las columnas <strong>ITEM, CEDULA O CODIGO, APELLIDOS, NOMBRE, CARGO, CORREO INSTITUCIONAL</strong>. Máximo 1000 usuarios y 5 MiB.</p>
        <p>Cargos: ESTUDIANTE, AUXILIAR ADMINISTRATIVA, AUXILIAR DE SERVICIOS DE SALUD, AUXILIAR DE SERVICIOS GENERALES, PROFESIONAL, TECNICO, DOCENTE y OPS. Solo estudiantes y docentes pueden reservar. Todas las cuentas se asignan a tu sede. Los cinco datos personales son obligatorios; ITEM es opcional. Descarga la nueva plantilla: el formato anterior ya no se admite.</p>
        <button className="usuarios-button usuarios-button--secondary" disabled={Boolean(busy)} onClick={descargar}>{busy === 'plantilla' ? 'Descargando…' : 'Descargar plantilla Excel'}</button>
      </section>
      <section className="usuarios-card"><h2>2. Crea las cuentas</h2><form onSubmit={cargar} aria-busy={busy === 'importar'}>
        <label htmlFor="usuarios-archivo">Archivo Excel (.xlsx)</label>
        <input ref={input} id="usuarios-archivo" type="file" accept=".xlsx" disabled={Boolean(busy)} onChange={event => { setArchivo(event.target.files?.[0] ?? null); setError(''); setErrores([]) }} />
        <p>No se crean cuentas si alguna fila tiene errores. Revisa los datos antes de enviarlos.</p>
        <button className="usuarios-button" type="submit" disabled={Boolean(busy) || !archivo}>{busy === 'importar' ? 'Creando cuentas…' : 'Importar usuarios'}</button>
      </form></section>
    </div>
    {message && <p role="status" className="usuarios-message">{message}</p>}
    {error && <p role="alert" className="usuarios-error">{error}</p>}
    {errores.length > 0 && <div className="usuarios-table-wrap"><table><caption>Errores del archivo: corrige las filas y vuelve a importar.</caption><thead><tr><th>Fila</th><th>Campo</th><th>Detalle</th></tr></thead><tbody>{errores.map((item, index) => <tr key={index}><td>{item.fila === 0 ? 'Archivo' : item.fila}</td><td>{{correoInstitucional: "CORREO INSTITUCIONAL", cedulaOCodigo: "CEDULA O CODIGO", nombres: "NOMBRE", apellidos: "APELLIDOS", cargo: "CARGO"}[item.campo] ?? item.campo}</td><td>{item.mensaje}</td></tr>)}</tbody></table></div>}
    <section className="usuarios-card usuarios-results"><div className="usuarios-result-heading"><h2>Seguimiento de importación</h2>
      <form className="usuarios-query" onSubmit={event => { event.preventDefault(); if (/^[1-9]\d*$/.test(consulta) && Number(consulta) <= 2147483647) abrir(consulta); else setError('Introduce un número de importación válido.') }}>
        <label htmlFor="usuarios-lote">Número de importación</label><input id="usuarios-lote" type="text" inputMode="numeric" value={consulta} onChange={event => setConsulta(event.target.value)} disabled={Boolean(busy)} />
        <button className="usuarios-button usuarios-button--secondary" disabled={Boolean(busy)}>Consultar</button>
      </form></div>
      {loteId && !lote && !error && <p role="status">Consultando importación…</p>}
      {lote && <>
        <p>Importación <strong>#{lote.id}</strong> · {lote.totalUsuarios} cuentas · Sede {lote.sedeId}</p>
        <dl className="usuarios-counts">{Object.entries(ESTADOS).map(([state, label]) => <div key={state}><dt>{label}</dt><dd>{lote.correos[state] ?? 0}</dd></div>)}</dl>
        <p className="usuarios-note">{tieneTareasActivas(lote) ? 'El estado se actualiza cada cinco segundos mientras haya tareas en cola.' : 'Consulta completada.'} El estado del correo no indica si la cuenta ya fue activada.</p>
        <div className="usuarios-actions"><button className="usuarios-button usuarios-button--secondary" disabled={Boolean(busy)} onClick={() => { setLote(null); setError(''); setRevision(value => value + 1) }}>Actualizar estado</button>
          <button className="usuarios-button" disabled={Boolean(busy) || !lote.correos.FALLIDO} onClick={() => ejecutar('reintentar', async () => {
            const result = await reintentar(lote.id, token); if (!mounted.current) return; setMessage(`${result.encolados} correos encolados para reintento.`); setRevision(value => value + 1)
          })}>{busy === 'reintentar' ? 'Solicitando…' : 'Reintentar correos fallidos'}</button></div>
        <div className="usuarios-table-wrap"><table><caption>Resultado por usuario</caption><thead><tr><th>Fila</th><th>ITEM</th><th>Cédula o código</th><th>Nombres</th><th>Apellidos</th><th>Cargo</th><th>Correo</th><th>Rol</th><th>Cuenta</th><th>Correo de activación</th><th>Intentos</th></tr></thead><tbody>{lote.filas.map(row => <tr key={row.usuarioId}><td>{row.fila}</td><td>{row.item ?? "No registrado"}</td><td>{row.cedulaOCodigo ?? "No registrado"}</td><td>{row.nombres ?? row.nombre}</td><td>{row.apellidos ?? "No registrado"}</td><td>{row.cargo ?? "No registrado"}</td><td>{row.correoInstitucional}</td><td>{row.rol}</td><td>{CUENTAS[row.estadoUsuario] ?? row.estadoUsuario}</td><td><span className={`usuarios-status usuarios-status--${row.estadoCorreo.toLowerCase()}`}>{CORREOS[row.estadoCorreo] ?? row.estadoCorreo}</span></td><td>{row.intentos}</td></tr>)}</tbody></table></div>
      </>}
      {!loteId && <p>Al crear cuentas aparecerá aquí el resultado. También puedes consultar una importación por su número.</p>}
      {loteId && error && <button className="usuarios-button usuarios-button--secondary" onClick={() => { setLote(null); setError(''); setRevision(value => value + 1) }}>Volver a consultar</button>}
    </section>
  </section>
}
