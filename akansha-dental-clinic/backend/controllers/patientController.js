const { query, getIsDbConnected } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

let memoryPatients = [
  {
    id: 1,
    full_name: 'Sunita Verma',
    phone: '9826012345',
    email: 'sunita.verma@example.com',
    date_of_birth: '1988-04-12',
    gender: 'FEMALE',
    blood_group: 'B+',
    medical_history: 'No chronic allergies. History of mild tooth sensitivity in lower molar.',
    created_at: new Date().toISOString()
  }
];

let nextPatientId = 2;

const getPatients = async (req, res, next) => {
  try {
    const { search, page = 0, size = 10 } = req.query;
    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let list = memoryPatients;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.full_name.toLowerCase().includes(q) ||
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
    const pat = memoryPatients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);
    return success(res, pat, 'Patient record retrieved.');
  } catch (err) {
    next(err);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const { full_name, phone, email, date_of_birth, gender, blood_group, medical_history } = req.body;
    if (!full_name || !phone) return error(res, 'Full name and phone are required', 400);

    const newPat = {
      id: nextPatientId++,
      full_name,
      phone,
      email: email || null,
      date_of_birth: date_of_birth || null,
      gender: gender || 'OTHER',
      blood_group: blood_group || null,
      medical_history: medical_history || '',
      created_at: new Date().toISOString()
    };

    memoryPatients.unshift(newPat);
    return success(res, newPat, 'Patient registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pat = memoryPatients.find(p => p.id === id);
    if (!pat) return error(res, `Patient #${id} not found`, 404);

    Object.assign(pat, req.body);
    return success(res, pat, 'Patient record updated.');
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
