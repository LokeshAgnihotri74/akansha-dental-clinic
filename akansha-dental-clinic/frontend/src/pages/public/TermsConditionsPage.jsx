import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div>
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Terms & Conditions of Service</h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem' }}>Clinical Treatment Guidelines • Akansha Dental Clinic</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="card" style={{ padding: '3rem', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>1. Appointment Reservations & Scheduling</h2>
            <p>
              Submitting an online appointment reservation reserves a clinical time slot with the selected dentist. Our reception will contact you by telephone or messaging to re-confirm your attendance. Please arrive 10 minutes prior to your designated slot for diagnostic preparation.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>2. Cancellation & Rescheduling Policy</h2>
            <p>
              If you need to reschedule or cancel your appointment, we request at least 24 hours advance notification so that the designated specialist slot can be released to patients needing emergency or urgent dental care.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>3. Treatment Plans & Estimates</h2>
            <p>
              All clinical treatment fees displayed on our web catalog represent standard base pricing. Individual clinical fees may vary depending on tooth anatomy, degree of infection, bone density, or specialized prosthetic materials required after clinical examination. Detailed written treatment plans are provided prior to initiating major restorative procedures.
            </p>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '2rem 0 1rem' }}>4. Medical Disclosure Requirement</h2>
            <p>
              Patients are required to provide complete and accurate information concerning current medications, systemic health conditions (such as diabetes, cardiovascular disease, hypertension, or pregnancy), and known drug or latex allergies to ensure surgical and anesthesia safety.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
