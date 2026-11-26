const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { getAvailableSlots, STANDARD_SLOTS } = require('../utils/slotEngine');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Get Available Time Slots
 * GET /api/v1/appointments/available-slots?doctorId=X&date=YYYY-MM-DD
 */
const getSlots = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.query.doctorId, 10) || 0;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const store = getStore();

    const dateObj = new Date(date);
    const dayOfWeek = isNaN(dateObj.getTime()) ? 'TODAY' : DAY_NAMES[dateObj.getDay()];

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
        console.warn('DB slot query failed, using persistent store filter:', err.message);
      }
    }

    if (bookedSlots.length === 0) {
      bookedSlots = store.appointments
        .filter(a => a.appointment_date === date && a.status !== 'CANCELLED' && (doctorId === 0 || a.doctor_id === doctorId || a.doctorId === doctorId))
        .map(a => a.time_slot || a.timeSlot);
    }

    const availableSlotStrings = getAvailableSlots(bookedSlots, date);
    const bookedSet = new Set(bookedSlots.map(s => (s || '').trim().toUpperCase()));

    // Construct slot objects for Frontend AppointmentBookingPage.jsx
    const slotObjects = STANDARD_SLOTS.map((s, idx) => ({
      id: idx + 1,
      slot: s,
      time: s,
      available: availableSlotStrings.includes(s) && !bookedSet.has(s.toUpperCase())
    }));

    const responsePayload = {
      clinicOpen: true,
      dayOfWeek: dayOfWeek,
      date: date,
      totalSlots: slotObjects.length,
      availableCount: availableSlotStrings.length,
      slots: slotObjects
    };

    return success(res, responsePayload, 'Available slots calculated.');
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
      patientFirstName,
      patientLastName,
      patientPhone,
      phone,
      patientEmail,
      email,
      doctorId,
      serviceId,
      appointmentDate,
      timeSlot,
      notes
    } = req.body;

    const store = getStore();

    // Reconcile names
    const fullName = patientName || `${patientFirstName || ''} ${patientLastName || ''}`.trim() || 'Patient';
    const rawPhone = patientPhone || phone || '';
    const cleanedPhone = rawPhone.toString().replace(/\D/g, '');
    const validPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12 ? cleanedPhone.slice(2) : cleanedPhone;
    const finalEmail = patientEmail || email || null;

    const parsedDoctorId = parseInt(doctorId, 10) || 0;
    const parsedServiceId = parseInt(serviceId, 10) || 100;

    // Doctor details & consultation fee
    let doctorFee = 0;
    let doctorName = 'Any Available Doctor';
    let doctorSpec = 'General Dental Consultation';

    if (parsedDoctorId === 0) {
      doctorFee = 0;
      doctorName = 'Any Available Doctor';
      doctorSpec = 'First Available Specialist on Duty';
    } else {
      const doc = store.doctors.find(d => d.id === parsedDoctorId);
      if (doc) {
        doctorFee = doc.consultationFee !== undefined ? doc.consultationFee : (doc.consultation_fee || 500);
        doctorName = doc.fullName || doc.name;
        doctorSpec = doc.specialization;
      }
    }

    // Service details & base price
    let servicePrice = 399.00;
    let serviceName = 'General Dental Checkup & Consultation';
    let serviceDuration = 30;

    const srv = store.services.find(s => s.id === parsedServiceId);
    if (srv) {
      servicePrice = srv.price !== undefined ? srv.price : (srv.base_price || 399);
      serviceName = srv.name;
      serviceDuration = srv.durationMinutes || srv.duration_minutes || 30;
    }

    const totalPrice = doctorFee + servicePrice;
    const bookingReference = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = store.appointments.length > 0 ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;

    // Patient lookup / creation in persistent store
    let patient = store.patients.find(p => p.phone === validPhone);
    if (!patient) {
      patient = {
        id: store.patients.length > 0 ? Math.max(...store.patients.map(p => p.id)) + 1 : 1,
        firstName: patientFirstName || fullName.split(' ')[0],
        lastName: patientLastName || fullName.split(' ').slice(1).join(' ') || 'Patient',
        fullName: fullName,
        full_name: fullName,
        phone: validPhone,
        email: finalEmail,
        createdAt: new Date().toISOString()
      };
      store.patients.unshift(patient);
    }

    // Normalized Appointment Object supporting both camelCase and snake_case
    const newAppointment = {
      id: newId,
      appointmentNumber: bookingReference,
      appointmentCode: bookingReference,
      bookingReference: bookingReference,
      booking_reference: bookingReference,
      patientId: patient.id,
      patient_id: patient.id,
      patientName: fullName,
      patient_name: fullName,
      patientPhone: validPhone,
      patient_phone: validPhone,
      patientEmail: finalEmail,
      doctorId: parsedDoctorId,
      doctor_id: parsedDoctorId,
      doctorName: doctorName,
      doctor_name: doctorName,
      doctorSpecialization: doctorSpec,
      serviceId: parsedServiceId,
      service_id: parsedServiceId,
      serviceName: serviceName,
      service_name: serviceName,
      servicePrice: servicePrice,
      serviceDurationMinutes: serviceDuration,
      appointmentDate: appointmentDate,
      appointment_date: appointmentDate,
      timeSlot: timeSlot,
      time_slot: timeSlot,
      status: 'PENDING',
      totalPrice: totalPrice,
      total_price: totalPrice,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_active: true
    };

    // Save to persistent file store
    store.appointments.unshift(newAppointment);
    saveStore();

    // Also sync to MySQL if connected
    if (getIsDbConnected()) {
      try {
        await query(
          `INSERT INTO appointments 
           (booking_reference, patient_id, doctor_id, service_id, appointment_date, time_slot, status, total_price, notes) 
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
          [bookingReference, patient.id, parsedDoctorId, parsedServiceId, appointmentDate, timeSlot, totalPrice, notes || null]
        );
      } catch (dbErr) {
        console.warn('MySQL async sync notice:', dbErr.message);
      }
    }

    // Trigger Notification Engine (SMS / WhatsApp simulation)
    try {
      await notificationService.sendBookingConfirmation(newAppointment);
    } catch (notifErr) {
      console.warn('Notification non-blocking alert:', notifErr.message);
    }

    // Return payload with exact fields expected by AppointmentBookingPage.jsx confirmation view
    return success(res, {
      appointmentNumber: bookingReference,
      appointmentCode: bookingReference,
      bookingReference: bookingReference,
      patientName: fullName,
      patientPhone: validPhone,
      patientEmail: finalEmail,
      doctorName: doctorName,
      serviceName: serviceName,
      appointmentDate: appointmentDate,
      timeSlot: timeSlot,
      totalPrice: totalPrice,
      status: 'PENDING',
      smsSent: true,
      emailSent: Boolean(finalEmail),
      appointment: newAppointment
    }, 'Appointment reserved successfully! Our reception team will call to confirm your slot.', 201);
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
    const { status, doctorId, startDate, endDate, query: searchParam, page = 0, size = 15 } = req.query;
    const store = getStore();

    const pageNum = Math.max(0, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10)));

    let list = store.appointments.filter(a => a.is_active !== false);

    if (status) {
      list = list.filter(a => (a.status || '').toUpperCase() === status.toUpperCase());
    }
    if (doctorId && doctorId !== '0') {
      list = list.filter(a => String(a.doctorId || a.doctor_id) === String(doctorId));
    }
    if (startDate) {
      list = list.filter(a => (a.appointmentDate || a.appointment_date) >= startDate);
    }
    if (endDate) {
      list = list.filter(a => (a.appointmentDate || a.appointment_date) <= endDate);
    }
    if (searchParam) {
      const q = searchParam.toLowerCase();
      list = list.filter(a =>
        (a.patientName || a.patient_name || '').toLowerCase().includes(q) ||
        (a.patientPhone || a.patient_phone || '').includes(q) ||
        (a.appointmentNumber || a.bookingReference || a.booking_reference || '').toLowerCase().includes(q)
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
    const store = getStore();
    const appt = store.appointments.find(a => a.id === id);

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
    const { status, reason, notes } = req.body;
    const store = getStore();

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return error(res, `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const targetStatus = status.toUpperCase();
    const noteText = reason || notes || `Status changed to ${targetStatus}`;

    const appt = store.appointments.find(a => a.id === id);
    if (!appt) {
      return error(res, `Appointment #${id} not found.`, 404);
    }

    appt.status = targetStatus;
    appt.cancellation_reason = targetStatus === 'CANCELLED' ? noteText : null;
    appt.updated_at = new Date().toISOString();
    saveStore();

    // Sync to MySQL if connected
    if (getIsDbConnected()) {
      try {
        await query('UPDATE appointments SET status = ?, cancellation_reason = ? WHERE id = ?', [targetStatus, noteText, id]);
      } catch (err) {
        console.warn('MySQL update status notice:', err.message);
      }
    }

    // Trigger status update alert
    try {
      await notificationService.sendStatusUpdateNotification(appt, targetStatus, noteText);
    } catch (notifErr) {
      console.warn('Status notification dispatch notice:', notifErr.message);
    }

    return success(res, appt, `Appointment status updated to ${targetStatus}.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Appointment
 * DELETE /api/v1/appointments/:id
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();

    store.appointments = store.appointments.filter(a => a.id !== id);
    saveStore();

    if (getIsDbConnected()) {
      try {
        await query('UPDATE appointments SET is_active = FALSE WHERE id = ?', [id]);
      } catch (err) {
        console.warn('MySQL delete notice:', err.message);
      }
    }

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
