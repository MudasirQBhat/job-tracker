import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from './Logo';

const SiteFooter = () => {
  const { user } = useAuth();

  return (
    <footer className="landing-footer">
      <div className="landing-container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <Logo />
          </Link>
          <p>The smarter way to manage your job search, powered by AI.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How it works</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">My Profile</Link>
              </>
            ) : (
              <>
                <Link to="/signup">Get started</Link>
                <Link to="/login">Log in</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="landing-container footer-bottom">
        <span>© {new Date().getFullYear()} ApplyWise. All rights reserved.</span>
        <span className="footer-credit">
          Developed with{' '}
          <span className="footer-heart" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>{' '}
          by{' '}
          <a href="https://mudasirqadir.netlify.app" target="_blank" rel="noreferrer">Mudasir Qadir</a>
        </span>
      </div>
    </footer>
  );
};

export default SiteFooter;
