/**
 * Servicio de autenticación.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Expone el login contra POST /api/auth/login y valida que el rol pertenezca
 * al personal administrativo, ya que la web no está pensada para otros roles.
 */

import { apiRequest } from '../../../shared/api/client'

// Se aceptan variantes del rol por si el backend usa ADMIN, ADMINISTRADOR o ROLE_ADMIN.
const ADMIN_ROLES = new Set(['ADMIN', 'ADMINISTRADOR', 'ROLE_ADMIN'])

export function login({ correoInstitucional, contrasenia }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { correoInstitucional, contrasenia },
  })
}

export function isAdminRole(rol) {
  return ADMIN_ROLES.has(String(rol ?? '').trim().toUpperCase())
}
