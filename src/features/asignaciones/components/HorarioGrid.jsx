/**
 * lady vidal - HU-06: representación gráfica del horario. Eje vertical para
 * los espacios, eje horizontal para las franjas horarias del día elegido.
 * Las tarjetas asignadas se pueden arrastrar de vuelta al panel izquierdo.
 */
import { colorDocente, formatearHora, ocupacionesDelDia } from '../utils/horario.js'

function metaEspacio(espacio) {
  const partes = []
  if (espacio.bloqueNombre) partes.push(espacio.bloqueNombre)
  if (espacio.pisoNumero != null) partes.push(`Piso ${espacio.pisoNumero}`)
  return partes.length ? partes.join(' · ') : 'Sin ubicación'
}

export default function HorarioGrid({
  horario,
  diaSeleccionado,
  onDiaChange,
  onVerEspacio,
  franjaArrastrada,
  puedeSoltarEn,
  onAsignarFranja,
  onArrastrarAsignacion,
  onDragEnd,
  onEditarAsignacion,
}) {
  const dias = Array.isArray(horario?.dias) ? horario.dias : []
  const franjas = Array.isArray(horario?.franjas) ? horario.franjas : []
  const espacios = Array.isArray(horario?.espacios) ? horario.espacios : []
  const mensaje =
    horario?.mensaje ||
    'No existen espacios que cumplan con los criterios seleccionados.'

  function arrastrarAsignacion(event, evento, espacio) {
    const payload = {
      tipo: 'asignacion',
      evento,
      espacio: { id: espacio.id, nombre: espacio.nombre },
    }
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
    event.dataTransfer.setData('text/plain', JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
    onArrastrarAsignacion?.(evento, espacio)
  }

  return (
    <section className="horario" aria-label="Horario de asignaciones">
      <div className="horario-dias" role="tablist" aria-label="Día de la semana">
        {dias.map((dia) => {
          const activo = dia.diaSemana === diaSeleccionado
          return (
            <button
              key={dia.diaSemana}
              type="button"
              role="tab"
              aria-selected={activo}
              className={`horario-dia${activo ? ' horario-dia--activo' : ''}`}
              onClick={() => onDiaChange?.(dia.diaSemana)}
            >
              {dia.nombre}
            </button>
          )
        })}
      </div>

      {espacios.length === 0 ? (
        <p className="horario-vacio" role="status">
          {mensaje}
        </p>
      ) : (
        <div className="horario-scroll">
          <table className="horario-tabla">
            <thead>
              <tr>
                <th scope="col" className="horario-tabla__espacio">
                  Espacio
                </th>
                {franjas.map((franja, indice) => (
                  <th
                    scope="col"
                    key={`${franja.horaInicio}-${indice}`}
                    className="horario-tabla__hora"
                  >
                    {franja.etiqueta ??
                      `${formatearHora(franja.horaInicio)} - ${formatearHora(franja.horaFin)}`}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {espacios.map((espacio) => {
                const eventos = ocupacionesDelDia(espacio, diaSeleccionado, franjas)
                const celdas = []
                let indice = 0

                while (indice < franjas.length) {
                  const evento = eventos.find(
                    (item) => item.posicion.desde === indice,
                  )

                  if (evento) {
                    celdas.push(
                      <td
                        key={`evento-${evento.id}`}
                        colSpan={evento.posicion.span}
                        className="horario-tabla__evento-celda"
                      >
                        <div className="horario-evento-wrap">
                          <button
                            type="button"
                            className={`horario-evento${
                              evento.origen === 'local' ? ' horario-evento--pendiente' : ''
                            }`}
                            draggable
                            style={{ '--evento-color': colorDocente(evento.docenteNombre) }}
                            onClick={() => onVerEspacio?.(espacio)}
                            onDragStart={(event) => arrastrarAsignacion(event, evento, espacio)}
                            onDragEnd={onDragEnd}
                            title={`${evento.titulo ?? 'Asignación'} · ${
                              evento.docenteNombre ?? 'Sin docente'
                            } · ${formatearHora(evento.horaInicio)} - ${formatearHora(
                              evento.horaFin,
                            )}.${
                              evento.origen === 'local'
                                ? ' Cambio sin guardar: presiona Guardar para aplicarlo.'
                                : ''
                            } Arrastra al panel de franjas para desasignar.`}
                          >
                            <span className="horario-evento__docente">
                              {evento.docenteNombre ?? 'Sin docente'}
                            </span>
                            {evento.titulo && (
                              <span className="horario-evento__titulo">{evento.titulo}</span>
                            )}
                            <span className="horario-evento__hora">
                              {evento.origen === 'local' && (
                                <span
                                  className="horario-evento__pendiente"
                                  title="Cambio sin guardar"
                                >
                                  ●{' '}
                                </span>
                              )}
                              {formatearHora(evento.horaInicio)} -{' '}
                              {formatearHora(evento.horaFin)}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="horario-evento__editar"
                            onClick={(event) => {
                              event.stopPropagation()
                              onEditarAsignacion?.(evento, espacio)
                            }}
                            title="Cambiar este evento de espacio"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    )
                    indice += evento.posicion.span
                  } else {
                    const franjaCelda = franjas[indice]
                    const puedeSoltar = Boolean(
                      franjaArrastrada && puedeSoltarEn?.(espacio, franjaCelda),
                    )

                    celdas.push(
                      <td
                        key={`libre-${espacio.id}-${indice}`}
                        className={`horario-tabla__libre${
                          puedeSoltar ? ' horario-tabla__libre--drop' : ''
                        }`}
                        onDragOver={
                          franjaArrastrada
                            ? (event) => event.preventDefault()
                            : undefined
                        }
                        onDrop={
                          puedeSoltar
                            ? (event) => {
                                event.preventDefault()
                                onAsignarFranja?.(
                                  espacio,
                                  franjaArrastrada,
                                  franjaCelda.horaInicio,
                                )
                              }
                            : undefined
                        }
                      />
                    )
                    indice += 1
                  }
                }

                return (
                  <tr
                    key={espacio.id}
                    className={
                      espacio.estado === 'DESHABILITADO'
                        ? 'horario-tabla__fila--deshabilitada'
                        : undefined
                    }
                  >
                    <th scope="row" className="horario-tabla__espacio">
                      <button
                        type="button"
                        className="horario-espacio"
                        onClick={() => onVerEspacio?.(espacio)}
                        title={`Ver información de ${espacio.nombre}`}
                      >
                        <span className="horario-espacio__nombre">{espacio.nombre}</span>
                        <span className="horario-espacio__meta">{metaEspacio(espacio)}</span>
                        {espacio.estado === 'DESHABILITADO' && (
                          <span className="horario-espacio__estado">Deshabilitado</span>
                        )}
                      </button>
                    </th>
                    {celdas}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
