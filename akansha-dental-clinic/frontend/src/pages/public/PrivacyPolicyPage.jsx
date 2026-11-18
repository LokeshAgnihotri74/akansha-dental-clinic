import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Privacy & Data Protection Policy</h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem' }}>Last Updated: November 2026 • Akansha Dental Clinic</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="card" style={{ padding: '3rem', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>1. Patient Information Privacy</h2>
            <p>
              Akansha Dental Clinic is strictly committed to safeguarding the privacy and confidentiality of your personal, demographic, and medical health records. We collect only information essential to your diagnostic evaluation, dental treatment planning, and appointment scheduling.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>2. Information Collected</h2>
            <p>
              When you use our online portal, we collect contact information (Full Name, Phone Number, Email Address) and medical details you voluntarily provide (Symptoms, Notes, Drug Allergies). Under no circumstances is patient information sold, rented, or shared with third-party advertisers.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>3. Data Security & Storage</h2>
            <p>
              All online interactions, authentication sessions, and appointment submissions are encrypted in transit using industry-standard TLS/HTTPS protocols. Our database implements least-privilege role-based access control, ensuring only authorized clinical staff can review patient records.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>4. Medical Records Retention</h2>
            <p>
              In compliance with healthcare medical council guidelines, clinical diagnostic records, treatment histories, and digital X-rays are retained securely for the statutory required duration. Patients retain the right to request access to copies of their dental charts and radiographs.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>5. Contact the Privacy Officer</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact our administrative desk at <strong>care@akanshadental.com</strong> or call <strong>+91 9399354201</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
