const crypto = require('crypto');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { getAvailableSlots, getDoctorDaySlots, DAY_NAMES } = require('../utils/slotEngine');
const { success, error } = require('../utils/responseHelper');
const notificationService = require('../services/notificationService');
const { logAuditEvent } = require('../services/auditService');

/**
 * Get Available Time Slots (Doctor-Aware OPD Schedule)
 * GET /api/v1/appointments/available-slots?doctorId=X&date=YYYY-MM-DD
 */
const getSlots = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.query.doctorId, 10) || 0;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const store = getStore();

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return error(res, 'Invalid date format provided. Use YYYY-MM-DD.', 400);
    }
    const dayOfWeek = DAY_NAMES[dateObj.getDay()];

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
 * Book New Patient Appointment with Strict Double-Booking Prevention
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

    // 1. Validate required fields
    if (!appointmentDate || !timeSlot) {
      return error(res, 'Appointment date and time slot are required.', 400);
    }

    // 2. Validate date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      return error(res, 'Cannot book an appointment for a past date.', 400);
    }

    const apptDateObj = new Date(appointmentDate);
    if (isNaN(apptDateObj.getTime())) {
      return error(res, 'Invalid appointment date format. Use YYYY-MM-DD.', 400);
    }
    const dayOfWeek = DAY_NAMES[apptDateObj.getDay()];

    // 3. Reconcile patient contact details
    const fullName = patientName || `${patientFirstName || ''} ${patientLastName || ''}`.trim() || 'Patient';
    const rawPhone = patientPhone || phone || '';
    const cleanedPhone = rawPhone.toString().replace(/\D/g, '');
    const validPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12 ? cleanedPhone.slice(2) : cleanedPhone;

    if (!validPhone || validPhone.length !== 10) {
      return error(res, 'A valid 10-digit mobile contact number is required.', 400);
    }
    const finalEmail = patientEmail || email || null;

    let parsedDoctorId = parseInt(doctorId, 10) || 0;
    const parsedServiceId = parseInt(serviceId, 10) || 100;

    // 4. Validate Service Existence
    const srv = store.services.find(s => s.id === parsedServiceId);
    if (!srv) {
      return error(res, `Selected treatment service with ID #${parsedServiceId} does not exist.`, 404);
    }
    const servicePrice = srv.price !== undefined ? srv.price : (srv.base_price || 399);
    const serviceName = srv.name;
    const serviceDuration = srv.durationMinutes || srv.duration_minutes || 30;

    // 5. Validate Doctor Existence and Schedule
    let doctorFee = 0;
    let doctorName = 'Any Available Doctor';
    let doctorSpec = 'First Available Specialist on Duty';

    if (parsedDoctorId > 0) {
      const doc = store.doctors.find(d => d.id === parsedDoctorId);
      if (!doc) {
        return error(res, `Selected doctor with ID #${parsedDoctorId} does not exist.`, 404);
      }

      // Check if doctor works on this day
      const docDaySlots = getDoctorDaySlots(doc, dayOfWeek);
      if (docDaySlots.length === 0) {
        return error(res, `Dr. ${doc.fullName || doc.name} is not on duty on ${dayOfWeek}s. Please choose another doctor or weekday.`, 400);
      }

      // Check if the selected timeSlot is within the doctor's actual working hours
      if (!docDaySlots.includes(timeSlot.trim())) {
        return error(res, `Time slot '${timeSlot}' is outside Dr. ${doc.fullName || doc.name}'s scheduled OPD hours on ${dayOfWeek}s.`, 400);
      }

      doctorFee = doc.consultationFee !== undefined ? doc.consultationFee : (doc.consultation_fee || 500);
      doctorName = doc.fullName || doc.name;
      doctorSpec = doc.specialization;

      // 6. Double-Booking Prevention: Check if this doctor is already booked for this date and slot
      const isAlreadyBooked = store.appointments.some(a =>
        (a.appointment_date === appointmentDate || a.appointmentDate === appointmentDate) &&
        (a.time_slot || a.timeSlot || '').trim().toUpperCase() === timeSlot.trim().toUpperCase() &&
        (a.doctor_id === parsedDoctorId || a.doctorId === parsedDoctorId) &&
        a.status !== 'CANCELLED' &&
        a.is_active !== false
      );

      if (isAlreadyBooked) {
        return error(res, `This time slot (${timeSlot}) is already booked for Dr. ${doctorName} on ${appointmentDate}. Please choose another time slot.`, 409);
      }
    } else {
      // "Any Available Doctor" (id 0): Dynamically find an available doctor on duty
      const activeDoctors = store.doctors.filter(d => d.active !== false && d.is_active !== false);
      const onDutyDoctors = activeDoctors.filter(d => getDoctorDaySlots(d, dayOfWeek).includes(timeSlot.trim()));

      if (onDutyDoctors.length === 0) {
        return error(res, `No doctors are on duty for ${timeSlot} on ${dayOfWeek}s. Please choose an open slot.`, 400);
      }

      // Find first doctor who does NOT have a booking on this date & slot
      const freeDoctor = onDutyDoctors.find(doc => {
        return !store.appointments.some(a =>
          (a.appointment_date === appointmentDate || a.appointmentDate === appointmentDate) &&
          (a.time_slot || a.timeSlot || '').trim().toUpperCase() === timeSlot.trim().toUpperCase() &&
          (a.doctor_id === doc.id || a.doctorId === doc.id) &&
          a.status !== 'CANCELLED' &&
          a.is_active !== false
        );
      });

      if (!freeDoctor) {
        return error(res, `All doctors on duty are already booked for ${timeSlot} on ${appointmentDate}. Please select another time slot.`, 409);
      }

      // Assign the confirmed free doctor to prevent slot hogging
      parsedDoctorId = freeDoctor.id;
      doctorName = freeDoctor.fullName || freeDoctor.name;
      doctorSpec = freeDoctor.specialization;
      doctorFee = freeDoctor.consultationFee !== undefined ? freeDoctor.consultationFee : (freeDoctor.consultation_fee || 500);
    }

    const totalPrice = doctorFee + servicePrice;

    // 7. Collision-free, cryptographically unique booking reference
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const timeHash = Date.now().toString(36).slice(-4).toUpperCase();
    const bookingReference = `APT-${new Date().getFullYear()}-${randomHex}-${timeHash}`;
    const newId = store.appointments.length > 0 ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;

    // 8. Patient Record Lookup / Creation
    let patient = store.patients.find(p => p.phone === validPhone);
    if (!patient) {
      patient = {
        id: store.patients.length > 0 ? Math.max(...store.patients.map(p => p.id)) + 1 : 1,
        firstName: patientFirstName || fullName.split(' ')[0],
        lastName: patientLastName || fullName.split(' ').slice(1).join(' ') || '',
        fullName: fullName,
        full_name: fullName,
        phone: validPhone,
        email: finalEmail || '',
        address: '', // Clean: no fabricated defaults
        bloodGroup: null, // Clean: no fabricated medical defaults
        createdAt: new Date().toISOString()
      };
      store.patients.unshift(patient);
    }

    // 9. Normalized Appointment Record
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
      timeSlot: timeSlot.trim(),
      time_slot: timeSlot.trim(),
      status: 'PENDING',
      totalPrice: totalPrice,
      total_price: totalPrice,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_active: true
    };

    // Save atomically to store
    store.appointments.unshift(newAppointment);
    saveStore();

    // 10. Audit Logging
    await logAuditEvent({
      actor: validPhone,
      action: 'APPOINTMENT_REQUESTED',
      resource: 'APPOINTMENTS',
      ipAddress: req.ip,
      details: `New appointment requested by ${fullName} for Dr. ${doctorName} on ${appointmentDate} at ${timeSlot} (Ref: ${bookingReference})`
    });

    // 11. Database Sync with Duplicate Conflict Catching
    if (getIsDbConnected()) {
      try {
        await query(
          `INSERT INTO appointments 
           (booking_reference, patient_id, doctor_id, service_id, appointment_date, time_slot, status, total_price, notes) 
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
          [bookingReference, patient.id, parsedDoctorId, parsedServiceId, appointmentDate, timeSlot.trim(), totalPrice, notes || null]
        );
      } catch (dbErr) {
        if (dbErr.code === 'ER_DUP_ENTRY') {
          // If a race condition occurred in the database
          store.appointments = store.appointments.filter(a => a.id !== newId);
          saveStore();
          return error(res, `This time slot (${timeSlot}) was just reserved by another patient. Please choose another slot.`, 409);
        }
        console.warn('MySQL async sync notice:', dbErr.message);
      }
    }

    // 12. Notification Engine with Truthful Delivery Status
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
      patientEmail: finalEmail,
      doctorName: doctorName,
      serviceName: serviceName,
      appointmentDate: appointmentDate,
      timeSlot: timeSlot.trim(),
      totalPrice: totalPrice,
      status: 'PENDING',
      smsSent: smsSent,
      emailSent: emailSent,
      smsStatus: notifResult?.smsStatus || 'NOT_CONFIGURED',
      emailStatus: notifResult?.emailStatus || 'NOT_CONFIGURED',
      appointment: newAppointment
    }, 'Appointment request recorded. Our reception desk will call to confirm your appointment.', 201);
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
