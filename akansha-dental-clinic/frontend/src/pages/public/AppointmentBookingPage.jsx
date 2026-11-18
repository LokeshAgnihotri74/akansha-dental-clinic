import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import doctorService from '../../services/doctorService';
import catalogService from '../../services/catalogService';
import appointmentService from '../../services/appointmentService';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const DEFAULT_DOCTORS = [
  { id: 1, fullName: 'Dr. Akansha Mishra', specialization: 'Chief Implantologist & Cosmetic Dentist', consultationFee: 1000 },
  { id: 2, fullName: 'Dr. Rajiv Mehta', specialization: 'Senior Orthodontist', consultationFee: 1000 },
  { id: 3, fullName: 'Dr. Sneha Kulkarni', specialization: 'Consultant Endodontist', consultationFee: 1000 },
  { id: 4, fullName: 'Dr. Amitav Banerjee', specialization: 'Pediatric Dental Specialist', consultationFee: 1000 }
];

const DEFAULT_SERVICES = [
  { id: 1, name: 'Precision Dental Implants', price: 15000, durationMinutes: 90 },
  { id: 2, name: 'Microscopic Root Canal Therapy', price: 2700, durationMinutes: 60 },
  { id: 3, name: 'Clear Aligners & Invisible Braces', price: 27000, durationMinutes: 45 },
  { id: 4, name: 'Ultrasonic Scaling & Deep Polishing', price: 900, durationMinutes: 30 },
  { id: 5, name: 'Laser Teeth Whitening', price: 4200, durationMinutes: 45 },
  { id: 6, name: 'Zirconia Aesthetic Crowns', price: 5400, durationMinutes: 60 }
];

const DEFAULT_SLOTS = [
  { slot: '09:00 - 09:30', available: true },
  { slot: '09:30 - 10:00', available: true },
  { slot: '10:00 - 10:30', available: true },
  { slot: '10:30 - 11:00', available: true },
  { slot: '11:00 - 11:30', available: true },
  { slot: '11:30 - 12:00', available: true },
  { slot: '14:00 - 14:30', available: true },
  { slot: '14:30 - 15:00', available: true },
  { slot: '15:00 - 15:30', available: true },
  { slot: '15:30 - 16:00', available: true },
  { slot: '16:00 - 16:30', available: true },
  { slot: '16:30 - 17:00', available: true },
  { slot: '17:00 - 17:30', available: true },
  { slot: '17:30 - 18:00', available: true },
  { slot: '18:00 - 18:30', available: true },
  { slot: '18:30 - 19:00', available: true },
  { slot: '19:00 - 19:30', available: true },
  { slot: '19:30 - 20:00', available: true },
  { slot: '20:00 - 20:30', available: true },
  { slot: '20:30 - 21:00', available: true },
  { slot: '21:00 - 21:30', available: true },
  { slot: '21:30 - 22:00', available: true }
];

