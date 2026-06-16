import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    title: '', bio: '', skills: [], github_url: '', linkedin_url: '',
    experience: [], education: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile().then((res) => {
      const p = res.data;
      setProfile(p);
      setForm({
        title: p.title || '',
        bio: p.bio || '',
        skills: p.skills || [],
        github_url: p.github_url || '',
        linkedin_url: p.linkedin_url || '',
        experience: p.experience || [],
        education: p.education || []
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim())) {
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

  const addExperience = () => setForm({
    ...form,
    experience: [...form.experience, { role: '', company: '', duration: '', description: '' }]
  });

  const updateExperience = (index, field, value) => {
    const updated = [...form.experience];
    updated[index][field] = value;
    setForm({ ...form, experience: updated });
  };

  const removeExperience = (index) => setForm({
    ...form, experience: form.experience.filter((_, i) => i !== index)
  });

  const addEducation = () => setForm({
    ...form,
    education: [...form.education, { degree: '', institution: '', year: '' }]
  });

  const updateEducation = (index, field, value) => {
    const updated = [...form.education];
    updated[index][field] = value;
    setForm({ ...form, education: updated });
  };

  const removeEducation = (index) => setForm({
    ...form, education: form.education.filter((_, i) => i !== index)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My profile</h1>
          <p>This information is used by the AI to analyze your job matches</p>
        </div>
        <Link to="/profile/resume" className="btn btn-secondary">Manage resume</Link>
      </div>

      {profile?.resume_url && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--success)' }}>
          <p style={{ fontSize: '14px', color: 'var(--success)' }}>
            ✓ Resume uploaded ·{' '}
            <a href={profile.resume_url} target="_blank" rel="noreferrer"
              style={{ color: 'var(--primary)' }}>View PDF</a>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Basic info</h2>
          <div className="form-group">
            <label>Professional title</label>
            <input name="title" placeholder="e.g. Full Stack Developer"
              value={form.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bio / Summary</label>
            <textarea name="bio" rows={4}
              placeholder="Brief summary of your professional background..."
              value={form.bio} onChange={handleChange} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>GitHub URL</label>
              <input name="github_url" placeholder="https://github.com/..."
                value={form.github_url} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input name="linkedin_url" placeholder="https://linkedin.com/in/..."
                value={form.linkedin_url} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Skills</h2>
          <div className="form-group">
            <label>Add skills (press Enter)</label>
            <input placeholder="e.g. React, Node.js, Python..."
              value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {form.skills.map((skill) => (
              <span key={skill} className="tag" style={{ cursor: 'pointer' }}
                onClick={() => removeSkill(skill)}>
                {skill} ×
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Experience</h2>
            <button type="button" className="btn btn-secondary" onClick={addExperience}
              style={{ padding: '6px 12px', fontSize: '13px' }}>+ Add</button>
          </div>
          {form.experience.map((exp, i) => (
            <div key={i} style={{ padding: '16px', background: 'var(--bg3)',
              borderRadius: 'var(--radius)', marginBottom: '12px', border: '1px solid var(--border)' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Role</label>
                  <input placeholder="Software Engineer" value={exp.role}
                    onChange={(e) => updateExperience(i, 'role', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input placeholder="Company name" value={exp.company}
                    onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input placeholder="e.g. Jan 2022 - Dec 2023" value={exp.duration}
                  onChange={(e) => updateExperience(i, 'duration', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} placeholder="Key responsibilities and achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(i, 'description', e.target.value)} />
              </div>
              <button type="button" className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => removeExperience(i)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Education</h2>
            <button type="button" className="btn btn-secondary" onClick={addEducation}
              style={{ padding: '6px 12px', fontSize: '13px' }}>+ Add</button>
          </div>
          {form.education.map((edu, i) => (
            <div key={i} style={{ padding: '16px', background: 'var(--bg3)',
              borderRadius: 'var(--radius)', marginBottom: '12px', border: '1px solid var(--border)' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Degree</label>
                  <input placeholder="B.Tech Computer Science" value={edu.degree}
                    onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input placeholder="University name" value={edu.institution}
                    onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input placeholder="2023" value={edu.year}
                  onChange={(e) => updateEducation(i, 'year', e.target.value)} />
              </div>
              <button type="button" className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => removeEducation(i)}>Remove</button>
            </div>
          ))}
        </div>

        {error && <p className="error-msg" style={{ marginBottom: '12px' }}>{error}</p>}
        {success && <p className="success-msg" style={{ marginBottom: '12px' }}>{success}</p>}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;