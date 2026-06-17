import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, deleteJob } from '../../api/jobs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';

const statusColors = {
  Applied: 'badge-applied',
  Interviewing: 'badge-interviewing',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected'
};

const Applications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('created_at');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    getJobs({ status: filter || undefined, sort })
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [filter, sort]);

  const askDelete = (id, e) => {
    e.preventDefault();
    setDeleteError('');
    setConfirmId(id);
  };

  const closeConfirm = () => {
    if (deleting) return;
    setConfirmId(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteJob(confirmId);
      setJobs((prev) => prev.filter((j) => j.id !== confirmId));
      setConfirmId(null);
    } catch {
      setDeleteError('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Applications</h1>
          <p>Track all your job applications</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">+ Add new</Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select className="form-group" style={{ margin: 0 }}
          value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select style={{ background: 'var(--bg3)', border: '1px solid var(--border)',
          color: 'var(--text)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '14px' }}
          value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at">Sort: Date added</option>
          <option value="applied_date">Sort: Applied date</option>
          <option value="ai_match_score">Sort: Match score</option>
          <option value="company">Sort: Company</option>
        </select>
      </div>

      {loading ? <LoadingSpinner text="Loading applications..." /> : (
        jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No applications found</p>
            <Link to="/applications/new" className="btn btn-primary">Add your first application</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobs.map((job) => (
              <Link key={job.id} to={`/applications/${job.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '16px 20px', cursor: 'pointer',
                  transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{job.role}</p>
                      <span className={`badge ${statusColors[job.status] || 'badge-applied'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {job.company} · Applied {new Date(job.applied_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {job.ai_match_score != null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700',
                          color: job.ai_match_score >= 70 ? 'var(--success)' :
                                 job.ai_match_score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {job.ai_match_score}%
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>match</div>
                      </div>
                    )}
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={(e) => askDelete(job.id, e)}>
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      <ConfirmModal
        open={confirmId !== null}
        title="Delete application?"
        message="This will permanently remove this application and its AI analysis. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default Applications;