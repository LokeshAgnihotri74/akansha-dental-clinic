import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Phone } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '520px' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
          4<span style={{ color: 'var(--color-accent)' }}>0</span>4
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          The dental page or resource you are looking for has been moved or does not exist. Please navigate back to our main clinic portal.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            Return Home
          </Link>
          <Link to="/book-appointment" className="btn btn-outline">
            <Calendar size={18} />
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
