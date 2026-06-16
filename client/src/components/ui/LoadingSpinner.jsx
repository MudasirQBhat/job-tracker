const LoadingSpinner = ({ size = 40, text = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px' }}>
    <div className="spinner" style={{ width: size, height: size }} />
    {text && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{text}</p>}
  </div>
);

export default LoadingSpinner;