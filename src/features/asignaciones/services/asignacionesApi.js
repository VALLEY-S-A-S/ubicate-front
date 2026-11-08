/**
 * lady vidal - HU-06: llamadas al backend para consultar el horario de
 * asignaciones y poblar los filtros de tipo de espacio, bloque y piso.
 */
import { apiRequest } from '../../../shared/api/client.js'
import { construirParametros, construirParametrosFranjas } from '../utils/horario.js'

export function obtenerHorario(filtros, token, signal) {
  const query = construirParametros(filtros).toString()
  return apiRequest(`/api/espacios/horario${query ? `?${query}` : ''}`, { token, signal })
}

export function obtenerFranjasPendientes(filtros, token, signal) {
  const query = construirParametrosFranjas(filtros).toString()
  return apiRequest(`/api/franjas/pendientes${query ? `?${query}` : ''}`, { token, signal })
}

export function guardarAsignaciones(cambios, token) {
  return apiRequest('/api/asignaciones', { method: 'PUT', token, body: cambios })
}

export function listarBloquesHorario(sedeId, token) {
  const parametros = new URLSearchParams()
  if (sedeId !== '' && sedeId != null) parametros.set('sedeId', String(sedeId))
  const query = parametros.toString()
  return apiRequest(`/api/espacios/bloques${query ? `?${query}` : ''}`, { token })
}

export function listarPisosHorario(bloqueId, token) {
  const parametros = new URLSearchParams()
  if (bloqueId !== '' && bloqueId != null) parametros.set('bloqueId', String(bloqueId))
  const query = parametros.toString()
  return apiRequest(`/api/pisos${query ? `?${query}` : ''}`, { token })
}
