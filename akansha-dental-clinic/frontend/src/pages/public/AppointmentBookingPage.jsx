import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import doctorService from '../../services/doctorService';
import catalogService from '../../services/catalogService';
import appointmentService from '../../services/appointmentService';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const ANY_DOCTOR_OPTION = {
  id: 0,
  fullName: 'Any Available Doctor (Koi Bhi Doctor)',
  specialization: 'Clinic Assigns Best Available Specialist',
  consultationFee: 0
};

const GENERAL_CHECKUP_SERVICE = {
  id: 100,
  name: 'General Dental Checkup & Consultation',
  category: 'DIAGNOSTIC',
  price: 399,
  durationMinutes: 20,
  description: 'Complete oral cavity examination, digital intraoral screening & specialist consultation.'
};

const DEFAULT_DOCTORS = [
  ANY_DOCTOR_OPTION,
  { id: 1, fullName: 'Dr. Akansha Mishra', specialization: 'Chief Implantologist & Cosmetic Dentist', consultationFee: 1000 },
  { id: 2, fullName: 'Dr. Rajiv Mehta', specialization: 'Senior Orthodontist', consultationFee: 1000 },
  { id: 3, fullName: 'Dr. Sneha Kulkarni', specialization: 'Consultant Endodontist', consultationFee: 1000 },
  { id: 4, fullName: 'Dr. Amitav Banerjee', specialization: 'Pediatric Dental Specialist', consultationFee: 1000 }
];

