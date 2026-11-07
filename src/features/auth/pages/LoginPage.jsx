/**
 * Pantalla de inicio de sesión.
 * Autor: Lady Johana Vidal Sevillano
 *
 * Compone la marca, la tarjeta del formulario y la nota de cuentas
 * institucionales siguiendo el prototipo visual.
 */

import logoUbicate from '../../../assets/logo-ubicate.svg'
import LoginForm from '../components/LoginForm'
import '../styles/auth.css'

function InfoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function LoginPage({ onSuccess, onVerificationRequired, notice, setup, onRetrySetup }) {
  return (
    <main className="login-page">
      <div className="login-page__content">
        <header className="login-brand">
          <img
            src={logoUbicate}
            className="login-brand__logo"
            width="78"
            height="78"
            alt="Logo de Ubícate"
          />
          <h1 className="login-brand__name">Ubícate</h1>
        </header>

        <section className="login-card" aria-labelledby="login-title">
          <h2 id="login-title" className="login-card__title" tabIndex={-1}>
            Bienvenido
          </h2>
          <p className="login-card__subtitle">
            Inicia sesión con tu correo institucional
          </p>

          {notice && <p role="status" className="login-card__subtitle">{notice}</p>}
          <LoginForm
            onSuccess={onSuccess}
            onVerificationRequired={onVerificationRequired}
          />

          {setup?.state === 'ready' && setup.requiresSetup && <a className="login-register-link" href="#/registro">Configurar primer administrador</a>}
          {setup?.state === 'loading' && <p className="login-card__note" role="status">Comprobando configuración inicial…</p>}
          {setup?.state === 'error' && <p className="login-card__note">No se pudo comprobar la configuración. <button type="button" onClick={onRetrySetup}>Reintentar</button></p>}
          {setup?.state === 'ready' && !setup.requiresSetup && <p className="login-card__note">Las cuentas nuevas las crea el administrador de tu institución.</p>}
          <a className="login-register-link" href="#/verificar-correo">¿Necesitas un enlace de activación?</a>

          <p className="login-card__note">
            <InfoIcon />
            <span>Solo se permiten cuentas institucionales</span>
          </p>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
