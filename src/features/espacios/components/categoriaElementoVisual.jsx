// Registro de colores e iconos del catálogo. El color/icono se guardan en BD
// como tokens (p. ej. "azul", "monitor"); aquí se mapean a estilos y SVG.

export const COLORES = {
  azul: { bg: '#e3f0fd', fg: '#1565c0' },
  morado: { bg: '#f1e8fd', fg: '#7c3aed' },
  ambar: { bg: '#fdf3e0', fg: '#b7791f' },
  teal: { bg: '#e0f5f3', fg: '#0f766e' },
  verde: { bg: '#e6f6ec', fg: '#1e8e4e' },
  indigo: { bg: '#e8eafd', fg: '#4f46e5' },
  naranja: { bg: '#fdeadf', fg: '#c2410c' },
  rojo: { bg: '#fde8e8', fg: '#c62828' },
  rosa: { bg: '#fde8f1', fg: '#be185d' },
  gris: { bg: '#f3f4f6', fg: '#6b7280' },
}

export const COLORES_DISPONIBLES = Object.keys(COLORES)

export function colorPorToken(token) {
  return COLORES[token] ?? COLORES.gris
}

const ICONOS_PATHS = {
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  teclado: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </>
  ),
  mouse: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 7v4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3z" />
    </>
  ),
  cable: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  silla: (
    <>
      <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <path d="M5 9h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M7 16v4M17 16v4" />
    </>
  ),
  mesa: <path d="M3 10h18M5 10l1-4h12l1 4M7 10v10M17 10v10" />,
  red: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.5 6h7M7.5 8l3.5 8M16.5 8L13 16" />
    </>
  ),
  balon: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </>
  ),
  libro: (
    <>
      <path d="M12 7C10 5 6 5 4 6v13c2-1 6-1 8 1 2-2 6-2 8-1V6c-2-1-6-1-8 1z" />
      <path d="M12 7v13" />
    </>
  ),
  lab: <path d="M9 3h6M10 3v6l-5 9a1 1 0 0 0 1 1.5h12a1 1 0 0 0 1-1.5l-5-9V3" />,
  impresora: (
    <>
      <path d="M6 9V4h12v5" />
      <rect x="3" y="9" width="18" height="7" rx="1" />
      <path d="M7 16h10v4H7z" />
    </>
  ),
  camara: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="12" cy="13" r="3" />
      <path d="M8 7l1.5-2h5L16 7" />
    </>
  ),
  herramienta: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z" />
  ),
  caja: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16" />
    </>
  ),
}

export const ICONOS_DISPONIBLES = Object.keys(ICONOS_PATHS)

export function CategoriaIcon({ icono }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS_PATHS[icono] ?? ICONOS_PATHS.caja}
    </svg>
  )
}

export function CategoriaBadge({ nombre, color, icono }) {
  const c = colorPorToken(color)
  return (
    <span className="inventario__cat" style={{ color: c.fg, background: c.bg }}>
      <CategoriaIcon icono={icono} />
      {nombre}
    </span>
  )
}
