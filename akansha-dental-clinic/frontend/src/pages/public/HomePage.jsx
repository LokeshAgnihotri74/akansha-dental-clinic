import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Sparkles, Award, Clock, ArrowRight, Star, CheckCircle2, Phone, MapPin, UserCheck, Activity, Smile, User, ShieldCheck, Microscope } from 'lucide-react';
import doctorService from '../../services/doctorService';
import catalogService from '../../services/catalogService';
import HeroFeatureCarousel from '../../components/HeroFeatureCarousel';

function ToothIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3C4.2 3 3 5.5 3 8c0 3.5 1.5 6 2.5 10 .8 3.2 2.5 3 3.5 0 .8-2.5 1.5-4 3-4s2.2 1.5 3 4c1 3 2.7 3.2 3.5 0 1-4 2.5-6.5 2.5-10 0-2.5-1.2-5-4-5-2 0-3 1.2-4.5 1.2S9 3 7 3z" />
    </svg>
  );
}

function getServiceIcon(name) {
  const n = name?.toLowerCase() || '';
  if (n.includes('cleaning') || n.includes('scaling')) {
    return <Sparkles size={24} color="var(--color-primary)" />;
  }
  if (n.includes('canal') || n.includes('endodontic')) {
    return <Activity size={24} color="var(--color-primary)" />;
  }
  if (n.includes('aligner') || n.includes('braces')) {
    return <Smile size={24} color="var(--color-primary)" />;
  }
  if (n.includes('cosmetic') || n.includes('whitening')) {
    return <Sparkles size={24} color="var(--color-primary)" />;
  }
  if (n.includes('pediatric')) {
    return <User size={24} color="var(--color-primary)" />;
  }
  if (n.includes('removal') || n.includes('extraction')) {
    return <ShieldCheck size={24} color="var(--color-primary)" />;
  }
  if (n.includes('scan') || n.includes('digital')) {
    return <Microscope size={24} color="var(--color-primary)" />;
  }
  return <ToothIcon size={24} color="var(--color-primary)" />;
}

const DEFAULT_DOCTORS = [
  {
    id: 1,
    fullName: 'Dr. Akansha Mishra',
    specialization: 'Chief Implantologist & Cosmetic Dentist',
    qualification: 'BDS, MDS (Prosthodontics)',
    experienceYears: 12,
    consultationFee: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    bio: 'Specializes in full-mouth rehabilitation, precision dental implants, and aesthetic smile design.'
  },
  {
    id: 2,
    fullName: 'Dr. Rajiv Mehta',
    specialization: 'Senior Orthodontist',
    qualification: 'BDS, MDS (Orthodontics)',
    experienceYears: 10,
    consultationFee: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    bio: 'Expert in customized clear aligners, self-ligating braces, and complex bite corrections.'
  },
  {
    id: 3,
    fullName: 'Dr. Sneha Kulkarni',
    specialization: 'Consultant Endodontist',
    qualification: 'BDS, MDS (Conservative Dentistry)',
    experienceYears: 8,
    consultationFee: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600',
    bio: 'Pioneer in single-sitting microscopic root canal therapy and tooth preservation.'
  },
  {
    id: 4,
    fullName: 'Dr. Amitav Banerjee',
    specialization: 'Pediatric Dental Specialist',
    qualification: 'BDS, MDS (Pedodontics)',
    experienceYears: 7,
    consultationFee: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    bio: 'Dedicated to child-friendly, anxiety-free preventative dental care and gentle treatments.'
  }
];

