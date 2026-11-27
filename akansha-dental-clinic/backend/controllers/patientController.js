const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');
const { logAuditEvent } = require('../services/auditService');

const normalizePatient = (p) => ({
  id: p.id,
  firstName: p.firstName || (p.full_name || p.fullName || '').split(' ')[0] || 'Patient',
  lastName: p.lastName || (p.full_name || p.fullName || '').split(' ').slice(1).join(' ') || '',
  fullName: p.fullName || p.full_name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
  full_name: p.fullName || p.full_name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
  phone: p.phone,
  email: (p.email && p.email.trim()) ? p.email.trim() : 'Not recorded',
  address: (p.address && p.address.trim()) ? p.address.trim() : 'Not recorded', // Never fabricate clinical addresses
  dateOfBirth: p.dateOfBirth || p.date_of_birth || null,
  bloodGroup: (p.bloodGroup || p.blood_group) && (p.bloodGroup || p.blood_group).trim() ? (p.bloodGroup || p.blood_group).trim() : 'Not recorded', // Never fabricate medical blood groups
  medicalHistory: (p.medicalHistory || p.medical_history) && (p.medicalHistory || p.medical_history).trim() ? (p.medicalHistory || p.medical_history).trim() : 'Not recorded',
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
    const { firstName, lastName, fullName, phone, email, address, bloodGroup, medicalHistory } = req.body;
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
      email: email ? email.trim() : '',
      address: address ? address.trim() : '', // No invented address
      bloodGroup: bloodGroup ? bloodGroup.trim() : null, // No invented blood group
      medicalHistory: medicalHistory ? medicalHistory.trim() : '',
      createdAt: new Date().toISOString()
    };

    store.patients.unshift(newPat);
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'STAFF',
      action: 'PATIENT_REGISTERED',
      resource: 'PATIENTS',
      ipAddress: req.ip,
      details: `New patient registered: ${name} (${phone})`
    });

    if (getIsDbConnected()) {
      try {
        await query(
          'INSERT INTO patients (full_name, phone, email, address, blood_group, medical_history) VALUES (?, ?, ?, ?, ?, ?)',
          [name, phone.trim(), newPat.email || null, newPat.address || null, newPat.bloodGroup || null, newPat.medicalHistory || null]
        );
      } catch (dbErr) {
        console.warn('MySQL patient insert notice:', dbErr.message);
      }
    }

    return success(res, normalizePatient(newPat), 'Patient created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { firstName, lastName, fullName, phone, email, address, bloodGroup, medicalHistory } = req.body;
    const store = getStore();

    const pat = store.patients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);

    if (fullName) pat.fullName = fullName.trim();
    if (firstName) pat.firstName = firstName.trim();
    if (lastName) pat.lastName = lastName.trim();
    if (phone) pat.phone = phone.trim();
    if (email !== undefined) pat.email = email.trim();
    if (address !== undefined) pat.address = address.trim();
    if (bloodGroup !== undefined) pat.bloodGroup = bloodGroup ? bloodGroup.trim() : null;
    if (medicalHistory !== undefined) pat.medicalHistory = medicalHistory.trim();

    pat.updatedAt = new Date().toISOString();
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'STAFF',
      action: 'PATIENT_UPDATED',
      resource: 'PATIENTS',
      ipAddress: req.ip,
      details: `Patient #${id} updated (${pat.fullName || pat.phone})`
    });

    return success(res, normalizePatient(pat), 'Patient updated successfully.');
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
