import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from './Logo';

const ProfileMenu = () => {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="profile-menu" ref={ref}>
      <button className="profile-chip" onClick={() => setOpen((o) => !o)}>
        <span className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</span>
        <span className="profile-chip-name">{user?.name}</span>
        <span className="profile-caret">▾</span>
      </button>
      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-head">
            <span className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <div>
              <div className="profile-dropdown-name">{user?.name}</div>
              <div className="profile-dropdown-email">{user?.email}</div>
            </div>
          </div>
          <Link to="/dashboard" className="profile-dropdown-item" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/profile" className="profile-dropdown-item" onClick={() => setOpen(false)}>My Profile</Link>
          <Link to="/settings" className="profile-dropdown-item" onClick={() => setOpen(false)}>Settings</Link>
          <button className="profile-dropdown-item danger" onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
};

const SiteHeader = () => {
  const { user } = useAuth();

  return (
    <header className="landing-header">
      <div className="landing-container landing-nav">
        <Link to="/" className="brand">
          <Logo />
        </Link>
        <nav className="landing-actions">
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
