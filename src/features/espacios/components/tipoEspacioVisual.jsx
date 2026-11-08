// Color e icono por tipo de espacio, consistentes en lista y detalle.

const PALETA = [
  { bg: '#fde8e8', fg: '#c62828' }, // rojo
  { bg: '#e3f0fd', fg: '#1565c0' }, // azul
  { bg: '#f1e8fd', fg: '#7c3aed' }, // morado
  { bg: '#e6f6ec', fg: '#1e8e4e' }, // verde
  { bg: '#fdf3e0', fg: '#b7791f' }, // ámbar
  { bg: '#e0f5f3', fg: '#0f766e' }, // teal
  { bg: '#fdeadf', fg: '#c2410c' }, // naranja
]

const GRIS = { bg: '#f3f4f6', fg: '#6b7280' }

export function tipoColor(tipoEspacioId, deshabilitado = false) {
  if (deshabilitado) return GRIS
  if (tipoEspacioId == null) return PALETA[0]
  return PALETA[Math.abs(Number(tipoEspacioId)) % PALETA.length]
}

function claveIcono(nombre) {
  const n = (nombre ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (n.includes('sistema') || n.includes('computo') || n.includes('informatic')) return 'monitor'
  if (n.includes('cancha') || n.includes('deportiv') || n.includes('gimnasio')) return 'deporte'
  if (n.includes('biblioteca')) return 'libro'
  if (n.includes('laboratorio')) return 'lab'
  if (n.includes('auditorio') || n.includes('multicultural') || n.includes('multiple')) return 'personas'
  if (n.includes('salon') || n.includes('aula') || n.includes('clase')) return 'pizarra'
  return 'edificio'
}

const PATHS = {
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  deporte: <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />,
  libro: (
    <>
      <path d="M12 7C10 5 6 5 4 6v13c2-1 6-1 8 1 2-2 6-2 8-1V6c-2-1-6-1-8 1z" />
      <path d="M12 7v13" />
    </>
  ),
  lab: <path d="M9 3h6M10 3v6l-5 9a1 1 0 0 0 1 1.5h12a1 1 0 0 0 1-1.5l-5-9V3" />,
  personas: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="17" cy="10" r="2" />
      <path d="M2 19a6 6 0 0 1 12 0M14 19a5 5 0 0 1 8 0" />
    </>
  ),
  pizarra: (
    <>
      <rect x="4" y="4" width="16" height="11" rx="1" />
      <polyline points="8 11 11 8 13 10 16 6" />
      <path d="M12 15v4M9 19h6" />
    </>
  ),
  edificio: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M5 9h14M5 13h14M5 17h14M10 3v18M15 3v18" />
    </>
  ),
}

export function TipoEspacioIcon({ nombre, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[claveIcono(nombre)]}
    </svg>
  )
}
