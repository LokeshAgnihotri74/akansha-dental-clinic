import React, { useEffect, useState } from 'react';
import {
  Shield,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Unlock,
  Trash2,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import adminService from '../../services/adminService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function UsersManagerPage() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'ROLE_STAFF',
  });

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAdmins();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast('Failed to load clinic user list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('Username, email, and temporary password are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        fullName: formData.fullName.trim() || formData.username.trim(),
        phone: formData.phone.trim() || null,
        roles: [formData.role],
      };
      await adminService.createAdmin(payload);
      showToast(`User ${payload.username} created. They must set their new password upon first sign-in.`, 'success');
      setCreateModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'ROLE_STAFF',
      });
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id || user.id === 1) {
      showToast('Cannot lock primary administrator account', 'warning');
      return;
    }

    const nextStatus = !user.active;
    try {
      await adminService.updateAdminStatus(user.id, nextStatus);
      showToast(`Account for ${user.fullName || user.username} is now ${nextStatus ? 'ACTIVE' : 'LOCKED'}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update account status', 'error');
    }
  };

  const handleOpenResetModal = (user) => {
    setSelectedUser(user);
    setTempPassword('TempPass@' + Math.floor(1000 + Math.random() * 9000));
    setResetModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !tempPassword.trim()) return;

    try {
      setResetting(true);
      await adminService.resetAdminPassword(selectedUser.id, tempPassword.trim());
      showToast(`Temporary password set for ${selectedUser.fullName || selectedUser.username}. Forced password change enabled on next login.`, 'success');
      setResetModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id || user.id === 1) {
      showToast('Cannot delete primary administrator account', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently revoke access for ${user.fullName || user.username}?`)) {
      return;
    }

    try {
      await adminService.deleteAdmin(user.id);
      showToast(`Account for ${user.fullName || user.username} deleted.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Staff &amp; Administrative Access Governance
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Only the Super Administrator can grant access, assign roles, and enforce first-login password security.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0A2540',
              color: '#00D4B2',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(10,37,64,0.2)'
            }}
          >
            <UserPlus size={16} color="#00D4B2" />
            <span>Grant New Staff Access</span>
          </button>
          <button
            onClick={fetchUsers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0A2540',
              cursor: 'pointer',
            }}
            title="Refresh Directory"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Security Info Card */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ShieldCheck size={22} color="#2563EB" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#1E40AF', lineHeight: 1.5 }}>
          <strong>Zero-Trust Access Policy Active:</strong> Public registration is blocked. When you grant access with a temporary password, the user is strictly intercepted on their first sign-in and forced to create their personal confidential password before any clinic records can be accessed.
        </div>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Personnel &amp; Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Username &amp; Email</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Password Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Account State</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading user access directory..." />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{u.fullName || u.username}</div>
                      {u.phone && <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{u.phone}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#0A2540', fontWeight: 600 }}>{u.email}</div>
                      <code style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.username}</code>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(u.roles || []).map((r, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: r === 'ROLE_SUPER_ADMIN' ? '#EDE9FE' : r === 'ROLE_ADMIN' ? '#DBEAFE' : '#DEF7EC',
                              color: r === 'ROLE_SUPER_ADMIN' ? '#7C3AED' : r === 'ROLE_ADMIN' ? '#1E40AF' : '#0E9F6E',
                            }}
                          >
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {u.mustChangePassword ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                        }}>
                          <KeyRound size={12} />
                          <span>Must Change on 1st Login</span>
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#DEF7EC',
                          color: '#0E9F6E',
                        }}>
                          <CheckCircle size={12} />
                          <span>Secured &amp; Active</span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: u.active ? '#DEF7EC' : '#FEE2E2',
                        color: u.active ? '#0E9F6E' : '#DC2626',
                      }}>
                        {u.active ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => handleOpenResetModal(u)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '5px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#fff',
                            color: '#0A2540',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Assign new temporary password & force change"
                        >
                          <Key size={12} color="#00BA9C" />
                          <span>Reset Pwd</span>
                        </button>

                        {/* Toggle Active / Lock */}
                        {u.id !== 1 && u.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '5px',
                              border: `1px solid ${u.active ? '#FCA5A5' : '#86EFAC'}`,
                              backgroundColor: u.active ? '#FEF2F2' : '#F0FDF4',
                              color: u.active ? '#DC2626' : '#16A34A',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={u.active ? 'Lock account access' : 'Activate account'}
                          >
                            {u.active ? <Lock size={12} /> : <Unlock size={12} />}
                            <span>{u.active ? 'Lock' : 'Unlock'}</span>
                          </button>
                        )}

                        {/* Delete User */}
                        {u.id !== 1 && u.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '5px',
                              border: '1px solid #FCA5A5',
                              backgroundColor: '#FFF',
                              color: '#DC2626',
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                            title="Delete staff account"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Super Admin: Grant New Staff / Admin Access"
          maxWidth="520px"
        >
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: '#475569',
              lineHeight: 1.4
            }}>
              💡 <strong>First-Login Enforcement:</strong> Set a temporary password below. The user will be required to create their own secure password immediately upon their first sign-in.
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Dr. Ananya Sen"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. ananya_sen"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign Role *</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ROLE_STAFF">Staff (Front Desk &amp; OPD)</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                  <option value="ROLE_SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address (Used for Login) *</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="ananya@akanshadental.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876 543 210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Initial Temporary Password *</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                User must replace this password on first login.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
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
                  color: '#00D4B2',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {saving ? <Spinner size="sm" color="#00D4B2" /> : <ShieldCheck size={16} />}
                <span>Authorize &amp; Provision User</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && selectedUser && (
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title={`Reset Temporary Password: ${selectedUser.fullName || selectedUser.username}`}
          maxWidth="460px"
        >
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Enter a new temporary password for <strong>{selectedUser.email}</strong>. The user will be forced to change this password as soon as they sign in.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Temporary Password *</label>
              <input
                type="text"
                className="form-control"
                required
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Temporary password"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
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
                disabled={resetting}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0A2540',
                  color: '#00D4B2',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                }}
              >
                {resetting ? 'Updating...' : 'Assign Temporary Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
