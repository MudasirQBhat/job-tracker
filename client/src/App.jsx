import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import ProtectedRoute from './components/ui/ProtectedRoute';
import PublicLayout from './components/ui/PublicLayout';
import Sidebar from './components/ui/Sidebar';
import Logo from './components/ui/Logo';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import ResumeUpload from './pages/profile/ResumeUpload';
import Applications from './pages/applications/Applications';
import AddApplication from './pages/applications/AddApplication';
import JobDetail from './pages/applications/JobDetail';
import Settings from './pages/settings/Settings';
import useAuth from './hooks/useAuth';

const AppLayout = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="app-main">
        <header className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
          <Link to="/" className="logo"><Logo size={30} /></Link>
          <span style={{ width: 24 }} />
        </header>
        <main className="main-content" key={location.pathname}>
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={!user ? <PublicLayout><Login /></PublicLayout> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <PublicLayout><Signup /></PublicLayout> : <Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute><AppLayout><Applications /></AppLayout></ProtectedRoute>
      } />
      <Route path="/applications/new" element={
        <ProtectedRoute><AppLayout><AddApplication /></AppLayout></ProtectedRoute>
      } />
      <Route path="/applications/:id" element={
        <ProtectedRoute><AppLayout><JobDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile/resume" element={
        <ProtectedRoute><AppLayout><ResumeUpload /></AppLayout></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
};

export default App;