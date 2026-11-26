import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Phone, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import MakeContactModal from './MakeContactModal';

const SLIDES = [
  {
    id: 1,
    tag: 'AKANSHA DENTAL',
    title: "Children's Dental Care",
    subtitle: 'Check-ups, fluoride and sealants for children aged 0 to 13.',
    location: 'Bhopal | Minal Residency',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=900',
    alt: "Children's Dental Care at Akansha Dental"
  },
  {
    id: 2,
    tag: 'AKANSHA DENTAL',
    title: 'Dental Implants',
    subtitle: 'Replacement of missing teeth with implant-supported restorations.',
    location: 'Bhopal | Minal Residency',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=900',
    alt: 'Dental Implants Restoration'
  },
  {
    id: 3,
    tag: 'AKANSHA DENTAL',
    title: 'Clear Aligners & Braces',
    subtitle: 'Orthodontic care to align teeth and improve the bite seamlessly.',
    location: 'Bhopal | Minal Residency',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=900',
    alt: 'Clear Aligners and Braces Smile'
  },
  {
    id: 4,
    tag: 'AKANSHA DENTAL',
    title: 'Orthodontic Treatment',
    subtitle: 'Braces and aligners planned around your teeth and bite.',
    location: 'Bhopal | Minal Residency',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=900',
    alt: 'Orthodontic Treatment and Braces'
  },
  {
    id: 5,
    tag: 'AKANSHA DENTAL',
    title: 'One place for every smile.',
    subtitle: 'Aligners, implants, fillings, pediatric dentistry and all other dental procedures.',
    location: 'Bhopal | Minal Residency',
    phone: '+91 9399354201',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=900',
    alt: 'Modern Akansha Dental Operatory'
  }
];

export default function HeroFeatureCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Auto-scroll every 3 seconds (3000ms)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[current];

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured Dental Treatments Carousel"
    >
      {/* Slide Content Box */}
      <div className="hero-carousel-slide">
        {/* Left Side: Editorial Content */}
        <div className="hero-slide-content">
          <div className="hero-slide-tag-row">
            <span className="hero-slide-tag">{slide.tag}</span>
            <div className="hero-slide-tag-line"></div>
          </div>

          <h2 className="hero-slide-title">{slide.title}</h2>
          <p className="hero-slide-subtitle">{slide.subtitle}</p>

          <div className="hero-slide-actions">
            <a
              href={`tel:${slide.phone.replace(/\s+/g, '')}`}
              className="hero-slide-call"
              title="Call Reception"
            >
              <Phone size={14} />
              <span>Call {slide.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="hero-slide-book-btn"
              title="Make direct contact regarding treatments, feedback, or inquiries"
              style={{
                cursor: 'pointer',
                border: 'none',
                background: '#00875a',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={13} />
              <span>Make Contact</span>
            </button>
          </div>

          <div className="hero-slide-location">
            {slide.location}
          </div>
        </div>

        {/* Right Side: Arched Image Frame (Rekha Dental curved style) */}
        <div className="hero-slide-image-wrapper">
          <div className="hero-slide-arch-frame">
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              className="hero-slide-img"
              key={slide.id}
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="hero-carousel-btn hero-carousel-btn-prev"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={nextSlide}
        className="hero-carousel-btn hero-carousel-btn-next"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination Dots */}
      <div className="hero-carousel-dots">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`hero-carousel-dot ${current === idx ? 'active' : ''}`}
            aria-label={`Go to slide ${idx + 1}: ${s.title}`}
          />
        ))}
      </div>

      {/* Make Contact Interactive Dialog */}
      <MakeContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}
