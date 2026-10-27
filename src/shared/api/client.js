/**
 * Cliente HTTP base de Ubícate.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Centraliza la URL del backend, serializa el body como JSON y convierte
 * las respuestas de error en ApiError para que las features no usen fetch
 * directamente.
 */

// Se puede sobreescribir con VITE_API_URL; se quita la barra final para unir rutas.
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Errores de red o backend apagado: fetch no devuelve respuesta.
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en línea.',
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      response.status,
      data,
    )
  }

  return data
}
