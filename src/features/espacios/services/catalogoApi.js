import { apiRequest } from '../../../shared/api/client'

export function listarCategorias(token, incluirInactivas = false) {
  return apiRequest(`/api/catalogo/categorias?incluirInactivas=${incluirInactivas}`, { token })
}
export function crearCategoria(body, token) {
  return apiRequest('/api/catalogo/categorias', { method: 'POST', body, token })
}
export function actualizarCategoria(id, body, token) {
  return apiRequest(`/api/catalogo/categorias/${id}`, { method: 'PUT', body, token })
}
export function estadoCategoria(id, activo, token) {
  return apiRequest(`/api/catalogo/categorias/${id}/estado`, { method: 'PATCH', body: { activo }, token })
}

export function listarElementos(token, { q, incluirInactivos = false } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  params.set('incluirInactivos', String(incluirInactivos))
  return apiRequest(`/api/catalogo/elementos?${params.toString()}`, { token })
}
export function crearElemento(body, token) {
  return apiRequest('/api/catalogo/elementos', { method: 'POST', body, token })
}
export function actualizarElemento(id, body, token) {
  return apiRequest(`/api/catalogo/elementos/${id}`, { method: 'PUT', body, token })
}
export function estadoElemento(id, activo, token) {
  return apiRequest(`/api/catalogo/elementos/${id}/estado`, { method: 'PATCH', body: { activo }, token })
}
