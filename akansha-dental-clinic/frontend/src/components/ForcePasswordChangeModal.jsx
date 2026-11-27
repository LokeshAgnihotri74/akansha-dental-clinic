import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  LogOut, 
  Sparkles,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from './Spinner';
import DentalLogo from './DentalLogo';

export default function ForcePasswordChangeModal() {
  const { user, changePassword, updateProfile, logout, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);

      // If Super Admin updated their email address
      if (isSuperAdmin && email.trim() && email.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
        await updateProfile({ email: email.trim() });
      }

      await changePassword(newPassword.trim());
      showToast('New password created successfully! Your administrative access is fully secured.', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
      }}>
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #004D40 100%)',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 212, 178, 0.2)',
            border: '2px solid #00D4B2',
            color: '#00D4B2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF' }}>
            First-Login Security Verification
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            To safeguard clinical data and patient health records, you must set your private personal password before entering the system.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Active Account Identity Pill */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.84rem'
          }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Logged In Account
              </span>
              <strong style={{ color: '#0A2540' }}>{user?.fullName || user?.username}</strong>
            </div>
            <span style={{
              backgroundColor: isSuperAdmin ? '#EDE9FE' : '#DEF7EC',
              color: isSuperAdmin ? '#7C3AED' : '#0E9F6E',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              {user?.role || 'ADMIN'}
            </span>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#991B1B',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Super Admin Email Self-Configuration */}
            {isSuperAdmin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px', display: 'block' }}>
                  Super Admin Email ID (Your Own Primary Email)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your personal or clinic email"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                  />
                  <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  You will use this email address for all future Super Admin sign-ins.
                </span>
              </div>
            )}

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px', display: 'block' }}>
                Create New Self-Created Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  autoFocus
                />
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px', display: 'block' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#0A2540',
                color: '#00D4B2',
                border: 'none',
                borderRadius: '8px',
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <Spinner size="sm" color="#00D4B2" />
              ) : (
                <>
                  <CheckCircle size={18} color="#00D4B2" />
                  <span>Secure My Account &amp; Proceed</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Safe Logout */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >
              <LogOut size={14} />
              <span>Cancel &amp; Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
