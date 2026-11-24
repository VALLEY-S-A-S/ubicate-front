import { apiRequest } from '../../../shared/api/client'

export function listarBloques(token) {
  return apiRequest('/api/bloques', { token })
}

export function crearBloque({ nombre, pisos }, token) {
  return apiRequest('/api/bloques', {
    method: 'POST',
    body: { nombre, pisos },
    token,
  })
}

export function editarBloque(id, { nombre, pisos }, token) {
  return apiRequest(`/api/bloques/${id}`, {
    method: 'PUT',
    body: { nombre, pisos },
    token,
  })
}
