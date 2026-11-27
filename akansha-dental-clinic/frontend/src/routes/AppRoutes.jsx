import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Layouts (eagerly loaded for structure)
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Homepage eagerly loaded for fast first contentful paint (FCP)
import HomePage from '../pages/public/HomePage';

// Lazy-loaded Public Pages (code-split)
const AboutUsPage = lazy(() => import('../pages/public/AboutUsPage'));
const DoctorsPage = lazy(() => import('../pages/public/DoctorsPage'));
const ServicesPage = lazy(() => import('../pages/public/ServicesPage'));
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage'));
const AppointmentBookingPage = lazy(() => import('../pages/public/AppointmentBookingPage'));
const ContactUsPage = lazy(() => import('../pages/public/ContactUsPage'));
const GalleryPage = lazy(() => import('../pages/public/GalleryPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('../pages/public/TermsConditionsPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// Lazy-loaded Auth Portal (split out from public bundle)
const AdminLoginPage = lazy(() => import('../features/auth/AdminLoginPage'));

// Lazy-loaded Admin Feature Pages (heavy admin code split out)
const DashboardOverviewPage = lazy(() => import('../pages/admin/DashboardOverviewPage'));
const AppointmentsManagerPage = lazy(() => import('../pages/admin/AppointmentsManagerPage'));
const PatientsManagerPage = lazy(() => import('../pages/admin/PatientsManagerPage'));
const DoctorsManagerPage = lazy(() => import('../pages/admin/DoctorsManagerPage'));
const ServicesManagerPage = lazy(() => import('../pages/admin/ServicesManagerPage'));
const InquiriesManagerPage = lazy(() => import('../pages/admin/InquiriesManagerPage'));
const ClinicSettingsPage = lazy(() => import('../pages/admin/ClinicSettingsPage'));
const UsersManagerPage = lazy(() => import('../pages/admin/UsersManagerPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));

// Accessible Loading Fallback
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '55vh',
        gap: '1rem',
        padding: '2rem',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#00D4B2',
          borderRadius: '50%',
          animation: 'clinicSpin 0.75s linear infinite'
        }}
      />
      <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600 }}>
        Loading clinic portal...
      </span>
      <style>{`
        @keyframes clinicSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Declarative Page Title & Description Injector
function PageMeta({ title, description, children }) {
  useDocumentTitle(title, description);
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Administrative Auth Portal */}
        <Route
          path="/admin/login"
          element={
            <PageMeta
              title="Admin Portal Login"
              description="Secure administrative login for clinical staff, dentists, and super administrator at Akansha Dental Clinic."
            >
              <AdminLoginPage />
            </PageMeta>
          }
        />

        {/* Protected Clinical Management Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <PageMeta
                title="Clinical Dashboard"
                description="Live clinic telemetry, appointment metrics, and doctor rosters."
              >
                <DashboardOverviewPage />
              </PageMeta>
            }
          />
          <Route
            path="dashboard"
            element={
              <PageMeta
                title="Clinical Dashboard"
                description="Live clinic telemetry, appointment metrics, and doctor rosters."
              >
                <DashboardOverviewPage />
              </PageMeta>
            }
          />
          <Route
            path="appointments"
            element={
              <PageMeta
                title="Manage Appointments"
                description="Schedule, confirm, reschedule, or cancel patient appointments."
              >
                <AppointmentsManagerPage />
              </PageMeta>
            }
          />
          <Route
            path="patients"
            element={
              <PageMeta
                title="Patient Health Records"
                description="Confidential patient directory, medical histories, and treatment logs."
              >
                <PatientsManagerPage />
              </PageMeta>
            }
          />
          <Route
            path="doctors"
            element={
              <PageMeta
                title="Doctor Rosters & Schedules"
                description="Doctor OPD duty timings, slot allocations, and leave management."
              >
                <DoctorsManagerPage />
              </PageMeta>
            }
          />
          <Route
            path="services"
            element={
              <PageMeta
                title="Dental Treatments Catalog"
                description="Dental service offerings, treatment pricing, and warranty durations."
              >
                <ServicesManagerPage />
              </PageMeta>
            }
          />
          <Route
            path="inquiries"
            element={
              <PageMeta
                title="Patient Inquiries & Leads"
                description="Direct contact inquiries and treatment consultation requests."
              >
                <InquiriesManagerPage />
              </PageMeta>
            }
          />

          {/* Admin / Super Admin Guarded */}
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                <PageMeta
                  title="Clinic Settings"
                  description="Working hours, notification credentials, and clinic configurations."
                >
                  <ClinicSettingsPage />
                </PageMeta>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Guarded */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                <PageMeta
                  title="Staff & User Management"
                  description="Administrative access provisioning and RBAC roles."
                >
                  <UsersManagerPage />
                </PageMeta>
              </ProtectedRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                <PageMeta
                  title="System Audit Logs"
                  description="Immutable audit trail of administrative actions and access events."
                >
                  <AuditLogsPage />
                </PageMeta>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public Dental Clinic Website */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <PageMeta
                title="Home | Leading Dental Implants & Cosmetic Dentistry"
                description="NABH & ISO 9001:2015 certified dental clinic in Minal Residency, Bhopal. Painless immediate dental implants, microscopic root canals, and digital smile makeover by Dr. Akansha Sharma."
              >
                <HomePage />
              </PageMeta>
            }
          />
          <Route
            path="/about"
            element={
              <PageMeta
                title="About Us & Sterilization Standards"
                description="Learn about Akansha Dental Clinic, our class-B autoclave sterilization protocols, digital OPG X-ray, and clinical philosophy in Bhopal."
              >
                <AboutUsPage />
              </PageMeta>
            }
          />
          <Route
            path="/doctors"
            element={
              <PageMeta
                title="Our Specialist Dentists & Surgeons"
                description="Meet Dr. Akansha Sharma and our specialist team of orthodontists, endodontists, and oral surgeons in Bhopal."
              >
                <DoctorsPage />
              </PageMeta>
            }
          />
          <Route
            path="/services"
            element={
              <PageMeta
                title="Dental Treatments & Procedures"
                description="Comprehensive dental treatments: Immediate Dental Implants, Microscopic RCT, Clear Aligners, Laser Teeth Whitening, and Pediatric Dentistry."
              >
                <ServicesPage />
              </PageMeta>
            }
          />
          <Route
            path="/services/:id"
            element={
              <PageMeta
                title="Treatment Details & Indications"
                description="Clinical details, procedure overview, recovery timeline, and transparent pricing for specialized dental care in Bhopal."
              >
                <ServiceDetailPage />
              </PageMeta>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <PageMeta
                title="Book Dental Appointment Online"
                description="Reserve a confirmed OPD appointment with Dr. Akansha Sharma. Real-time slot availability, instant SMS confirmation, and no waiting time."
              >
                <AppointmentBookingPage />
              </PageMeta>
            }
          />
          <Route
            path="/contact"
            element={
              <PageMeta
                title="Contact Clinic & Location Map"
                description="Visit Akansha Dental Clinic at Raj Business Park, Minal Residency, Bhopal. Call +91 8130406405 or get directions on Google Maps."
              >
                <ContactUsPage />
              </PageMeta>
            }
          />
          <Route
            path="/gallery"
            element={
              <PageMeta
                title="Smile Transformations Gallery"
                description="Before and after smiles, advanced operatory photos, and patient testimonials from our clinic in Bhopal."
              >
                <GalleryPage />
              </PageMeta>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <PageMeta
                title="Patient Privacy Policy"
                description="Patient health information privacy practices, HIPAA compliance standards, and medical confidentiality policy."
              >
                <PrivacyPolicyPage />
              </PageMeta>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <PageMeta
                title="Clinic Terms & Patient Charter"
                description="Appointment terms, clinical safety guidelines, payment methods, and cancellation policies at Akansha Dental Clinic."
              >
                <TermsConditionsPage />
              </PageMeta>
            }
          />
          <Route
            path="*"
            element={
              <PageMeta
                title="Page Not Found (404)"
                description="The dental clinic page you are looking for does not exist or has been moved."
              >
                <NotFoundPage />
              </PageMeta>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
