import AuthVisualPanel from './AuthVisualPanel'
import '../styles/registration.css'

export default function RegistrationLayout({ children, title, subtitle }) {
  return (
    <main className="registration-page">
      <AuthVisualPanel />
      <section className="registration-panel">
        <div className="registration-card" aria-labelledby="registration-title">
          <h2 id="registration-title" tabIndex={-1}>
            {title}
          </h2>
          {subtitle && <p className="registration-subtitle">{subtitle}</p>}
          {children}
        </div>
      </section>
    </main>
  )
}
