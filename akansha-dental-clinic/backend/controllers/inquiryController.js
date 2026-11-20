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
    const store = getStore();

    if (!fullName || !phone || !message) {
      return error(res, 'Full name, phone, and message are required.', 400);
    }

    const newId = store.inquiries.length > 0 ? Math.max(...store.inquiries.map(i => i.id)) + 1 : 1;

    const newInq = {
      id: newId,
      fullName: fullName.trim(),
      full_name: fullName.trim(),
      email: email ? email.trim() : '',
      phone: phone.trim(),
      subject: subject ? subject.trim() : 'General Dental Inquiry',
      message: message.trim(),
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

const searchInquiries = async (req, res, next) => {
  try {
    const { status, page = 0, size = 10 } = req.query;
    const store = getStore();

    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let list = (store.inquiries || []).map(normalizeInquiry);
    if (status) {
      list = list.filter(i => (i.status || '').toUpperCase() === status.toUpperCase());
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
    }, 'Inquiries retrieved.');
  } catch (err) {
    next(err);
  }
};

const getInquiryById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();
    const inq = store.inquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);
    return success(res, normalizeInquiry(inq), 'Inquiry details retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes, notes } = req.body;
    const store = getStore();

    const inq = store.inquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);

    if (status) inq.status = status.toUpperCase();
    if (adminNotes !== undefined || notes !== undefined) {
      inq.adminNotes = adminNotes || notes || '';
      inq.admin_notes = inq.adminNotes;
    }
    saveStore();

    return success(res, normalizeInquiry(inq), 'Inquiry status updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitInquiry,
  searchInquiries,
  getInquiryById,
  updateStatus
};
