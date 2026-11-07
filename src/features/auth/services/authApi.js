import { apiRequest } from '../../../shared/api/client.js'

const ADMIN_ROLES = new Set(['ADMIN', 'ADMINISTRADOR', 'ROLE_ADMIN'])
export function isAdminRole(rol) { return ADMIN_ROLES.has(String(rol ?? '').trim().toUpperCase()) }
export function login({ correoInstitucional, contrasenia }) {
  return apiRequest('/api/auth/login', { method: 'POST', body: { correoInstitucional, contrasenia } })
}
export function bootstrapStatus(signal) { return apiRequest('/api/auth/bootstrap-status', { signal }) }
export function me(token, signal) { return apiRequest('/api/auth/me', { token, signal }) }
export function logout(token, correoInstitucional) {
  return apiRequest('/api/auth/logout', { method: 'POST', token, body: { correoInstitucional } })
}
export function register({ nombre, correoInstitucional, contrasenia }, bootstrapKey) {
  return apiRequest('/api/auth/register', { method: 'POST', headers: { 'X-Bootstrap-Key': bootstrapKey }, body: { nombre, correoInstitucional, contrasenia } })
}
export function activationInfo(token, signal) {
  return apiRequest('/api/auth/activation-info', { method: 'POST', body: { token }, signal })
}
export function activate(token, contrasenia) {
  return apiRequest('/api/auth/activate', { method: 'POST', body: { token, contrasenia } })
}
export function resendVerification(correoInstitucional) {
  return apiRequest('/api/auth/resend-verification', { method: 'POST', body: { correoInstitucional } })
}
