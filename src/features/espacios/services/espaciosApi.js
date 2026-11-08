import { apiRequest } from '../../../shared/api/client'

// lady vidal - HU-06: se acepta token opcional para reutilizar el catálogo
// de tipos de espacio desde la vista de asignaciones.
export function listarTiposEspacio(token) {
  return apiRequest('/api/tipos-espacio', { token })
}

export function listarPisos(bloqueId) {
  const qs = bloqueId != null && bloqueId !== '' ? `?bloqueId=${encodeURIComponent(bloqueId)}` : ''
  return apiRequest(`/api/pisos${qs}`)
}

export function listarEspacios({ sedeId, q, tipoEspacioId, bloqueId, pisoId, page = 0, size = 100 } = {}) {
  const params = new URLSearchParams()
  if (sedeId != null) params.set('sedeId', String(sedeId))
  if (q) params.set('q', q)
  if (tipoEspacioId != null && tipoEspacioId !== '') params.set('tipoEspacioId', String(tipoEspacioId))
  if (bloqueId != null && bloqueId !== '') params.set('bloqueId', String(bloqueId))
  if (pisoId != null && pisoId !== '') params.set('pisoId', String(pisoId))
  params.set('page', String(page))
  params.set('size', String(size))

  return apiRequest(`/api/espacios?${params.toString()}`)
}

export function crearEspacio(body, token) {
  return apiRequest('/api/espacios', { method: 'POST', body, token })
}

export function editarEspacio(id, body, token) {
  return apiRequest(`/api/espacios/${id}`, { method: 'PUT', body, token })
}

export function cambiarEstadoEspacio(id, estado, token) {
  return apiRequest(`/api/espacios/${id}/estado`, { method: 'PATCH', body: { estado }, token })
}

export function eliminarEspacio(id, token) {
  return apiRequest(`/api/espacios/${id}`, { method: 'DELETE', token })
}
