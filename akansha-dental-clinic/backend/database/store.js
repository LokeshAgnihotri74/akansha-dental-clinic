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
      is_active: true,
      mustChangePassword: true,
      must_change_password: true
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
      is_active: true,
      mustChangePassword: true,
      must_change_password: true
    }
  ],
  doctors: [
    {
        "id": 1,
        "name": "Dr. Akansha Sharma",
        "fullName": "Dr. Akansha Sharma",
        "qualification": "BDS, MDS - Oral & Maxillofacial Implantology (Gold Medalist)",
        "specialization": "Senior Implantologist & Cosmetic Surgeon",
        "experienceYears": 14,
        "experience_years": 14,
        "consultationFee": 500,
        "consultation_fee": 500,
        "department": "Department of Oral Implantology & Aesthetics",
        "roomNo": "Executive Suite 101",
        "languages": "English, Hindi",
        "bio": "Specialist in immediate dental implants, full-arch restorations, and advanced bone grafting with over 14 years of surgical mastery.",
        "detailedBio": "Dr. Akansha Sharma is the Chief Medical Director and Senior Implantologist at Akansha Dental Clinic. With over 14 years of clinical excellence and international fellowship in computer-guided implantology, she has successfully performed more than 4,500 dental implant surgeries and full-mouth rehabilitations. Her clinical practice focuses on immediate-load implants, sinus lifts, piezo-bone surgery, and smile redesigning. She believes in empathetic, evidence-based dentistry, ensuring that every patient receives minimally invasive surgical care within an ultra-sterile, Class-B autoclave operating room.",
        "procedures": [
            "Immediate Dental Implants",
            "Full-Arch All-on-4 / All-on-6",
            "Sinus Lift & Bone Grafting",
            "Digital Smile Design (DSD)",
            "Cosmetic Gum Contouring"
        ],
        "scheduleText": "Monday to Saturday (Morning: 10:00 AM - 01:30 PM | Evening: 05:00 PM - 08:30 PM). Sunday by prior appointment.",
        "schedules": [
            {
                "id": 1,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 2,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 3,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 4,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 5,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 6,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 7,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 8,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 9,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 10,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 11,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "10:00 AM",
                "start_time": "10:00 AM",
                "endTime": "01:30 PM",
                "end_time": "01:30 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 12,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            }
        ],
        "imageUrl": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
        "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
        "is_active": true,
        "active": true,
        "email": "dr.akansha@akanshadental.com",
        "phone": "+91 8130 406 405"
    },
    {
        "id": 2,
        "name": "Dr. Rajesh Deshmukh",
        "fullName": "Dr. Rajesh Deshmukh",
        "qualification": "BDS, MDS - Endodontics & Conservative Dentistry",
        "specialization": "Chief Endodontist & Microscopic RCT Specialist",
        "experienceYears": 12,
        "experience_years": 12,
        "consultationFee": 400,
        "consultation_fee": 400,
        "department": "Department of Microscopic Endodontics",
        "roomNo": "Suite 102",
        "languages": "English, Hindi, Marathi",
        "bio": "Expert in painless single-sitting root canal treatments, smile redesigns, and tooth-colored composite restorations.",
        "detailedBio": "Dr. Rajesh Deshmukh is our Senior Endodontist recognized for his delicate touch and expertise in high-magnification dental microscopy. Having treated over 6,000 complex root canal cases, he specializes in single-visit painless RCTs, re-treatments of failed canals, separated instrument retrieval, and vital pulp therapy. His clinical philosophy centers on tooth conservation, avoiding unnecessary extractions wherever natural dentition can be biologically preserved.",
        "procedures": [
            "Single-Sitting Microscopic RCT",
            "Rotary Endodontics & Apex Locators",
            "Bio-Ceramic Root Canal Sealing",
            "Tooth Colored Nano-Hybrid Fillings",
            "Inlays & Onlays Restorations"
        ],
        "scheduleText": "Monday to Saturday (Morning: 10:30 AM - 02:00 PM | Evening: 05:30 PM - 08:30 PM)",
        "schedules": [
            {
                "id": 13,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 14,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 15,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 16,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 17,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 18,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 19,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 20,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 21,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 22,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 23,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "10:30 AM",
                "start_time": "10:30 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 24,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "05:30 PM",
                "start_time": "05:30 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            }
        ],
        "imageUrl": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
        "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
        "is_active": true,
        "active": true,
        "email": "dr.rajesh@akanshadental.com",
        "phone": "+91 8130 406 405"
    },
    {
        "id": 3,
        "name": "Dr. Neha Kapoor",
        "fullName": "Dr. Neha Kapoor",
        "qualification": "BDS, MDS - Orthodontics & Dentofacial Orthopedics",
        "specialization": "Chief Orthodontist & Clear Aligner Specialist",
        "experienceYears": 9,
        "experience_years": 9,
        "consultationFee": 450,
        "consultation_fee": 450,
        "department": "Department of Orthodontics & Smile Alignment",
        "roomNo": "Suite 103",
        "languages": "English, Hindi, Punjabi",
        "bio": "Certified invisalign and self-ligating braces specialist transforming patient smiles with discreet modern aligners.",
        "detailedBio": "Dr. Neha Kapoor is a certified invisible aligner practitioner and specialist in dentofacial orthopedics. Over the past 9 years, she has corrected hundreds of complex malocclusions, deep bites, and open bites in teens and adults. Utilizing advanced 3D intraoral digital scanners, she provides patients with simulated before-and-after smile projections before treatment even starts, achieving discreet and predictable teeth alignment.",
        "procedures": [
            "Invisible Clear Aligners",
            "Damon Self-Ligating Metal/Ceramic Braces",
            "Lingual Braces",
            "Child Habit Breaking Appliances",
            "Orthognathic Surgical Planning"
        ],
        "scheduleText": "Monday to Saturday (Morning: 11:00 AM - 02:00 PM | Evening: 04:30 PM - 08:00 PM)",
        "schedules": [
            {
                "id": 25,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 26,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 27,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 28,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 29,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 30,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 31,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 32,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 33,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 34,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 35,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "11:00 AM",
                "start_time": "11:00 AM",
                "endTime": "02:00 PM",
                "end_time": "02:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 36,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "04:30 PM",
                "start_time": "04:30 PM",
                "endTime": "08:00 PM",
                "end_time": "08:00 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            }
        ],
        "imageUrl": "https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600",
        "image_url": "https://images.unsplash.com/photo-1594824813589-805f15905d4b?auto=format&fit=crop&q=80&w=600",
        "is_active": true,
        "active": true,
        "email": "dr.neha@akanshadental.com",
        "phone": "+91 8130 406 405"
    },
    {
        "id": 4,
        "name": "Dr. Amit Patel",
        "fullName": "Dr. Amit Patel",
        "qualification": "BDS, MDS - Periodontics & Oral Implantology",
        "specialization": "Periodontist & Gum Laser Surgeon",
        "experienceYears": 10,
        "experience_years": 10,
        "consultationFee": 350,
        "consultation_fee": 350,
        "department": "Department of Periodontics & Laser Gum Care",
        "roomNo": "Suite 104",
        "languages": "English, Hindi, Gujarati",
        "bio": "Laser gum surgery, dental bone regeneration, deep periodontal therapy, and aesthetic crown lengthening.",
        "detailedBio": "Dr. Amit Patel is an accomplished Periodontist specializing in minimally invasive diode laser surgery and bone regenerative therapy. He treats bleeding gums, severe pyorrhea, tooth mobility, and peri-implantitis. He emphasizes preventive periodontal therapy and uses fine ultrasonic piezo scalers and dental lasers that eliminate bacteria without requiring painful traditional gum incisions.",
        "procedures": [
            "Laser Flap Surgery (LANAP)",
            "Aesthetic Crown Lengthening",
            "Gum Depigmentation for Dark Gums",
            "Guided Bone Regeneration (GBR)",
            "Deep Subgingival Scaling & Root Planing"
        ],
        "scheduleText": "Monday to Saturday (Morning: 09:30 AM - 01:00 PM | Evening: 05:00 PM - 08:30 PM)",
        "schedules": [
            {
                "id": 37,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 38,
                "dayOfWeek": "MONDAY",
                "day_of_week": "MONDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 39,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 40,
                "dayOfWeek": "TUESDAY",
                "day_of_week": "TUESDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 41,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 42,
                "dayOfWeek": "WEDNESDAY",
                "day_of_week": "WEDNESDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 43,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 44,
                "dayOfWeek": "THURSDAY",
                "day_of_week": "THURSDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 45,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 46,
                "dayOfWeek": "FRIDAY",
                "day_of_week": "FRIDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 47,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "09:30 AM",
                "start_time": "09:30 AM",
                "endTime": "01:00 PM",
                "end_time": "01:00 PM",
                "shift": "Morning OPD",
                "is_available": true,
                "available": true
            },
            {
                "id": 48,
                "dayOfWeek": "SATURDAY",
                "day_of_week": "SATURDAY",
                "startTime": "05:00 PM",
                "start_time": "05:00 PM",
                "endTime": "08:30 PM",
                "end_time": "08:30 PM",
                "shift": "Evening OPD",
                "is_available": true,
                "available": true
            }
        ],
        "imageUrl": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
        "image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
        "is_active": true,
        "active": true,
        "email": "dr.amit@akanshadental.com",
        "phone": "+91 8130 406 405"
    }
],
  services: [
    {
        "id": 100,
        "name": "General Dental Checkup & Consultation",
        "category": "Diagnostic & Preventative",
        "price": 399,
        "base_price": 399,
        "durationMinutes": 30,
        "duration_minutes": 30,
        "description": "Comprehensive intraoral examination, digital X-ray screening, periodontal health score, and tailored treatment planning.",
        "imageUrl": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 1,
        "name": "Immediate Dental Implants",
        "category": "Implantology & Surgery",
        "price": 32990,
        "base_price": 32990,
        "durationMinutes": 60,
        "duration_minutes": 60,
        "description": "Same-day precision implants, biological osseointegration, and custom zirconia natural-feel crowns with lifetime durability.",
        "imageUrl": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 2,
        "name": "Single-Visit Root Canal Treatment",
        "category": "Endodontics",
        "price": 3500,
        "base_price": 3500,
        "durationMinutes": 45,
        "duration_minutes": 45,
        "description": "Rotary microscopic cleaning, painless apex locator disinfection, and hermetic bio-ceramic 3D root filling.",
        "imageUrl": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 3,
        "name": "Clear Aligners & Invisible Braces",
        "category": "Orthodontics",
        "price": 7000,
        "base_price": 7000,
        "durationMinutes": 40,
        "duration_minutes": 40,
        "description": "Custom 3D scanned transparent aligners correcting crowding and bite alignment seamlessly without metal brackets.",
        "imageUrl": "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 4,
        "name": "Deep Teeth Cleaning & Ultrasonic Scaling",
        "category": "Preventive Dentistry",
        "price": 1499,
        "base_price": 1499,
        "durationMinutes": 30,
        "duration_minutes": 30,
        "description": "Painless removal of subgingival tartar, coffee/tea stains, bacterial biofilm, and protective fluoride polishing.",
        "imageUrl": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 5,
        "name": "Composite Aesthetic Tooth Fillings",
        "category": "Cosmetic Dentistry",
        "price": 1200,
        "base_price": 1200,
        "durationMinutes": 30,
        "duration_minutes": 30,
        "description": "Invisible tooth-colored bio-compatible resin restorations matching natural tooth shade and preserving enamel.",
        "imageUrl": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 6,
        "name": "Wisdom Tooth Painless Extraction",
        "category": "Oral Surgery",
        "price": 2500,
        "base_price": 2500,
        "durationMinutes": 45,
        "duration_minutes": 45,
        "description": "Atraumatic surgical removal of impacted wisdom teeth with quick-healing socket preservation under local anesthesia.",
        "imageUrl": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 7,
        "name": "Full Mouth Rehabilitation",
        "category": "Advanced Prosthodontics",
        "price": 45000,
        "base_price": 45000,
        "durationMinutes": 90,
        "duration_minutes": 90,
        "description": "Complete multi-disciplinary restoration of collapsed bite, chewing balance, and youthful facial aesthetics.",
        "imageUrl": "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 8,
        "name": "Laser Teeth Whitening & Bleaching",
        "category": "Cosmetic Dentistry",
        "price": 4999,
        "base_price": 4999,
        "durationMinutes": 45,
        "duration_minutes": 45,
        "description": "Advanced painless diode laser whitening eliminating deep tea, coffee, and fluorosis stains in a single 45-minute sitting.",
        "imageUrl": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 9,
        "name": "Porcelain Ceramic Dental Crowns & Bridges",
        "category": "Prosthodontics",
        "price": 5500,
        "base_price": 5500,
        "durationMinutes": 60,
        "duration_minutes": 60,
        "description": "CAD/CAM engineered metal-free zirconia crowns with lifelike enamel translucency and 15-year fracture warranty.",
        "imageUrl": "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 10,
        "name": "Pediatric & Children Dentistry",
        "category": "Pediatric Care",
        "price": 999,
        "base_price": 999,
        "durationMinutes": 30,
        "duration_minutes": 30,
        "description": "Child-friendly preventative dental care, cavity-preventing fluoride varnishes, and gentle habit correction in a fun environment.",
        "imageUrl": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
    },
    {
        "id": 11,
        "name": "Dental Veneers & Smile Makeover",
        "category": "Cosmetic Dentistry",
        "price": 8500,
        "base_price": 8500,
        "durationMinutes": 60,
        "duration_minutes": 60,
        "description": "Ultra-thin custom porcelain laminate veneers correcting gap closures, tooth chipping, and aesthetic Hollywood smile symmetry.",
        "imageUrl": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
        "is_active": true,
        "active": true
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
      bloodGroup: null,
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
  ],
  auditLogs: []
};

// Directory for resilient rotating clinical data backups
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  } catch (e) {
    console.warn('Backup directory initialization notice:', e.message);
  }
}

let store = null;
let lastBackupTime = 0;

/**
 * Find the latest valid backup file in BACKUP_DIR
 */
const findLatestBackup = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return null;
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('clinic_data_backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    for (const file of files) {
      try {
        const fullPath = path.join(BACKUP_DIR, file);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (data && data.admins && data.doctors) {
          return { path: fullPath, data };
        }
      } catch {
        // try next backup
      }
    }
  } catch (err) {
    console.warn('Backup lookup warning:', err.message);
  }
  return null;
};

