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
  phone: d.phone || '+91 8130 406 405',
  schedules: d.schedules || []
});

const getDoctors = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly !== 'false';

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const whereClause = activeOnly ? 'WHERE is_active = TRUE' : '';
        const docRows = await query(`SELECT * FROM doctors ${whereClause} ORDER BY id ASC`);
        const schedRows = await query('SELECT * FROM doctor_schedules WHERE is_available = TRUE ORDER BY id ASC');

        const DAY_NAMES_BY_NUM = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        const schedulesByDoc = {};
        (schedRows || []).forEach(s => {
          if (!schedulesByDoc[s.doctor_id]) schedulesByDoc[s.doctor_id] = [];
          const dayName = DAY_NAMES_BY_NUM[s.day_of_week] || 'MONDAY';
          schedulesByDoc[s.doctor_id].push({
            id: s.id,
            dayOfWeek: dayName,
            day_of_week: dayName,
            startTime: s.start_time,
            start_time: s.start_time,
            endTime: s.end_time,
            end_time: s.end_time,
            is_available: Boolean(s.is_available),
            available: Boolean(s.is_available)
          });
        });

        const list = (docRows || []).map(d => {
          const docNorm = normalizeDoctor(d);
          docNorm.schedules = schedulesByDoc[d.id] || [];
          return docNorm;
        });

        return success(res, list, 'Doctors roster retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getDoctors error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
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

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM doctors WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) return error(res, `Doctor #${id} not found`, 404);

        const schedRows = await query('SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY id ASC', [id]);
        const DAY_NAMES_BY_NUM = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        const doc = normalizeDoctor(rows[0]);
        doc.schedules = (schedRows || []).map(s => {
          const dayName = DAY_NAMES_BY_NUM[s.day_of_week] || 'MONDAY';
          return {
            id: s.id,
            dayOfWeek: dayName,
            day_of_week: dayName,
            startTime: s.start_time,
            start_time: s.start_time,
            endTime: s.end_time,
            end_time: s.end_time,
            is_available: Boolean(s.is_available),
            available: Boolean(s.is_available)
          };
        });

        return success(res, doc, 'Doctor profile retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getDoctorById error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
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
    const docName = fullName || name;
    if (!docName || !qualification) return error(res, 'Doctor name and qualification are required', 400);

    const exp = parseInt(experienceYears || experience_years || 5, 10);
    const fee = parseFloat(consultationFee !== undefined ? consultationFee : (consultation_fee || 500));
    const img = imageUrl || image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600';

    // 1. Authoritative MySQL Insert
    if (getIsDbConnected()) {
      try {
        const result = await query(
          `INSERT INTO doctors (name, qualification, specialization, experience_years, consultation_fee, bio, image_url, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [docName, qualification, specialization || 'General Dentist', exp, fee, bio || '', img]
        );
        const rows = await query('SELECT * FROM doctors WHERE id = ?', [result.insertId]);
        return success(res, normalizeDoctor(rows[0]), 'Doctor added successfully to clinic roster in MySQL.', 201);
      } catch (dbErr) {
        console.warn('MySQL createDoctor error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const newId = store.doctors.length > 0 ? Math.max(...store.doctors.map(d => d.id)) + 1 : 1;

    const newDoc = {
      id: newId,
      name: docName,
      fullName: docName,
      qualification,
      specialization: specialization || 'General Dentist',
      experienceYears: exp,
      experience_years: exp,
      consultationFee: fee,
      consultation_fee: fee,
      bio: bio || '',
      email: email || `doctor${newId}@akanshadental.com`,
      phone: phone || '+91 8130 406 405',
      imageUrl: img,
      image_url: img,
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

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const existing = await query('SELECT * FROM doctors WHERE id = ?', [id]);
        if (!existing || existing.length === 0) return error(res, `Doctor #${id} not found`, 404);

        const { name, fullName, qualification, specialization, experienceYears, experience_years, consultationFee, consultation_fee, bio, imageUrl, image_url } = req.body;
        await query(
          `UPDATE doctors 
           SET name = COALESCE(?, name),
               qualification = COALESCE(?, qualification),
               specialization = COALESCE(?, specialization),
               experience_years = COALESCE(?, experience_years),
               consultation_fee = COALESCE(?, consultation_fee),
               bio = COALESCE(?, bio),
               image_url = COALESCE(?, image_url)
           WHERE id = ?`,
          [
            fullName || name || null,
            qualification || null,
            specialization || null,
            experienceYears || experience_years || null,
            consultationFee !== undefined ? consultationFee : (consultation_fee !== undefined ? consultation_fee : null),
            bio !== undefined ? bio : null,
            imageUrl || image_url || null,
            id
          ]
        );

        const rows = await query('SELECT * FROM doctors WHERE id = ?', [id]);
        return success(res, normalizeDoctor(rows[0]), 'Doctor updated successfully in MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL updateDoctor error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const doc = store.doctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);

    Object.assign(doc, req.body);
    saveStore();

    return success(res, normalizeDoctor(doc), 'Doctor updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (getIsDbConnected()) {
      try {
        await query('UPDATE doctors SET is_active = FALSE WHERE id = ?', [id]);
        return success(res, null, `Doctor #${id} deactivated successfully in MySQL database.`);
      } catch (dbErr) {
        console.warn('MySQL deleteDoctor error:', dbErr.message);
      }
    }

    const store = getStore();
    const idx = store.doctors.findIndex(d => d.id === id);
    if (idx === -1) return error(res, `Doctor #${id} not found`, 404);

    store.doctors[idx].is_active = false;
    store.doctors[idx].active = false;
    saveStore();

    return success(res, null, `Doctor #${id} deactivated successfully.`);
  } catch (err) {
    next(err);
  }
};

const getSchedules = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week ASC', [id]);
        return success(res, rows, 'Doctor schedules retrieved from MySQL.');
      } catch (dbErr) {
        console.warn('MySQL getSchedules error:', dbErr.message);
      }
    }
    const store = getStore();
    const doc = store.doctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);
    return success(res, doc.schedules || [], 'Doctor schedules retrieved.');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (getIsDbConnected()) {
      try {
        await query('UPDATE doctors SET is_active = NOT is_active WHERE id = ?', [id]);
        const rows = await query('SELECT * FROM doctors WHERE id = ?', [id]);
        return success(res, normalizeDoctor(rows[0]), 'Doctor status toggled in MySQL.');
      } catch (dbErr) {
        console.warn('MySQL toggleStatus error:', dbErr.message);
      }
    }
    const store = getStore();
    const doc = store.doctors.find(d => d.id === id);
    if (!doc) return error(res, `Doctor #${id} not found`, 404);
    doc.is_active = !doc.is_active;
    doc.active = doc.is_active;
    saveStore();
    return success(res, normalizeDoctor(doc), 'Doctor status toggled.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getSchedules,
  toggleStatus
};
