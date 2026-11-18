import apiClient from './apiClient';

export const authService = {
  /**
   * Authenticate admin or staff user
   * @param {string} username - Username or email
   * @param {string} password - User password
   */
  login: async (username, password) => {
    return await apiClient.post('/auth/login', { username, password });
  },

  /**
   * Retrieve currently authenticated user profile
   */
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  /**
   * Terminate active session and record audit trail
   */
  logout: async () => {
    try {
      return await apiClient.post('/auth/logout');
    } catch {
      // Local clean up even if network fails
      return { success: true };
    }
  },
};

export default authService;
