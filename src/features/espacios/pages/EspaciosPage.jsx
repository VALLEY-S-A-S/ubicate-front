import '../styles/espacios.css'

export default function EspaciosPage() {
  return (
    <section className="espacios-page">
      <h2 className="espacios-page__title">Administrar espacios</h2>
      <p className="espacios-page__subtitle">Elige qué quieres gestionar</p>

      <div className="espacios-options">
        <a href="#/dashboard/espacios/bloques" className="espacios-option">
          <span className="espacios-option__title">Gestionar bloques</span>
          <span className="espacios-option__desc">
            Edificios y su cantidad de pisos
          </span>
        </a>

        <a href="#/dashboard/espacios/espacios" className="espacios-option">
          <span className="espacios-option__title">Gestionar espacios</span>
          <span className="espacios-option__desc">
            Crear, editar y administrar espacios
          </span>
        </a>
      </div>
    </section>
  )
}
