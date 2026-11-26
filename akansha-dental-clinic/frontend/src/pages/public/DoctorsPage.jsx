import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Award,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Stethoscope,
  MapPin,
  X,
  FileText,
  UserCheck,
  Shield
} from 'lucide-react';
import doctorService from '../../services/doctorService';
import Spinner from '../../components/Spinner';

const DEFAULT_DOCTORS = [
  {
    id: 1,
    name: 'Dr. Akansha Sharma',
    fullName: 'Dr. Akansha Sharma',
    qualification: 'BDS, MDS - Oral & Maxillofacial Implantology (Gold Medalist)',
    specialization: 'Senior Implantologist & Cosmetic Surgeon',
    experienceYears: 14,
    consultationFee: 500,
    department: 'Department of Oral Implantology & Aesthetics',
    roomNo: 'Executive Suite 101',
    languages: 'English, Hindi',
    email: 'dr.akansha@akanshadental.com',
    phone: '+91 8130 406 405',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    bio: 'Specialist in immediate dental implants, full-arch restorations, and advanced bone grafting with over 14 years of surgical mastery.',
    detailedBio: 'Dr. Akansha Sharma is the Chief Medical Director and Senior Implantologist at Akansha Dental Clinic. With over 14 years of clinical excellence and international fellowship in computer-guided implantology, she has successfully performed more than 4,500 dental implant surgeries and full-mouth rehabilitations. Her clinical practice focuses on immediate-load implants, sinus lifts, piezo-bone surgery, and smile redesigning. She believes in empathetic, evidence-based dentistry, ensuring that every patient receives minimally invasive surgical care within an ultra-sterile, Class-B autoclave operating room.',
    procedures: ['Immediate Dental Implants', 'Full-Arch All-on-4 / All-on-6', 'Sinus Lift & Bone Grafting', 'Digital Smile Design (DSD)', 'Cosmetic Gum Contouring'],
    scheduleText: 'Monday to Saturday (Morning: 10:00 AM - 01:30 PM | Evening: 05:00 PM - 08:30 PM). Sunday by prior appointment.',
    schedules: [
      { dayOfWeek: 'MONDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'MONDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '10:00 AM', endTime: '01:30 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' }
    ]
  },
  {
    id: 2,
    name: 'Dr. Rajesh Deshmukh',
    fullName: 'Dr. Rajesh Deshmukh',
    qualification: 'BDS, MDS - Endodontics & Conservative Dentistry',
    specialization: 'Chief Endodontist & Microscopic RCT Specialist',
    experienceYears: 12,
    consultationFee: 400,
    department: 'Department of Microscopic Endodontics',
    roomNo: 'Suite 102',
    languages: 'English, Hindi, Marathi',
    email: 'dr.rajesh@akanshadental.com',
    phone: '+91 8130 406 405',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    bio: 'Expert in painless single-sitting root canal treatments, smile redesigns, and tooth-colored composite restorations.',
    detailedBio: 'Dr. Rajesh Deshmukh is our Senior Endodontist recognized for his delicate touch and expertise in high-magnification dental microscopy. Having treated over 6,000 complex root canal cases, he specializes in single-visit painless RCTs, re-treatments of failed canals, separated instrument retrieval, and vital pulp therapy. His clinical philosophy centers on tooth conservation, avoiding unnecessary extractions wherever natural dentition can be biologically preserved.',
    procedures: ['Single-Sitting Microscopic RCT', 'Rotary Endodontics & Apex Locators', 'Bio-Ceramic Root Canal Sealing', 'Tooth Colored Nano-Hybrid Fillings', 'Inlays & Onlays Restorations'],
    scheduleText: 'Monday to Saturday (Morning: 10:30 AM - 02:00 PM | Evening: 05:30 PM - 08:30 PM)',
    schedules: [
      { dayOfWeek: 'MONDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'MONDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '10:30 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '05:30 PM', endTime: '08:30 PM', shift: 'Evening OPD' }
    ]
  },
  {
    id: 3,
    name: 'Dr. Neha Kapoor',
    fullName: 'Dr. Neha Kapoor',
    qualification: 'BDS, MDS - Orthodontics & Dentofacial Orthopedics',
    specialization: 'Chief Orthodontist & Clear Aligner Specialist',
    experienceYears: 9,
    consultationFee: 450,
    department: 'Department of Orthodontics & Smile Alignment',
    roomNo: 'Suite 103',
    languages: 'English, Hindi, Punjabi',
    email: 'dr.neha@akanshadental.com',
    phone: '+91 8130 406 405',
    imageUrl: 'https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600',
    bio: 'Certified invisalign and self-ligating braces specialist transforming patient smiles with discreet modern aligners.',
    detailedBio: 'Dr. Neha Kapoor is a certified invisible aligner practitioner and specialist in dentofacial orthopedics. Over the past 9 years, she has corrected hundreds of complex malocclusions, deep bites, and open bites in teens and adults. Utilizing advanced 3D intraoral digital scanners, she provides patients with simulated before-and-after smile projections before treatment even starts, achieving discreet and predictable teeth alignment.',
    procedures: ['Invisible Clear Aligners', 'Damon Self-Ligating Metal/Ceramic Braces', 'Lingual Braces', 'Child Habit Breaking Appliances', 'Orthognathic Surgical Planning'],
    scheduleText: 'Monday to Saturday (Morning: 11:00 AM - 02:00 PM | Evening: 04:30 PM - 08:00 PM)',
    schedules: [
      { dayOfWeek: 'MONDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'MONDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '11:00 AM', endTime: '02:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '04:30 PM', endTime: '08:00 PM', shift: 'Evening OPD' }
    ]
  },
  {
    id: 4,
    name: 'Dr. Amit Patel',
    fullName: 'Dr. Amit Patel',
    qualification: 'BDS, MDS - Periodontics & Oral Implantology',
    specialization: 'Periodontist & Gum Laser Surgeon',
    experienceYears: 10,
    consultationFee: 350,
    department: 'Department of Periodontics & Laser Gum Care',
    roomNo: 'Suite 104',
    languages: 'English, Hindi, Gujarati',
    email: 'dr.amit@akanshadental.com',
    phone: '+91 8130 406 405',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    bio: 'Laser gum surgery, dental bone regeneration, deep periodontal therapy, and aesthetic crown lengthening.',
    detailedBio: 'Dr. Amit Patel is an accomplished Periodontist specializing in minimally invasive diode laser surgery and bone regenerative therapy. He treats bleeding gums, severe pyorrhea, tooth mobility, and peri-implantitis. He emphasizes preventive periodontal therapy and uses fine ultrasonic piezo scalers and dental lasers that eliminate bacteria without requiring painful traditional gum incisions.',
    procedures: ['Laser Flap Surgery (LANAP)', 'Aesthetic Crown Lengthening', 'Gum Depigmentation for Dark Gums', 'Guided Bone Regeneration (GBR)', 'Deep Subgingival Scaling & Root Planing'],
    scheduleText: 'Monday to Saturday (Morning: 09:30 AM - 01:00 PM | Evening: 05:00 PM - 08:30 PM)',
    schedules: [
      { dayOfWeek: 'MONDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'MONDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'TUESDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'WEDNESDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'THURSDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'FRIDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '09:30 AM', endTime: '01:00 PM', shift: 'Morning OPD' },
      { dayOfWeek: 'SATURDAY', startTime: '05:00 PM', endTime: '08:30 PM', shift: 'Evening OPD' }
    ]
  }
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [loading, setLoading] = useState(false);
  const [selectedDoctorModal, setSelectedDoctorModal] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await doctorService.getDoctors(true);
        if (res?.data && res.data.length > 0) {
          setDoctors(res.data);
        }
      } catch (err) {
        console.warn('Backend API warming up, using default roster:', err);
      }
    }
    fetchDoctors();
  }, []);

  // Handle auto-scroll to doctor hash e.g. #doctor-1
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elem.style.boxShadow = '0 0 0 3px #00d4b2, 0 10px 25px rgba(0, 212, 178, 0.2)';
          setTimeout(() => {
            if (elem) elem.style.boxShadow = '';
          }, 2500);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash, doctors]);

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Dental Specialist Faculty & OPD Schedules
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            Meet Our Certified Dental Specialists
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Browse verified clinical qualifications, multi-paragraph background profiles, surgical specializations, and daily morning & evening OPD timings.
          </p>
        </div>
      </section>

      {/* Main Directory */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          {loading ? (
            <Spinner message="Loading dental specialist profiles & clinical schedules..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {doctors && doctors.filter(Boolean).map((doctor) => {
                const docName = String(doctor?.fullName || doctor?.name || 'Doctor');
                const docSpecialization = doctor?.specialization || 'Dental Specialist';
                const docQual = doctor?.qualification || 'BDS, MDS';
                const docExp = doctor?.experienceYears || doctor?.experience_years || 5;
                const docFee = doctor?.consultationFee !== undefined ? doctor.consultationFee : (doctor?.consultation_fee || 500);
                const docImg = doctor?.imageUrl || doctor?.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600';
                const firstName = docName.includes(' ') ? (docName.split(' ')[1] || docName) : docName;
                const department = doctor?.department || 'Department of General Dentistry';
                const roomNo = doctor?.roomNo || 'Consultation Suite';
                const fullBioParagraph = doctor?.detailedBio || doctor?.bio || 'Experienced dental specialist committed to providing gentle, high-standard oral care with computerized planning and compassionate patient attention.';
                const proceduresList = doctor?.procedures || ['Dental Consultation', 'Preventative Care', 'Oral Examination', 'Aesthetic Smile Design'];
                const scheduleText = doctor?.scheduleText || 'Monday to Saturday (Morning: 10:00 AM - 01:30 PM | Evening: 05:00 PM - 08:30 PM)';

                return (
                  <div
                    key={doctor.id}
                    id={`doctor-${doctor.id}`}
                    className="card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '280px 1fr',
                      gap: '2.5rem',
                      padding: '2.5rem',
                      alignItems: 'start',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Doctor Image and Quick Badges */}
                    <div>
                      <div
                        style={{
                          height: '320px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#f1f5f9',
                          marginBottom: '1rem',
                          boxShadow: '0 8px 20px rgba(10, 37, 64, 0.08)'
                        }}
                      >
                        <img
                          src={docImg}
                          alt={docName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>

                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                          Verified Specialist
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                          {docExp}+ Years Clinical Mastery
                        </div>
                      </div>
                    </div>

                    {/* Detailed Doctor Information */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {docSpecialization}
                          </span>
                          <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.25rem 0' }}>{docName}</h2>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                            {docQual} • {department}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                            <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                            {roomNo} • Spoken: {doctor.languages || 'English, Hindi'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', backgroundColor: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{docFee}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>OPD Consultation Fee</span>
                        </div>
                      </div>

                      {/* Detailed Paragraph Form Description */}
                      <div style={{ marginBottom: '1.5rem', backgroundColor: '#fbfcfd', borderLeft: '4px solid #00d4b2', padding: '1.25rem', borderRadius: '0 8px 8px 0' }}>
                        <h4 style={{ fontSize: '0.92rem', color: '#0a2540', marginBottom: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={15} color="#00875a" />
                          Clinical Background & Medical Profile:
                        </h4>
                        <p style={{ color: '#334155', lineHeight: 1.75, fontSize: '0.95rem', margin: 0 }}>
                          {fullBioParagraph}
                        </p>
                      </div>

                      {/* Procedures Performed */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Key Clinical Procedures:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {proceduresList.map((proc, pIdx) => (
                            <span
                              key={pIdx}
                              style={{
                                fontSize: '0.8rem',
                                backgroundColor: '#f1f5f9',
                                color: '#1e293b',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <CheckCircle2 size={13} color="#00875a" />
                              {proc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Schedule and Timings Block */}
                      <div style={{ marginBottom: '1.75rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={16} color="#00875a" />
                            Weekly OPD Clinical Timings & Shifts:
                          </div>
                          <span style={{ fontSize: '0.78rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                            Mon - Sat Active Roster
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                              Morning OPD Shift
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginTop: '2px' }}>
                              10:00 AM – 01:30 PM
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#00875a', fontWeight: 600, marginTop: '2px' }}>
                              General Consultations & Diagnoses
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                              Evening OPD Shift
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginTop: '2px' }}>
                              05:00 PM – 08:30 PM
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#00875a', fontWeight: 600, marginTop: '2px' }}>
                              Procedures & Surgical Follow-ups
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                              Sunday Emergency
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a2540', marginTop: '2px' }}>
                              10:00 AM – 01:00 PM
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                              Prior Appointment / Urgent Cases
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link
                          to={`/book-appointment?doctorId=${doctor.id}`}
                          className="btn btn-primary"
                          style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Calendar size={18} />
                          Book Appointment with {firstName}
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedDoctorModal(doctor)}
                          className="btn btn-outline"
                          style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <UserCheck size={16} />
                          View Detailed Clinical Dossier
                        </button>

                        {doctor.phone && (
                          <a
                            href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Phone size={15} />
                            Call Desk
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal: Complete Doctor Profile & Schedule Details */}
      {selectedDoctorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 37, 64, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedDoctorModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: '#0a2540',
                color: '#ffffff',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '3px solid #00d4b2',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                  {selectedDoctorModal.fullName || selectedDoctorModal.name}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#00d4b2', fontWeight: 600 }}>
                  {selectedDoctorModal.specialization}
                </span>
              </div>
              <button
                onClick={() => setSelectedDoctorModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={selectedDoctorModal.imageUrl || selectedDoctorModal.image_url}
                  alt={selectedDoctorModal.fullName}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #00d4b2' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0a2540' }}>
                    {selectedDoctorModal.fullName}
                  </h4>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                    {selectedDoctorModal.qualification}
                  </div>
                  <div style={{ color: '#00875a', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>
                    Experience: {selectedDoctorModal.experienceYears || selectedDoctorModal.experience_years} Years • Consultation Fee: ₹{selectedDoctorModal.consultationFee || selectedDoctorModal.consultation_fee}
                  </div>
                </div>
              </div>

              {/* Comprehensive Paragraph Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#0a2540', marginBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Professional Biography & Clinical Mastery
                </h4>
                <p style={{ color: '#334155', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {selectedDoctorModal.detailedBio || selectedDoctorModal.bio}
                </p>
              </div>

              {/* OPD Schedule Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#0a2540', marginBottom: '0.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  Daily Clinical OPD Consultation Timings
                </h4>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.65rem 1rem' }}>Day</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Morning Shift</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Evening Shift</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#0a2540' }}>{day}</td>
                          <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>10:00 AM – 01:30 PM</td>
                          <td style={{ padding: '0.65rem 1rem', color: '#334155' }}>05:00 PM – 08:30 PM</td>
                          <td style={{ padding: '0.65rem 1rem' }}>
                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              AVAILABLE
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#b45309' }}>Sunday</td>
                        <td style={{ padding: '0.65rem 1rem', color: '#b45309' }} colSpan={2}>
                          10:00 AM – 01:00 PM (Prior Emergency Appointment)
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            ON-CALL
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDoctorModal(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <Link
                  to={`/book-appointment?doctorId=${selectedDoctorModal.id}`}
                  className="btn btn-primary"
                  onClick={() => setSelectedDoctorModal(null)}
                >
                  <Calendar size={16} style={{ marginRight: '6px' }} />
                  Proceed to Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
