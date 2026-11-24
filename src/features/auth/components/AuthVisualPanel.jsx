import logoUbicate from '../../../assets/logoubicate.png'
import imagenInicio from '../../../assets/imageninicio.webp'
import '../styles/auth-visual.css'

export default function AuthVisualPanel() {
  return (
    <section
      className="auth-visual"
      aria-label="Ubícate, gestión de espacios universitarios"
    >
      <img className="auth-visual__image" src={imagenInicio} alt="" />
      <span className="auth-visual__tint" aria-hidden="true" />
      <div className="auth-visual__brand">
        <img
          className="auth-visual__logo"
          src={logoUbicate}
          alt="Logotipo de Ubícate"
        />
        <span className="auth-visual__divider" aria-hidden="true" />
        <p className="auth-visual__tagline">
          Gestión de espacios universitarios
        </p>
      </div>
    </section>
  )
}