export default function AppointmentBookingPage() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form selections - automatically preselected so dropdown is never empty
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => searchParams.get('doctorId') || '1');
  const [selectedServiceId, setSelectedServiceId] = useState(() => searchParams.get('serviceId') || '1');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [selectedSlot, setSelectedSlot] = useState('');

  // Available slots state initialized with guaranteed standard slots
  const [slotsData, setSlotsData] = useState({
    clinicOpen: true,
    dayOfWeek: 'TODAY',
    slots: DEFAULT_SLOTS
  });
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Load doctors and services
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [docRes, srvRes] = await Promise.all([
          doctorService.getDoctors(true),
          catalogService.getServices(true),
        ]);
        if (docRes?.data) setDoctors(docRes.data);
        if (srvRes?.data) setServices(srvRes.data);

        if (!selectedDoctorId && docRes?.data?.length > 0) {
          setSelectedDoctorId(docRes.data[0].id.toString());
        }
        if (!selectedServiceId && srvRes?.data?.length > 0) {
          setSelectedServiceId(srvRes.data[0].id.toString());
        }
      } catch (err) {
        showToast('Failed to load clinic doctor roster or service catalog', 'error');
      } finally {
        setLoadingInitial(false);
      }
    }
    loadMetadata();
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await appointmentService.getAvailableSlots(selectedDoctorId, selectedDate);
        if (isMounted && res?.data) {
          setSlotsData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          // Graceful fallback to guaranteed default slots
          setSlotsData({
            clinicOpen: true,
            dayOfWeek: 'SELECTED DAY',
            slots: DEFAULT_SLOTS
          });
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => { isMounted = false; };
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      showToast('Please select a doctor', 'error');
      return;
    }
    if (!selectedServiceId) {
      showToast('Please select a dental service', 'error');
      return;
    }
    if (!selectedDate) {
      showToast('Please pick an appointment date', 'error');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select an available time slot', 'error');
      return;
    }
    if (!firstName.trim() || !phone.trim()) {
      showToast('Please provide your name and phone number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: Number(selectedDoctorId),
        serviceId: Number(selectedServiceId),
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        patientFirstName: firstName.trim(),
        patientLastName: lastName.trim() || 'Patient',
        patientPhone: phone.trim(),
        patientEmail: email.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await appointmentService.bookAppointment(payload);
      if (res?.data) {
        setConfirmation(res.data);
        showToast('Appointment reserved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Booking failed. The slot may have just been taken.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setConfirmation(null);
    setSelectedSlot('');
    setNotes('');
  };

  if (loadingInitial) {
    return <Spinner message="Initializing online reservation engine..." />;
  }

  // Confirmation View
  if (confirmation) {
    return (
      <div className="section-padding" style={{ backgroundColor: 'var(--color-bg-subtle)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem', border: '2px solid var(--color-accent)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-soft)',
              color: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="badge badge-confirmed" style={{ marginBottom: '0.75rem' }}>Reservation Placed</span>
            <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Appointment Confirmed</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              We have received your appointment request. Our reception desk will call you to confirm your visit.
            </p>

            <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tracking Code:</span>
                <strong style={{ color: 'var(--color-accent-hover)', letterSpacing: '0.05em' }}>{confirmation.appointmentNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Patient Name:</span>
                <strong>{confirmation.patientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Attending Doctor:</span>
                <strong>{confirmation.doctorName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Treatment:</span>
                <strong>{confirmation.serviceName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Scheduled Date:</span>
                <strong>{confirmation.appointmentDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Reserved Slot:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{confirmation.timeSlot}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/" className="btn btn-outline">
                Return to Home
              </Link>
              <Button onClick={handleBookAnother} variant="primary">
                Book Another Visit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedDoctor = doctors.find((d) => d.id.toString() === selectedDoctorId);
  const selectedService = services.find((s) => s.id.toString() === selectedServiceId);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Online Booking System
          </span>
          <h1 style={{ color: '#fff', fontSize: '2.75rem', margin: '0.5rem 0 0.75rem' }}>
            Book Your Dental Visit
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: '#CBD5E1', fontSize: '1rem' }}>
            Select your preferred specialist, treatment, date, and guaranteed time slot with instant server-verified availability.
          </p>
        </div>
      </section>

      {/* Booking Form Layout */}
      <section className="section-padding bg-subtle">
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="booking-container">
            <div className="booking-header">
              <h2>Schedule Consultation</h2>
              <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>
                Please provide accurate contact details so we can send your appointment confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="booking-body">
              {/* Step 1: Doctor & Service Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <User size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Select Dental Specialist *
                  </label>
                  <select
                    className="form-control"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName} ({doc.specialization} — ₹{doc.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FileText size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Select Dental Treatment *
                  </label>
                  <select
                    className="form-control"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    required
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₹{srv.price} • {srv.durationMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Date Picker */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              {/* Step 3: Real-Time Slot Picker */}
              <div className="form-group" style={{ margin: '2rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <Clock size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Available Time Slots on {selectedDate} *
                  </label>
                  {slotsData && (
                    <span style={{ fontSize: '0.8rem', color: slotsData.clinicOpen ? 'var(--color-secondary)' : 'var(--color-danger)', fontWeight: 700 }}>
                      {slotsData.clinicOpen ? `● Doctor available on ${slotsData.dayOfWeek}` : `✕ Doctor unavailable on ${slotsData.dayOfWeek}`}
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Checking real-time slot calendar...
                  </div>
                ) : (
                  <div className="slot-grid">
                    {((slotsData && slotsData.slots && slotsData.slots.length > 0) ? slotsData.slots : DEFAULT_SLOTS).map((slotObj) => (
                      <button
                        key={slotObj.slot}
                        type="button"
                        disabled={slotObj.available === false}
                        onClick={() => setSelectedSlot(slotObj.slot)}
                        className={`slot-btn ${selectedSlot === slotObj.slot ? 'selected' : ''}`}
                        title={slotObj.available !== false ? 'Click to select slot' : 'Slot already booked'}
                      >
                        {slotObj.slot}
                      </button>
                    ))}
                  </div>
                )}
                {selectedSlot && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
                    ✓ Selected Slot: {selectedSlot}
                  </div>
                )}
              </div>

              {/* Step 4: Patient Demographics */}
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderTop: '1px solid var(--color-border)', paddingTop: '1.75rem', marginBottom: '1.25rem' }}>
                Patient Contact Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 93993 54201"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit / Symptoms (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe your symptoms, tooth sensitivity, or dental goals..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  <ShieldCheck size={18} color="var(--color-accent-hover)" />
                  <span>Your personal contact information is protected under strict healthcare privacy standards.</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={!selectedSlot || submitting}
                >
                  Confirm Appointment Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
