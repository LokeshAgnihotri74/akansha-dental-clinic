import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import catalogService from '../../services/catalogService';
import Spinner from '../../components/Spinner';

const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Dental Implants',
    category: 'IMPLANTOLOGY',
    price: 32990,
    durationMinutes: 90,
    description: 'Same-day implants with surgical precision restoring natural chewing strength and lifetime aesthetics with osseointegration.',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Clear Aligners & Braces',
    category: 'ORTHODONTICS',
    price: 7000,
    durationMinutes: 45,
    description: 'Discreet and comfortable orthodontic alignment correcting crowding and malocclusion with 3D digital planning.',
    imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Preventive Dentistry',
    category: 'PREVENTIVE',
    price: 1499,
    durationMinutes: 30,
    description: 'Fluoride varnish, pit & fissure sealants, and gentle dental checkups for ages 0-13 & adults.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    name: 'Root Canal Treatment',
    category: 'ENDODONTICS',
    price: 2700,
    durationMinutes: 60,
    description: 'Painless, single-sitting pulp disinfection and biological 3D root filling under dental operating magnification.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    name: 'Cosmetic Dentistry',
    category: 'COSMETIC',
    price: 4200,
    durationMinutes: 45,
    description: 'Smile makeover, aesthetic porcelain veneers, and photo-activated enamel whitening with zero sensitivity.',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    name: 'Teeth Cleaning & Scaling',
    category: 'PREVENTIVE',
    price: 900,
    durationMinutes: 30,
    description: 'Gentle ultrasonic calculus removal, plaque eradication, and enamel polishing for vibrant gums and fresh breath.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 7,
    name: 'Dental Fillings',
    category: 'RESTORATIVE',
    price: 1500,
    durationMinutes: 40,
    description: 'Seamless tooth-colored composite restorations repairing cavities with natural shade matching and durability.',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 8,
    name: 'Dental Bridges & Crowns',
    category: 'PROSTHODONTICS',
    price: 5400,
    durationMinutes: 60,
    description: 'Fixed precision-crafted prosthetic restorations bridging gaps left by one or more missing teeth.',
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 9,
    name: 'Painless Tooth Removal',
    category: 'ORAL SURGERY',
    price: 1200,
    durationMinutes: 45,
    description: 'Atraumatic simple and surgical extractions performed under localized pain-free anesthesia with rapid recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 10,
    name: 'Pediatric Dentistry',
    category: 'PEDIATRIC',
    price: 1000,
    durationMinutes: 30,
    description: 'Child-friendly preventative coatings, sealants, and gentle dental checkups in an anxiety-free setting.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 11,
    name: 'Advanced Laser Treatment',
    category: 'ADVANCED TECH',
    price: 3500,
    durationMinutes: 45,
    description: 'Minimally invasive laser soft-tissue contouring, gum healing, and painless bacterial disinfection.',
    imageUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 12,
    name: 'Digital 3D Oral Scanning',
    category: '3D DIAGNOSTICS',
    price: 1500,
    durationMinutes: 20,
    description: 'Optical 3D intraoral impressions replacing messy traditional putty molds with sub-millimeter precision.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await catalogService.getServices(true);
        if (res?.data && res.data.length > 0) setServices(res.data);
      } catch (err) {
        console.warn('Backend API warming up, using default treatments:', err);
      }
    }
    fetchServices();
  }, []);

  const categories = ['All', ...new Set(services.map((s) => s.category))];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Comprehensive Treatments
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            World-Class Dental Services
          </h1>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.1rem' }}>
            From preventative hygiene and invisible clear aligners to titanium dental implants and full smile design.
          </p>
        </div>
      </section>

      {/* Category Pills & Service Grid */}
      <section className="section-padding">
        <div className="container">
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : '#fff',
                  color: selectedCategory === cat ? '#fff' : 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner message="Loading dental treatments..." />
          ) : (
            <div className="grid-3">
              {filteredServices.map((service, index) => (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="service-card-num">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="service-category-tag" style={{ margin: 0 }}>
                        {service.category}
                      </span>
                    </div>

                    <h3 className="service-card-title">{service.name}</h3>
                    <p className="service-card-desc">{service.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      <Clock size={15} color="var(--color-accent-hover)" />
                      <span>Duration: <strong>{service.durationMinutes} Minutes</strong></span>
                    </div>

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

                    <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                      <Link
                        to={`/services/${service.id}`}
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--color-accent-hover)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Treatment Guide & FAQs</span>
                        <ArrowRight size={14} />
                      </Link>
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
