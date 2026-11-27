-- =========================================================================
-- Akansha Dental Clinic & Implant Center — Production Seed Data
-- =========================================================================

USE akansha_dental_db;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
  (1, 'SUPER_ADMIN', 'Full clinical system and financial authority'),
  (2, 'ADMIN', 'Clinical doctor or operations manager'),
  (3, 'STAFF', 'Front-desk reception, appointment caller and inquiry coordinator')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Initial Super Admin Account Setup Note
-- Super Admin accounts are provisioned via environment variables
-- (ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD) upon first startup.
-- No static password hashes are stored in seed SQL files for zero-trust security compliance.

-- 3. Insert Doctors
INSERT INTO doctors (id, name, qualification, specialization, experience_years, consultation_fee, bio, is_active) VALUES
  (1, 'Dr. Akansha Sharma', 'BDS, MDS - Oral & Maxillofacial Implantology', 'Senior Implantologist & Cosmetic Surgeon', 14, 500.00, 'Specialist in immediate dental implants, full-arch restorations, and advanced bone grafting with over 14 years of surgical mastery.', TRUE),
  (2, 'Dr. Rajesh Deshmukh', 'BDS, MDS - Endodontics & Conservative Dentistry', 'Chief Endodontist & Microscopic RCT', 12, 400.00, 'Expert in painless single-sitting root canal treatments, smile redesigns, and tooth-colored composite restorations.', TRUE),
  (3, 'Dr. Neha Kapoor', 'BDS, MDS - Orthodontics & Dentofacial Orthopedics', 'Chief Orthodontist & Clear Aligner Specialist', 9, 450.00, 'Certified invisalign and self-ligating braces specialist transforming patient smiles with discreet modern aligners.', TRUE),
  (4, 'Dr. Amit Patel', 'BDS, MDS - Periodontics & Oral Implantology', 'Periodontist & Gum Laser Surgeon', 10, 350.00, 'Laser gum surgery, dental bone regeneration, deep periodontal therapy, and aesthetic crown lengthening.', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Doctor Schedules (OPD Duty Shifts: 10:00 - 13:30 & 17:00 - 20:30)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
  (1, 1, '10:00:00', '13:30:00', TRUE),
  (1, 1, '17:00:00', '20:30:00', TRUE),
  (1, 2, '10:00:00', '13:30:00', TRUE),
  (1, 2, '17:00:00', '20:30:00', TRUE),
  (1, 3, '10:00:00', '13:30:00', TRUE),
  (1, 3, '17:00:00', '20:30:00', TRUE),
  (1, 4, '10:00:00', '13:30:00', TRUE),
  (1, 4, '17:00:00', '20:30:00', TRUE),
  (1, 5, '10:00:00', '13:30:00', TRUE),
  (1, 5, '17:00:00', '20:30:00', TRUE),
  (1, 6, '10:00:00', '17:00:00', TRUE),
  (2, 1, '10:00:00', '13:30:00', TRUE),
  (2, 1, '17:00:00', '20:30:00', TRUE),
  (2, 2, '10:00:00', '13:30:00', TRUE),
  (2, 2, '17:00:00', '20:30:00', TRUE),
  (2, 3, '10:00:00', '13:30:00', TRUE),
  (2, 3, '17:00:00', '20:30:00', TRUE),
  (2, 4, '10:00:00', '13:30:00', TRUE),
  (2, 4, '17:00:00', '20:30:00', TRUE),
  (2, 5, '10:00:00', '13:30:00', TRUE),
  (2, 5, '17:00:00', '20:30:00', TRUE),
  (2, 6, '10:00:00', '16:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_available=VALUES(is_available);

-- 5. Insert Dental Services Catalog
INSERT INTO services (id, name, category, base_price, duration_minutes, description, is_active) VALUES
  (100, 'General Dental Checkup & Consultation', 'Diagnostic & Preventative', 399.00, 30, 'Comprehensive intraoral examination, digital X-ray screening, periodontal health score, and tailored treatment planning.', TRUE),
  (1, 'Immediate Dental Implants', 'Implantology & Surgery', 32990.00, 60, 'Same-day precision implants, biological integration, and custom zirconia natural-feel crowns.', TRUE),
  (2, 'Single-Visit Root Canal Treatment', 'Endodontics', 3500.00, 45, 'Rotary microscopic cleaning, painless apex locator disinfection, and hermetic bio-ceramic seal.', TRUE),
  (3, 'Clear Aligners & Invisible Braces', 'Orthodontics', 7000.00, 40, 'Custom 3D scanned transparent aligners for discreet, comfortable teeth straightening.', TRUE),
  (4, 'Deep Teeth Cleaning & Ultrasonic Scaling', 'Preventive Dentistry', 1499.00, 30, 'Removal of dental plaque, tartar, coffee/tobacco stains, and enamel fluoride polish.', TRUE),
  (5, 'Composite Aesthetic Tooth Fillings', 'Cosmetic Dentistry', 1200.00, 30, 'Invisible tooth-colored bio-compatible resin restorations matching your natural tooth shade.', TRUE),
  (6, 'Wisdom Tooth Painless Extraction', 'Oral Surgery', 2500.00, 45, 'Atraumatic surgical removal of impacted wisdom teeth with quick-healing socket preservation.', TRUE),
  (7, 'Full Mouth Rehabilitation', 'Advanced Prosthodontics', 45000.00, 90, 'Complete structural restoration of severely worn, broken, or missing teeth with precision crowns.', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Patients and Appointments are created dynamically via real patient interactions and protected EHR endpoints.
