import { apiRequest } from '../../../shared/api/client.js'
const BASE = '/api/admin/usuarios'
export function plantilla(token) { return apiRequest(`${BASE}/plantilla`, { token, responseType: 'blob' }) }
export function importar(archivo, token) {
  const body = new FormData(); body.append('archivo', archivo)
  return apiRequest(`${BASE}/importaciones`, { method: 'POST', body, token })
}
export function detalle(id, token, signal) { return apiRequest(`${BASE}/importaciones/${id}`, { token, signal }) }
export function reintentar(id, token) { return apiRequest(`${BASE}/importaciones/${id}/reintentar-correos`, { method: 'POST', token }) }
export function validarArchivo(archivo) {
  if (!archivo) return 'Selecciona un archivo Excel.'
  if (!/\.xlsx$/i.test(archivo.name)) return 'Solo se permiten archivos .xlsx.'
  if (!archivo.size) return 'El archivo está vacío.'
  if (archivo.size > 5 * 1024 * 1024) return 'El archivo supera 5 MiB.'
  return ''
}
export function tieneTareasActivas(lote) { return (lote?.correos?.PENDIENTE ?? 0) + (lote?.correos?.ENVIANDO ?? 0) > 0 }
export function loteDesdeHash(hash) {
  const value = new URLSearchParams(hash.split('?')[1] ?? '').get('lote')
  return value && /^[1-9]\d*$/.test(value) && Number(value) <= 2147483647 ? value : ''
}
