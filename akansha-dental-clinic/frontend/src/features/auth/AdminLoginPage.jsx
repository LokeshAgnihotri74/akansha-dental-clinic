import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowLeft, 
  CalendarCheck,
  Activity,
  Sparkles,
  LockKeyhole,
  ShieldAlert
} from 'lucide-react';
import Spinner from '../../components/Spinner';
import DentalLogo from '../../components/DentalLogo';

export const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide your registered administrative email/username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials or contact the Super Administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-wrapper">
      {/* =========================================
          LEFT PANEL: Modern Clinical Showcase
         ========================================= */}
      <div className="admin-showcase-panel">
        <div className="admin-showcase-glow-1"></div>
        <div className="admin-showcase-glow-2"></div>
        <div className="admin-grid-pattern"></div>

        {/* Top Branding Pill */}
        <div className="admin-showcase-top">
          <div className="admin-brand-pill">
            <DentalLogo size={22} light={true} />
            <span className="admin-brand-pill-text">Akansha Dental Clinic &amp; Implant Center</span>
            <span className="admin-brand-pill-badge">CLINICAL OS</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏥 Minal Residency, Bhopal</span>
            <span>•</span>
            <span style={{ color: '#00D4B2' }}>NABH &amp; ISO 9001:2015 Practice</span>
          </div>
        </div>

        {/* Center Main Presentation */}
        <div className="admin-showcase-center">
          <div className="admin-status-indicator">
            <span className="admin-status-dot"></span>
            <span>Intelligent Operatory &amp; Healthcare Station</span>
          </div>

          <h1 className="admin-showcase-title">
            Advanced Dental Clinical &amp; <span>Management Workstation</span>
          </h1>

          <p className="admin-showcase-desc">
            Unified digital command center for dentists, prosthodontists, dental hygienists, 
            and clinical administration to coordinate patient care, appointments, 3D imaging, and operatory workflows.
          </p>

          {/* 4 Feature Cards */}
          <div className="admin-features-grid">
            <div className="admin-feature-card">
              <div className="admin-feature-icon">
                <CalendarCheck size={20} />
              </div>
              <h3 className="admin-feature-title">Smart Operatory Rosters</h3>
              <p className="admin-feature-desc">
                Multi-doctor chair allocation, real-time token queues, and walk-in scheduling.
              </p>
            </div>

            <div className="admin-feature-card">
              <div className="admin-feature-icon" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34D399' }}>
                <Activity size={20} />
              </div>
              <h3 className="admin-feature-title">Digital EHR &amp; 3D Imaging</h3>
              <p className="admin-feature-desc">
                Direct optical scan archives, periodontal charts, and chronological treatment history.
              </p>
            </div>

            <div className="admin-feature-card">
              <div className="admin-feature-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8' }}>
                <ShieldCheck size={20} />
              </div>
              <h3 className="admin-feature-title">100% Hospital Sterility</h3>
              <p className="admin-feature-desc">
                Class-B autoclave batch validation, UV chamber timers, and bio-waste tracking.
              </p>
            </div>

            <div className="admin-feature-card">
              <div className="admin-feature-icon" style={{ background: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' }}>
                <Sparkles size={20} />
              </div>
              <h3 className="admin-feature-title">Automated Billing &amp; Plans</h3>
              <p className="admin-feature-desc">
                Itemized dental procedure estimates, GST invoicing, and doctor payout reconciliation.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Security Strip */}
        <div className="admin-showcase-bottom">
          <div className="admin-stats-strip">
            <div className="admin-stat-item">
              <h5>15,000+</h5>
              <p>Patients Restored</p>
            </div>
            <div className="admin-stat-item">
              <h5>99.4%</h5>
              <p>Clinical Satisfaction</p>
            </div>
            <div className="admin-stat-item">
              <h5>12+ Years</h5>
              <p>Clinical Mastery</p>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LockKeyhole size={14} color="#00D4B2" />
            <span>DISHA &amp; HIPAA Compliant Zero-Trust Security</span>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT PANEL: Authentication Console
         ========================================= */}
      <div className="admin-auth-console">
        {/* Top Navigation */}
        <div className="admin-auth-top-nav">
          <Link to="/" className="admin-back-btn">
            <ArrowLeft size={15} />
            <span>Return to Clinic Website</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo-circle">
              <DentalLogo size={32} light={true} />
            </div>
            <h2 className="admin-login-title">Clinical Portal Login</h2>
            <p className="admin-login-subtitle">
              Akansha Dental Clinic Management System
            </p>
            <div>
              <span className="admin-roles-tag">
                🛡️ Super Admin &amp; Authorized Personnel Only
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '10px',
              color: '#991B1B',
              fontSize: '0.86rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Administrative Email ID or Username
              </label>
              <div className="admin-input-wrapper">
                <div className="admin-input-icon">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin@akanshadental.com"
                  required
                  autoFocus
                  className="admin-input-field"
                />
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="admin-form-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  256-bit Encrypted
                </span>
              </div>
              <div className="admin-input-wrapper">
                <div className="admin-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  required
                  className="admin-input-field"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-pwd-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-submit-btn"
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spinner size="sm" color="#0A2540" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to Clinical Workstation</span>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>→</span>
                </>
              )}
            </button>
          </form>

          {/* Secure Access Notice (Replaces unsafe 1-click bypass) */}
          <div style={{
            marginTop: '1.75rem',
            padding: '14px',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ShieldAlert size={20} color="#00BA9C" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#0A2540', display: 'block', marginBottom: '2px' }}>
                Restricted Access Policy
              </strong>
              Only Super Admin and authorized clinical staff provisioned by the Super Administrator can access this workstation. Public self-registration is permanently disabled.
            </div>
          </div>

          {/* Security Footer Note */}
          <div className="admin-security-footer">
            <ShieldCheck size={14} color="#00BA9C" />
            <span>DISHA &amp; HIPAA Compliant Clinical Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
