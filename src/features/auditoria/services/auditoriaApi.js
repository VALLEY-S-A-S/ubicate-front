import { apiRequest } from '../../../shared/api/client'

export function listarAuditoriaReservas(filtros = {}, token) {
  const {
    desde, hasta, bloqueId, pisoId, tipoEspacioId,
    rol, tipoEvento, situacion, q, page = 0, size = 10,
  } = filtros
  const p = new URLSearchParams()
  if (desde) p.set('desde', `${desde}T00:00:00`)
  if (hasta) p.set('hasta', `${hasta}T23:59:59`)
  if (bloqueId) p.set('bloqueId', String(bloqueId))
  if (pisoId) p.set('pisoId', String(pisoId))
  if (tipoEspacioId) p.set('tipoEspacioId', String(tipoEspacioId))
  if (rol) p.set('rol', rol)
  if (tipoEvento) p.set('tipoEvento', tipoEvento)
  if (situacion) p.set('situacion', situacion)
  if (q) p.set('q', q)
  p.set('page', String(page))
  p.set('size', String(size))
  return apiRequest(`/api/auditoria/reservas?${p.toString()}`, { token })
}
