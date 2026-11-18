import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import catalogService from '../../services/catalogService';
import Spinner from '../../components/Spinner';

const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Precision Dental Implants',
    category: 'IMPLANTOLOGY',
    price: 15000,
    durationMinutes: 90,
    description: 'Titanium root replacement restoring natural chewing strength and lifetime aesthetics with osseointegration.'
  },
  {
    id: 2,
    name: 'Microscopic Root Canal Therapy',
    category: 'ENDODONTICS',
    price: 2700,
    durationMinutes: 60,
    description: 'Painless, single-sitting pulp disinfection and biological 3D root filling under dental operating magnification.'
  },
  {
    id: 3,
    name: 'Clear Aligners & Invisible Braces',
    category: 'ORTHODONTICS',
    price: 27000,
    durationMinutes: 45,
    description: 'Customized transparent aligners correcting crowding and malocclusion discreetly with 3D digital planning.'
  },
  {
    id: 4,
    name: 'Ultrasonic Scaling & Deep Polishing',
    category: 'PREVENTIVE',
    price: 900,
    durationMinutes: 30,
    description: 'Gentle calculus removal, plaque eradication, and enamel polishing for vibrant gums and fresh breath.'
  },
  {
    id: 5,
    name: 'Laser Teeth Whitening',
    category: 'COSMETIC',
    price: 4200,
    durationMinutes: 45,
    description: 'In-office photo-activated whitening brightening shades safely in 45 minutes with zero sensitivity.'
  },
  {
    id: 6,
    name: 'Zirconia Aesthetic Crowns',
    category: 'PROSTHODONTICS',
    price: 5400,
    durationMinutes: 60,
    description: 'Cad-Cam precision milled metal-free crowns providing lifelike translucency and fracture resistance.'
  },
  {
    id: 7,
    name: 'Pediatric Dental Sealants & Fluoride',
    category: 'PEDIATRIC',
    price: 1200,
    durationMinutes: 30,
    description: 'Child-friendly preventative coatings shielding developing molars against cavities and acid erosion.'
  },
  {
    id: 8,
    name: 'Wisdom Tooth Surgical Extraction',
    category: 'SURGERY',
    price: 3600,
    durationMinutes: 45,
    description: 'Atraumatic impaction removal performed under localized numbness with rapid tissue recovery.'
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
              {filteredServices.map((service) => (
                <div key={service.id} className="card service-card">
                  <div>
                    <span className="service-category-tag">{service.category}</span>
                    <h3 className="service-card-title">{service.name}</h3>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {service.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      <Clock size={16} color="var(--color-accent-hover)" />
                      <span>Estimated Duration: <strong>{service.durationMinutes} Minutes</strong></span>
                    </div>
                  </div>

                  <div>
                    <div className="service-price-tag">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Standard Cost</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          ₹{service.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link to={`/book-appointment?serviceId=${service.id}`} className="btn btn-primary btn-sm">
                        <Calendar size={14} />
                        Book
                      </Link>
                    </div>

                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <Link to={`/services/${service.id}`} style={{ fontSize: '0.85rem', color: 'var(--color-accent-hover)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        Read Treatment Guide & FAQs
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
