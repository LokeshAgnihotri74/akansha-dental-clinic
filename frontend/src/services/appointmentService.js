import apiClient from './apiClient';

export const appointmentService = {
  bookAppointment: (data) => apiClient.post('/appointments', data),
  getAvailableSlots: (doctorId, date) => apiClient.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`),
  searchAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.query) query.append('query', params.query);
    query.append('page', params.page !== undefined ? params.page : 0);
    query.append('size', params.size || 10);
    return apiClient.get(`/appointments?${query.toString()}`);
  },
  getAppointmentById: (id) => apiClient.get(`/appointments/${id}`),
  updateStatus: (id, data) => apiClient.patch(`/appointments/${id}/status`, data),
  deleteAppointment: (id) => apiClient.delete(`/appointments/${id}`),
};

export default appointmentService;
