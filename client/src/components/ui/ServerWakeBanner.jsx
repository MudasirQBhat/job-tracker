import { useState, useEffect } from 'react';

// Shows a banner when API requests are slow — typically the Render free-tier
// backend cold-starting (can take ~30s on first request after sleeping).
const ServerWakeBanner = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const on = () => setSlow(true);
    const off = () => setSlow(false);
    window.addEventListener('api:slow', on);
    window.addEventListener('api:idle', off);
    return () => {
      window.removeEventListener('api:slow', on);
      window.removeEventListener('api:idle', off);
    };
  }, []);

  if (!slow) return null;

  return (
    <div className="wake-banner" role="status">
      <span className="wake-spinner" aria-hidden="true" />
      Waking up the server — the first request after a while can take up to ~30s.
    </div>
  );
};

export default ServerWakeBanner;
