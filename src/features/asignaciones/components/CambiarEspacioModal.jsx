import { useEffect, useMemo, useState } from 'react'
import { colorDocente, formatearHora, nombreDia } from '../utils/horario.js'

function metaEspacio(espacio) {
  const partes = []
  if (espacio.tipoEspacioNombre) partes.push(espacio.tipoEspacioNombre)
  if (espacio.bloqueNombre) partes.push(espacio.bloqueNombre)
  if (espacio.pisoNumero != null) partes.push(`Piso ${espacio.pisoNumero}`)
  return partes.join(' · ') || 'Sin ubicación'
}

export default function CambiarEspacioModal({
  asignacion,
  espacios = [],
  dias = [],
  onConfirm,
  onClose,
}) {
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return espacios

    return espacios.filter((espacio) =>
      [
        espacio.nombre,
        espacio.codigo,
        espacio.bloqueNombre,
        espacio.tipoEspacioNombre,
        espacio.pisoNumero != null ? `piso ${espacio.pisoNumero}` : '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto),
    )
  }, [espacios, busqueda])

  if (!asignacion) return null

  const { espacio: espacioActual, ocupacion } = asignacion

  return (
    <div
      className="horario-detalle"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className="horario-detalle__contenido cambiar-espacio"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambiar-espacio-titulo"
      >
        <header className="horario-detalle__cabecera">
          <div>
            <p className="horario-detalle__codigo">Editar asignación</p>
            <h3 id="cambiar-espacio-titulo">Cambiar espacio</h3>
          </div>
          <button
            type="button"
            className="horario-detalle__cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div
          className="cambiar-espacio__resumen"
          style={{ '--evento-color': colorDocente(ocupacion?.docenteNombre) }}
        >
          <span className="cambiar-espacio__docente">
            {ocupacion?.docenteNombre ?? 'Sin docente'}
          </span>
          <span className="cambiar-espacio__materia">
            {ocupacion?.titulo ?? 'Asignación'}
            {ocupacion?.grupoCodigo ? ` · ${ocupacion.grupoCodigo}` : ''}
          </span>
          {ocupacion?.programaNombre && (
            <span className="cambiar-espacio__meta">{ocupacion.programaNombre}</span>
          )}
          <span className="cambiar-espacio__meta">
            {nombreDia(ocupacion?.diaSemana, dias)} ·{' '}
            {formatearHora(ocupacion?.horaInicio)} - {formatearHora(ocupacion?.horaFin)}
          </span>
          <span className="cambiar-espacio__actual">
            Espacio actual: <strong>{espacioActual?.nombre ?? 'Sin espacio'}</strong>
          </span>
        </div>

        <label className="cambiar-espacio__campo">
          <span>Buscar espacio disponible</span>
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Nombre, código, bloque o piso…"
            aria-label="Buscar espacio disponible"
          />
        </label>

        {filtrados.length === 0 ? (
          <p className="cambiar-espacio__vacio" role="status">
            {espacios.length === 0
              ? 'No hay espacios disponibles para este día y horario.'
              : 'Ningún espacio coincide con la búsqueda.'}
          </p>
        ) : (
          <ul className="cambiar-espacio__lista">
            {filtrados.map((espacio) => (
              <li key={espacio.id}>
                <button
                  type="button"
                  className="cambiar-espacio__opcion"
                  onClick={() => onConfirm?.(espacio)}
                >
                  <span className="cambiar-espacio__opcion-nombre">
                    {espacio.nombre}
                  </span>
                  <span className="cambiar-espacio__opcion-meta">
                    {metaEspacio(espacio)}
                    {espacio.codigo ? ` · ${espacio.codigo}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="horario-detalle__acciones">
          <button type="button" className="horario-detalle__boton" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
