/**
 * Request Validation Middleware for Akansha Dental Clinic API
 */
const { error } = require('../utils/responseHelper');
const { getNowInIST } = require('../utils/slotEngine');

const stripHtml = (val) => {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Validate Appointment Booking Request Body
 * Seamlessly supports both `patientFirstName` + `patientLastName` AND `patientName`
 */
const validateAppointmentBooking = (req, res, next) => {
  const {
    patientName,
    patientFirstName,
    patientLastName,
    patientPhone,
    phone,
    patientEmail,
    email,
    appointmentDate,
    date,
    timeSlot,
    slot,
    notes
  } = req.body;

  const errors = [];

  // 1. Patient Name Validation & HTML Sanitization
  const rawName = patientName || `${patientFirstName || ''} ${patientLastName || ''}`.trim();
  const cleanName = stripHtml(rawName);
  if (!cleanName || cleanName.length < 2) {
    errors.push({ field: 'patientName', message: 'Valid patient name is required (minimum 2 characters).' });
  }

  // 2. 10-Digit Indian Mobile Number Validation
  const rawPhone = patientPhone || phone;
  let valid10 = '';
  if (!rawPhone) {
    errors.push({ field: 'patientPhone', message: 'Contact number is required.' });
  } else {
    const cleanedPhone = rawPhone.toString().replace(/\D/g, '');
    valid10 = cleanedPhone.startsWith('91') && cleanedPhone.length === 12 
      ? cleanedPhone.slice(2) 
      : cleanedPhone;

    if (!/^[6-9]\d{9}$/.test(valid10)) {
      errors.push({ 
        field: 'patientPhone', 
        message: 'Invalid contact number. Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' 
      });
    }
  }

  // 3. Email Validation (if provided)
  const rawEmail = stripHtml(patientEmail || email || '');
  if (rawEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      errors.push({ field: 'patientEmail', message: 'Please provide a valid email address.' });
    }
  }

  // 4. Appointment Date Validation (Strict YYYY-MM-DD & IST Horizon)
  const rawDate = (appointmentDate || date || '').toString().trim();
  if (!rawDate) {
    errors.push({ field: 'appointmentDate', message: 'Appointment date is required.' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    errors.push({ field: 'appointmentDate', message: 'Invalid date format. Expected YYYY-MM-DD.' });
  } else {
    const istNow = getNowInIST();
    if (rawDate < istNow.dateStr) {
      errors.push({ field: 'appointmentDate', message: 'Cannot book an appointment for a past date.' });
    } else {
      const [y, m, d] = rawDate.split('-').map(Number);
      const apptDateObj = new Date(Date.UTC(y, m - 1, d));
      const dayOfWeek = apptDateObj.getUTCDay();

      if (dayOfWeek === 0) {
        errors.push({ field: 'appointmentDate', message: 'The clinic is closed on Sundays for routine OPD consultations. Please choose Monday through Saturday.' });
      }

      // Max 90 days in advance
      const nowUtc = new Date(Date.UTC(istNow.year, istNow.month - 1, istNow.day));
      const diffDays = Math.round((apptDateObj - nowUtc) / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        errors.push({ field: 'appointmentDate', message: 'Appointments can only be scheduled up to 90 days in advance.' });
      }
    }
  }

  // 5. Time Slot Validation
  const rawSlot = stripHtml((timeSlot || slot || '').toString());
  if (!rawSlot) {
    errors.push({ field: 'timeSlot', message: 'Please select an appointment time slot.' });
  }

  if (errors.length > 0) {
    return error(res, 'Validation failed. Please correct the highlighted errors.', 400, errors);
  }

  // Normalize sanitized values onto req.body
  req.body.patientName = cleanName;
  req.body.patientPhone = valid10;
  req.body.patientEmail = rawEmail;
  req.body.appointmentDate = rawDate;
  req.body.timeSlot = rawSlot;
  req.body.notes = stripHtml(notes || '');

  next();
};

/**
 * Validate Admin / Staff Login Request
 */
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push({ field: 'username', message: 'Username or email address is required.' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    return error(res, 'Validation error: credentials are required.', 400, errors);
  }

  next();
};

/**
 * Validate Appointment Status Transition
 */
const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  if (!status || !validStatuses.includes(status.toUpperCase())) {
    return error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  next();
};

/**
 * Validate Public Contact Inquiry Form
 */
const validateInquiry = (req, res, next) => {
  const { fullName, phone, message } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name is required.' });
  }

  if (!phone) {
    errors.push({ field: 'phone', message: 'Contact number is required.' });
  } else {
    const cleanedPhone = phone.toString().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errors.push({ field: 'phone', message: 'Please provide a valid 10-digit Indian phone number.' });
    }
  }

  if (!message || message.trim().length < 5) {
    errors.push({ field: 'message', message: 'Inquiry message must be at least 5 characters long.' });
  }

  if (errors.length > 0) {
    return error(res, 'Validation error: please fill all required fields.', 400, errors);
  }

  next();
};

module.exports = {
  validateAppointmentBooking,
  validateLogin,
  validateStatusUpdate,
  validateInquiry
};
