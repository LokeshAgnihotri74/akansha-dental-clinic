import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutUsPage from '../pages/public/AboutUsPage';
import DoctorsPage from '../pages/public/DoctorsPage';
import ServicesPage from '../pages/public/ServicesPage';
import ServiceDetailPage from '../pages/public/ServiceDetailPage';
import AppointmentBookingPage from '../pages/public/AppointmentBookingPage';
import ContactUsPage from '../pages/public/ContactUsPage';
import GalleryPage from '../pages/public/GalleryPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsConditionsPage from '../pages/public/TermsConditionsPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Auth & Protected Routes
import AdminLoginPage from '../features/auth/AdminLoginPage';
import ProtectedRoute from './ProtectedRoute';

// Admin Feature Pages
import DashboardOverviewPage from '../pages/admin/DashboardOverviewPage';
import AppointmentsManagerPage from '../pages/admin/AppointmentsManagerPage';
import PatientsManagerPage from '../pages/admin/PatientsManagerPage';
import DoctorsManagerPage from '../pages/admin/DoctorsManagerPage';
import ServicesManagerPage from '../pages/admin/ServicesManagerPage';
import InquiriesManagerPage from '../pages/admin/InquiriesManagerPage';
import ClinicSettingsPage from '../pages/admin/ClinicSettingsPage';
import UsersManagerPage from '../pages/admin/UsersManagerPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Portal */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="dashboard" element={<DashboardOverviewPage />} />
        <Route path="appointments" element={<AppointmentsManagerPage />} />
        <Route path="patients" element={<PatientsManagerPage />} />
        <Route path="doctors" element={<DoctorsManagerPage />} />
        <Route path="services" element={<ServicesManagerPage />} />
        <Route path="inquiries" element={<InquiriesManagerPage />} />
        
        {/* Admin / Super Admin Guarded */}
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
              <ClinicSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Guarded */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
              <UsersManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public Dental Clinic Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/book-appointment" element={<AppointmentBookingPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
