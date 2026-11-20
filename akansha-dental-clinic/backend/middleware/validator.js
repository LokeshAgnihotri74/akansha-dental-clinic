/**
 * Request Validation Middleware for Akansha Dental Clinic API
 */
const { error } = require('../utils/responseHelper');

/**
 * Validate Appointment Booking Request Body
 */
const validateAppointmentBooking = (req, res, next) => {
  const { patientName, patientPhone, patientEmail, appointmentDate, timeSlot } = req.body;
  const errors = [];

  // 1. Patient Name Validation
  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    errors.push({ field: 'patientName', message: 'Full name is required and must be at least 2 characters.' });
  }

  // 2. 10-Digit Indian Mobile Number Validation
  if (!patientPhone) {
    errors.push({ field: 'patientPhone', message: 'Contact number is required.' });
  } else {
    const cleanedPhone = patientPhone.toString().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errors.push({ 
        field: 'patientPhone', 
        message: 'Invalid contact number. Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' 
      });
    }
  }

  // 3. Email Validation (if provided)
  if (patientEmail && patientEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail.trim())) {
      errors.push({ field: 'patientEmail', message: 'Please provide a valid email address.' });
    }
  }

  // 4. Appointment Date Validation (YYYY-MM-DD)
  if (!appointmentDate) {
    errors.push({ field: 'appointmentDate', message: 'Appointment date is required.' });
  } else {
    const dateObj = new Date(appointmentDate);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'appointmentDate', message: 'Invalid date format. Expected YYYY-MM-DD.' });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (appointmentDate < todayStr) {
        errors.push({ field: 'appointmentDate', message: 'Appointment date cannot be in the past.' });
      }
    }
  }

  // 5. Time Slot Validation
  if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.trim()) {
    errors.push({ field: 'timeSlot', message: 'Please select an appointment time slot.' });
  }

  if (errors.length > 0) {
    return error(res, 'Validation failed. Please correct the highlighted errors.', 400, errors);
  }

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
