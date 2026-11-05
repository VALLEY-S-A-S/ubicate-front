import WorkspaceCarousel from './WorkspaceCarousel'
import '../styles/registration-web.css'

export default function RegistrationWebLayout({ title, subtitle, children }) {
  return (
    <div className="registration-web">
      <header className="registration-web__header">
        <div>
          <div className="registration-web__brand"><svg viewBox="0 0 32 38" fill="none" aria-hidden="true"><path d="M16 35S3 23 3 15a13 13 0 0 1 26 0c0 8-13 20-13 20Z" stroke="currentColor" strokeWidth="2.7"/><circle cx="16" cy="15" r="4.5" stroke="currentColor" strokeWidth="2.7"/></svg>Ubícate</div>
          <div className="registration-web__portal"><span aria-hidden="true"></span><span>Portal administrativo</span></div>
        </div>
      </header>
      <main>
        <div className="registration-web__card">
          <aside className="registration-web__identity" aria-labelledby="identity-title">
            <p className="registration-web__eyebrow">Administración institucional</p>
            <h1 id="identity-title">La gestión de tu<br /> campus empieza<br /> aquí.</h1>
            <p className="registration-web__description">Un espacio para administrar los espacios y servicios de tu institución, con todo en su lugar.</p>
            <WorkspaceCarousel />
          </aside>
          <section className="registration-web__form-panel" aria-labelledby="form-title">
            <h2 id="form-title" tabIndex={-1}>{title}</h2>
            <p className="registration-web__intro">{subtitle}</p>
            {children}
            <p className="registration-web__login">
              ¿Ya tienes acceso? <a href="#/login">Inicia sesión</a>
            </p>
          </section>
        </div>
        <footer>Ubícate · Portal de administración institucional</footer>
      </main>
    </div>
  )
}
