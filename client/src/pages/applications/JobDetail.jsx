import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, updateJob } from '../../api/jobs';
import { analyzeJob, generateCoverLetter } from '../../api/ai';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useToast from '../../hooks/useToast';

const statusColors = {
  Applied: 'badge-applied', Interviewing: 'badge-interviewing',
  Offer: 'badge-offer', Rejected: 'badge-rejected'
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getJob(id)
      .then((res) => { setJob(res.data); setEditStatus(res.data.status); })
      .catch(() => navigate('/applications'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setEditStatus(newStatus);
    try {
      const res = await updateJob(id, { ...job, status: newStatus });
      setJob(res.data);
      toast(`Status updated to ${newStatus}`);
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleCoverLetter = async () => {
    setGeneratingCL(true);
    try {
      const res = await generateCoverLetter(id);
      setCoverLetter(res.data.cover_letter);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to generate cover letter', 'error');
    } finally {
      setGeneratingCL(false);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter)
      .then(() => toast('Cover letter copied'))
      .catch(() => toast('Could not copy', 'error'));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAiError('');
    try {
      const res = await analyzeJob(id);
      setJob((prev) => ({ ...prev, ai_match_score: res.data.match_score, ai_analysis: res.data }));
    } catch (err) {
      setAiError(err.response?.data?.error || 'Analysis failed. Check your Gemini API key in Settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading application..." />;
  if (!job) return null;

  const analysis = job.ai_analysis;
  const score = job.ai_match_score;
  const scoreClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/applications" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
          ← Back to applications
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{job.role}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {job.company} · Applied {new Date(job.applied_date).toLocaleDateString()}
          </p>
          {job.job_url && (
            <a href={job.job_url} target="_blank" rel="noreferrer"
              style={{ color: 'var(--primary)', fontSize: '13px' }}>
              View job posting ↗
            </a>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select value={editStatus} onChange={handleStatusChange}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: '14px' }}>
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>AI match analysis</h2>
              <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}
                style={{ padding: '8px 14px', fontSize: '13px' }}>
                {analyzing ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze match'}
              </button>
            </div>

            {analyzing && <LoadingSpinner text="Gemini is analyzing your profile vs this job..." />}
            {aiError && <p className="error-msg">{aiError}</p>}

            {!analyzing && analysis && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div className={`score-ring ${scoreClass}`}>{score}%</div>
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>Match score</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{analysis.verdict}</p>
                  </div>
                </div>

                <hr className="divider" />

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--success)' }}>✓ Strengths</p>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {analysis.strengths?.map((s, i) => (
                      <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s}</li>
                    ))}
                  </ul>
                </div>

                {analysis.skill_gaps?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--warning)' }}>⚠ Skill gaps</p>
                    <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {analysis.skill_gaps.map((g, i) => (
                        <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.keywords_missing?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>Keywords to add to your resume</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {analysis.keywords_missing.map((k, i) => (
                        <span key={i} className="tag">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="divider" />

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--primary)' }}>💡 Advice</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {analysis.advice}
                  </p>
                </div>

                {analysis.interview_tips && (
                  <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)',
                    borderLeft: '3px solid var(--primary)' }}>
                    <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '13px' }}>Interview tips</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {analysis.interview_tips}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!analyzing && !analysis && !aiError && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '8px' }}>No analysis yet</p>
                <p style={{ fontSize: '13px' }}>Click "Analyze match" to get your AI-powered hiring prediction</p>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Cover letter</h2>
              <button className="btn btn-primary" onClick={handleCoverLetter} disabled={generatingCL}
                style={{ padding: '8px 14px', fontSize: '13px' }}>
                {generatingCL ? 'Generating...' : coverLetter ? 'Regenerate' : 'Generate'}
              </button>
            </div>

            {generatingCL && <LoadingSpinner text="Writing a tailored cover letter..." />}

            {!generatingCL && coverLetter && (
              <>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7',
                  color: 'var(--text)', background: 'var(--bg3)', padding: '16px',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  {coverLetter}
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '12px', fontSize: '13px' }}
                  onClick={copyCoverLetter}>
                  Copy to clipboard
                </button>
              </>
            )}

            {!generatingCL && !coverLetter && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Generate a tailored cover letter for this role using your profile and the job description.
              </p>
            )}
          </div>

          {job.notes && (
            <div className="card">
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Notes</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{job.notes}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Job description</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8',
            whiteSpace: 'pre-wrap', maxHeight: '600px', overflowY: 'auto' }}>
            {job.job_description || 'No job description provided.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;