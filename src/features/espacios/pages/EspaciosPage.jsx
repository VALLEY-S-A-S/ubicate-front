import GestionEspaciosPage from './GestionEspaciosPage'
import BloquesPage from './BloquesPage'
import '../styles/espacios.css'

const PESTANAS = [
  { id: 'espacios', label: 'Espacios', href: '#/dashboard/espacios' },
  { id: 'bloques', label: 'Bloques', href: '#/dashboard/espacios/bloques' },
]

export default function EspaciosPage({ token, onLogout, sedeId, route }) {
  const pestanaActiva = route === '/dashboard/espacios/bloques' ? 'bloques' : 'espacios'

  return (
    <section className="espacios-page" aria-labelledby="espacios-title">
      <header className="espacios-page__cabecera">
        <p className="page-eyebrow">Infraestructura</p>
        <h2 id="espacios-title">Administrar espacios</h2>
        <p className="espacios-page__subtitulo">
          Administra los bloques del campus y consulta, filtra y mantén cada espacio de la sede.
        </p>
      </header>

      <nav className="espacios-tabs" aria-label="Secciones de administrar espacios">
        {PESTANAS.map((pestana) => {
          const activa = pestana.id === pestanaActiva
          return (
            <a
              key={pestana.id}
              href={pestana.href}
              className={`espacios-tab${activa ? ' espacios-tab--active' : ''}`}
              aria-current={activa ? 'page' : undefined}
            >
              {pestana.label}
            </a>
          )
        })}
      </nav>

      <div className="espacios-tabs__contenido">
        {pestanaActiva === 'bloques' ? (
          <BloquesPage token={token} onLogout={onLogout} />
        ) : (
          <GestionEspaciosPage token={token} onLogout={onLogout} sedeId={sedeId} />
        )}
      </div>
    </section>
  )
}
