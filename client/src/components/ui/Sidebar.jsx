import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const links = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/applications', icon: '◈', label: 'Applications' },
  { to: '/profile', icon: '◉', label: 'My Profile' },
  { to: '/settings', icon: '◎', label: 'Settings' }
];

const Sidebar = ({ open = false, onClose = () => {} }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">JobTracker</div>
          <div className="user-info">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="user-name">{user?.name}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          ⎋ Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