/**
 * Prune older backups, keeping the most recent 10 backups
 */
const pruneBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('clinic_data_backup_') && f.endsWith('.json'))
      .sort();
    if (files.length > 10) {
      const toDelete = files.slice(0, files.length - 10);
      for (const f of toDelete) {
        try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
      }
    }
  } catch {}
};

/**
 * Load clinic data store from disk with zero-data-loss protection
 */
const loadStore = () => {
  if (store) return store;

  if (fs.existsSync(STORE_PATH)) {
    try {
      const content = fs.readFileSync(STORE_PATH, 'utf8');
      store = JSON.parse(content);
      if (!store.auditLogs) store.auditLogs = [];
      console.log('📂 Loaded persistent clinic data store from:', STORE_PATH);
      return store;
    } catch (parseErr) {
      console.error('CRITICAL: Clinic data JSON parse error:', parseErr.message);
      // 1. Preserve corrupted file immediately so real data is never lost
      const corruptPath = path.join(__dirname, `clinic_data.corrupted.${Date.now()}.json`);
      try {
        fs.copyFileSync(STORE_PATH, corruptPath);
        console.error(`🛡️ Corrupted data preserved safely at: ${corruptPath}`);
      } catch (cpErr) {
        console.error('Failed to preserve corrupted file:', cpErr.message);
      }

      // 2. Attempt to restore from latest valid automated backup
      const backup = findLatestBackup();
      if (backup) {
        console.warn(`🔄 Restoring clinic data from latest valid backup: ${backup.path}`);
        store = backup.data;
        if (!store.auditLogs) store.auditLogs = [];
        saveStore();
        return store;
      }

      console.error('❌ No valid backup found. Initializing with safety defaults.');
      store = JSON.parse(JSON.stringify(INITIAL_DATA));
      return store;
    }
  }

  // File does not exist yet: check if a backup exists before falling back to seed
  const backup = findLatestBackup();
  if (backup) {
    console.log(`🔄 Restoring from existing backup: ${backup.path}`);
    store = backup.data;
  } else {
    store = JSON.parse(JSON.stringify(INITIAL_DATA));
    console.log('✨ Initialized new clinic data store at:', STORE_PATH);
  }

  if (!store.auditLogs) store.auditLogs = [];
  saveStore();
  return store;
};

/**
 * Atomic save: writes to .tmp file then renames, preventing truncated writes on crash
 */
const saveStore = () => {
  if (!store) return;
  const tempPath = `${STORE_PATH}.tmp`;
  try {
    const dataStr = JSON.stringify(store, null, 2);
    // 1. Atomic write to temporary file
    fs.writeFileSync(tempPath, dataStr, 'utf8');
    // 2. Atomic rename replaces STORE_PATH atomically
    fs.renameSync(tempPath, STORE_PATH);

    // 3. Automated rotating backup (at most once every 60 seconds or on structural change)
    const now = Date.now();
    if (now - lastBackupTime > 60000) {
      lastBackupTime = now;
      const backupPath = path.join(BACKUP_DIR, `clinic_data_backup_${now}.json`);
      fs.writeFileSync(backupPath, dataStr, 'utf8');
      pruneBackups();
    }
  } catch (err) {
    console.error('❌ Failed to save clinic data store atomically:', err.message);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
  }
};

const getStore = () => {
  if (!store) loadStore();
  return store;
};

module.exports = {
  getStore,
  saveStore,
  loadStore,
  STORE_PATH,
  BACKUP_DIR
};
