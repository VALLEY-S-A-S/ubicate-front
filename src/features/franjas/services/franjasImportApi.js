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

// Horario general del periodo vigente. El endpoint es publico, por eso no viaja
// token: sirve para el vistazo de las clases ya cargadas en el backend.
export function listarHorariosCargados(limit = 8, signal) {
  const tamanio = Number.isFinite(limit) && limit > 0 ? Math.min(Math.trunc(limit), 100) : 8
  return apiRequest(`/api/horarios/publicos?page=0&size=${tamanio}`, { signal })
}

export function validarArchivoFranjas(archivo) {
  if (!archivo) return 'Selecciona un archivo Excel.'
  if (!/\.xlsx$/i.test(archivo.name)) return 'Solo se permiten archivos .xlsx.'
  if (!archivo.size) return 'El archivo está vacío.'
  if (archivo.size > 5 * 1024 * 1024) return 'El archivo supera 5 MiB.'
  return ''
}
