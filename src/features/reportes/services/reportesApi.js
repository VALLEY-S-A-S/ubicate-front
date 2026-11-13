import { apiRequest } from '../../../shared/api/client.js'

const CAMPOS = [
  'espacioId',
  'bloqueId',
  'pisoId',
  'tipoAnomaliaId',
  'estado',
  'rolReportante',
  'responsable',
]

function construirConsulta(filtros, page, size) {
  const params = new URLSearchParams()
  CAMPOS.forEach((campo) => {
    const valor = filtros?.[campo]
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      params.set(campo, String(valor).trim())
    }
  })
  if (filtros?.desde) params.set('desde', `${filtros.desde}T00:00:00`)
  if (filtros?.hasta) params.set('hasta', `${filtros.hasta}T23:59:59`)
  params.set('page', String(page))
  params.set('size', String(size))
  return params.toString()
}

export function listarReportes(filtros, page, size, token, signal) {
  return apiRequest(`/api/reportes?${construirConsulta(filtros, page, size)}`, { token, signal })
}

export function obtenerReporte(id, token, signal) {
  return apiRequest(`/api/reportes/${id}`, { token, signal })
}

export function obtenerEvidencia(id, token, signal) {
  return apiRequest(`/api/reportes/${id}/evidencia`, { token, signal, responseType: 'blob' })
}

export function listarTiposAnomalia(token, signal) {
  return apiRequest('/api/tipos-anomalia', { token, signal })
}

export function listarBloques(sedeId, token, signal) {
  const params = new URLSearchParams()
  if (sedeId) params.set('sedeId', String(sedeId))
  const consulta = params.toString()
  return apiRequest(`/api/espacios/bloques${consulta ? `?${consulta}` : ''}`, { token, signal })
}

export function listarPisos(bloqueId, sedeId, token, signal) {
  const params = new URLSearchParams()
  if (bloqueId) params.set('bloqueId', String(bloqueId))
  if (sedeId) params.set('sedeId', String(sedeId))
  const consulta = params.toString()
  return apiRequest(`/api/pisos${consulta ? `?${consulta}` : ''}`, { token, signal })
}

export function listarEspacios({ sedeId, bloqueId, pisoId }, token, signal) {
  const params = new URLSearchParams({ page: '0', size: '500' })
  if (sedeId) params.set('sedeId', String(sedeId))
  if (bloqueId) params.set('bloqueId', String(bloqueId))
  if (pisoId) params.set('pisoId', String(pisoId))
  return apiRequest(`/api/espacios?${params.toString()}`, { token, signal })
}
