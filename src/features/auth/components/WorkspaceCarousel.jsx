import { useState } from 'react'

const SLIDES = [
  {
    title: 'Espacios del campus',
    description: 'Consulta los espacios de tu institución, su tipo y su ubicación.',
    icon: 'M3 21h18M5 21V5l7-3 7 3v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-3h2v3',
  },
  {
    title: 'Organización del campus',
    description: 'Consulta los bloques y pisos que organizan los espacios universitarios.',
    icon: 'm3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4',
  },
  {
    title: 'Acceso institucional',
    description: 'Ingresa con tu correo institucional y verifica tu cuenta.',
    icon: 'm12 3 8 4v6c0 5-8 8-8 8s-8-3-8-8V7Zm-4 9 3 3 5-6',
  },
]

export default function WorkspaceCarousel() {
  const [current, setCurrent] = useState(0)

  function move(direction) {
    setCurrent((index) => (index + direction + SLIDES.length) % SLIDES.length)
  }

  function handleKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    move(event.key === 'ArrowRight' ? 1 : -1)
  }

  return (
    <section
      className="registration-web__visual workspace-carousel"
      aria-roledescription="carrusel"
      aria-label="Tu espacio de trabajo"
      onKeyDown={handleKeyDown}
    >
      <div className="registration-web__visual-top">
        <span className="registration-web__visual-title">Tu espacio de trabajo</span>
        <span className="workspace-carousel__count" aria-hidden="true">
          {String(current + 1).padStart(2, '0')} / 03
        </span>
      </div>
      <div className="workspace-carousel__content" aria-live="polite" aria-atomic="true">
        {SLIDES.map((slide, index) => (
          <article
            className="workspace-carousel__slide"
            key={slide.title}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${SLIDES.length}`}
            hidden={index !== current}
          >
            <span className="workspace-carousel__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d={slide.icon} />
              </svg>
            </span>
            <h3>{slide.title}</h3>
            <p>{slide.description}</p>
          </article>
        ))}
      </div>
      <div className="workspace-carousel__controls">
        <div className="workspace-carousel__indicators" role="group" aria-label="Seleccionar diapositiva">
          {SLIDES.map((slide, index) => (
            <button
              type="button"
              className="workspace-carousel__indicator"
              key={slide.title}
              aria-label={`Mostrar: ${slide.title}`}
              aria-current={index === current ? 'true' : undefined}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
        <div className="workspace-carousel__arrows">
          <button type="button" aria-label="Diapositiva anterior" onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Diapositiva siguiente" onClick={() => move(1)}>→</button>
        </div>
      </div>
    </section>
  )
}
