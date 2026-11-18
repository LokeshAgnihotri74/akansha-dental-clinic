import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import inquiryService from '../../services/inquiryService';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';

export default function ContactUsPage() {
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await inquiryService.submitInquiry({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      showToast('Thank you! Your message has been sent to our clinical team.', 'success');
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      showToast(err.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Get in Touch
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            Contact Akansha Dental Clinic
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.1rem' }}>
            Have questions regarding treatment plans, costs, or dental insurance? Our patient desk is here to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '3.5rem', alignItems: 'flex-start' }}>
            {/* Left Info Column */}
            <div>
              <span className="section-tag">Direct Lines</span>
              <h2 className="section-title">We are Here to Help</h2>
              <p style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
                Walk-ins are welcomed for emergencies, though scheduling an advance appointment ensures guaranteed zero-waiting-time specialist attention.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}
                  title="Click to get directions on Google Maps"
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={22} color="var(--color-accent-hover)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>Clinic Location</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, Madhya Pradesh 462041</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-hover)', fontWeight: 600 }}>● Click to open Google Maps Directions</span>
                  </div>
                </a>

                <a
                  href="tel:+919399354201"
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}
                  title="Click to call Akansha Dental Clinic"
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={22} color="var(--color-accent-hover)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>Reception & Helpline</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>+91 9399354201</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-hover)', fontWeight: 600 }}>● Click to call now</span>
                  </div>
                </a>

                <a
                  href="tel:+919399354201"
                  style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}
                  title="Click for 24/7 Dental Emergency Helpline"
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF2F2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={22} color="#EF4444" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem', color: '#991B1B' }}>24/7 Dental Emergency</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>+91 9399354201 (Immediate triage & pain relief)</p>
                    <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>● Click for emergency call</span>
                  </div>
                </a>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={22} color="var(--color-accent-hover)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>Email Support</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>care@akanshadental.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={22} color="var(--color-accent-hover)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>Operating Hours</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Monday - Saturday: 9:00 AM - 10:00 PM</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sunday: 10:00 AM - 2:00 PM (Emergency & Scheduled)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Send Us a Message</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
                Fill out the form below and a clinical coordinator will contact you within 2 business hours.
              </p>

              {submitted && (
                <div style={{ padding: '1.25rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={22} />
                  <span>Your consultation message has been submitted. Our doctor desk will reply shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Meera Joshi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="meera@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Clear Aligners EMI Inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide details about your query or dental requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" loading={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
                  <Send size={16} />
                  Submit Consultation Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Google Maps */}
      <section style={{ height: '450px', width: '100%', borderTop: '1px solid var(--color-border)' }}>
        <iframe
          title="Akansha Dental Clinic Google Maps"
          src="https://maps.google.com/maps?q=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
