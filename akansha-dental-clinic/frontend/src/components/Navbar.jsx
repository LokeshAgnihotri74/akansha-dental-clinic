import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Phone, Clock, MapPin, Calendar, Menu, X, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DentalLogo from './DentalLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="clinic-header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-links">
            <a
              href="tel:+919399354201"
              style={{ color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              title="Click to call Akansha Dental Clinic"
            >
              <Phone size={13} color="var(--color-accent)" />
              <span>+91 9399354201</span>
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={13} color="var(--color-accent)" />
              <span>Mon - Sat: 9:00 AM - 10:00 PM</span>
            </span>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              title="Click to get directions on Google Maps"
            >
              <MapPin size={13} color="var(--color-accent)" />
              <span>Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, MP 462041</span>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href="tel:+919399354201"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#FCD34D', fontWeight: 700, textDecoration: 'none' }}
              title="Click to call 24/7 Dental Emergency Helpline"
            >
              <ShieldAlert size={13} />
              <span>24/7 Emergency: +91 9399354201</span>
            </a>
            {isAuthenticated ? (
              <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                <UserCheck size={13} />
                <span>Console ({user?.username})</span>
              </Link>
            ) : (
              <Link to="/admin/login" style={{ color: '#94A3B8', fontWeight: 600 }}>
                Staff Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container nav-container">
        <Link to="/" className="logo-brand" onClick={closeMobileMenu}>
          <div className="logo-icon-box">
            <DentalLogo size={28} light={true} />
          </div>
          <div>
            <div className="brand-text-title">Akansha Dental</div>
            <div className="brand-text-sub">Clinic & Implant Center</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About Us</NavLink></li>
            <li><NavLink to="/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Our Doctors</NavLink></li>
            <li><NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Services</NavLink></li>
            <li><NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Gallery</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact Us</NavLink></li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/book-appointment" className="btn btn-primary" style={{ display: 'none' }} id="desktop-book-btn">
            <Calendar size={16} />
            Book Appointment
          </Link>

          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'flex',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              padding: '0.4rem',
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#fff',
          borderTop: '1px solid var(--color-border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <li><NavLink to="/" onClick={closeMobileMenu} className="nav-link">Home</NavLink></li>
            <li><NavLink to="/about" onClick={closeMobileMenu} className="nav-link">About Us</NavLink></li>
            <li><NavLink to="/doctors" onClick={closeMobileMenu} className="nav-link">Our Doctors</NavLink></li>
            <li><NavLink to="/services" onClick={closeMobileMenu} className="nav-link">Dental Services</NavLink></li>
            <li><NavLink to="/gallery" onClick={closeMobileMenu} className="nav-link">Gallery</NavLink></li>
            <li><NavLink to="/contact" onClick={closeMobileMenu} className="nav-link">Contact Us</NavLink></li>
            {isAuthenticated ? (
              <li><NavLink to="/admin" onClick={closeMobileMenu} className="nav-link" style={{ color: 'var(--color-accent-hover)' }}>Admin Console</NavLink></li>
            ) : (
              <li><NavLink to="/admin/login" onClick={closeMobileMenu} className="nav-link">Staff Login</NavLink></li>
            )}
          </ul>
          <Link to="/book-appointment" onClick={closeMobileMenu} className="btn btn-primary" style={{ width: '100%' }}>
            <Calendar size={16} />
            Book Appointment
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: block !important; }
          #desktop-book-btn { display: inline-flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
