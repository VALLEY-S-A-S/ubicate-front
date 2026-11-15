import logoUbicate from '../../../assets/logoubicatetrazado.png'
import imagenInicio from '../../../assets/imageninicio.webp'
import '../styles/verification.css'

export default function VerificationLayout({ children, title, subtitle }) {
  return (
    <main className="verification-page">
      <section
        className="verification-visual"
        aria-label="Ubícate, gestión de espacios universitarios"
      >
        <img className="verification-visual__image" src={imagenInicio} alt="" />
        <span className="verification-visual__tint" aria-hidden="true" />
        <div className="verification-visual__brand">
          <img
            className="verification-visual__logo"
            src={logoUbicate}
            alt="Logotipo de Ubícate"
          />
          <p className="verification-visual__name">Ubicate</p>
          <span className="verification-visual__divider" aria-hidden="true" />
          <p className="verification-visual__tagline">
            Gestión de espacios universitarios
          </p>
        </div>
      </section>

      <section className="verification-panel">
        <div className="verification-card" aria-labelledby="verification-title">
          <h2 id="verification-title" tabIndex={-1}>
            {title}
          </h2>
          {subtitle && <p className="verification-subtitle">{subtitle}</p>}
          {children}
        </div>
      </section>
    </main>
  )
}
