import { apiRequest } from '../../../shared/api/client'

export function buscarCatalogo(q, token) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiRequest(`/api/catalogo/elementos${qs}`, { token })
}

export function listarInventario(espacioId, token) {
  return apiRequest(`/api/espacios/${espacioId}/inventario`, { token })
}

export function agregarInventario(espacioId, elementoId, cantidad, token) {
  return apiRequest(`/api/espacios/${espacioId}/inventario`, {
    method: 'POST',
    body: { elementoId, cantidad },
    token,
  })
}

export function actualizarCantidad(espacioId, elementoId, cantidad, token) {
  return apiRequest(`/api/espacios/${espacioId}/inventario/${elementoId}`, {
    method: 'PUT',
    body: { cantidad },
    token,
  })
}

export function retirarInventario(espacioId, elementoId, token) {
  return apiRequest(`/api/espacios/${espacioId}/inventario/${elementoId}`, {
    method: 'DELETE',
    token,
  })
}
