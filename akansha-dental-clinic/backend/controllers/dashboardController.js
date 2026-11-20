const { success } = require('../utils/responseHelper');

const getSummary = async (req, res, next) => {
  try {
    const summary = {
      totalAppointments: 154,
      todayAppointments: 8,
      pendingAppointments: 3,
      confirmedAppointments: 138,
      completedAppointments: 130,
      cancelledAppointments: 13,
      totalPatients: 124,
      totalRevenue: 284500,
      monthlyRevenue: 68400,
      todayQueue: [
        { id: 1, patient: 'Sunita Verma', doctor: 'Dr. Akansha Sharma', service: 'General Dental Checkup', slot: '10:30 AM', status: 'CONFIRMED' },
        { id: 2, patient: 'Rahul Gupta', doctor: 'Dr. Rajesh Deshmukh', service: 'Root Canal Therapy', slot: '11:30 AM', status: 'CONFIRMED' },
        { id: 3, patient: 'Pooja Tiwari', doctor: 'Any Available Doctor', service: 'General Dental Checkup', slot: '02:00 PM', status: 'PENDING' },
        { id: 4, patient: 'Manish Soni', doctor: 'Dr. Neha Kapoor', service: 'Clear Aligners & Braces', slot: '04:30 PM', status: 'CONFIRMED' }
      ],
      recentAppointments: [
        { id: 1, bookingRef: 'APT-2026-0001', patient: 'Sunita Verma', doctor: 'Dr. Akansha Sharma', service: 'General Dental Checkup', slot: '10:30 AM', status: 'CONFIRMED' }
      ]
    };

    return success(res, summary, 'Dashboard analytics retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary
};
