import RegistrationWebLayout from '../components/RegistrationWebLayout'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage({ onRegistered }) {
  return (
    <RegistrationWebLayout
      title="Configura tu acceso"
      subtitle="Completa tus datos para crear tu cuenta"
    >
      <RegisterForm onRegistered={onRegistered} />
    </RegistrationWebLayout>
  )
}
