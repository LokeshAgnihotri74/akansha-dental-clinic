import apiClient from './apiClient';

export const clinicSettingService = {
  getPublicSettings: () => apiClient.get('/settings'),
  getAllSettings: () => apiClient.get('/settings/all'),
  updateSetting: (key, value) => apiClient.put(`/settings/${key}`, { value }),
};

export default clinicSettingService;
