import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, uploadResume } from '../../api/profile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useToast from '../../hooks/useToast';

const ResumeUpload = () => {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast('Please select a PDF file', 'error');
    if (file.type !== 'application/pdf') return toast('Only PDF files are allowed', 'error');
    if (file.size > 5 * 1024 * 1024) return toast('File must be under 5MB', 'error');

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await uploadResume(formData);
      setProfile((prev) => ({ ...prev, resume_url: res.data.resume_url }));
      toast('Resume uploaded — text extracted and ready for AI analysis');
      setFile(null);
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Resume</h1>
        <p>Upload your PDF resume for AI-powered match analysis</p>
      </div>

      {profile?.resume_url && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--success)', fontWeight: '500', marginBottom: '4px' }}>
                ✓ Resume on file
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Text extracted and ready for AI analysis
              </p>
            </div>
            <a href={profile.resume_url} target="_blank" rel="noreferrer"
              className="btn btn-secondary" style={{ fontSize: '13px' }}>
              View PDF ↗
            </a>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '480px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          {profile?.resume_url ? 'Replace resume' : 'Upload resume'}
        </h2>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>PDF file (max 5MB)</label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '10px', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
          </div>
          {file && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn btn-primary" type="submit" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <Link to="/profile" className="btn btn-secondary">Back to profile</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;