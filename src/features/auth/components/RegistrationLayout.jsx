import logoUbicate from '../../../assets/logo-ubicate-registration.svg'
import '../styles/registration.css'

export default function RegistrationLayout({ children, title, subtitle }) {
  return (
    <main className="registration-page">
      <div className="registration-shell">
        <header className="registration-brand">
          <span className="registration-brand__mark">
            <img src={logoUbicate} width="76" height="76" alt="" />
          </span>
          <h1>Ubícate</h1>
        </header>
        <section
          className="registration-card"
          aria-labelledby="registration-title"
        >
          <h2 id="registration-title" tabIndex={-1}>
            {title}
          </h2>
          {subtitle && <p className="registration-subtitle">{subtitle}</p>}
          {children}
        </section>
      </div>
    </main>
  )
}
