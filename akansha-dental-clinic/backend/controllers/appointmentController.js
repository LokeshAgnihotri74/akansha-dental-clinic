const { query, getIsDbConnected } = require('../config/db');
const { getAvailableSlots } = require('../utils/slotEngine');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');

// In-Memory store for offline fallback / rapid local testing
let memoryAppointments = [
  {
    id: 1,
    booking_reference: 'APT-2026-0001',
    patient_id: 1,
    patient_name: 'Sunita Verma',
    patient_phone: '9826012345',
    patient_email: 'sunita.verma@example.com',
    doctor_id: 1,
    doctor_name: 'Dr. Akansha Sharma',
    service_id: 100,
    service_name: 'General Dental Checkup & Consultation',
    appointment_date: new Date().toISOString().split('T')[0],
    time_slot: '10:30 AM',
    status: 'CONFIRMED',
    total_price: 399.00,
    notes: 'Regular checkup and sensitive tooth check.',
    created_at: new Date().toISOString()
  }
];

let nextApptId = 2;

/**
 * Get Available Time Slots
 * GET /api/v1/appointments/available-slots?doctorId=X&date=YYYY-MM-DD
 */
const getSlots = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.query.doctorId, 10) || 0;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    let bookedSlots = [];

    if (getIsDbConnected()) {
      try {
        let sql = `
          SELECT time_slot 
          FROM appointments 
          WHERE appointment_date = ? 
            AND status != 'CANCELLED' 
            AND is_active = TRUE
        `;
        const params = [date];

        if (doctorId > 0) {
          sql += ' AND doctor_id = ?';
          params.push(doctorId);
        }

        const rows = await query(sql, params);
        bookedSlots = (rows || []).map(r => r.time_slot);
      } catch (err) {
        console.warn('DB slot query failed, using in-memory filter:', err.message);
      }
    }

    if (bookedSlots.length === 0) {
      bookedSlots = memoryAppointments
        .filter(a => a.appointment_date === date && a.status !== 'CANCELLED' && (doctorId === 0 || a.doctor_id === doctorId))
        .map(a => a.time_slot);
    }

    const availableSlots = getAvailableSlots(bookedSlots, date);
    return success(res, availableSlots, 'Available slots calculated.');
  } catch (err) {
    next(err);
  }
};

/**
 * Book New Patient Appointment
 * POST /api/v1/appointments
 */
