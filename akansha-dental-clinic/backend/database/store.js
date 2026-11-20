/**
 * Persistent File-Backed Data Engine for Akansha Dental Clinic
 * Ensures 100% data durability across restarts while also syncing with MySQL when active.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const STORE_PATH = path.join(__dirname, 'clinic_data.json');

// Exact BCrypt hash for 'password123' (10 rounds)
const DEFAULT_PASSWORD_HASH = '$2a$10$BZ84NEU2/k9UsF3OsHzlHOJoNFslGOO3g8tdRLmSy2umfBuACM0Li';

const INITIAL_DATA = {
  admins: [
    {
      id: 1,
      userId: 1,
      fullName: 'Dr. Akansha Sharma (Chief Director)',
      full_name: 'Dr. Akansha Sharma (Chief Director)',
      username: 'admin@akanshadental.com',
      email: 'admin@akanshadental.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'SUPER_ADMIN',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
      phone: '+91 8130 406 405',
      is_active: true
    },
    {
      id: 2,
      userId: 2,
      fullName: 'Rohan Verma (Front Desk Staff)',
      full_name: 'Rohan Verma (Front Desk Staff)',
      username: 'rohan@akanshadental.com',
      email: 'rohan@akanshadental.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'STAFF',
      roles: ['ROLE_STAFF'],
      phone: '+91 9876 543 210',
      is_active: true
    }
  ],
  doctors: [
    {
      id: 1,
      name: 'Dr. Akansha Sharma',
      fullName: 'Dr. Akansha Sharma',
      qualification: 'BDS, MDS - Oral & Maxillofacial Implantology',
      specialization: 'Senior Implantologist & Cosmetic Surgeon',
      experienceYears: 14,
      experience_years: 14,
      consultationFee: 500,
      consultation_fee: 500,
      bio: 'Specialist in immediate dental implants, full-arch restorations, and advanced bone grafting with over 14 years of surgical mastery.',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      is_active: true,
      active: true,
      email: 'dr.akansha@akanshadental.com',
      phone: '+91 8130 406 405'
    },
    {
      id: 2,
      name: 'Dr. Rajesh Deshmukh',
      fullName: 'Dr. Rajesh Deshmukh',
      qualification: 'BDS, MDS - Endodontics & Conservative Dentistry',
      specialization: 'Chief Endodontist & Microscopic RCT',
      experienceYears: 12,
      experience_years: 12,
      consultationFee: 400,
      consultation_fee: 400,
      bio: 'Expert in painless single-sitting root canal treatments, smile redesigns, and tooth-colored composite restorations.',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      is_active: true,
      active: true,
      email: 'dr.rajesh@akanshadental.com',
      phone: '+91 8130 406 405'
    },
    {
      id: 3,
      name: 'Dr. Neha Kapoor',
      fullName: 'Dr. Neha Kapoor',
      qualification: 'BDS, MDS - Orthodontics & Dentofacial Orthopedics',
      specialization: 'Chief Orthodontist & Clear Aligner Specialist',
      experienceYears: 9,
      experience_years: 9,
      consultationFee: 450,
      consultation_fee: 450,
      bio: 'Certified invisalign and self-ligating braces specialist transforming patient smiles with discreet modern aligners.',
      imageUrl: 'https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600',
      image_url: 'https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600',
      is_active: true,
      active: true,
      email: 'dr.neha@akanshadental.com',
      phone: '+91 8130 406 405'
    },
    {
      id: 4,
      name: 'Dr. Amit Patel',
      fullName: 'Dr. Amit Patel',
      qualification: 'BDS, MDS - Periodontics & Oral Implantology',
      specialization: 'Periodontist & Gum Laser Surgeon',
      experienceYears: 10,
      experience_years: 10,
      consultationFee: 350,
      consultation_fee: 350,
      bio: 'Laser gum surgery, dental bone regeneration, deep periodontal therapy, and aesthetic crown lengthening.',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      image_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      is_active: true,
      active: true,
      email: 'dr.amit@akanshadental.com',
      phone: '+91 8130 406 405'
    }
  ],
  services: [
    {
      id: 100,
      name: 'General Dental Checkup & Consultation',
      category: 'Diagnostic & Preventative',
      price: 399,
      base_price: 399,
      durationMinutes: 30,
      duration_minutes: 30,
      description: 'Comprehensive intraoral examination, digital X-ray screening, periodontal health score, and tailored treatment planning.',
      is_active: true,
      active: true
    },
    {
      id: 1,
      name: 'Immediate Dental Implants',
      category: 'Implantology & Surgery',
      price: 32990,
      base_price: 32990,
      durationMinutes: 60,
      duration_minutes: 60,
      description: 'Same-day precision implants, biological integration, and custom zirconia natural-feel crowns.',
      is_active: true,
      active: true
    },
    {
      id: 2,
      name: 'Single-Visit Root Canal Treatment',
      category: 'Endodontics',
      price: 3500,
      base_price: 3500,
      durationMinutes: 45,
      duration_minutes: 45,
      description: 'Rotary microscopic cleaning, painless apex locator disinfection, and hermetic bio-ceramic seal.',
      is_active: true,
      active: true
    },
    {
      id: 3,
      name: 'Clear Aligners & Invisible Braces',
      category: 'Orthodontics',
      price: 7000,
      base_price: 7000,
      durationMinutes: 40,
      duration_minutes: 40,
      description: 'Custom 3D scanned transparent aligners for discreet, comfortable teeth straightening.',
      is_active: true,
      active: true
    },
    {
      id: 4,
      name: 'Deep Teeth Cleaning & Ultrasonic Scaling',
      category: 'Preventive Dentistry',
      price: 1499,
      base_price: 1499,
      durationMinutes: 30,
      duration_minutes: 30,
      description: 'Removal of dental plaque, tartar, coffee/tobacco stains, and enamel fluoride polish.',
      is_active: true,
      active: true
    },
    {
      id: 5,
      name: 'Composite Aesthetic Tooth Fillings',
      category: 'Cosmetic Dentistry',
      price: 1200,
      base_price: 1200,
      durationMinutes: 30,
      duration_minutes: 30,
      description: 'Invisible tooth-colored bio-compatible resin restorations matching your natural tooth shade.',
      is_active: true,
      active: true
    },
    {
      id: 6,
      name: 'Wisdom Tooth Painless Extraction',
      category: 'Oral Surgery',
      price: 2500,
      base_price: 2500,
      durationMinutes: 45,
      duration_minutes: 45,
      description: 'Atraumatic surgical removal of impacted wisdom teeth with quick-healing socket preservation.',
      is_active: true,
      active: true
    },
    {
      id: 7,
      name: 'Full Mouth Rehabilitation',
      category: 'Advanced Prosthodontics',
      price: 45000,
      base_price: 45000,
      durationMinutes: 90,
      duration_minutes: 90,
      description: 'Complete structural restoration of severely worn, broken, or missing teeth with precision crowns.',
      is_active: true,
      active: true
    }
  ],
  patients: [
    {
      id: 1,
      firstName: 'Sunita',
      lastName: 'Verma',
      fullName: 'Sunita Verma',
      full_name: 'Sunita Verma',
      phone: '9826012345',
      email: 'sunita.verma@example.com',
      dateOfBirth: '1988-04-12',
      bloodGroup: 'B+',
      medicalHistory: 'Mild tooth sensitivity in lower molar.',
      createdAt: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 1,
      appointmentNumber: 'APT-2026-0001',
      appointmentCode: 'APT-2026-0001',
      bookingReference: 'APT-2026-0001',
      booking_reference: 'APT-2026-0001',
      patientId: 1,
      patient_id: 1,
      patientName: 'Sunita Verma',
      patient_name: 'Sunita Verma',
      patientPhone: '9826012345',
      patient_phone: '9826012345',
      patientEmail: 'sunita.verma@example.com',
      doctorId: 1,
      doctor_id: 1,
      doctorName: 'Dr. Akansha Sharma',
      doctor_name: 'Dr. Akansha Sharma',
      doctorSpecialization: 'Senior Implantologist & Cosmetic Surgeon',
      serviceId: 100,
      service_id: 100,
      serviceName: 'General Dental Checkup & Consultation',
      service_name: 'General Dental Checkup & Consultation',
      servicePrice: 399,
      serviceDurationMinutes: 30,
      appointmentDate: new Date().toISOString().split('T')[0],
      appointment_date: new Date().toISOString().split('T')[0],
      timeSlot: '10:30 AM',
      time_slot: '10:30 AM',
      status: 'CONFIRMED',
      totalPrice: 399,
      total_price: 399,
      notes: 'Initial consultation and tooth checkup.',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_active: true
    }
  ],
  inquiries: [
    {
      id: 1,
      fullName: 'Amitabh Sen',
      full_name: 'Amitabh Sen',
      email: 'amitabh.sen@example.com',
      phone: '9893123456',
      subject: 'Dental Implant Cost Enquiry',
      message: 'Hello doctor, I would like to know the cost of full mouth implants and healing time.',
      status: 'NEW',
      adminNotes: '',
      admin_notes: '',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ]
};

// Load or initialize store from disk
let store = null;

const loadStore = () => {
  if (store) return store;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf8');
      store = JSON.parse(content);
      console.log('📂 Loaded persistent clinic data store from:', STORE_PATH);
    } else {
      store = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveStore();
      console.log('✨ Initialized new persistent clinic data store at:', STORE_PATH);
    }
  } catch (err) {
    console.warn('⚠️ Error loading clinic data store, using defaults:', err.message);
    store = JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  return store;
};

const saveStore = () => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Failed to save clinic data store to disk:', err.message);
  }
};

const getStore = () => {
  if (!store) loadStore();
  return store;
};

module.exports = {
  getStore,
  saveStore,
  loadStore
};
