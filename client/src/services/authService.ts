import { apiClient } from './apiClient';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
}

export const authService = {
  updateProfile: async (profileData: ProfileUpdateData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
