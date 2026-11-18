import React, { useState } from 'react';
import { Sparkles, ZoomIn } from 'lucide-react';
import Modal from '../../components/Modal';

export default function GalleryPage() {
  const [activeImage, setActiveImage] = useState(null);

  const galleryItems = [
    {
      id: 1,
      title: 'Advanced Surgical Operatory',
      category: 'Clinic Facilities',
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=900',
      description: 'Ergonomic treatment chairs equipped with ceiling LED dental lights and integrated intraoral cameras.'
    },
    {
      id: 2,
      title: 'Class-B Autoclave Sterilization Suite',
      category: 'Sterility & Hygiene',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=900',
      description: 'Multi-stage ultrasonic cleaning and medical pouch vacuum steam sterilization adhering to international hospital standards.'
    },
    {
      id: 3,
      title: 'Digital Intraoral 3D Scanning',
      category: 'Technology',
      url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=900',
      description: 'Zero-mess optical impressions replacing traditional putty molds with sub-millimeter 3D digital accuracy.'
    },
    {
      id: 4,
      title: 'Consultation & Treatment Planning Lounge',
      category: 'Patient Comfort',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=900',
      description: 'Relaxing, private consultation space where patients review digital simulations with their dentist.'
    },
    {
      id: 5,
      title: 'Microscopic Endodontic Station',
      category: 'Technology',
      url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=900',
      description: 'High-magnification surgical microscope for precision single-sitting root canal treatment.'
    },
    {
      id: 6,
      title: 'Child-Friendly Pediatric Dental Suite',
      category: 'Clinic Facilities',
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=900',
      description: 'Vibrant, comforting operatory equipped with gentle care protocols for pediatric patients.'
    }
  ];

  return (
    <div>
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Facility & Technology Showcase
          </span>
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0.5rem 0 1rem' }}>
            Clinic Infrastructure & Equipment
          </h1>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#CBD5E1', fontSize: '1.1rem' }}>
            Tour our modern clinical suites, hospital-grade sterilization center, and high-precision digital dental equipment.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-3">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setActiveImage(item)}
              >
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                  <img
                    src={item.url}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10, 37, 64, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                    color: '#fff',
                  }}
                  className="gallery-overlay"
                  >
                    <ZoomIn size={32} />
                  </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent-hover)', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', margin: '0.25rem 0 0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeImage && (
        <Modal isOpen={!!activeImage} onClose={() => setActiveImage(null)} title={activeImage.title} maxWidth="750px">
          <div>
            <img
              src={activeImage.url}
              alt={activeImage.title}
              style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-accent-hover)', textTransform: 'uppercase' }}>
              {activeImage.category}
            </span>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
              {activeImage.description}
            </p>
          </div>
        </Modal>
      )}

      <style>{`
        .card:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
