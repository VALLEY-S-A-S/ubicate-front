// Cuadrado redondeado con fondo tinte y icono de línea centrado.
// Es el patrón repetido en cabeceras, ítems de lista y filas de pisos.
export default function IconTile({ size = 'medio', className = '', children }) {
  const clases = ['icon-tile', `icon-tile--${size}`, className].filter(Boolean).join(' ')
  return (
    <span className={clases} aria-hidden="true">
      {children}
    </span>
  )
}
