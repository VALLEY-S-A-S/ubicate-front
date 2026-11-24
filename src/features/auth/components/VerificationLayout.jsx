import AuthVisualPanel from './AuthVisualPanel'
import '../styles/verification.css'

export default function VerificationLayout({ children, title, subtitle }) {
  return (
    <main className="verification-page">
      <AuthVisualPanel />

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
