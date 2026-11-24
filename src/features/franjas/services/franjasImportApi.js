import { apiRequest } from '../../../shared/api/client.js'

const BASE = '/api/franjas'

export function descargarPlantilla(token) {
  return apiRequest(`${BASE}/plantilla`, { token, responseType: 'blob' })
}

export function importarFranjas(archivo, token) {
  const body = new FormData()
  body.append('archivo', archivo)
  return apiRequest(`${BASE}/importaciones`, { method: 'POST', body, token })
}

export function validarArchivoFranjas(archivo) {
  if (!archivo) return 'Selecciona un archivo Excel.'
  if (!/\.xlsx$/i.test(archivo.name)) return 'Solo se permiten archivos .xlsx.'
  if (!archivo.size) return 'El archivo está vacío.'
  if (archivo.size > 5 * 1024 * 1024) return 'El archivo supera 5 MiB.'
  return ''
}
