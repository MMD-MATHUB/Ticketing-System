import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import { requesterNavigation } from '../features/requester/requesterNavigation'

export function AppShell({ children }) {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const userInitials = user?.name?.split(' ').map((name) => name[0]).join('').toUpperCase() || 'U'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className={`shell${menuOpen ? ' menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="avatar">{userInitials}</div>
          <div>
            <div className="name">{user?.name || 'User'}</div>
            <div className="role">Service operations</div>
          </div>
          <div className="mobile-menu-control">
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
                {requesterNavigation.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                    {item.label}
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
            {requesterNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
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