const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Dental Implants',
    category: 'IMPLANTOLOGY',
    price: 32990,
    description: 'Same-day implants with surgical precision restoring natural chewing strength and lifetime aesthetics.',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Clear Aligners & Braces',
    category: 'ORTHODONTICS',
    price: 7000,
    description: 'Discreet and comfortable orthodontic alignment correcting crowding with 3D digital planning.',
    imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Preventive Dentistry',
    category: 'PREVENTIVE',
    price: 1499,
    description: 'Fluoride varnish, pit & fissure sealants, and gentle dental checkups for ages 0-13 & adults.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    name: 'Root Canal Treatment',
    category: 'ENDODONTICS',
    price: 2700,
    description: 'Painless, single-sitting pulp disinfection and biological 3D root filling under magnification.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    name: 'Cosmetic Dentistry',
    category: 'COSMETIC',
    price: 4200,
    description: 'Smile makeover, aesthetic porcelain veneers, and photo-activated enamel shade brightening.',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    name: 'Teeth Cleaning & Scaling',
    category: 'PREVENTIVE',
    price: 900,
    description: 'Gentle ultrasonic calculus removal, plaque eradication, and enamel polishing for vibrant gums.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 7,
    name: 'Dental Fillings',
    category: 'RESTORATIVE',
    price: 1500,
    description: 'Seamless tooth-colored composite restorations repairing cavities with natural shade durability.',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 8,
    name: 'Dental Bridges & Crowns',
    category: 'PROSTHODONTICS',
    price: 5400,
    description: 'Fixed precision-crafted prosthetic restorations bridging gaps left by missing teeth.',
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 9,
    name: 'Painless Tooth Removal',
    category: 'ORAL SURGERY',
    price: 1200,
    description: 'Atraumatic simple and wisdom tooth extractions performed with localized pain-free anesthesia.',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 10,
    name: 'Pediatric Dentistry',
    category: 'PEDIATRIC',
    price: 1000,
    description: 'Child-friendly dental checkups, sealants, and gentle treatments in a comforting care setup.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 11,
    name: 'Advanced Laser Treatment',
    category: 'ADVANCED TECH',
    price: 3500,
    description: 'Modern laser soft-tissue contouring and sterilization accelerating patient healing.',
    imageUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 12,
    name: 'Digital 3D Oral Scanning',
    category: '3D DIAGNOSTICS',
    price: 1500,
    description: 'Zero-mess optical impressions generating sub-millimeter 3D dental mapping instantly.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
  }
];

