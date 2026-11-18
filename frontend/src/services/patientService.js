import apiClient from './apiClient';

export const patientService = {
  getPatients: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    query.append('page', params.page || 0);
    query.append('size', params.size || 10);
    return apiClient.get(`/patients?${query.toString()}`);
  },
  getPatientById: (id) => apiClient.get(`/patients/${id}`),
  createPatient: (data) => apiClient.post('/patients', data),
  updatePatient: (id, data) => apiClient.put(`/patients/${id}`, data),
};

export default patientService;
