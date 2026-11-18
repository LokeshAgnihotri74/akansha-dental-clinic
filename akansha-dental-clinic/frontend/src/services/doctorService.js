import apiClient from './apiClient';

export const doctorService = {
  getDoctors: (activeOnly = true) => apiClient.get(`/doctors?activeOnly=${activeOnly}`),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`),
  createDoctor: (data) => apiClient.post('/doctors', data),
  updateDoctor: (id, data) => apiClient.put(`/doctors/${id}`, data),
  toggleStatus: (id, active) => apiClient.patch(`/doctors/${id}/status?active=${active}`),
  deleteDoctor: (id) => apiClient.delete(`/doctors/${id}`),
  getDoctorSchedules: (id) => apiClient.get(`/doctors/${id}/schedules`),
};

export default doctorService;
