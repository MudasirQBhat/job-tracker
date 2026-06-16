import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob } from '../../api/jobs';

const AddApplication = () => {
  const [form, setForm] = useState({
    company: '', role: '', job_description: '',
    status: 'Applied', applied_date: new Date().toISOString().split('T')[0],
    job_url: '', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.company || !form.role) return setError('Company and role are required');
    setLoading(true);
    try {
      const res = await createJob(form);
      navigate(`/applications/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add application</h1>
        <p>Track a new job you've applied to</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Company *</label>
              <input name="company" placeholder="e.g. Google" value={form.company} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input name="role" placeholder="e.g. Software Engineer" value={form.role} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Applied</option>
                <option>Interviewing</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label>Applied date</label>
              <input name="applied_date" type="date" value={form.applied_date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Job URL</label>
            <input name="job_url" type="url" placeholder="https://..." value={form.job_url} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Job description *</label>
            <textarea name="job_description" rows={10}
              placeholder="Paste the full job description here. The more detail, the better the AI analysis."
              value={form.job_description} onChange={handleChange} style={{ minHeight: '200px' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {form.job_description.length} characters — aim for the full JD for best AI results
            </span>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" rows={3} placeholder="Any personal notes about this application..."
              value={form.notes} onChange={handleChange} />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save application'}
            </button>
            <Link to="/applications" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplication;