export function parseRoute(hash = '') {
  const value = hash.replace(/^#/, '')
  const [path, query = ''] = value.split('?')
  const known = new Set(['/login', '/registro', '/verificar-correo', '/activar-cuenta'])
  const route = known.has(path) || isDashboardRoute(path) ? path : '/login'
  const params = new URLSearchParams(query)
  const tokens = params.getAll('token')
  return { path: route, token: route === '/activar-cuenta' && tokens.length === 1 && /^[0-9a-f]{64}$/.test(tokens[0]) ? tokens[0] : null }
}
export function isDashboardRoute(path = '') { return path === '/dashboard' || path.startsWith('/dashboard/') }
