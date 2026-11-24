import AuthVisualPanel from './AuthVisualPanel'
import '../styles/registration-web.css'

export default function RegistrationWebLayout({ title, subtitle, children }) {
  return (
    <main className="registration-web">
      <AuthVisualPanel />
      <section className="registration-web__panel">
        <div className="registration-web__card" aria-labelledby="form-title">
          <h2 id="form-title" tabIndex={-1}>{title}</h2>
          <p className="registration-web__intro">{subtitle}</p>
          {children}
          <p className="registration-web__login">
            ¿Ya tienes acceso? <a href="#/login">Inicia sesión</a>
          </p>
        </div>
      </section>
    </main>
  )
}
