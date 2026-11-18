import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Heart, CheckCircle2, Calendar, Sparkles } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            About Our Practice
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            Elevating Dental Care Standards
          </h1>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.1rem' }}>
            Founded on the core principles of clinical excellence, painless procedures, and compassionate care.
          </p>
        </div>
      </section>

      {/* Founder & Clinic Story */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Our Philosophy</span>
              <h2 className="section-title">A New Era in Gentle, Modern Dentistry</h2>
              <p style={{ marginBottom: '1.25rem', lineHeight: 1.7 }}>
                Established in Bhopal, Madhya Pradesh, <strong>Akansha Dental Clinic</strong> was created to transform the conventional dental visit into a stress-free, empowering healthcare journey. Led by <strong>Dr. Akansha Mishra</strong> (BDS, MDS - Prosthodontics & Implantology), our team brings more than 12 years of specialized clinical experience to every treatment.
              </p>
              <p style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
                We refuse to adopt one-size-fits-all treatments. Whether performing single-visit root canal preservation or multi-stage full-mouth implant restorations, every procedure begins with 3D digital visualization so you understand each step before treatment begins.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--color-accent-hover)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>NABH Sterilization Protocols</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--color-accent-hover)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Computerized Local Anesthesia</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--color-accent-hover)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Transparent Pricing with No Hidden Fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--color-accent-hover)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Digital 3D Intraoral Impressions</span>
                </div>
              </div>

              <Link to="/book-appointment" className="btn btn-primary">
                <Calendar size={18} />
                Schedule a Consultation
              </Link>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=900"
                alt="Dr. Akansha Mishra - Chief Dental Surgeon & Implantologist"
                style={{ width: '100%', height: '480px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '4px solid #fff' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hospital-Grade Safety & Technology */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Sterility & Safety</span>
            <h2 className="section-title">Zero-Compromise Hygiene Standards</h2>
            <p>Your health and peace of mind are non-negotiable. We adhere to multi-barrier infection control protocols.</p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Class-B Vacuum Autoclaves</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Every non-disposable instrument undergoes 5-step ultrasonic cleaning, sealing in medical-grade sterilization pouches, and vacuum steam autoclaving at 134°C with chemical indicator strips.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Low-Dose Digital OPG Radiography</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Our digital panoramic X-ray unit reduces patient radiation exposure by over 80% compared to traditional film while producing ultra-crisp diagnostic views in under 12 seconds.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Heart size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Comfort Sedation & Anesthesia</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                For anxious patients or lengthy procedures, we offer computerized needle-free topical analgesia and mild nitrous oxide sedation to guarantee an anxiety-free visit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
