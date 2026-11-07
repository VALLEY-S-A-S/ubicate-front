const API_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, { method = 'GET', body, token, headers: extraHeaders, signal, responseType = 'json' } = {}) {
  const multipart = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = { Accept: responseType === 'blob' ? '*/*' : 'application/json', ...extraHeaders }
  if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method, headers, signal, cache: 'no-store', credentials: 'omit',
      body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    if (response.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ubicate:unauthorized', { detail: { token } }))
    }
    throw new ApiError(data?.message ?? 'No se pudo completar la solicitud. Inténtalo de nuevo.', response.status, data)
  }
  if (response.status === 204) return null
  return responseType === 'blob' ? response.blob() : response.json().catch(() => null)
}
