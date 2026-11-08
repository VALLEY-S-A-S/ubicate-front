/**
 * Página Dashboard - Layout base del sistema Ubicate.
 * Autora: Lady Johana Vidal Sevillano
 *
 * Estructura del dashboard según DASHBOARD_BASE.md:
 * - Sidebar izquierda con navegación
 * - Barra superior con breadcrumb, notificaciones y usuario
 * - Área de contenido principal
 */

import { useEffect, useRef, useState } from 'react'
import UsuariosPage from '../../usuarios/pages/UsuariosPage'
import BloquesPage from '../../espacios/pages/BloquesPage'
import EspaciosPage from '../../espacios/pages/EspaciosPage'
import GestionEspaciosPage from '../../espacios/pages/GestionEspaciosPage'
import AsignacionesPage from '../../asignaciones/pages/AsignacionesPage'

const DashboardPage = ({ onLogout, onRequestLogout, session, route }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showUserMenu) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUserMenu])

  const handleLogoutClick = () => {
    setShowUserMenu(false)
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = async () => {
    if (loggingOut) return
    setLoggingOut(true); setLogoutError('')
    try { await onRequestLogout(); setShowLogoutDialog(false) }
    catch (error) { setLogoutError(error.message) }
    finally { setLoggingOut(false) }
  }

  const isUsuarios = route === '/dashboard/usuarios'
  const isEspacios = route === '/dashboard/espacios'
  const isBloques = route === '/dashboard/espacios/bloques'
  const isGestionEspacios = route === '/dashboard/espacios/espacios'
  // lady vidal - HU-06: sección de asignaciones con filtros y horario.
  const isAsignaciones = route === '/dashboard/asignaciones'

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        {/* Sidebar izquierda */}
        <aside className="dashboard-sidebar">
          <h2 className="sidebar-header">Menú</h2>
          <nav className="sidebar-nav">
            <a href="#/dashboard/usuarios" className={`sidebar-link${isUsuarios ? ' active' : ''}`}>Importar usuarios</a>
            <a
              href="#/dashboard/espacios"
              className={`sidebar-link${route?.startsWith('/dashboard/espacios') ? ' active' : ''}`}
            >
              Administrar espacios
            </a>
            <a
              href="#/dashboard/asignaciones"
              className={`sidebar-link${isAsignaciones ? ' active' : ''}`}
            >
              Asignaciones
            </a>
          </nav>
        </aside>

        {/* Barra superior y área de contenido */}
        <div className="dashboard-content">
          {/* Barra superior */}
          <header className="dashboard-header">
            <div className="breadcrumb">
              Administración
              {isUsuarios ? <>{' > '}<span>Importar usuarios</span></> : isAsignaciones ? (
                <>
                  {' > '}
                  <span>Asignaciones</span>
                </>
              ) : isBloques ? (
                <>
                  {' > '}
                  Administrar espacios
                  {' > '}
                  <span>Gestionar bloques</span>
                </>
              ) : isGestionEspacios ? (
                <>
                  {' > '}
                  Administrar espacios
                  {' > '}
                  <span>Gestionar espacios</span>
                </>
              ) : isEspacios ? (
                <>
                  {' > '}
                  <span>Administrar espacios</span>
                </>
              ) : null}
            </div>
            <div className="header-actions">
              <div className="user-dropdown" ref={menuRef}>
                <button
                  type="button"
                  className="user-dropdown__trigger"
                  onClick={() => setShowUserMenu((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                >
                  <span className="user-info">
                    {session?.user?.nombre ?? 'Administrador'}
                  </span>
                  <svg
                    className="user-dropdown-arrow"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-menu" role="menu">
                    <button
                      type="button"
                      className="user-menu-item"
                      role="menuitem"
                      onClick={handleLogoutClick}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Área de contenido */}
          <div className="dashboard-main">
            {isUsuarios ? <UsuariosPage token={session?.token} /> : isAsignaciones ? (
              <AsignacionesPage
                token={session?.token}
                sedeId={session?.user?.sedeId}
                onLogout={onLogout}
              />
            ) : isBloques ? (
              <BloquesPage token={session?.token} onLogout={onLogout} />
            ) : isGestionEspacios ? (
              <GestionEspaciosPage
                token={session?.token}
                onLogout={onLogout}
                sedeId={session?.user?.sedeId}
              />
            ) : isEspacios ? (
              <EspaciosPage />
            ) : (
              <section className="module-section">
                <h3>Bienvenido al dashboard</h3>
                <p>Administra los espacios universitarios desde aquí.</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {showLogoutDialog && (
        <div className="logout-dialog" role="presentation">
          <div
            className="logout-dialog-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <p id="logout-dialog-title">¿Deseas cerrar sesión?</p>
            {logoutError && <p role="alert">{logoutError}</p>}
            <div className="logout-dialog-actions">
              <button
                type="button"
                className="logout-dialog-btn logout-dialog-btn-cancel"
                disabled={loggingOut}
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="logout-dialog-btn logout-dialog-btn-confirm"
                disabled={loggingOut}
                onClick={handleLogoutConfirm}
              >
                {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default DashboardPage
