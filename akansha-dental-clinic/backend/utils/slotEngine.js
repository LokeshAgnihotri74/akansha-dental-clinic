/**
 * Akansha Dental Clinic — Doctor-Aware Slot Engine
 * Generates exact clinical appointment slots adhering to doctor OPD rosters
 * Morning Shift: 10:00 AM - 01:30 PM | Evening Shift: 05:00 PM - 08:30 PM
 */

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// Fallback standard slots if doctor schedule is unspecified
const STANDARD_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

/**
 * Convert time string like '10:00 AM' or '01:30 PM' to minutes from midnight
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] || 'AM';

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

/**
 * Format minutes from midnight to 'HH:MM AM/PM' string
 */
const formatMinutesToTime = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${paddedHours}:${paddedMinutes} ${modifier}`;
};

/**
 * Generate 30-minute incremental slots between start and end minutes
 */
const generateIntervalSlots = (startMin, endMin, slotDurationMinutes = 30) => {
  const slots = [];
  // Stop when adding slot duration would exceed shift end
  for (let m = startMin; m + slotDurationMinutes <= endMin; m += slotDurationMinutes) {
    slots.push(formatMinutesToTime(m));
  }
  return slots;
};

/**
 * Generate all theoretical slots for a doctor on a given day based on their schedules
 * @param {Object} doctor
 * @param {string} dayOfWeek - 'MONDAY', 'TUESDAY', etc.
 * @returns {Array<string>}
 */
const getDoctorDaySlots = (doctor, dayOfWeek) => {
  if (!doctor || !doctor.schedules || !Array.isArray(doctor.schedules)) {
    return STANDARD_SLOTS;
  }

  const matchingSchedules = doctor.schedules.filter(s => {
    const sDay = (s.dayOfWeek || s.day_of_week || '').toUpperCase();
    const isAvail = s.is_available !== false && s.available !== false;
    return sDay === dayOfWeek && isAvail;
  });

  if (matchingSchedules.length === 0) {
    return []; // Doctor has no schedule on this day (e.g. Sunday or day off)
  }

  const slotsSet = new Set();
  matchingSchedules.forEach(sched => {
    const startStr = sched.startTime || sched.start_time;
    const endStr = sched.endTime || sched.end_time;
    if (startStr && endStr) {
      const startMin = parseTimeToMinutes(startStr);
      const endMin = parseTimeToMinutes(endStr);
      if (endMin > startMin) {
        const intervalSlots = generateIntervalSlots(startMin, endMin, 30);
        intervalSlots.forEach(s => slotsSet.add(s));
      }
    }
  });

  return Array.from(slotsSet).sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
};

/**
 * Get Doctor-Aware Available Time Slots
 * @param {Object|Array} doctorOrDoctors - single doctor object, or array of all doctors
 * @param {string} targetDate - 'YYYY-MM-DD'
 * @param {Array<string>} bookedSlots - slots already taken for this doctor or all doctors
 * @returns {Array<string>} available slots
 */
const getAvailableSlots = (bookedSlots = [], targetDate = null, doctorOrDoctors = null) => {
  const bookedSet = new Set((bookedSlots || []).map(s => (s || '').trim().toUpperCase()));
  const targetDateObj = targetDate ? new Date(targetDate) : new Date();
  const dayOfWeek = isNaN(targetDateObj.getTime()) ? 'MONDAY' : DAY_NAMES[targetDateObj.getDay()];

  let candidateSlots = [];

  if (Array.isArray(doctorOrDoctors)) {
    // Union of all active doctors' slots on this day
    const unionSet = new Set();
    doctorOrDoctors.forEach(doc => {
      const docSlots = getDoctorDaySlots(doc, dayOfWeek);
      docSlots.forEach(s => unionSet.add(s));
    });
    candidateSlots = Array.from(unionSet).sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    if (candidateSlots.length === 0 && dayOfWeek !== 'SUNDAY') {
      candidateSlots = STANDARD_SLOTS;
    }
  } else if (doctorOrDoctors && typeof doctorOrDoctors === 'object') {
    candidateSlots = getDoctorDaySlots(doctorOrDoctors, dayOfWeek);
  } else {
    candidateSlots = STANDARD_SLOTS;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = targetDate === todayStr;
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  return candidateSlots.filter(slot => {
    // 1. Check if booked
    if (bookedSet.has(slot.toUpperCase())) {
      return false;
    }

    // 2. Check if in past (if today) with 30 min preparation buffer
    if (isToday) {
      const slotMinutes = parseTimeToMinutes(slot);
      if (slotMinutes <= currentTotalMinutes + 30) {
        return false;
      }
    }

    return true;
  });
};

module.exports = {
  STANDARD_SLOTS,
  DAY_NAMES,
  parseTimeToMinutes,
  formatMinutesToTime,
  getDoctorDaySlots,
  getAvailableSlots
};
