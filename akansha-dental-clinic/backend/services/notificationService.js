/**
 * Notification Service for Akansha Dental Clinic
 * Handles SMS, WhatsApp & Email notifications for patients and administrative desk
 */

const { query, getIsDbConnected } = require('../config/db');

// In-memory notification audit log
const notificationHistory = [];

/**
 * Send Booking Submission Confirmation to Patient
 * @param {Object} appointment
 */
const sendBookingConfirmation = async (appointment) => {
  const message = `Dear ${appointment.patient_name}, your dental appointment request (Ref: ${appointment.booking_reference}) has been received at Akansha Dental Clinic for ${appointment.appointment_date} at ${appointment.time_slot}. Service: ${appointment.service_name}. Doctor: ${appointment.doctor_name}. Total: ₹${appointment.total_price}. Our reception team will confirm shortly. Helpline: +91 8130 406 405.`;

  const logEntry = {
    id: notificationHistory.length + 1,
    recipient: appointment.patient_phone,
    recipient_email: appointment.patient_email || null,
    channel: 'SMS_WHATSAPP_SIMULATION',
    type: 'BOOKING_RECEIVED',
    message,
    status: 'DELIVERED',
    created_at: new Date().toISOString()
  };

  notificationHistory.unshift(logEntry);

  console.log('\n📲 [PATIENT NOTIFICATION SENT - SMS/WHATSAPP]:');
  console.log(`   To:      ${appointment.patient_name} (${appointment.patient_phone})`);
  console.log(`   Message: ${message}`);
  console.log(`   Ref:     ${appointment.booking_reference}\n`);

  return logEntry;
};

/**
 * Send Status Update Notification (CONFIRMED / CANCELLED / COMPLETED)
 * @param {Object} appointment
 * @param {string} newStatus
 * @param {string} reason
 */
const sendStatusUpdateNotification = async (appointment, newStatus, reason = '') => {
  let message = '';

  if (newStatus === 'CONFIRMED') {
    message = `Dear ${appointment.patient_name}, your dental appointment (Ref: ${appointment.booking_reference}) for ${appointment.appointment_date} at ${appointment.time_slot} is now CONFIRMED with ${appointment.doctor_name || 'Dr. Akansha Sharma'}. Please arrive 10 minutes prior for Class-B sterilized operatory preparation. Clinic: Minal Residency, Bhopal.`;
  } else if (newStatus === 'CANCELLED') {
    message = `Dear ${appointment.patient_name}, your appointment (Ref: ${appointment.booking_reference}) on ${appointment.appointment_date} has been CANCELLED. Reason: ${reason || 'Schedule adjustment'}. To reschedule, please call our desk at +91 8130 406 405.`;
  } else if (newStatus === 'COMPLETED') {
    message = `Dear ${appointment.patient_name}, thank you for visiting Akansha Dental Clinic! We hope your treatment (${appointment.service_name}) was gentle and comfortable. For post-treatment care instructions, visit our portal.`;
  }

  if (!message) return null;

  const logEntry = {
    id: notificationHistory.length + 1,
    recipient: appointment.patient_phone,
    recipient_email: appointment.patient_email || null,
    channel: 'SMS_WHATSAPP_SIMULATION',
    type: `STATUS_${newStatus}`,
    message,
    status: 'DELIVERED',
    created_at: new Date().toISOString()
  };

  notificationHistory.unshift(logEntry);

  console.log(`\n🔔 [PATIENT STATUS ALERT - ${newStatus}]:`);
  console.log(`   To:      ${appointment.patient_phone}`);
  console.log(`   Message: ${message}\n`);

  return logEntry;
};

/**
 * Alert Reception Desk on New Patient Inquiry / Emergency
 * @param {Object} inquiry
 */
const notifyDeskNewInquiry = async (inquiry) => {
  const alertText = `[NEW CLINIC LEAD]: ${inquiry.full_name} (${inquiry.phone}) submitted inquiry: "${inquiry.subject || 'General'}" - ${inquiry.message}`;
  console.log(`\n📥 [DESK ALERT]: ${alertText}\n`);
  return { alertText, timestamp: new Date().toISOString() };
};

/**
 * Send Direct SMS / WhatsApp to Patient for Contact Request Form Submission
 * @param {Object} contact { name, phone, reason, message, refCode }
 */
const sendContactConfirmationNotification = async (contact) => {
  const refCode = contact.refCode || `CNT-${Math.floor(1000 + Math.random() * 9000)}`;
  const message = `Dear ${contact.name}, thank you for contacting Akansha Dental Clinic regarding "${contact.reason}". Your request (Ref: ${refCode}) has been received. Our clinical helpdesk will contact you shortly on ${contact.phone}. Emergency Helpline: +91 9399354201.`;

  const logEntry = {
    id: notificationHistory.length + 1,
    recipient: contact.phone,
    channel: 'SMS_WHATSAPP_SIMULATION',
    type: 'MAKE_CONTACT_CONFIRMATION',
    message,
    status: 'DELIVERED',
    created_at: new Date().toISOString()
  };

  notificationHistory.unshift(logEntry);

  console.log('\n📲 [SMS / WHATSAPP DISPATCHED TO PATIENT CONTACT NUMBER]:');
  console.log(`   To:      ${contact.name} (${contact.phone})`);
  console.log(`   Reason:  ${contact.reason}`);
  console.log(`   Ref:     ${refCode}`);
  console.log(`   Message: ${message}\n`);

  return { ...logEntry, refCode };
};

/**
 * Retrieve Notification Log History for Admin Portal
 */
const getNotificationHistory = () => {
  return notificationHistory.slice(0, 50);
};

module.exports = {
  sendBookingConfirmation,
  sendStatusUpdateNotification,
  notifyDeskNewInquiry,
  sendContactConfirmationNotification,
  getNotificationHistory
};
