import { apiRequest } from '../../../shared/api/client'

export function listarTiposEspacio() {
  return apiRequest('/api/tipos-espacio')
}

export function listarEspacios({ sedeId, page = 0, size = 100 } = {}) {
  const params = new URLSearchParams()
  if (sedeId != null) {
    params.set('sedeId', String(sedeId))
  }
  params.set('page', String(page))
  params.set('size', String(size))

  const qs = params.toString()
  return apiRequest(`/api/espacios${qs ? `?${qs}` : ''}`)
}

export function crearEspacio(body, token) {
  return apiRequest('/api/espacios', {
    method: 'POST',
    body,
    token,
  })
}

export function editarEspacio(id, body, token) {
  return apiRequest(`/api/espacios/${id}`, {
    method: 'PUT',
    body,
    token,
  })
}

export function cambiarEstadoEspacio(id, estado, token) {
  return apiRequest(`/api/espacios/${id}/estado`, {
    method: 'PATCH',
    body: { estado },
    token,
  })
}

export function eliminarEspacio(id, token) {
  return apiRequest(`/api/espacios/${id}`, {
    method: 'DELETE',
    token,
  })
}
