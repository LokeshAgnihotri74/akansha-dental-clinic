const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');

const normalizeInquiry = (i) => ({
  id: i.id,
  fullName: i.fullName || i.full_name,
  full_name: i.fullName || i.full_name,
  email: i.email || '',
  phone: i.phone,
  subject: i.subject || 'General Inquiry',
  message: i.message,
  status: i.status || 'NEW',
  adminNotes: i.adminNotes || i.admin_notes || '',
  admin_notes: i.adminNotes || i.admin_notes || '',
  createdAt: i.createdAt || i.created_at || new Date().toISOString()
});

const submitInquiry = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !phone || !message) {
      return error(res, 'Full name, phone, and message are required.', 400);
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim() : null;
    const cleanSubj = subject ? subject.trim() : 'General Dental Inquiry';
    const cleanMsg = message.trim();

    // 1. Authoritative MySQL Insert
    if (getIsDbConnected()) {
      try {
        const result = await query(
          'INSERT INTO inquiries (full_name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, "NEW")',
          [cleanName, cleanEmail, cleanPhone, cleanSubj, cleanMsg]
        );
        const rows = await query('SELECT * FROM inquiries WHERE id = ?', [result.insertId]);
        const inq = normalizeInquiry(rows[0]);

        try {
          await notificationService.notifyDeskNewInquiry(inq);
        } catch (notifErr) {
          console.warn('Inquiry desk alert notice:', notifErr.message);
        }

        return success(res, inq, 'Thank you! Your message has been received by our clinic desk in MySQL.', 201);
      } catch (dbErr) {
        console.warn('MySQL submitInquiry error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const newId = store.inquiries.length > 0 ? Math.max(...store.inquiries.map(i => i.id)) + 1 : 1;

    const newInq = {
      id: newId,
      fullName: cleanName,
      full_name: cleanName,
      email: cleanEmail || '',
      phone: cleanPhone,
      subject: cleanSubj,
      message: cleanMsg,
      status: 'NEW',
      adminNotes: '',
      admin_notes: '',
      createdAt: new Date().toISOString()
    };

    store.inquiries.unshift(newInq);
    saveStore();

    try {
      await notificationService.notifyDeskNewInquiry(newInq);
    } catch (notifErr) {
      console.warn('Inquiry desk alert notice:', notifErr.message);
    }

    return success(res, normalizeInquiry(newInq), 'Thank you! Your message has been received by our clinic desk.', 201);
  } catch (err) {
    next(err);
  }
};

const getInquiries = async (req, res, next) => {
  try {
    const { status, search, page = 0, size = 15 } = req.query;
    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        let whereClauses = [];
        const params = [];

        if (status) {
          whereClauses.push('status = ?');
          params.push(status.toUpperCase());
        }
        if (search && search.trim()) {
          whereClauses.push('(full_name LIKE ? OR phone LIKE ? OR subject LIKE ?)');
          const q = `%${search.trim()}%`;
          params.push(q, q, q);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countRows = await query(`SELECT COUNT(*) as total FROM inquiries ${whereSql}`, params);
        const totalElements = countRows?.[0]?.total !== undefined ? Number(countRows[0].total) : 0;
        const totalPages = Math.ceil(totalElements / pageSize) || 1;

        const rows = await query(
          `SELECT * FROM inquiries ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
          [...params, pageSize, pageNum * pageSize]
        );

        return success(res, {
          content: (rows || []).map(normalizeInquiry),
          totalElements,
          totalPages,
          page: pageNum,
          size: pageSize
        }, 'Inquiries directory retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getInquiries error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    let list = store.inquiries || [];

    if (status) {
      list = list.filter(i => (i.status || '').toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.fullName || i.full_name || '').toLowerCase().includes(q) ||
        (i.phone || '').includes(q) ||
        (i.subject || '').toLowerCase().includes(q)
      );
    }

    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const paginated = list.slice(pageNum * pageSize, (pageNum + 1) * pageSize).map(normalizeInquiry);

    return success(res, {
      content: paginated,
      totalElements,
      totalPages,
      page: pageNum,
      size: pageSize
    }, 'Inquiries directory retrieved.');
  } catch (err) {
    next(err);
  }
};

const getInquiryById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM inquiries WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) return error(res, `Inquiry #${id} not found`, 404);
        return success(res, normalizeInquiry(rows[0]), 'Inquiry retrieved from MySQL.');
      } catch (dbErr) {
        console.warn('MySQL getInquiryById error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const inq = store.inquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);
    return success(res, normalizeInquiry(inq), 'Inquiry retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes, admin_notes } = req.body;
    const notes = adminNotes || admin_notes || '';

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const existing = await query('SELECT * FROM inquiries WHERE id = ? LIMIT 1', [id]);
        if (!existing || existing.length === 0) return error(res, `Inquiry #${id} not found`, 404);

        await query(
          'UPDATE inquiries SET status = COALESCE(?, status), admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
          [status ? status.toUpperCase() : null, notes || null, id]
        );

        const rows = await query('SELECT * FROM inquiries WHERE id = ?', [id]);
        return success(res, normalizeInquiry(rows[0]), 'Inquiry status updated in MySQL.');
      } catch (dbErr) {
        console.warn('MySQL updateStatus error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const inq = store.inquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);

    if (status) inq.status = status.toUpperCase();
    if (notes) {
      inq.adminNotes = notes;
      inq.admin_notes = notes;
    }
    inq.updated_at = new Date().toISOString();
    saveStore();

    return success(res, normalizeInquiry(inq), 'Inquiry status updated.');
  } catch (err) {
    next(err);
  }
};

const deleteInquiry = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (getIsDbConnected()) {
      try {
        await query('DELETE FROM inquiries WHERE id = ?', [id]);
        return success(res, null, `Inquiry #${id} removed from MySQL database.`);
      } catch (dbErr) {
        console.warn('MySQL deleteInquiry error:', dbErr.message);
      }
    }

    const store = getStore();
    const idx = store.inquiries.findIndex(i => i.id === id);
    if (idx === -1) return error(res, `Inquiry #${id} not found`, 404);

    store.inquiries.splice(idx, 1);
    saveStore();

    return success(res, null, `Inquiry #${id} removed.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitInquiry,
  submitContactRequest: submitInquiry,
  getInquiries,
  searchInquiries: getInquiries,
  getInquiryById,
  updateStatus,
  deleteInquiry
};