const bookAppointment = async (req, res, next) => {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      serviceId,
      appointmentDate,
      timeSlot,
      notes
    } = req.body;

    if (!patientName || !patientPhone || !appointmentDate || !timeSlot) {
      return error(res, 'Missing required appointment fields: patientName, patientPhone, appointmentDate, timeSlot are required.', 400);
    }

    // Validate 10-digit Indian Mobile Number
    const cleanedPhone = patientPhone.toString().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return error(res, 'Invalid contact number. Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.', 400);
    }

    const parsedDoctorId = parseInt(doctorId, 10) || 0;
    const parsedServiceId = parseInt(serviceId, 10) || 100; // Default to General Checkup (100)

    // Calculate Pricing:
    // Doctor fee is 0 for "Any Doctor (id 0)", else fetch doctor fee
    let doctorFee = 0;
    let doctorName = 'Any Available Doctor';

    // Service fee is 399 for General Checkup (id 100), else fetch service price
    let servicePrice = 399.00;
    let serviceName = 'General Dental Checkup & Consultation';

    if (parsedDoctorId === 1) { doctorFee = 500; doctorName = 'Dr. Akansha Sharma'; }
    else if (parsedDoctorId === 2) { doctorFee = 400; doctorName = 'Dr. Rajesh Deshmukh'; }
    else if (parsedDoctorId === 3) { doctorFee = 450; doctorName = 'Dr. Neha Kapoor'; }
    else if (parsedDoctorId === 4) { doctorFee = 350; doctorName = 'Dr. Amit Patel'; }

    if (parsedServiceId === 1) { servicePrice = 32990; serviceName = 'Immediate Dental Implants'; }
    else if (parsedServiceId === 2) { servicePrice = 3500; serviceName = 'Single-Visit Root Canal Treatment'; }
    else if (parsedServiceId === 3) { servicePrice = 7000; serviceName = 'Clear Aligners & Invisible Braces'; }
    else if (parsedServiceId === 4) { servicePrice = 1499; serviceName = 'Deep Teeth Cleaning & Ultrasonic Scaling'; }
    else if (parsedServiceId === 5) { servicePrice = 1200; serviceName = 'Composite Aesthetic Tooth Fillings'; }

    const totalPrice = doctorFee + servicePrice;
    const bookingReference = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let savedId = nextApptId++;

    if (getIsDbConnected()) {
      try {
        // 1. Patient matching / insertion
        let patientId = null;
        const patientRows = await query('SELECT id FROM patients WHERE phone = ? LIMIT 1', [cleanedPhone]);
        if (patientRows && patientRows.length > 0) {
          patientId = patientRows[0].id;
        } else {
          const insertPat = await query(
            'INSERT INTO patients (full_name, phone, email) VALUES (?, ?, ?)',
            [patientName.trim(), cleanedPhone, patientEmail || null]
          );
          patientId = insertPat.insertId;
        }

        // 2. Insert Appointment
        const insertAppt = await query(
          `INSERT INTO appointments 
           (booking_reference, patient_id, doctor_id, service_id, appointment_date, time_slot, status, total_price, notes) 
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
          [
            bookingReference,
            patientId,
            parsedDoctorId,
            parsedServiceId,
            appointmentDate,
            timeSlot,
            totalPrice,
            notes || null
          ]
        );
        savedId = insertAppt.insertId;

        // 3. Status History
        await query(
          'INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
          [savedId, null, 'PENDING', 'PATIENT_WEB', 'Online appointment booking submission']
        );
      } catch (err) {
        console.warn('MySQL insertion failed, falling back to memory record:', err.message);
      }
    }

    const newAppointment = {
      id: savedId,
      booking_reference: bookingReference,
      patient_id: 1,
      patient_name: patientName,
      patient_phone: cleanedPhone,
      patient_email: patientEmail || null,
      doctor_id: parsedDoctorId,
      doctor_name: doctorName,
      service_id: parsedServiceId,
      service_name: serviceName,
      appointment_date: appointmentDate,
      time_slot: timeSlot,
      status: 'PENDING',
      total_price: totalPrice,
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    memoryAppointments.unshift(newAppointment);

    // Trigger Notification Engine (SMS / WhatsApp / Email dispatch)
    try {
      await notificationService.sendBookingConfirmation(newAppointment);
    } catch (notifErr) {
      console.warn('Notification dispatch failed (non-blocking):', notifErr.message);
    }

    return success(res, {
      bookingReference,
      appointment: newAppointment
    }, 'Appointment booked successfully. Our clinic desk will confirm your slot shortly.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Search & List Appointments for Admin / Staff
 * GET /api/v1/appointments?status=&doctorId=&startDate=&endDate=&query=&page=0&size=10
 */
const searchAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, startDate, endDate, query: searchParam, page = 0, size = 10 } = req.query;

    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let appointments = [...memoryAppointments];

    if (getIsDbConnected()) {
      try {
        let sql = `
          SELECT 
            a.id, a.booking_reference, a.appointment_date, a.time_slot, a.status, a.total_price, a.notes, a.created_at,
            p.full_name AS patient_name, p.phone AS patient_phone, p.email AS patient_email,
            COALESCE(d.name, 'Any Available Doctor') AS doctor_name,
            s.name AS service_name
          FROM appointments a
          JOIN patients p ON a.patient_id = p.id
          LEFT JOIN doctors d ON a.doctor_id = d.id
          JOIN services s ON a.service_id = s.id
          WHERE a.is_active = TRUE
        `;
        const params = [];

        if (status) {
          sql += ' AND a.status = ?';
          params.push(status);
        }
        if (doctorId) {
          sql += ' AND a.doctor_id = ?';
          params.push(doctorId);
        }
        if (startDate) {
          sql += ' AND a.appointment_date >= ?';
          params.push(startDate);
        }
        if (endDate) {
          sql += ' AND a.appointment_date <= ?';
          params.push(endDate);
        }
        if (searchParam) {
          sql += ' AND (p.full_name LIKE ? OR p.phone LIKE ? OR a.booking_reference LIKE ?)';
          const wild = `%${searchParam}%`;
          params.push(wild, wild, wild);
        }

        sql += ' ORDER BY a.appointment_date DESC, a.created_at DESC';

        const rows = await query(sql, params);
        if (rows && rows.length > 0) {
          appointments = rows;
        }
      } catch (err) {
        console.warn('DB search failed, using memory filter:', err.message);
      }
    }

    // Filter memory array if DB wasn't used
    let filtered = appointments;
    if (status) filtered = filtered.filter(a => a.status === status);
    if (doctorId && doctorId !== '0') filtered = filtered.filter(a => String(a.doctor_id) === String(doctorId));
    if (searchParam) {
      const q = searchParam.toLowerCase();
      filtered = filtered.filter(a =>
        (a.patient_name || '').toLowerCase().includes(q) ||
        (a.patient_phone || '').includes(q) ||
        (a.booking_reference || '').toLowerCase().includes(q)
      );
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize) || 1;
    const paginated = filtered.slice(pageNum * pageSize, (pageNum + 1) * pageSize);

    return success(res, {
      content: paginated,
      totalElements,
      totalPages,
      page: pageNum,
      size: pageSize
    }, 'Appointments retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get Single Appointment by ID
 * GET /api/v1/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const appt = memoryAppointments.find(a => a.id === id);

    if (!appt) {
      return error(res, `Appointment #${id} not found.`, 404);
    }

    return success(res, appt, 'Appointment details retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update Status (CONFIRMED, COMPLETED, CANCELLED)
 * PATCH /api/v1/appointments/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, reason } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return error(res, `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    if (getIsDbConnected()) {
      try {
        await query(
          'UPDATE appointments SET status = ?, cancellation_reason = ? WHERE id = ?',
          [status, reason || null, id]
        );
        await query(
          'INSERT INTO appointment_status_history (appointment_id, new_status, changed_by, notes) VALUES (?, ?, ?, ?)',
          [id, status, req.user?.username || 'STAFF', reason || 'Status updated via clinical desk']
        );
      } catch (err) {
        console.warn('DB updateStatus error:', err.message);
      }
    }

    const appt = memoryAppointments.find(a => a.id === id);
    if (appt) {
      appt.status = status;
      if (reason) appt.cancellation_reason = reason;

      // Trigger status update alert
      try {
        await notificationService.sendStatusUpdateNotification(appt, status, reason);
      } catch (notifErr) {
        console.warn('Status notification dispatch failed:', notifErr.message);
      }
    }

    return success(res, appt || { id, status }, `Appointment status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Soft Delete Appointment
 * DELETE /api/v1/appointments/:id
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (getIsDbConnected()) {
      try {
        await query('UPDATE appointments SET is_active = FALSE WHERE id = ?', [id]);
      } catch (err) {
        console.warn('DB delete error:', err.message);
      }
    }

    memoryAppointments = memoryAppointments.filter(a => a.id !== id);
    return success(res, null, `Appointment #${id} removed successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSlots,
  bookAppointment,
  searchAppointments,
  getAppointmentById,
  updateStatus,
  deleteAppointment
};
