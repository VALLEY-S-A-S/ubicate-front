// Catálogo de iconos de línea para la pestaña Bloques.
// Reutiliza los trazados de tipoEspacioVisual (edificio) y
// categoriaElementoVisual (balón) y añade los que faltan, con el
// mismo estilo: viewBox 24, currentColor y extremos redondeados.
const PATHS = {
  capas: (
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0l8.57-3.9a1 1 0 0 0 0-1.83z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </>
  ),
  edificio: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M5 9h14M5 13h14M5 17h14M10 3v18M15 3v18" />
    </>
  ),
  balon: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </>
  ),
  zona: (
    <>
      <path d="M12 3 7 10h3l-4 6h12l-4-6h3z" />
      <path d="M12 16v5" />
      <path d="M7 21h10" />
    </>
  ),
  puerta: (
    <>
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56Z" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
  lapiz: <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  chevronDerecha: <path d="m9 18 6-6-6-6" />,
  chevronAbajo: <path d="m6 9 6 6 6-6" />,
}

// El icono no se guarda en el backend: todo bloque empieza en "edificio"
// y la elección manual vive en memoria (BloquesPage) mientras la sesión dure.
export const BLOQUES_ICONOS = ['edificio', 'balon', 'zona']

export const BLOQUE_ICONO_ETIQUETAS = {
  edificio: 'Edificio',
  balon: 'Balón',
  zona: 'Árbol',
}

export function iconoBloque(override) {
  return BLOQUES_ICONOS.includes(override) ? override : 'edificio'
}

export function BloquesIcono({ nombre, className, strokeWidth = 1.75 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[nombre] ?? PATHS.edificio}
    </svg>
  )
}
