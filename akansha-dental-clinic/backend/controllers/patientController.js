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
    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    // 1. Authoritative MySQL Read when connected
    if (getIsDbConnected()) {
      try {
        let whereClause = '';
        const params = [];

        if (search && search.trim()) {
          whereClause = 'WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?';
          const q = `%${search.trim()}%`;
          params.push(q, q, q);
        }

        const countRows = await query(`SELECT COUNT(*) as total FROM patients ${whereClause}`, params);
        const totalElements = countRows?.[0]?.total !== undefined ? Number(countRows[0].total) : 0;
        const totalPages = Math.ceil(totalElements / pageSize) || 1;

        const rows = await query(
          `SELECT * FROM patients ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
          [...params, pageSize, pageNum * pageSize]
        );

        const content = (rows || []).map(normalizePatient);

        return success(res, {
          content,
          totalElements,
          totalPages,
          page: pageNum,
          size: pageSize
        }, 'Patients directory retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getPatients query error:', dbErr.message);
      }
    }

    // 2. Local memory fallback (offline dev / test mode)
    const store = getStore();
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

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM patients WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) return error(res, `Patient #${id} not found`, 404);
        return success(res, normalizePatient(rows[0]), 'Patient record retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getPatientById query error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
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
    const name = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    if (!name || !phone) return error(res, 'Patient name and contact phone are required.', 400);

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim() : null;
    const cleanAddress = address && address.trim() ? address.trim() : 'Not recorded';
    const cleanBlood = bloodGroup && bloodGroup.trim() ? bloodGroup.trim() : 'Not recorded';
    const cleanHistory = medicalHistory && medicalHistory.trim() ? medicalHistory.trim() : 'Not recorded';

    // 1. Authoritative MySQL Insert
    if (getIsDbConnected()) {
      try {
        const result = await query(
          'INSERT INTO patients (full_name, phone, email, address, blood_group, medical_history) VALUES (?, ?, ?, ?, ?, ?)',
          [name, cleanPhone, cleanEmail, cleanAddress, cleanBlood, cleanHistory]
        );

        const newId = result.insertId;
        const rows = await query('SELECT * FROM patients WHERE id = ?', [newId]);

        await logAuditEvent({
          actor: req.user?.username || 'STAFF',
          action: 'PATIENT_REGISTERED',
          resource: 'PATIENTS',
          ipAddress: req.ip,
          details: `New patient registered in MySQL: ${name} (${cleanPhone})`
        });

        return success(res, normalizePatient(rows[0]), 'Patient created successfully in database.', 201);
      } catch (dbErr) {
        if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
          return error(res, `A patient with phone number ${cleanPhone} already exists.`, 409);
        }
        console.warn('MySQL createPatient insert error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const newId = store.patients.length > 0 ? Math.max(...store.patients.map(p => p.id)) + 1 : 1;

    const newPat = {
      id: newId,
      firstName: firstName || name.split(' ')[0],
      lastName: lastName || name.split(' ').slice(1).join(' ') || '',
      fullName: name,
      full_name: name,
      phone: cleanPhone,
      email: cleanEmail || '',
      address: cleanAddress,
      bloodGroup: cleanBlood,
      medicalHistory: cleanHistory,
      createdAt: new Date().toISOString()
    };

    store.patients.unshift(newPat);
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'STAFF',
      action: 'PATIENT_REGISTERED',
      resource: 'PATIENTS',
      ipAddress: req.ip,
      details: `New patient registered: ${name} (${cleanPhone})`
    });

    return success(res, normalizePatient(newPat), 'Patient created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { firstName, lastName, fullName, phone, email, address, bloodGroup, medicalHistory } = req.body;
    const name = fullName || (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined);

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const existing = await query('SELECT * FROM patients WHERE id = ?', [id]);
        if (!existing || existing.length === 0) return error(res, `Patient #${id} not found`, 404);

        await query(
          `UPDATE patients 
           SET full_name = COALESCE(?, full_name), 
               phone = COALESCE(?, phone), 
               email = COALESCE(?, email), 
               address = COALESCE(?, address), 
               blood_group = COALESCE(?, blood_group), 
               medical_history = COALESCE(?, medical_history) 
           WHERE id = ?`,
          [
            name || null,
            phone ? phone.trim() : null,
            email !== undefined ? (email ? email.trim() : null) : null,
            address !== undefined ? (address ? address.trim() : 'Not recorded') : null,
            bloodGroup !== undefined ? (bloodGroup ? bloodGroup.trim() : 'Not recorded') : null,
            medicalHistory !== undefined ? (medicalHistory ? medicalHistory.trim() : 'Not recorded') : null,
            id
          ]
        );

        const rows = await query('SELECT * FROM patients WHERE id = ?', [id]);

        await logAuditEvent({
          actor: req.user?.username || 'STAFF',
          action: 'PATIENT_UPDATED',
          resource: 'PATIENTS',
          ipAddress: req.ip,
          details: `Patient #${id} updated in MySQL`
        });

        return success(res, normalizePatient(rows[0]), 'Patient updated successfully in database.');
      } catch (dbErr) {
        console.warn('MySQL updatePatient error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const pat = store.patients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);

    if (name) pat.fullName = name.trim();
    if (firstName) pat.firstName = firstName.trim();
    if (lastName) pat.lastName = lastName.trim();
    if (phone) pat.phone = phone.trim();
    if (email !== undefined) pat.email = email.trim();
    if (address !== undefined) pat.address = address.trim();
    if (bloodGroup !== undefined) pat.bloodGroup = bloodGroup ? bloodGroup.trim() : 'Not recorded';
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
