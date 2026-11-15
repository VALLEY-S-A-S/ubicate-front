export const ROLES_REPORTANTE = [
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'LOGISTICA', label: 'Logística' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'ADMIN', label: 'Administrador' },
]

const ETIQUETAS_ROL = {
  ADMIN: 'Administrador',
  ADMINISTRADOR: 'Administrador',
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  TECNICO: 'Técnico',
  LOGISTICA: 'Logística',
  PERSONAL: 'Personal',
}

const ESTILOS_ANOMALIA = [
  { claves: ['electric', 'eléctric', 'luz', 'cable'], color: '#d97706', fondo: '#fef3c7', icono: 'alerta' },
  { claves: ['aseo', 'limpieza', 'suciedad'], color: '#15803d', fondo: '#dcfce7', icono: 'edificio' },
  { claves: ['plomer', 'agua', 'hidr', 'fuga'], color: '#0369a1', fondo: '#e0f2fe', icono: 'alerta' },
  { claves: ['estructural', 'grieta', 'techo', 'pared', 'piso'], color: '#b45309', fondo: '#fef3c7', icono: 'edificio' },
  { claves: ['tecnolog', 'comput', 'proyector', 'equipo', 'red'], color: '#7c3aed', fondo: '#f3e8ff', icono: 'monitor' },
  { claves: ['mobiliario', 'silla', 'mesa', 'pupitre'], color: '#a16207', fondo: '#fef9c3', icono: 'edificio' },
]

export const FILTROS_VACIOS = {
  espacioId: '',
  bloqueId: '',
  pisoId: '',
  desde: '',
  hasta: '',
  tipoAnomaliaId: '',
  estado: '',
  rolReportante: '',
  responsable: '',
}

export function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function etiquetaRol(rol) {
  return ETIQUETAS_ROL[String(rol ?? '').toUpperCase()] ?? rol ?? 'Sin rol'
}

export function estiloAnomalia(nombre) {
  const normalizado = normalizarTexto(nombre)
  const encontrado = ESTILOS_ANOMALIA.find(({ claves }) =>
    claves.some((clave) => normalizado.includes(normalizarTexto(clave))),
  )
  return encontrado ?? { color: '#9f1d20', fondo: '#fef2f2', icono: 'reportes' }
}

export function formatoIdReporte(id) {
  return `REP-${String(id ?? 0).padStart(4, '0')}`
}

export function formatoFecha(valor) {
  if (!valor) return 'Sin fecha'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function formatoFechaCorta(valor) {
  if (!valor) return 'Sin fecha'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function ubicacionReporte(reporte) {
  return [
    reporte?.sedeNombre,
    reporte?.bloqueNombre,
    reporte?.pisoNumero != null ? `Piso ${reporte.pisoNumero}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function claseEstado(estado) {
  return String(estado ?? '').toUpperCase() === 'COMPLETADO' ? 'completado' : 'pendiente'
}

export function etiquetaEstado(estado) {
  return String(estado ?? '').toUpperCase() === 'COMPLETADO' ? 'Completado' : 'Pendiente'
}
