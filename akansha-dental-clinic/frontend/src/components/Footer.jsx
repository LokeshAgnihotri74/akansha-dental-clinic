import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import DentalLogo from './DentalLogo';

export default function Footer() {
  return (
    <footer className="clinic-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand & Bio */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 212, 178, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 212, 178, 0.3)'
              }}>
                <DentalLogo size={28} light={true} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Akansha Dental</h4>
                <p style={{ margin: 0, color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinic & Implant Center</p>
              </div>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Setting the standard in compassionate, state-of-the-art dental healthcare. We combine microscopic precision, digital workflows, and painless anesthesia for healthy, beautiful smiles.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#CBD5E1', fontSize: '0.75rem' }}>
              <ShieldCheck size={16} color="var(--color-accent)" />
              <span>NABH & ISO 9001:2015 Hygiene Standards</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/about">About Our Practice</Link></li>
              <li><Link to="/doctors">Certified Specialists</Link></li>
              <li><Link to="/services">Dental Treatments</Link></li>
              <li><Link to="/gallery">Clinic Facility & Tech</Link></li>
              <li><Link to="/book-appointment">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Column 3: Treatments */}
          <div className="footer-col">
            <h4>Key Treatments</h4>
            <ul className="footer-links">
              <li><Link to="/services">Precision Dental Implants</Link></li>
              <li><Link to="/services">Single-Sitting Root Canal</Link></li>
              <li><Link to="/services">Clear Aligners & Braces</Link></li>
              <li><Link to="/services">Laser Teeth Whitening</Link></li>
              <li><Link to="/services">Ceramic Porcelain Veneers</Link></li>
              <li><Link to="/services">Gentle Pediatric Care</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Emergency */}
          <div className="footer-col">
            <h4>Contact & Hours</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: '#CBD5E1', textDecoration: 'none' }}
                  title="Click to get directions on Google Maps"
                >
                  <MapPin size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, Madhya Pradesh 462041</span>
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href="tel:+919399354201"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                  title="Click to call Akansha Dental Clinic"
                >
                  <Phone size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <span>+91 9399354201</span>
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <a href="mailto:care@akanshadental.com" style={{ color: '#CBD5E1' }}>care@akanshadental.com</a>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Clock size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Mon - Sat: 9:00 AM - 10:00 PM</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Sunday: 10:00 AM - 2:00 PM (Emergency)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Akansha Dental Clinic. All clinical rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy-policy" style={{ color: '#94A3B8' }}>Privacy Policy</Link>
            <Link to="/terms-and-conditions" style={{ color: '#94A3B8' }}>Terms of Service</Link>
            <Link to="/contact" style={{ color: '#94A3B8' }}>Patient Inquiries</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
