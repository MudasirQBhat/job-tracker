import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/jobs';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusColors = {
  Applied: 'badge-applied',
  Interviewing: 'badge-interviewing',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected'
};

const ScoreColor = (score) => {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-mid';
  return 'score-low';
};

const Dashboard = () => {
  const { user, hasGeminiKey } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const stats = data?.stats || {};
  const recent = data?.recent || [];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your job search overview</p>
      </div>

      {!hasGeminiKey && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--warning)', background: '#1c1700' }}>
          <p style={{ color: 'var(--warning)', fontSize: '14px' }}>
            ⚠️ You haven't added your Gemini API key yet. AI match predictions won't work until you do.{' '}
            <Link to="/settings" style={{ color: 'var(--primary)' }}>Add it in Settings →</Link>
          </p>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.applied || 0}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.interviewing || 0}</div>
          <div className="stat-label">Interviewing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.offer || 0}</div>
          <div className="stat-label">Offers</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent applications</h2>
            <Link to="/applications" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <p>No applications yet</p>
              <Link to="/applications/new" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Add your first
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recent.map((job) => (
                <Link key={job.id} to={`/applications/${job.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '14px' }}>{job.role}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{job.company}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {job.ai_match_score && (
                        <span style={{ fontSize: '13px', fontWeight: '600',
                          color: job.ai_match_score >= 70 ? 'var(--success)' :
                                 job.ai_match_score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {job.ai_match_score}%
                        </span>
                      )}
                      <span className={`badge ${statusColors[job.status] || 'badge-applied'}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/applications/new" className="btn btn-primary">+ Add new application</Link>
            <Link to="/profile" className="btn btn-secondary">Update my profile</Link>
            <Link to="/profile/resume" className="btn btn-secondary">Upload resume</Link>
            <Link to="/settings" className="btn btn-secondary">Manage API key</Link>
          </div>

          {stats.avg_match_score && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg3)',
              borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                Average match score
              </p>
              <div className={`score-ring ${ScoreColor(stats.avg_match_score)}`}
                style={{ margin: '0 auto' }}>
                {stats.avg_match_score}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;