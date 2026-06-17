import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import HeroIllustration from './HeroIllustration';

const features = [
  {
    icon: '◈',
    title: 'Track every application',
    desc: 'Keep all your job applications in one organized place — statuses, notes, and timelines at a glance.'
  },
  {
    icon: '✦',
    title: 'AI match scoring',
    desc: 'Upload your resume and let AI score how well you fit each role, so you focus on what matters.'
  },
  {
    icon: '◉',
    title: 'Smart profile',
    desc: 'Build a rich candidate profile once and reuse it across every application you send out.'
  },
  {
    icon: '⊞',
    title: 'Insightful dashboard',
    desc: 'See your pipeline at a glance — applied, interviewing, offers, and rejections in real time.'
  },
  {
    icon: '⚡',
    title: 'Move faster',
    desc: 'Stop juggling spreadsheets. Add a job, track its progress, and never miss a follow-up again.'
  },
  {
    icon: '🔒',
    title: 'Private & secure',
    desc: 'Your data is yours. Everything stays protected behind secure authentication.'
  }
];

const steps = [
  { num: '1', title: 'Create your account', desc: 'Sign up in seconds and set up your candidate profile.' },
  { num: '2', title: 'Add your applications', desc: 'Log every role you apply to with status and notes.' },
  { num: '3', title: 'Let AI guide you', desc: 'Get match scores and insights to land your next role.' }
];

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

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="brand">
            <span className="brand-mark">JT</span>
            <span className="brand-name">JobTracker</span>
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

      {/* Hero */}
      <section className="hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <span className="hero-pill">✦ AI-powered job tracking</span>
            <h1 className="hero-title">
              Land your next role,{' '}
              <span className="hero-accent">organized and effortless.</span>
            </h1>
            <p className="hero-subtitle">
              JobTracker helps you manage every job application in one place — track your pipeline,
              score your fit with AI, and never lose sight of an opportunity again.
            </p>
            <div className="hero-cta">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">Open your dashboard</Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">Get started free</Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">Log in</Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div><strong>100%</strong><span>Free to start</span></div>
              <div><strong>AI</strong><span>Match scoring</span></div>
              <div><strong>1</strong><span>Place for everything</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="landing-container">
          <div className="section-head">
            <h2>Everything you need to run your job search</h2>
            <p>Powerful tools that keep you organized from your first application to your final offer.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt" id="how-it-works">
        <div className="landing-container">
          <div className="section-head">
            <h2>Get started in three simple steps</h2>
            <p>From sign-up to your first insight in just a few minutes.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="landing-container">
          <div className="cta-banner">
            <h2>Ready to take control of your job search?</h2>
            <p>Join JobTracker today and turn the chaos of applications into a clear, winning plan.</p>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
            ) : (
              <Link to="/signup" className="btn btn-primary btn-lg">Create your free account</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
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
    </div>
  );
};

export default Home;
