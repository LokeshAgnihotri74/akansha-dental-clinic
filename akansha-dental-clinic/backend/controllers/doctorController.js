const { query, getIsDbConnected } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

let memoryDoctors = [
  {
    id: 1,
    name: 'Dr. Akansha Sharma',
    qualification: 'BDS, MDS - Oral & Maxillofacial Implantology',
    specialization: 'Senior Implantologist & Cosmetic Surgeon',
    experience_years: 14,
    consultation_fee: 500.00,
    bio: 'Specialist in immediate dental implants, full-arch restorations, and advanced bone grafting with over 14 years of surgical mastery.',
    is_active: true
  },
  {
    id: 2,
    name: 'Dr. Rajesh Deshmukh',
    qualification: 'BDS, MDS - Endodontics & Conservative Dentistry',
    specialization: 'Chief Endodontist & Microscopic RCT',
    experience_years: 12,
    consultation_fee: 400.00,
    bio: 'Expert in painless single-sitting root canal treatments, smile redesigns, and tooth-colored composite restorations.',
    is_active: true
  },
  {
    id: 3,
    name: 'Dr. Neha Kapoor',
    qualification: 'BDS, MDS - Orthodontics & Dentofacial Orthopedics',
    specialization: 'Chief Orthodontist & Clear Aligner Specialist',
    experience_years: 9,
    consultation_fee: 450.00,
    bio: 'Certified invisalign and self-ligating braces specialist transforming patient smiles with discreet modern aligners.',
    is_active: true
  },
  {
    id: 4,
    name: 'Dr. Amit Patel',
    qualification: 'BDS, MDS - Periodontics & Oral Implantology',
    specialization: 'Periodontist & Gum Laser Surgeon',
    experience_years: 10,
    consultation_fee: 350.00,
    bio: 'Laser gum surgery, dental bone regeneration, deep periodontal therapy, and aesthetic crown lengthening.',
    is_active: true
  }
];

let nextDoctorId = 5;

const normalizeDoctor = (d) => ({
  id: d.id,
  name: d.name || d.fullName,
  fullName: d.name || d.fullName,
  qualification: d.qualification,
  specialization: d.specialization,
  experience_years: d.experience_years || d.experienceYears || 5,
  experienceYears: d.experience_years || d.experienceYears || 5,
  consultation_fee: d.consultation_fee !== undefined ? d.consultation_fee : (d.consultationFee || 500),
  consultationFee: d.consultationFee !== undefined ? d.consultationFee : (d.consultation_fee || 500),
  bio: d.bio,
  image_url: d.image_url || d.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  imageUrl: d.imageUrl || d.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  is_active: d.is_active !== undefined ? d.is_active : true,
  email: d.email || `doctor${d.id}@akanshadental.com`,
  phone: d.phone || '+91 8130 406 405'
});

const getDoctors = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    let doctors = memoryDoctors;

    if (getIsDbConnected()) {
      try {
        let sql = 'SELECT * FROM doctors';
        if (activeOnly) sql += ' WHERE is_active = TRUE';
        sql += ' ORDER BY id ASC';
        const rows = await query(sql);
        if (rows && rows.length > 0) doctors = rows;
      } catch (err) {
        console.warn('DB getDoctors error:', err.message);
      }
    }

    if (activeOnly) {
      doctors = doctors.filter(d => d.is_active);
    }

    const normalized = doctors.map(normalizeDoctor);
    return success(res, normalized, 'Doctors roster retrieved.');
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const doctor = memoryDoctors.find(d => d.id === id);
    if (!doctor) return error(res, `Doctor #${id} not found`, 404);
    return success(res, normalizeDoctor(doctor), 'Doctor profile retrieved.');
  } catch (err) {
    next(err);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const { name, qualification, specialization, experience_years, consultation_fee, bio } = req.body;
    if (!name || !qualification) return error(res, 'Name and qualification are required', 400);

    const newDoc = {
      id: nextDoctorId++,
      name,
      qualification,
      specialization: specialization || 'General Dentist',
      experience_years: parseInt(experience_years, 10) || 5,
      consultation_fee: parseFloat(consultation_fee) || 0.00,
      bio: bio || '',
      is_active: true
    };

    memoryDoctors.push(newDoc);
    return success(res, newDoc, 'Doctor added successfully to clinic roster.', 201);
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const doc = memoryDoctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);

    Object.assign(doc, req.body);
    return success(res, doc, 'Doctor profile updated.');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const doc = memoryDoctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);

    const active = req.query.active !== undefined ? req.query.active === 'true' : !doc.is_active;
    doc.is_active = active;
    return success(res, doc, `Doctor status updated to ${active ? 'Active' : 'Inactive'}.`);
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    memoryDoctors = memoryDoctors.filter(d => d.id !== id);
    return success(res, null, `Doctor #${id} removed from roster.`);
  } catch (err) {
    next(err);
  }
};

const getSchedules = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedules = [
      { day_of_week: 1, start_time: '09:00:00', end_time: '19:30:00', is_available: true },
      { day_of_week: 2, start_time: '09:00:00', end_time: '19:30:00', is_available: true },
      { day_of_week: 3, start_time: '09:00:00', end_time: '19:30:00', is_available: true },
      { day_of_week: 4, start_time: '09:00:00', end_time: '19:30:00', is_available: true },
      { day_of_week: 5, start_time: '09:00:00', end_time: '19:30:00', is_available: true },
      { day_of_week: 6, start_time: '09:00:00', end_time: '17:00:00', is_available: true },
    ];
    return success(res, schedules, 'Doctor weekly schedule retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleStatus,
  deleteDoctor,
  getSchedules
};