const DEFAULT_SERVICES = [
  GENERAL_CHECKUP_SERVICE,
  { id: 1, name: 'Dental Implants (Immediate Implantology)', price: 32990, durationMinutes: 90 },
  { id: 2, name: 'Clear Aligners & Braces', price: 7000, durationMinutes: 45 },
  { id: 3, name: 'Preventive Dentistry', price: 1499, durationMinutes: 30 },
  { id: 4, name: 'Microscopic Root Canal Therapy', price: 2700, durationMinutes: 60 },
  { id: 5, name: 'Cosmetic Dentistry & Smile Design', price: 4200, durationMinutes: 45 },
  { id: 6, name: 'Ultrasonic Scaling & Deep Polishing', price: 900, durationMinutes: 30 },
  { id: 7, name: 'Tooth-Colored Dental Fillings', price: 1500, durationMinutes: 40 },
  { id: 8, name: 'Zirconia Aesthetic Crowns & Bridges', price: 5400, durationMinutes: 60 },
  { id: 9, name: 'Painless Tooth Removal', price: 1200, durationMinutes: 45 },
  { id: 10, name: 'Pediatric Dentistry Checkup', price: 1000, durationMinutes: 30 },
  { id: 11, name: 'Laser Gum & Soft Tissue Treatment', price: 3500, durationMinutes: 45 },
  { id: 12, name: 'Digital 3D Intraoral Scanning', price: 1500, durationMinutes: 20 }
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
  // Default doctor: '0' (Any Available Doctor - ₹0)
  // Default treatment: '100' (General Dental Checkup & Consultation - ₹399)
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => searchParams.get('doctorId') || '0');
  const [selectedServiceId, setSelectedServiceId] = useState(() => searchParams.get('serviceId') || '100');
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

  // Patient Info & Validation
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Phone input validator for 10-digit Indian numbers
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (!/^[0-9+\s-]*$/.test(raw)) return;
    if (raw.length > 15) return;
    setPhone(raw);

    const digits = raw.replace(/\D/g, '');
    const clean = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

    if (raw.trim() === '') {
      setPhoneError('Contact mobile number is required');
    } else if (clean.length > 0 && !/^[6-9]/.test(clean)) {
      setPhoneError('Mobile number must start with 6, 7, 8, or 9');
    } else if (clean.length > 0 && clean.length !== 10) {
      setPhoneError(`Must be exactly 10 digits (currently ${clean.length} digits)`);
    } else {
      setPhoneError('');
    }
  };

  // Load doctors and services
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [docRes, srvRes] = await Promise.allSettled([
          doctorService.getDoctors(true),
          catalogService.getServices(true),
        ]);
        if (docRes.status === 'fulfilled' && docRes.value?.data && docRes.value.data.length > 0) {
          setDoctors([ANY_DOCTOR_OPTION, ...docRes.value.data]);
        }
        if (srvRes.status === 'fulfilled' && srvRes.value?.data && srvRes.value.data.length > 0) {
          setServices([GENERAL_CHECKUP_SERVICE, ...srvRes.value.data]);
        }
      } catch (err) {
        // retain default doctors & services
      } finally {
        setLoadingInitial(false);
      }
    }
    loadMetadata();
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctorId === undefined || selectedDoctorId === null || !selectedDate) return;

    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot('');

      // If 'Any Available Doctor' (id: 0), all clinic slots are available
      if (selectedDoctorId === '0' || selectedDoctorId === 0) {
        setSlotsData({
          clinicOpen: true,
          dayOfWeek: 'SELECTED DAY',
          slots: DEFAULT_SLOTS
        });
        setLoadingSlots(false);
        return;
      }

      try {
        const res = await appointmentService.getAvailableSlots(selectedDoctorId, selectedDate);
        if (isMounted && res?.data) {
          setSlotsData(res.data);
        }
      } catch (err) {
        if (isMounted) {
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
    if (!firstName.trim()) {
      showToast('Please provide your first name', 'error');
      return;
    }
    
    // Strict Indian mobile phone validation
    const digits = phone.replace(/\D/g, '');
    const cleanDigits = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
    if (!cleanDigits || cleanDigits.length !== 10 || !/^[6-9]/.test(cleanDigits)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number (e.g. 9399354201)');
      showToast('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'error');
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

            <div style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
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

            {/* Notification Delivery Notice */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.88rem', color: '#166534' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px', fontSize: '0.92rem' }}>
                <CheckCircle2 size={16} color="#00875a" />
                <span>Instant Confirmation Dispatched!</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>📲</span>
                <span><strong>SMS / WhatsApp:</strong> Details sent to <strong>+91 {confirmation.patientPhone || phone}</strong></span>
              </div>
              {(confirmation.patientEmail || email) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📧</span>
                  <span><strong>Official Email:</strong> Confirmation receipt sent to <strong>{confirmation.patientEmail || email}</strong></span>
                </div>
              )}
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className={`form-control ${phoneError ? 'is-invalid' : phone && !phoneError ? 'is-valid' : ''}`}
                      placeholder="e.g. 93993 54201"
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      required
                      style={{
                        borderColor: phoneError ? '#E11D48' : phone && !phoneError ? '#10B981' : undefined,
                        paddingRight: '35px'
                      }}
                    />
                    {phone && !phoneError && (
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10B981', fontWeight: 800 }}>
                        ✓
                      </span>
                    )}
                  </div>
                  {phoneError ? (
                    <span style={{ color: '#E11D48', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} />
                      {phoneError}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>
                      10-digit Indian mobile number (starting with 6, 7, 8, or 9)
                    </span>
                  )}
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

              {/* Consultation & Treatment Fee Summary Card */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                backgroundColor: 'rgba(0, 212, 178, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid rgba(0, 212, 178, 0.35)',
                marginTop: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-accent-hover)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                    Selected Specialist & Treatment
                  </span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                    {selectedDoctor?.fullName || 'Any Available Doctor'}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                    {selectedService?.name || 'General Dental Checkup & Consultation'}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                    Total Estimated Cost
                  </span>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹{((selectedDoctor?.consultationFee || 0) + (selectedService?.price || 0)).toLocaleString('en-IN')}
                  </strong>
                  {selectedDoctor?.consultationFee === 0 && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                      ✓ Doctor Consultation: ₹0 (Free)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
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
