import IconTile from './IconTile'
import { BloquesIcono, BLOQUES_ICONOS, BLOQUE_ICONO_ETIQUETAS, iconoBloque } from './bloquesVisual'

// Pisos configurados del bloque. El conteo por piso sale de los espacios
// reales; si aún no se pudo cargar no se inventa el número.
function pisosDelBloque(bloque, resumen) {
  const configurados = Number(bloque?.pisos) || 0
  const numeros = new Set()
  for (let numero = 1; numero <= configurados; numero += 1) numeros.add(numero)
  Object.keys(resumen?.porPiso ?? {}).forEach((clave) => {
    const numero = Number(clave)
    if (Number.isInteger(numero) && numero >= 1) numeros.add(numero)
  })
  return [...numeros].sort((a, b) => a - b)
}

export default function BloqueDetalle({ bloque, resumen, vacio, onEdit, iconos = {}, onCambiarIcono }) {
  if (!bloque) {
    return <p className="bloques-layout__vacio">{vacio}</p>
  }

  const hayConteos = Boolean(resumen && resumen.total != null)
  const pisos = pisosDelBloque(bloque, resumen)
  const icono = iconoBloque(iconos[bloque.id])

  return (
    <div className="bloque-detalle">
      <header className="bloque-detalle__cabecera">
        <IconTile size="grande">
          <BloquesIcono nombre={icono} />
        </IconTile>
        <div className="bloque-detalle__titular">
          <p className="bloque-detalle__eyebrow">Bloque</p>
          <h3>{bloque.nombre}</h3>
        </div>
        <button
          type="button"
          className="bloques-edit"
          onClick={() => onEdit?.(bloque)}
        >
          <BloquesIcono nombre="lapiz" />
          Editar bloque
        </button>
      </header>

      <div className="bloque-iconos">
        <span className="bloque-iconos__label" id="bloque-iconos-label">Ícono</span>
        <div
          className="bloque-iconos__opciones"
          role="group"
          aria-labelledby="bloque-iconos-label"
        >
          {BLOQUES_ICONOS.map((clave) => {
            const activo = clave === icono
            return (
              <button
                type="button"
                key={clave}
                className={`selector-icono${activo ? ' selector-icono--sel' : ''}`}
                aria-label={BLOQUE_ICONO_ETIQUETAS[clave]}
                aria-pressed={activo}
                onClick={() => onCambiarIcono?.(bloque.id, clave)}
              >
                <BloquesIcono nombre={clave} />
              </button>
            )
          })}
        </div>
      </div>

      <dl className="bloque-detalle__metricas">
        <div className="bloque-metrica">
          <dt>
            <IconTile size="pequeno">
              <BloquesIcono nombre="capas" />
            </IconTile>
            Pisos
          </dt>
          <dd>{bloque.pisos ?? 0}</dd>
        </div>
        <div className="bloque-metrica">
          <dt>
            <IconTile size="pequeno">
              <BloquesIcono nombre="puerta" />
            </IconTile>
            Espacios
          </dt>
          <dd>{hayConteos ? resumen.total : '—'}</dd>
        </div>
      </dl>

      <section className="bloque-pisos">
        <h4>Pisos del bloque</h4>
        {pisos.length === 0 ? (
          <p className="bloques-layout__vacio">Este bloque aún no tiene pisos.</p>
        ) : (
          <ul>
            {pisos.map((numero) => {
              const conteo = resumen?.porPiso?.[numero]
              return (
                <li key={numero} className="bloque-piso">
                  <IconTile size="pequeno">
                    <BloquesIcono nombre="capas" />
                  </IconTile>
                  <span className="bloque-piso__nombre">Piso {numero}</span>
                  <span className="bloque-piso__meta">
                    {hayConteos
                      ? `${conteo ?? 0} ${(conteo ?? 0) === 1 ? 'espacio' : 'espacios'}`
                      : '—'}
                  </span>
                  <span className="bloques-list__chevron">
                    <BloquesIcono nombre="chevronDerecha" />
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
