import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import { requesterNavigation } from '../features/requester/requesterNavigation'
import { analysisNavigation } from '../features/analysis/analysisNavigation'

export function AppShell({ children }) {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const mobileMenuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const selectedApplication = useSelector((state) => state.auth.selectedApplication)
  const navigation = selectedApplication === 'analysis' ? analysisNavigation : requesterNavigation
  const userInitials = user?.name?.split(' ').map((name) => name[0]).join('').toUpperCase() || 'U'

  const handleLogout = () => {
    setMenuOpen(false)
    dispatch(logout())
    navigate('/login')
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenuOnOutsideClick = (event) => {
      if (!mobileMenuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeMenuOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeMenuOnOutsideClick)
  }, [menuOpen])

  return (
    <div className={`shell${menuOpen ? ' menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">{userInitials}</div>
          <div>
            <div className="name">{user?.name || 'User'}</div>
            <div className="role">Service operations</div>
          </div>
          <div className="mobile-menu-control" ref={mobileMenuRef}>
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="mobile-menu-panel">
              <nav className="nav" aria-label="Requester navigation">
                {navigation.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive && (selectedApplication !== 'analysis' || location.search === new URL(item.to, window.location.origin).search)) ? 'active' : ''}>
                    {item.label === 'Cancellation Requests/Cancelled tickets' ? <span className="analysis-nav-multiline">Cancellation Requests/<br />Cancelled tickets</span> : item.label}
                    {item.label === 'Pending my reply' && <span className="badge">2</span>}
                  </NavLink>
                ))}
              </nav>

              <div className="nav-footer">
                <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
              </div>
            </div>
          </div>
        </div>

        <div className="desktop-navigation">
          <nav className="nav" aria-label="Requester navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive && (selectedApplication !== 'analysis' || location.search === new URL(item.to, window.location.origin).search)) ? 'active' : ''}>
                {item.label === 'Cancellation Requests/Cancelled tickets' ? <span className="analysis-nav-multiline">Cancellation Requests/<br />Cancelled tickets</span> : item.label}
                {item.label === 'Pending my reply' && <span className="badge">2</span>}
              </NavLink>
            ))}
          </nav>

          <div className="nav-footer">
            <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}
