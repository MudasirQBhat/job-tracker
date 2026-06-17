import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const SiteFooter = () => {
  const { user } = useAuth();

  return (
    <footer className="landing-footer">
      <div className="landing-container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark">JT</span>
            <span className="brand-name">JobTracker</span>
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
        <span>© {new Date().getFullYear()} JobTracker. All rights reserved.</span>
        <span>Built for job seekers, by job seekers.</span>
      </div>
    </footer>
  );
};

export default SiteFooter;