export default function HomePage() {
  const [featuredDoctors, setFeaturedDoctors] = useState(DEFAULT_DOCTORS);
  const [featuredServices, setFeaturedServices] = useState(DEFAULT_SERVICES.slice(0, 6));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, srvRes] = await Promise.allSettled([
          doctorService.getDoctors(true),
          catalogService.getServices(true)
        ]);
        if (docRes.status === 'fulfilled' && docRes.value?.data && docRes.value.data.length > 0) {
          setFeaturedDoctors(docRes.value.data.slice(0, 4));
        }
        if (srvRes.status === 'fulfilled' && srvRes.value?.data && srvRes.value.data.length > 0) {
          setFeaturedServices(srvRes.value.data.slice(0, 6));
        }
      } catch (err) {
        console.warn('Backend API warming up, using default catalog values:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-text-content">
              <div className="hero-badge">
                <Sparkles size={14} color="var(--color-accent-hover)" />
                <span>Next-Generation Digital Dental Care</span>
              </div>
              <h1 className="hero-title">
                Exceptional Smiles Crafted with <span className="text-teal">Gentle Precision</span>.
              </h1>
              <p className="hero-subtitle">
                At Akansha Dental Clinic, we merge certified specialist expertise with microscopic endodontics, painless laser dentistry, and 3D digital smile design in a tranquil, sterile setting.
              </p>

              <div className="hero-actions">
                <Link to="/book-appointment" className="btn btn-primary btn-lg">
                  <Calendar size={18} />
                  Book Appointment
                </Link>
                <Link to="/services" className="btn btn-outline btn-lg">
                  Explore Treatments
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* 100% Hospital Sterility - Positioned on Left Side Away From Carousel */}
              <div className="hero-sterility-left-card">
                <div className="sterility-icon-box">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="sterility-title">100% Hospital Sterility</div>
                  <div className="sterility-sub">Class-B Autoclave & UV Sanitized Protocol</div>
                </div>
              </div>

              <div className="hero-stats-ribbon">
                <div className="stat-item">
                  <h4>12+</h4>
                  <p>Years Clinical Mastery</p>
                </div>
                <div className="stat-item">
                  <h4>15,000+</h4>
                  <p>Patients Restored</p>
                </div>
                <div className="stat-item">
                  <h4>99.4%</h4>
                  <p>Clinical Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <HeroFeatureCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clinic Values & Overview (Optimized Spacing) */}
      <section className="section-padding bg-subtle" style={{ paddingTop: '2rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Clinical Excellence</span>
            <h2 className="section-title">Designed Around Patient Comfort</h2>
            <p>We believe going to the dentist should be reassuring, gentle, and transparent from first consultation to final restoration.</p>
          </div>

          <div className="grid-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Activity size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Digital Diagnostics</h3>
              <p style={{ fontSize: '0.875rem' }}>Ultra-low-dose full mouth digital OPG and high-resolution intraoral cameras for accurate diagnosis.</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Sparkles size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Painless Procedures</h3>
              <p style={{ fontSize: '0.875rem' }}>Computerized local anesthesia and laser soft-tissue treatments minimize discomfort and accelerate healing.</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Award size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Certified Specialists</h3>
              <p style={{ fontSize: '0.875rem' }}>Every procedure is carried out by MDS specialists holding advanced prosthodontic and endodontic credentials.</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Clock size={26} color="var(--color-accent-hover)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Punctual Scheduling</h3>
              <p style={{ fontSize: '0.875rem' }}>Real-time automated slot reservation ensures you are attended on time with zero crowded waiting room delays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Dental Services (Optimized Compact Spacing) */}
      <section className="section-padding" style={{ backgroundColor: '#FAFBFB', paddingTop: '2.25rem', paddingBottom: '2.25rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">Comprehensive Care</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Specialized Treatments</h2>
            </div>
            <Link to="/services" className="btn-view-all-green" title="Explore all dental treatments">
              <span>View All Treatments</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredServices.map((service, index) => (
              <div
                key={service.id}
                className="service-image-card"
                style={{
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.93), rgba(255, 255, 255, 0.97)), url(${service.imageUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="service-card-media">
                  <img
                    src={service.imageUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'}
                    alt={service.name}
                    className="service-card-img"
                    loading="lazy"
                  />
                </div>
                <div className="service-card-body">
                  <div className="service-card-num">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="service-card-title">{service.name}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <div className="service-card-footer">
                    <div className="service-price-block">
                      <span className="service-price-label">STARTS FROM*</span>
                      <span className="service-price-value">
                        ₹{service.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/book-appointment?serviceId=${service.id}`}
                      className="btn-book-treatment"
                      title={`Book ${service.name} appointment`}
                    >
                      <Calendar size={15} />
                      <span>Book Appointment</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <Link
              to="/services"
              className="btn-view-all-green"
              style={{ padding: '0.8rem 2rem', fontSize: '0.96rem' }}
              title="View all 12 specialized dental treatments"
            >
              <span>Explore All 12 Dental Specializations</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Specialist Doctors Showcase */}
      <section className="section-padding bg-subtle" style={{ paddingTop: '2.25rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Medical Team</span>
            <h2 className="section-title">Meet Our Dedicated Dentists</h2>
            <p>Our team comprises senior dental consultants, prosthodontists, and orthodontists who prioritize gentle care and long-term oral health.</p>
          </div>

          <div className="grid-4">
            {featuredDoctors.map((doc) => (
              <div key={doc.id} className="card doctor-card">
                <div className="doctor-img-box">
                  <img src={doc.imageUrl} alt={doc.fullName} className="doctor-img" loading="lazy" />
                </div>
                <div className="doctor-info-box">
                  <div className="doctor-specialization">{doc.specialization}</div>
                  <h3 className="doctor-name">{doc.fullName}</h3>
                  <div className="doctor-qualification">{doc.qualification} • {doc.experienceYears} Yrs Exp</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.bio}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Fee: ₹{doc.consultationFee}</span>
                    <Link to="/book-appointment" className="btn btn-accent btn-sm">
                      Book Visit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <Link to="/doctors" className="btn btn-outline">
              View Doctor Schedules & Qualifications
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Patient Testimonials */}
      <section className="section-padding" style={{ paddingTop: '2.25rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Patient Experiences</span>
            <h2 className="section-title">What Our Patients Say</h2>
            <p>Authentic feedback from patients who have undergone treatments at Akansha Dental Clinic.</p>
          </div>

          <div className="grid-3">
            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#F59E0B" />)}
                </div>
                <p className="testimonial-text">
                  "I had severe dental anxiety from past childhood experiences. Dr. Akansha Mishra performed my single-sitting root canal and ceramic crown completely pain-free. The entire clinic atmosphere is calming and professional."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">PS</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Priya Sundaram</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Root Canal & Crown Patient</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#F59E0B" />)}
                </div>
                <p className="testimonial-text">
                  "Dr. Rajiv Mehta planned my clear aligner treatment with 3D digital simulation. Within 9 months, my severe crowding was straightened without any ugly metal wires. The staff punctuality is impressive!"
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">VM</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Vikram Malhotra</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Clear Aligners Patient</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#F59E0B" />)}
                </div>
                <p className="testimonial-text">
                  "Took my 6-year-old son to Dr. Amitav for fluoride varnish and cavity checkup. He made my child feel completely relaxed and excited about brushing. Highly recommend for family dental care!"
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">AD</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Ananya Deshmukh</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pediatric Dentistry Patient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Appointment Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '3.25rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready for a Healthy, Radiant Smile?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.125rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Reserve your consultation with our dental specialists. Real-time slot availability, instant confirmation, and personalized oral care.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/book-appointment" className="btn btn-accent btn-lg">
              <Calendar size={20} />
              Reserve Your Appointment Online
            </Link>
            <a href="tel:+919399354201" className="btn btn-outline-light btn-lg" title="Click to call reception">
              <Phone size={20} />
              Call Reception: +91 9399354201
            </a>
          </div>
        </div>
      </section>

      {/* 7. Contact Details & Google Maps */}
      <section className="section-padding bg-subtle" style={{ paddingTop: '2.25rem', paddingBottom: '2.75rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Convenient Location</span>
            <h2 className="section-title">Visit Our Clinic</h2>
            <p>Conveniently located at Raj Business Park, Minal Residency, Bhopal with parking and complete accessibility.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem', alignItems: 'center' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Clinic Information</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'inherit', textDecoration: 'none' }}
                  title="Click to get directions on Google Maps"
                >
                  <MapPin size={22} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Address:</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, Madhya Pradesh 462041</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-hover)', fontWeight: 600 }}>● Click for directions on Google Maps</span>
                  </div>
                </a>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Clock size={22} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Working Hours:</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Mon - Sat: 9:00 AM - 10:00 PM</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-accent-hover)', fontWeight: 600 }}>Sun: 10:00 AM - 2:00 PM (Emergency)</p>
                  </div>
                </div>

                <a
                  href="tel:+919399354201"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'inherit', textDecoration: 'none' }}
                  title="Click to call Akansha Dental Clinic"
                >
                  <Phone size={22} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Helpline:</strong>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>+91 9399354201</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-hover)', fontWeight: 600 }}>● Click to call now</span>
                  </div>
                </a>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <Link to="/contact" className="btn btn-primary" style={{ width: '100%' }}>
                  Send a Consultation Inquiry
                </Link>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', height: '420px', border: '1px solid var(--color-border)' }}>
              <iframe
                title="Akansha Dental Clinic Google Maps Location"
                src="https://maps.google.com/maps?q=Raj+Business+Park,+RA-5,+Minal+Shopping+St,+Minal+Residency,+Bhopal,+Madhya+Pradesh+462041&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
