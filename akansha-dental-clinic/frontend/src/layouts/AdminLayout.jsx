import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Stethoscope,
  Mail,
  Settings,
  Shield,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = hasRole(['ROLE_SUPER_ADMIN']);
  const isAdmin = hasRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

  const handleLogout = () => {
    logout();
    showToast('You have been securely signed out', 'info');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', to: '/admin/appointments', icon: Calendar },
    { label: 'Patients', to: '/admin/patients', icon: Users },
    { label: 'Doctors', to: '/admin/doctors', icon: UserCheck },
    { label: 'Treatments', to: '/admin/services', icon: Stethoscope },
    { label: 'Inquiries', to: '/admin/inquiries', icon: Mail },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Clinic Settings', to: '/admin/settings', icon: Settings });
  }

  if (isSuperAdmin) {
    navItems.push(
      { label: 'Staff & Roles', to: '/admin/users', icon: Shield },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: FileText }
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 37, 64, 0.5)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0A2540',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1050,
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        }}
        className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}
      >
        {/* Clinic Admin Brand */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent, #00D4B2)',
                color: '#0A2540',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Akansha Dental
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Clinic Portal
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, padding: '0.5rem 0.75rem', letterSpacing: '0.08em' }}>
            Main Operations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: isActive ? '#0A2540' : '#E2E8F0',
                    backgroundColor: isActive ? '#00D4B2' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Current User Card */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1E3A8A',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '2px solid #00D4B2',
              }}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || user?.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#00D4B2', fontWeight: 600 }}>
                {user?.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Body Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1020,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#0A2540',
                cursor: 'pointer',
              }}
            >
              <Menu size={22} />
            </button>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
              Akansha Dental Clinic Management System
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: '#0A2540',
                textDecoration: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontWeight: 600,
                backgroundColor: '#F8FAFC',
              }}
            >
              <span>Public Website</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
