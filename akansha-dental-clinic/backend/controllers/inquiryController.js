const { query, getIsDbConnected } = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');

let memoryInquiries = [
  {
    id: 1,
    full_name: 'Amitabh Sen',
    email: 'amitabh.sen@example.com',
    phone: '9893123456',
    subject: 'Dental Implant Cost Enquiry',
    message: 'Hello doctor, I would like to know the cost of full mouth implants and healing time.',
    status: 'NEW',
    admin_notes: '',
    created_at: new Date().toISOString()
  }
];

let nextInquiryId = 2;

const submitInquiry = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !phone || !message) {
      return error(res, 'Full name, phone, and message are required.', 400);
    }

    const newInq = {
      id: nextInquiryId++,
      full_name: fullName,
      email: email || '',
      phone,
      subject: subject || 'General Dental Inquiry',
      message,
      status: 'NEW',
      admin_notes: '',
      created_at: new Date().toISOString()
    };

    memoryInquiries.unshift(newInq);

    try {
      await notificationService.notifyDeskNewInquiry(newInq);
    } catch (notifErr) {
      console.warn('Inquiry desk alert failed:', notifErr.message);
    }

    return success(res, newInq, 'Thank you! Your message has been received by our clinic desk.', 201);
  } catch (err) {
    next(err);
  }
};

const searchInquiries = async (req, res, next) => {
  try {
    const { status, page = 0, size = 10 } = req.query;
    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let list = memoryInquiries;
    if (status) {
      list = list.filter(i => i.status === status);
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
    const inq = memoryInquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);
    return success(res, inq, 'Inquiry details retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    const inq = memoryInquiries.find(i => i.id === id);
    if (!inq) return error(res, `Inquiry #${id} not found`, 404);

    if (status) inq.status = status;
    if (adminNotes !== undefined) inq.admin_notes = adminNotes;

    return success(res, inq, 'Inquiry status updated.');
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
