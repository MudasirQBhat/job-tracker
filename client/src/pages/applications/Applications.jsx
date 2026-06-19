import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, deleteJob, updateJob } from '../../api/jobs';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Skeleton from '../../components/ui/Skeleton';
import useToast from '../../hooks/useToast';
import { needsFollowUp } from '../../utils/followup';

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

const statusColors = {
  Applied: 'badge-applied',
  Interviewing: 'badge-interviewing',
  Offer: 'badge-offer',
  Rejected: 'badge-rejected'
};

const scoreColor = (s) =>
  s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)';

const Applications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('created_at');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => localStorage.getItem('appsView') || 'list');
  const [dragId, setDragId] = useState(null);
  const [dropCol, setDropCol] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const fetchJobs = () => {
    setLoading(true);
    getJobs({ sort })
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [sort]);

  const setViewMode = (v) => { setView(v); localStorage.setItem('appsView', v); };

  const askDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
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
      toast('Application deleted');
    } catch {
      setDeleteError('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const moveTo = async (job, status) => {
    if (!job || job.status === status) return;
    const prev = jobs;
    setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status } : j)));
    try {
      await updateJob(job.id, { ...job, status });
      toast(`Moved to ${status}`);
    } catch {
      setJobs(prev);
      toast('Failed to move application', 'error');
    }
  };

  const q = search.trim().toLowerCase();
  const matchesSearch = (j) => !q || `${j.role} ${j.company}`.toLowerCase().includes(q);
  const listVisible = jobs.filter((j) => (!filter || j.status === filter) && matchesSearch(j));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Applications</h1>
          <p>Track all your job applications</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">+ Add new</Link>
      </div>

      <div className="apps-toolbar">
        <input
          className="apps-search"
          type="search"
          placeholder="Search company or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {view === 'list' && (
          <select className="apps-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select className="apps-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at">Sort: Date added</option>
          <option value="applied_date">Sort: Applied date</option>
          <option value="ai_match_score">Sort: Match score</option>
          <option value="company">Sort: Company</option>
        </select>
        <div className="view-toggle">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
          <button className={view === 'board' ? 'active' : ''} onClick={() => setViewMode('board')}>Board</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '18px 20px' }}>
              <Skeleton width="38%" height={15} />
              <Skeleton width="22%" height={12} style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">◈</div>
          <h3>No applications yet</h3>
          <p>Start tracking your job search — add your first application to get going.</p>
          <Link to="/applications/new" className="btn btn-primary">Add your first application</Link>
        </div>
      ) : view === 'board' ? (
        <div className="kanban">
          {STATUSES.map((status) => {
            const cards = jobs.filter((j) => j.status === status && matchesSearch(j));
            return (
              <div
                key={status}
                className={`kanban-col ${dropCol === status ? 'drop' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDropCol(status); }}
                onDragLeave={() => setDropCol((c) => (c === status ? null : c))}
                onDrop={() => {
                  const job = jobs.find((j) => j.id === dragId);
                  moveTo(job, status);
                  setDragId(null);
                  setDropCol(null);
                }}
              >
                <div className="kanban-col-head">
                  <span className="kanban-col-title">{status}</span>
                  <span className="kanban-count">{cards.length}</span>
                </div>
                {cards.map((job) => (
                  <div
                    key={job.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => setDragId(job.id)}
                    onDragEnd={() => { setDragId(null); setDropCol(null); }}
                    onClick={() => navigate(`/applications/${job.id}`)}
                  >
                    <div className="kanban-card-role">{job.role}</div>
                    <div className="kanban-card-company">{job.company}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {job.ai_match_score != null && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(job.ai_match_score) }}>
                          {job.ai_match_score}% match
                        </span>
                      )}
                      {needsFollowUp(job) && <span className="badge badge-followup">⏰ Follow up</span>}
                    </div>
                  </div>
                ))}
                {cards.length === 0 && <div className="kanban-empty">Drop here</div>}
              </div>
            );
          })}
        </div>
      ) : listVisible.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🔍</div>
          <h3>No matches</h3>
          <p>No applications match your search or filter. Try adjusting them.</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilter(''); }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listVisible.map((job) => (
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
                    {needsFollowUp(job) && <span className="badge badge-followup">⏰ Follow up</span>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {job.company} · Applied {new Date(job.applied_date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {job.ai_match_score != null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: scoreColor(job.ai_match_score) }}>
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
