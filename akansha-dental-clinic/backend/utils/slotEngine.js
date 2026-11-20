/**
 * Akansha Dental Clinic — Intelligent Slot Generator & Availability Engine
 */

const STANDARD_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM'
];

/**
 * Filter slots based on existing booked appointments and current time if today
 * @param {Array<string>} bookedSlots - Slots already taken
 * @param {string} targetDate - Date string YYYY-MM-DD
 * @returns {Array<string>} Available slot strings
 */
const getAvailableSlots = (bookedSlots = [], targetDate = null) => {
  const bookedSet = new Set(bookedSlots.map(s => (s || '').trim().toUpperCase()));
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = targetDate === todayStr;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  return STANDARD_SLOTS.filter(slot => {
    // 1. If already booked, exclude
    if (bookedSet.has(slot.toUpperCase())) {
      return false;
    }

    // 2. If booking for today, exclude past slots
    if (isToday) {
      const [timePart, modifier] = slot.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      // Add 30-min advance buffer
      if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes + 30)) {
        return false;
      }
    }

    return true;
  });
};

module.exports = {
  STANDARD_SLOTS,
  getAvailableSlots
};
