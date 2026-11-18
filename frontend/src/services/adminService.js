import apiClient from './apiClient';

export const adminService = {
  getAdmins: () => apiClient.get('/admins'),
  createAdmin: (data) => apiClient.post('/admins', data),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    query.append('page', params.page || 0);
    query.append('size', params.size || 20);
    return apiClient.get(`/audit-logs?${query.toString()}`);
  },
};

export default adminService;
