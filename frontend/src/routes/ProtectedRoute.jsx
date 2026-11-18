import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 'var(--spacing-md)'
      }}>
        <Spinner size="lg" />
        <p style={{ color: 'var(--color-navy-light)', fontSize: '0.95rem' }}>Verifying clinical access credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login, remembering previous page
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => hasRole(role));
    if (!hasPermission) {
      return (
        <div style={{
          maxWidth: '540px',
          margin: 'var(--spacing-2xl) auto',
          padding: 'var(--spacing-xl)',
          backgroundColor: '#FFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          borderTop: '4px solid #EF4444'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-md)'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ color: 'var(--color-navy-dark)', marginBottom: 'var(--spacing-sm)' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-navy-light)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.6 }}>
            Your account (<strong>{user?.fullName || user?.username}</strong>) does not have sufficient role privileges to view this section.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
            <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => window.location.href = '/admin/dashboard'}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
