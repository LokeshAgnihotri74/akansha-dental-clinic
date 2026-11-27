import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import Spinner from './Spinner';

export default function AccountSecurityModal({ isOpen, onClose }) {
  const { user, changePassword, updateProfile, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'email'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Email / Profile update state
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setSaving(true);
      await changePassword(newPassword.trim(), currentPassword.trim());
      showToast('Password successfully updated!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim()
      });
      showToast('Account credentials & profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Administrative Account Security & Credentials" maxWidth="480px">
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('password'); setError(null); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'password' ? '2px solid #00D4B2' : '2px solid transparent',
            color: activeTab === 'password' ? '#0A2540' : '#64748B',
            fontWeight: activeTab === 'password' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('email'); setError(null); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'email' ? '2px solid #00D4B2' : '2px solid transparent',
            color: activeTab === 'email' ? '#0A2540' : '#64748B',
            fontWeight: activeTab === 'email' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          Update Email &amp; Identity
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#991B1B',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'password' ? (
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                className="form-control"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
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
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">New Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPwd ? 'text' : 'password'}
                className="form-control"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
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
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password *</label>
            <input
              type={showNewPwd ? 'text' : 'password'}
              className="form-control"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0A2540',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? <Spinner size="sm" color="#fff" /> : <ShieldCheck size={16} color="#00D4B2" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Email ID (For Sign-In) *</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@akanshadental.com"
            />
            <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Used to authenticate into the Super Admin console.
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9399354201"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0A2540',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? <Spinner size="sm" color="#fff" /> : <CheckCircle size={16} color="#00D4B2" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
