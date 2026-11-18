import apiClient from './apiClient';

export const catalogService = {
  getServices: (activeOnly = true) => apiClient.get(`/services?activeOnly=${activeOnly}`),
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  createService: (data) => apiClient.post('/services', data),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`),
  toggleStatus: (id) => apiClient.patch(`/services/${id}/status`),
};

export default catalogService;
