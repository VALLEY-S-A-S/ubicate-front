import RegistrationLayout from '../components/RegistrationLayout'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage({ onRegistered }) {
  return (
    <RegistrationLayout
      title="Crear cuenta"
      subtitle="Regístrate con tu correo institucional"
    >
      <RegisterForm onRegistered={onRegistered} />
      <a className="registration-link" href="#/login">
        ¿Ya tienes cuenta? Inicia sesión
      </a>
      <p className="registration-note">
        <span aria-hidden="true">ⓘ</span> Solo se permiten cuentas
        institucionales
      </p>
    </RegistrationLayout>
  )
}
