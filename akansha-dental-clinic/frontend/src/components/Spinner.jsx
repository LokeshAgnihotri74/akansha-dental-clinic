import React from 'react';

export default function Spinner({ message = 'Loading...', size = 'md' }) {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div style={{
        width: `${dim}px`,
        height: `${dim}px`,
        border: '3px solid rgba(0, 212, 178, 0.2)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {message && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{message}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
