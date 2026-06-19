import { useState } from 'react';
import { saveGeminiKey, deleteGeminiKey } from '../../api/auth';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import PasswordInput from '../../components/ui/PasswordInput';

const Settings = () => {
  const { hasGeminiKey, setHasGeminiKey } = useAuth();
  const toast = useToast();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return toast('Please enter your API key', 'error');
    setSaving(true);
    try {
      await saveGeminiKey(apiKey.trim());
      setHasGeminiKey(true);
      setApiKey('');
      toast('API key saved and encrypted successfully');
    } catch {
      toast('Failed to save API key', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteGeminiKey();
      setHasGeminiKey(false);
      setConfirmOpen(false);
      toast('API key removed');
    } catch {
      setDeleteError('Failed to remove key');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and API configuration</p>
      </div>

      <div className="card" style={{ maxWidth: '540px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          Gemini API key
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
          Your key is encrypted with AES-256 before being stored. It is only decrypted on the server
          at the moment of an AI analysis request, and never sent to the frontend.
          Get a free key at{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
            style={{ color: 'var(--primary)' }}>
            Google AI Studio ↗
          </a>
        </p>

        {hasGeminiKey ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius)',
              border: '1px solid var(--success)', marginBottom: '16px' }}>
              <span style={{ color: 'var(--success)', fontSize: '18px' }}>✓</span>
              <div>
                <p style={{ fontWeight: '500', fontSize: '14px' }}>API key is set</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Encrypted and stored securely</p>
              </div>
            </div>
            <form onSubmit={handleSave} style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label>Replace with a new key</label>
                <PasswordInput placeholder="AIza..."
                  value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Update key'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)} disabled={deleting}>
                  {deleting ? 'Removing...' : 'Remove key'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Paste your Gemini API key</label>
              <PasswordInput placeholder="AIza..."
                value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save API key'}
            </button>
          </form>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Remove API key?"
        message="Your Gemini API key will be deleted and AI match analysis will stop working until you add a new one."
        confirmLabel="Remove key"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => { if (!deleting) { setConfirmOpen(false); setDeleteError(''); } }}
      />
    </div>
  );
};

export default Settings;