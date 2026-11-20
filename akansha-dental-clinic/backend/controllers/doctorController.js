const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');

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
  bio: d.bio || 'Compassionate oral healthcare specialist dedicated to clinical excellence.',
  image_url: d.image_url || d.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  imageUrl: d.imageUrl || d.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  is_active: d.is_active !== undefined ? d.is_active : (d.active !== undefined ? d.active : true),
  active: d.active !== undefined ? d.active : (d.is_active !== undefined ? d.is_active : true),
  email: d.email || `doctor${d.id}@akanshadental.com`,
  phone: d.phone || '+91 8130 406 405'
});

const getDoctors = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const store = getStore();

    let list = (store.doctors || []).map(normalizeDoctor);

    if (activeOnly) {
      list = list.filter(d => d.active);
    }

    return success(res, list, 'Doctors roster retrieved.');
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const doctor = store.doctors.find(d => d.id === id);
    if (!doctor) return error(res, `Doctor #${id} not found`, 404);
    return success(res, normalizeDoctor(doctor), 'Doctor profile retrieved.');
  } catch (err) {
    next(err);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const { name, fullName, qualification, specialization, experienceYears, experience_years, consultationFee, consultation_fee, bio, email, phone, imageUrl, image_url } = req.body;
    const store = getStore();

    const docName = fullName || name;
    if (!docName || !qualification) return error(res, 'Doctor name and qualification are required', 400);

    const newId = store.doctors.length > 0 ? Math.max(...store.doctors.map(d => d.id)) + 1 : 1;

    const newDoc = {
      id: newId,
      name: docName,
      fullName: docName,
      qualification,
      specialization: specialization || 'General Dentist',
      experienceYears: parseInt(experienceYears || experience_years || 5, 10),
      experience_years: parseInt(experienceYears || experience_years || 5, 10),
      consultationFee: parseFloat(consultationFee !== undefined ? consultationFee : (consultation_fee || 500)),
      consultation_fee: parseFloat(consultationFee !== undefined ? consultationFee : (consultation_fee || 500)),
      bio: bio || '',
      email: email || `doctor${newId}@akanshadental.com`,
      phone: phone || '+91 8130 406 405',
      imageUrl: imageUrl || image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      image_url: imageUrl || image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      active: true,
      is_active: true
    };

    store.doctors.push(newDoc);
    saveStore();

    return success(res, normalizeDoctor(newDoc), 'Doctor added successfully to clinic roster.', 201);
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const doc = store.doctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);

    Object.assign(doc, req.body);
    saveStore();

    return success(res, normalizeDoctor(doc), 'Doctor profile updated.');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const doc = store.doctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);

    const active = req.query.active !== undefined ? req.query.active === 'true' : !doc.active;
    doc.active = active;
    doc.is_active = active;
    saveStore();

    return success(res, normalizeDoctor(doc), `Doctor status updated.`);
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();

    store.doctors = store.doctors.filter(d => d.id !== id);
    saveStore();

    return success(res, null, `Doctor #${id} removed from roster.`);
  } catch (err) {
    next(err);
  }
};

const getSchedules = async (req, res, next) => {
  try {
    const schedules = [
      { id: 1, dayOfWeek: 'MONDAY', startTime: '09:00 AM', endTime: '07:30 PM', slotDurationMinutes: 30, available: true },
      { id: 2, dayOfWeek: 'TUESDAY', startTime: '09:00 AM', endTime: '07:30 PM', slotDurationMinutes: 30, available: true },
      { id: 3, dayOfWeek: 'WEDNESDAY', startTime: '09:00 AM', endTime: '07:30 PM', slotDurationMinutes: 30, available: true },
      { id: 4, dayOfWeek: 'THURSDAY', startTime: '09:00 AM', endTime: '07:30 PM', slotDurationMinutes: 30, available: true },
      { id: 5, dayOfWeek: 'FRIDAY', startTime: '09:00 AM', endTime: '07:30 PM', slotDurationMinutes: 30, available: true },
      { id: 6, dayOfWeek: 'SATURDAY', startTime: '09:00 AM', endTime: '05:00 PM', slotDurationMinutes: 30, available: true },
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
