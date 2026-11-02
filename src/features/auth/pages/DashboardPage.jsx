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

const DashboardPage = ({ onLogout, session }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
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

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false)
    onLogout?.()
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        {/* Sidebar izquierda */}
        <aside className="dashboard-sidebar">
          <h2 className="sidebar-header">Menú</h2>
          <nav className="sidebar-nav">
            <a href="#/dashboard/espacios" className="sidebar-link">
              Administrar espacios
            </a>
          </nav>
        </aside>

        {/* Barra superior y área de contenido */}
        <div className="dashboard-content">
          {/* Barra superior */}
          <header className="dashboard-header">
            <div className="breadcrumb">
              Administración {'>'} Espacios
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
            <section className="module-section">
              <h3>Bienvenido al dashboard</h3>
              <p>Administra los espacios universitarios desde aquí.</p>
            </section>
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
            <div className="logout-dialog-actions">
              <button
                type="button"
                className="logout-dialog-btn logout-dialog-btn-cancel"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="logout-dialog-btn logout-dialog-btn-confirm"
                onClick={handleLogoutConfirm}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default DashboardPage
