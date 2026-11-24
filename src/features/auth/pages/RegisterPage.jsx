import RegistrationWebLayout from '../components/RegistrationWebLayout'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage({ onRegistered, onClosed }) {
  return (
    <RegistrationWebLayout
      title="Configura el primer administrador"
      subtitle="Este paso está disponible una sola vez por instalación."
    >
      <RegisterForm onRegistered={onRegistered} onClosed={onClosed} />
    </RegistrationWebLayout>
  )
}
