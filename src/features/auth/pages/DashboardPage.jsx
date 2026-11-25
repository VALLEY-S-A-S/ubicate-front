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
import ImportarHorariosPage from '../../franjas/pages/ImportarHorariosPage'
import EspaciosPage from '../../espacios/pages/EspaciosPage'
import AsignacionesPage from '../../asignaciones/pages/AsignacionesPage'
import CatalogoPage from '../../espacios/pages/CatalogoPage'
import ReportesPage from '../../reportes/pages/ReportesPage.jsx'
import AuditoriaPage from '../../auditoria/pages/AuditoriaPage'
import PerfilModal from '../components/PerfilModal'

const DashboardPage = ({ onLogout, onRequestLogout, session, route }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPerfil, setShowPerfil] = useState(false)
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
  const isHorarios = route === '/dashboard/horarios'
  const isEspacios = route === '/dashboard/espacios'
  const isBloques = route === '/dashboard/espacios/bloques'
  const isGestionEspacios = route === '/dashboard/espacios/espacios'
  // El módulo de espacios agrupa bloques y espacios en una sola vista con pestañas.
  const isModuloEspacios = isEspacios || isBloques || isGestionEspacios
  // lady vidal - HU-06: sección de asignaciones con filtros y horario.
  const isAsignaciones = route === '/dashboard/asignaciones'
  const isCatalogo = route === '/dashboard/catalogo'
  const isReportes = route === '/dashboard/reportes'
  const isAuditoria = route === '/dashboard/auditoria'

  // Iniciales del avatar: nombre, o correo como respaldo.
  const inicialesUsuario = (() => {
    const fuentes = [session?.user?.nombre, session?.user?.correoInstitucional].filter(Boolean)
    for (const fuente of fuentes) {
      const partes = fuente
        .split('@')[0]
        .split(/[\s._-]+/)
        .map((parte) => parte.trim())
        .filter(Boolean)
      if (!partes.length) continue
      const letras = partes.length > 1
        ? partes.slice(0, 2).map((parte) => parte[0])
        : [partes[0][0], partes[0][1]].filter(Boolean)
      if (letras.length) return letras.join('').toUpperCase()
    }
    return 'AD'
  })()

  const iconUsuarios = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )
  const iconHorarios = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  )
  const iconEspacios = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )
  const iconAsignaciones = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="M9 14l2 2 4-4"/></svg>
  )
  const iconCatalogo = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  )
  const iconReportes = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V9M18 17v-8"/></svg>
  )
  const iconAuditoria = (
    <svg className="sidebar-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.5-6.36L3 8"/><path d="M12 7v5l3 2"/></svg>
  )

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        {/* Sidebar izquierda */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <img src="/logo.png" alt="Ubícate" className="sidebar-logo" />
          </div>
          <nav className="sidebar-nav">
            <a
              href="#/dashboard/asignaciones"
              className={`sidebar-link${isAsignaciones ? ' active' : ''}`}
            >
              {iconAsignaciones}Asignaciones
            </a>
            <a href="#/dashboard/usuarios" className={`sidebar-link${isUsuarios ? ' active' : ''}`}>{iconUsuarios}Importar usuarios</a>
            <a href="#/dashboard/horarios" className={`sidebar-link${isHorarios ? ' active' : ''}`}>{iconHorarios}Importar horarios</a>
            <a
              href="#/dashboard/espacios"
              className={`sidebar-link${isModuloEspacios ? ' active' : ''}`}
            >
              {iconEspacios}Administrar espacios
            </a>
            <a
              href="#/dashboard/catalogo"
              className={`sidebar-link${isCatalogo ? ' active' : ''}`}
            >
              {iconCatalogo}Catálogo
            </a>
            <a
              href="#/dashboard/reportes"
              className={`sidebar-link${isReportes ? ' active' : ''}`}
            >
              {iconReportes}Reportes
            </a>
            <a
              href="#/dashboard/auditoria"
              className={`sidebar-link${isAuditoria ? ' active' : ''}`}
            >
              {iconAuditoria}Auditoría
            </a>
          </nav>
        </aside>

        {/* Barra superior y área de contenido */}
        <div className="dashboard-content">
          {/* Barra superior */}
          <header className="dashboard-header">
            <div className="breadcrumb">
              Administración
              {isUsuarios ? <>{' > '}<span>Importar usuarios</span></> : isHorarios ? (
                <>
                  {' > '}
                  <span>Importar horarios</span>
                </>
              ) : isAsignaciones ? (
                <>
                  {' > '}
                  <span>Asignaciones</span>
                </>
              ) : isCatalogo ? <>{' > '}<span>Catálogo</span></> : isReportes ? (
                <>
                  {' > '}
                  <span>Reportes</span>
                </>
              ) : isAuditoria ? (
                <>
                  {' > '}
                  <span>Auditoría</span>
                </>
              ) : isBloques ? (
                <>
                  {' > '}
                  Administrar espacios
                  {' > '}
                  <span>Bloques</span>
                </>
              ) : isGestionEspacios ? (
                <>
                  {' > '}
                  Administrar espacios
                  {' > '}
                  <span>Espacios</span>
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
                  <span className="user-avatar" aria-hidden="true">
                    {inicialesUsuario}
                  </span>
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
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowPerfil(true)
                      }}
                    >
                      Mi perfil
                    </button>
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
            {isUsuarios ? (
              <UsuariosPage token={session?.token} />
            ) : isHorarios ? (
              <ImportarHorariosPage token={session?.token} onLogout={onLogout} />
            ) : isAsignaciones ? (
              <AsignacionesPage
                token={session?.token}
                sedeId={session?.user?.sedeId}
                onLogout={onLogout}
              />
            ) : isCatalogo ? (
              <CatalogoPage token={session?.token} />
            ) : isReportes ? (
              <ReportesPage token={session?.token} sedeId={session?.user?.sedeId} rol={session?.user?.rol} />
            ) : isAuditoria ? (
              <AuditoriaPage token={session?.token} />
            ) : isModuloEspacios ? (
              <EspaciosPage
                token={session?.token}
                onLogout={onLogout}
                sedeId={session?.user?.sedeId}
                route={route}
              />
            ) : (
              <section className="module-section">
                <h3>Bienvenido al dashboard</h3>
                <p>Administra los espacios universitarios desde aquí.</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {showPerfil && (
        <PerfilModal usuario={session?.user} onCerrar={() => setShowPerfil(false)} />
      )}

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
