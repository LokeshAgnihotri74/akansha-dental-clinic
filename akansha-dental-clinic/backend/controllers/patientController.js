const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');

const normalizePatient = (p) => ({
  id: p.id,
  firstName: p.firstName || (p.full_name || p.fullName || '').split(' ')[0] || 'Patient',
  lastName: p.lastName || (p.full_name || p.fullName || '').split(' ').slice(1).join(' ') || '',
  fullName: p.fullName || p.full_name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
  full_name: p.fullName || p.full_name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
  phone: p.phone,
  email: p.email || '',
  address: p.address || 'Bhopal, MP',
  dateOfBirth: p.dateOfBirth || p.date_of_birth || null,
  bloodGroup: p.bloodGroup || p.blood_group || 'B+',
  medicalHistory: p.medicalHistory || p.medical_history || '',
  createdAt: p.createdAt || p.created_at || new Date().toISOString()
});

const getPatients = async (req, res, next) => {
  try {
    const { search, page = 0, size = 10 } = req.query;
    const store = getStore();

    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let list = (store.patients || []).map(normalizePatient);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const paginated = list.slice(pageNum * pageSize, (pageNum + 1) * pageSize);

    return success(res, {
      content: paginated,
      totalElements,
      totalPages,
      page: pageNum,
      size: pageSize
    }, 'Patients directory retrieved.');
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const pat = store.patients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);
    return success(res, normalizePatient(pat), 'Patient record retrieved.');
  } catch (err) {
    next(err);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const { firstName, lastName, fullName, phone, email, address, medicalHistory } = req.body;
    const store = getStore();

    const name = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    if (!name || !phone) return error(res, 'Patient name and contact phone are required.', 400);

    const newId = store.patients.length > 0 ? Math.max(...store.patients.map(p => p.id)) + 1 : 1;

    const newPat = {
      id: newId,
      firstName: firstName || name.split(' ')[0],
      lastName: lastName || name.split(' ').slice(1).join(' ') || '',
      fullName: name,
      full_name: name,
      phone: phone.trim(),
      email: email || '',
      address: address || 'Bhopal, MP',
      medicalHistory: medicalHistory || '',
      createdAt: new Date().toISOString()
    };

    store.patients.unshift(newPat);
    saveStore();

    if (getIsDbConnected()) {
      try {
        await query(
          'INSERT INTO patients (full_name, phone, email, medical_history) VALUES (?, ?, ?, ?)',
          [name, phone.trim(), email || null, medicalHistory || null]
        );
      } catch (dbErr) {
        console.warn('MySQL patient insert notice:', dbErr.message);
      }
    }

    return success(res, normalizePatient(newPat), 'Patient registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const pat = store.patients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);

    Object.assign(pat, req.body);
    saveStore();

    return success(res, normalizePatient(pat), 'Patient record updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient
};
