const crypto = require('crypto');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { getAvailableSlots, getDoctorDaySlots, DAY_NAMES, getNowInIST, parseTimeToMinutes } = require('../utils/slotEngine');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');
const { logAuditEvent } = require('../services/auditService');

// Concurrency Mutex: Serializes concurrent slot bookings for the exact same slot & date
const activeSlotLocks = new Map();
const acquireSlotLock = async (key) => {
  while (activeSlotLocks.has(key)) {
    await activeSlotLocks.get(key);
  }
  let unlock;
  const p = new Promise(resolve => { unlock = resolve; });
  activeSlotLocks.set(key, p);
  return () => {
    activeSlotLocks.delete(key);
    unlock();
  };
};

// Strict HTML sanitization helper
const stripHtml = (val) => {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Get Available Time Slots (Doctor-Aware OPD Schedule)
 * GET /api/v1/appointments/available-slots?doctorId=X&date=YYYY-MM-DD
 */
const getSlots = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.query.doctorId, 10) || 0;
    const istNow = getNowInIST();
    const date = (req.query.date || istNow.dateStr).trim();
    const store = getStore();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return error(res, 'Invalid date format provided. Use YYYY-MM-DD.', 400);
    }

    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek = DAY_NAMES[dateObj.getUTCDay()];

    // Clinic is closed on Sundays
    if (dayOfWeek === 'SUNDAY') {
      return success(res, {
        clinicOpen: false,
        dayOfWeek: 'SUNDAY',
        date: date,
        totalSlots: 0,
        availableCount: 0,
        slots: [],
        message: 'The clinic is closed on Sundays for routine OPD consultations.'
      }, 'Clinic is closed on Sundays.');
    }

    // Identify doctor or all doctors
    let targetDoctor = null;
    if (doctorId > 0) {
      targetDoctor = store.doctors.find(d => d.id === doctorId);
      if (!targetDoctor) {
        return error(res, `Doctor with ID #${doctorId} not found.`, 404);
      }
    }

    // Determine booked slots for this date and doctor
    let bookedSlots = [];

    if (getIsDbConnected()) {
      try {
        let sql = `
          SELECT time_slot, doctor_id 
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
        if (rows && rows.length > 0) {
          if (doctorId > 0) {
            bookedSlots = rows.map(r => r.time_slot);
          } else {
            // For any doctor, only mark slot booked if ALL on-duty doctors are booked
            const activeDoctors = store.doctors.filter(d => d.active !== false && d.is_active !== false);
            const doctorsOnDuty = activeDoctors.filter(d => getDoctorDaySlots(d, dayOfWeek).length > 0);
            const slotBookingCount = {};
            rows.forEach(r => {
              const s = (r.time_slot || '').trim().toUpperCase();
              slotBookingCount[s] = (slotBookingCount[s] || 0) + 1;
            });
            bookedSlots = Object.keys(slotBookingCount).filter(
              s => slotBookingCount[s] >= Math.max(1, doctorsOnDuty.length)
            );
          }
        }
      } catch (err) {
        console.warn('DB slot query fallback:', err.message);
      }
    }

    if (bookedSlots.length === 0) {
      if (doctorId > 0) {
        bookedSlots = store.appointments
          .filter(a => (a.appointment_date === date || a.appointmentDate === date) &&
                       a.status !== 'CANCELLED' &&
                       a.is_active !== false &&
                       (a.doctor_id === doctorId || a.doctorId === doctorId))
          .map(a => a.time_slot || a.timeSlot);
      } else {
        const activeDoctors = store.doctors.filter(d => d.active !== false && d.is_active !== false);
        const doctorsOnDuty = activeDoctors.filter(d => getDoctorDaySlots(d, dayOfWeek).length > 0);
        const slotBookingCount = {};
        store.appointments
          .filter(a => (a.appointment_date === date || a.appointmentDate === date) &&
                       a.status !== 'CANCELLED' &&
                       a.is_active !== false)
          .forEach(a => {
            const s = (a.time_slot || a.timeSlot || '').trim().toUpperCase();
            slotBookingCount[s] = (slotBookingCount[s] || 0) + 1;
          });
        bookedSlots = Object.keys(slotBookingCount).filter(
          s => slotBookingCount[s] >= Math.max(1, doctorsOnDuty.length)
        );
      }
    }

    // Generate doctor-aware slots
    const targetEntity = targetDoctor || store.doctors.filter(d => d.active !== false && d.is_active !== false);
    const candidateSlots = targetDoctor
      ? getDoctorDaySlots(targetDoctor, dayOfWeek)
      : Array.from(new Set(targetEntity.flatMap(d => getDoctorDaySlots(d, dayOfWeek))));

    const availableSlotStrings = getAvailableSlots(bookedSlots, date, targetEntity);
    const bookedSet = new Set(bookedSlots.map(s => (s || '').trim().toUpperCase()));

    const slotObjects = candidateSlots.map((s, idx) => ({
      id: idx + 1,
      slot: s,
      time: s,
      available: availableSlotStrings.includes(s) && !bookedSet.has(s.toUpperCase())
    }));

    const isClinicOpen = candidateSlots.length > 0;

    const responsePayload = {
      clinicOpen: isClinicOpen,
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
 * Book New Patient Appointment with Strict Double-Booking Prevention & Validation
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
      date,
      timeSlot,
      slot,
      notes
    } = req.body;

    const store = getStore();

    // 1. Normalize input date and slot
    const rawDate = (appointmentDate || date || '').toString().trim();
    const rawSlot = (timeSlot || slot || '').toString().trim();

    if (!rawDate || !rawSlot) {
      return error(res, 'Appointment date and time slot are required.', 400);
    }

    // 2. Validate strict YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return error(res, 'Invalid appointment date format. Expected YYYY-MM-DD.', 400);
    }

    // 3. Timezone-Aware (IST) Date and Horizon Validation
    const istNow = getNowInIST();
    if (rawDate < istNow.dateStr) {
      return error(res, 'Cannot book an appointment for a past date. Please select today or a future date.', 400);
    }

    const [y, m, d] = rawDate.split('-').map(Number);
    const apptDateObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek = DAY_NAMES[apptDateObj.getUTCDay()];

    // Sunday check
    if (dayOfWeek === 'SUNDAY') {
      return error(res, 'The clinic is closed on Sundays for routine OPD consultations. Please choose Monday through Saturday.', 400);
    }

    // Max 90 days in advance
    const nowUtc = new Date(Date.UTC(istNow.year, istNow.month - 1, istNow.day));
    const diffDays = Math.round((apptDateObj - nowUtc) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return error(res, 'Appointments can only be booked up to 90 days in advance.', 400);
    }

    // If today in IST, ensure time slot has not already passed
    if (rawDate === istNow.dateStr) {
      const slotMins = parseTimeToMinutes(rawSlot);
      if (slotMins <= istNow.totalMinutes + 15) {
        return error(res, 'The selected time slot has already passed for today. Please select a later time slot.', 400);
      }
    }

    // 4. Sanitize patient contact details and strip HTML
    const rawName = patientName || `${patientFirstName || ''} ${patientLastName || ''}`.trim() || 'Patient';
    const fullName = stripHtml(rawName);
    const cleanNotes = stripHtml(notes || '');
    const cleanEmail = stripHtml(patientEmail || email || '');

    const rawContact = patientPhone || phone || '';
    const cleanedPhone = rawContact.toString().replace(/\D/g, '');
    const validPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12 ? cleanedPhone.slice(2) : cleanedPhone;

    if (!validPhone || validPhone.length !== 10) {
      return error(res, 'A valid 10-digit mobile contact number is required.', 400);
    }

    let parsedDoctorId = parseInt(doctorId, 10) || 0;
    const parsedServiceId = parseInt(serviceId, 10) || 100;

    // 5. Validate Service Existence
    const srv = store.services.find(s => s.id === parsedServiceId);
    if (!srv) {
      return error(res, `Selected treatment service with ID #${parsedServiceId} does not exist.`, 404);
    }
    const servicePrice = srv.price !== undefined ? srv.price : (srv.base_price || 399);
    const serviceName = srv.name;
    const serviceDuration = srv.durationMinutes || srv.duration_minutes || 30;

    // 6. Validate Doctor Timetable & Working Shifts
    let doctorFee = 0;
    let doctorName = 'Any Available Doctor';
    let doctorSpec = 'First Available Specialist on Duty';

    if (parsedDoctorId > 0) {
      const doc = store.doctors.find(d => d.id === parsedDoctorId);
      if (!doc) {
        return error(res, `Selected doctor with ID #${parsedDoctorId} does not exist.`, 404);
      }

      const rawDocName = doc.fullName || doc.name || 'Specialist';
      const docDisplayName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;

      // Check doctor's actual timetable for this weekday
      const docDaySlots = getDoctorDaySlots(doc, dayOfWeek);
      if (docDaySlots.length === 0) {
        return error(res, `${docDisplayName} is not on duty on ${dayOfWeek}s. Please choose another doctor or weekday.`, 400);
      }

      if (!docDaySlots.includes(rawSlot)) {
        return error(res, `Time slot '${rawSlot}' is outside ${docDisplayName}'s scheduled OPD hours on ${dayOfWeek}s.`, 400);
      }

      doctorFee = doc.consultationFee !== undefined ? doc.consultationFee : (doc.consultation_fee || 500);
      doctorName = docDisplayName;
      doctorSpec = doc.specialization;
    } else {
      // For "Any doctor" (id 0), ensure the slot belongs to at least one active doctor's timetable
      const activeDoctors = store.doctors.filter(d => d.active !== false && d.is_active !== false);
      const doctorsWithSlot = activeDoctors.filter(d => getDoctorDaySlots(d, dayOfWeek).includes(rawSlot));
      if (doctorsWithSlot.length === 0) {
        return error(res, `Time slot '${rawSlot}' is not a valid clinic OPD slot for ${dayOfWeek}s.`, 400);
      }
    }

    // 7. Atomic Concurrency Lock: Prevents simultaneous double bookings
    const lockKey = `${rawDate}_${rawSlot.toUpperCase()}_${parsedDoctorId}`;
    const releaseLock = await acquireSlotLock(lockKey);

    try {
      // Re-verify slot availability inside atomic lock
      if (parsedDoctorId > 0) {
        const isAlreadyBooked = store.appointments.some(a =>
          (a.appointment_date === rawDate || a.appointmentDate === rawDate) &&
          (a.time_slot || a.timeSlot || '').trim().toUpperCase() === rawSlot.toUpperCase() &&
          (a.doctor_id === parsedDoctorId || a.doctorId === parsedDoctorId) &&
          a.status !== 'CANCELLED' &&
          a.is_active !== false
        );

        if (isAlreadyBooked) {
          return error(res, `This time slot (${rawSlot}) is already booked for Dr. ${doctorName} on ${rawDate}. Please choose another time slot.`, 409);
        }
      } else {
        // "Any Available Doctor" (id 0): Dynamically allocate first available doctor on duty
        const activeDoctors = store.doctors.filter(d => d.active !== false && d.is_active !== false);
        const onDutyDoctors = activeDoctors.filter(d => getDoctorDaySlots(d, dayOfWeek).includes(rawSlot));

        const freeDoctor = onDutyDoctors.find(doc => {
          return !store.appointments.some(a =>
            (a.appointment_date === rawDate || a.appointmentDate === rawDate) &&
            (a.time_slot || a.timeSlot || '').trim().toUpperCase() === rawSlot.toUpperCase() &&
            (a.doctor_id === doc.id || a.doctorId === doc.id) &&
            a.status !== 'CANCELLED' &&
            a.is_active !== false
          );
        });

        if (!freeDoctor) {
          return error(res, `All doctors on duty are already booked for ${rawSlot} on ${rawDate}. Please select another time slot.`, 409);
        }

        parsedDoctorId = freeDoctor.id;
        doctorName = freeDoctor.fullName || freeDoctor.name;
        doctorSpec = freeDoctor.specialization;
        doctorFee = freeDoctor.consultationFee !== undefined ? freeDoctor.consultationFee : (freeDoctor.consultation_fee || 500);
      }

      const totalPrice = doctorFee + servicePrice;

      // 8. Collision-free, cryptographically unique booking reference (8 hex chars + timestamp)
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const timeHash = Date.now().toString(36).toUpperCase();
      const bookingReference = `APT-${istNow.year}-${randomHex}-${timeHash}`;
      const newId = store.appointments.length > 0 ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;

      // 9. Patient Record Lookup / Creation
      let patient = store.patients.find(p => p.phone === validPhone);
      if (!patient) {
        patient = {
          id: store.patients.length > 0 ? Math.max(...store.patients.map(p => p.id)) + 1 : 1,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || '',
          fullName: fullName,
          full_name: fullName,
          phone: validPhone,
          email: cleanEmail || '',
          address: 'Not recorded',
          bloodGroup: 'Not recorded',
          medicalHistory: 'Not recorded',
          createdAt: new Date().toISOString()
        };
        store.patients.unshift(patient);
      }

      // 10. Normalized Appointment Record
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
        patientEmail: cleanEmail || null,
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
        appointmentDate: rawDate,
        appointment_date: rawDate,
        timeSlot: rawSlot,
        time_slot: rawSlot,
        status: 'PENDING',
        totalPrice: totalPrice,
        total_price: totalPrice,
        notes: cleanNotes,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_active: true
      };

      // Save atomically to store
      store.appointments.unshift(newAppointment);
      saveStore();

      // 11. Database Transaction with Unique Constraint & Duplicate Key Catching
      if (getIsDbConnected()) {
        try {
          await query(
            `INSERT INTO appointments 
             (booking_reference, patient_id, doctor_id, service_id, appointment_date, time_slot, status, total_price, notes) 
             VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
            [bookingReference, patient.id, parsedDoctorId, parsedServiceId, rawDate, rawSlot, totalPrice, cleanNotes || null]
          );
        } catch (dbErr) {
          if (dbErr.code === 'ER_DUP_ENTRY' || dbErr.errno === 1062) {
            store.appointments = store.appointments.filter(a => a.id !== newId);
            saveStore();
            return error(res, `This time slot (${rawSlot}) was just reserved by another patient. Please choose another slot.`, 409);
          }
          console.warn('MySQL async sync notice:', dbErr.message);
        }
      }

      // 12. Audit Logging
      await logAuditEvent({
        actor: validPhone,
        action: 'APPOINTMENT_REQUESTED',
        resource: 'APPOINTMENTS',
        ipAddress: req.ip,
        details: `New appointment requested by ${fullName} for Dr. ${doctorName} on ${rawDate} at ${rawSlot} (Ref: ${bookingReference})`
      });

      // 13. Notification Dispatcher
      let notifResult = null;
      try {
        notifResult = await notificationService.sendBookingConfirmation(newAppointment);
      } catch (notifErr) {
        console.warn('Notification non-blocking notice:', notifErr.message);
      }

      const smsSent = Boolean(notifResult?.smsSent);
      const emailSent = Boolean(notifResult?.emailSent);

      return success(res, {
        appointmentNumber: bookingReference,
        appointmentCode: bookingReference,
        bookingReference: bookingReference,
        patientName: fullName,
        patientPhone: validPhone,
        patientEmail: cleanEmail || null,
        doctorName: doctorName,
        serviceName: serviceName,
        appointmentDate: rawDate,
        timeSlot: rawSlot,
        totalPrice: totalPrice,
        status: 'PENDING',
        smsSent: smsSent,
        emailSent: emailSent,
        smsStatus: notifResult?.smsStatus || 'NOT_CONFIGURED',
        emailStatus: notifResult?.emailStatus || 'NOT_CONFIGURED',
        appointment: newAppointment
      }, 'Appointment request recorded. Our reception desk will call to confirm your appointment.', 201);
    } finally {
      releaseLock();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Search & List Appointments for Admin / Staff
 * GET /api/v1/appointments?status=&doctorId=&startDate=&endDate=&query=&page=0&size=15
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
    const noteText = reason || notes || `Status updated to ${targetStatus}`;

    const appt = store.appointments.find(a => a.id === id);
    if (!appt) {
      return error(res, `Appointment #${id} not found.`, 404);
    }

    const previousStatus = appt.status;
    appt.status = targetStatus;
    appt.cancellation_reason = targetStatus === 'CANCELLED' ? noteText : null;
    appt.updated_at = new Date().toISOString();
    saveStore();

    // Audit Logging
    await logAuditEvent({
      actor: req.user?.username || 'STAFF',
      action: 'APPOINTMENT_STATUS_UPDATE',
      resource: 'APPOINTMENTS',
      ipAddress: req.ip,
      details: `Appointment #${id} (Ref: ${appt.bookingReference || appt.appointmentNumber}) changed from ${previousStatus} to ${targetStatus}`
    });

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
    const appt = store.appointments.find(a => a.id === id);

    store.appointments = store.appointments.filter(a => a.id !== id);
    saveStore();

    if (appt) {
      await logAuditEvent({
        actor: req.user?.username || 'STAFF',
        action: 'APPOINTMENT_DELETED',
        resource: 'APPOINTMENTS',
        ipAddress: req.ip,
        details: `Appointment #${id} (Ref: ${appt.bookingReference || appt.appointmentNumber}) was removed`
      });
    }

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
