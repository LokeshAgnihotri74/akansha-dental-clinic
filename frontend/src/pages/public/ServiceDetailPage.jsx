import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import catalogService from '../../services/catalogService';
import Spinner from '../../components/Spinner';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await catalogService.getServiceById(id);
        if (res?.data) setService(res.data);
      } catch (err) {
        console.error('Failed to load dental service details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  if (loading) return <Spinner message="Loading treatment details..." />;
  if (!service) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Treatment Not Found</h2>
        <p>The requested dental treatment could not be found in our clinical catalog.</p>
        <Link to="/services" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to All Treatments
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '3.5rem 0' }}>
        <div className="container">
          <Link to="/services" style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Back to All Treatments
          </Link>
          <span style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>
            {service.category}
          </span>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0.25rem 0 1rem' }}>
            {service.name}
          </h1>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Clock size={18} color="var(--color-accent)" />
              Duration: <strong>{service.durationMinutes} Minutes</strong>
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              Standard Fee: ₹{service.price?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* Main Details */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem', alignItems: 'flex-start' }}>
            {/* Left Content */}
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Treatment Overview</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text)', marginBottom: '2.5rem' }}>
                {service.description}
              </p>

              {/* Step by Step Clinical Workflow */}
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Step-by-Step Clinical Procedure</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Digital Diagnostics & Clinical Examination</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Comprehensive oral assessment using high-resolution intraoral imaging and low-dose digital radiography.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Treatment Planning & Consultation</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Review of findings, visual simulation of anticipated results, and step-by-step transparent fee discussion.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Painless Clinical Execution</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Procedure performed by our specialist under computerized gentle local anesthesia with sterile barrier isolation.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    4
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Post-Procedure Review & Maintenance</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Detailed aftercare guidelines, prescription instructions, and follow-up consultation schedule.</p>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <HelpCircle size={18} color="var(--color-accent-hover)" />
                    Will I experience any pain during this procedure?
                  </h4>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Our clinic utilizes computerized local anesthesia and advanced sedation protocols. Most patients report feeling zero pain and only gentle vibration during the treatment.
                  </p>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <HelpCircle size={18} color="var(--color-accent-hover)" />
                    How many visits are typically required?
                  </h4>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Thanks to rotary endodontics and single-sitting protocols, routine root canals and whitening are completed in a single 45-minute visit. Implant crowns or aligners involve structured multi-phase appointments.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Booking Sidebar Card */}
            <div className="card" style={{ position: 'sticky', top: '100px', border: '2px solid var(--color-accent)' }}>
              <span className="badge badge-confirmed" style={{ marginBottom: '1rem' }}>Available for Booking</span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Book This Treatment</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Reserve a guaranteed time slot with our certified dental specialists.
              </p>

              <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Procedure Duration:</span>
                  <strong>{service.durationMinutes} Mins</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Specialist Category:</span>
                  <strong>{service.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <span>Clinical Fee:</span>
                  <span>₹{service.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                to={`/book-appointment?serviceId=${service.id}`}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                <Calendar size={18} />
                Reserve Slot Online
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={16} color="var(--color-accent-hover)" />
                <span>Zero pre-payment required to book</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
