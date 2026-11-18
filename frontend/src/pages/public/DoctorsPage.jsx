import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Award, Clock, Phone, Mail, CheckCircle2 } from 'lucide-react';
import doctorService from '../../services/doctorService';
import Spinner from '../../components/Spinner';

const DEFAULT_DOCTORS = [
  {
    id: 1,
    fullName: 'Dr. Akansha Mishra',
    specialization: 'Chief Implantologist & Cosmetic Dentist',
    qualification: 'BDS, MDS (Prosthodontics)',
    experienceYears: 12,
    consultationFee: 1000,
    email: 'dr.akansha@akanshadental.com',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    bio: 'Specializes in full-mouth rehabilitation, precision dental implants, and aesthetic smile design with over a decade of clinical excellence.'
  },
  {
    id: 2,
    fullName: 'Dr. Rajiv Mehta',
    specialization: 'Senior Orthodontist & Dentofacial Specialist',
    qualification: 'BDS, MDS (Orthodontics)',
    experienceYears: 10,
    consultationFee: 1000,
    email: 'dr.rajiv@akanshadental.com',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    bio: 'Expert in customized clear aligners, self-ligating braces, and complex bite corrections for teens and adults.'
  },
  {
    id: 3,
    fullName: 'Dr. Sneha Kulkarni',
    specialization: 'Consultant Endodontist (Root Canal Specialist)',
    qualification: 'BDS, MDS (Conservative Dentistry)',
    experienceYears: 8,
    consultationFee: 1000,
    email: 'dr.sneha@akanshadental.com',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600',
    bio: 'Pioneer in single-sitting microscopic root canal therapy and minimally invasive laser tooth preservation.'
  },
  {
    id: 4,
    fullName: 'Dr. Amitav Banerjee',
    specialization: 'Pediatric Dental Specialist',
    qualification: 'BDS, MDS (Pedodontics)',
    experienceYears: 7,
    consultationFee: 1000,
    email: 'dr.amitav@akanshadental.com',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    bio: 'Dedicated to child-friendly, anxiety-free preventative dental care, dental sealants, and gentle treatments.'
  }
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await doctorService.getDoctors(true);
        if (res?.data && res.data.length > 0) setDoctors(res.data);
      } catch (err) {
        console.warn('Backend API warming up, using default roster:', err);
      }
    }
    fetchDoctors();
  }, []);

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Specialist Roster
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            Meet Our Certified Dental Specialists
          </h1>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.1rem' }}>
            Compassionate oral healthcare practitioners dedicated to surgical precision, aesthetic beauty, and patient satisfaction.
          </p>
        </div>
      </section>

      {/* Main Directory */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <Spinner message="Loading dental specialist profiles..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {doctors.map((doctor) => (
                <div key={doctor.id} className="card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', padding: '2rem', alignItems: 'center' }}>
                  <div style={{ height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent-hover)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {doctor.specialization}
                        </span>
                        <h2 style={{ fontSize: '1.85rem', color: 'var(--color-primary)', margin: '0.25rem 0' }}>{doctor.fullName}</h2>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                          {doctor.qualification} • {doctor.experienceYears} Years Clinical Experience
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{doctor.consultationFee}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consultation Fee</span>
                      </div>
                    </div>

                    <p style={{ color: 'var(--color-text)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                      {doctor.bio}
                    </p>

                    {/* Schedule Pills */}
                    {doctor.schedules && doctor.schedules.length > 0 && (
                      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                          Weekly Availability Schedule:
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {doctor.schedules.map((s) => (
                            <span
                              key={s.id}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: s.available ? '#fff' : '#f1f5f9',
                                color: s.available ? 'var(--color-primary)' : '#94a3b8',
                                border: '1px solid var(--color-border)',
                                fontWeight: 600,
                              }}
                            >
                              <strong>{s.dayOfWeek.slice(0, 3)}:</strong> {s.startTime} - {s.endTime} ({s.slotDurationMinutes}m)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/book-appointment?doctorId=${doctor.id}`}
                        className="btn btn-primary"
                      >
                        <Calendar size={18} />
                        Book with {doctor.fullName.split(' ')[1] || doctor.fullName}
                      </Link>
                      {doctor.email && (
                        <a href={`mailto:${doctor.email}`} className="btn btn-outline">
                          <Mail size={16} />
                          Clinical Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
