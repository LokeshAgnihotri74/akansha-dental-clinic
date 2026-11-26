import apiClient from './apiClient';

export const inquiryService = {
  submitInquiry: (data) => apiClient.post('/inquiries', data),
  submitContactRequest: (data) => apiClient.post('/inquiries/contact', data),
  searchInquiries: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    query.append('page', params.page !== undefined ? params.page : 0);
    query.append('size', params.size || 10);
    return apiClient.get(`/inquiries?${query.toString()}`);
  },
  getInquiryById: (id) => apiClient.get(`/inquiries/${id}`),
  updateStatus: (id, data) => apiClient.patch(`/inquiries/${id}/status`, data),
};

export default inquiryService;
