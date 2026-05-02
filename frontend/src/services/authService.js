import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    localStorage.clear();
    sessionStorage.clear();
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Storage cleared. Remaining keys:", Object.keys(localStorage));
    window.location.replace('/login'); // Use replace to prevent back-button issues
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  
  updatePassword: async (data) => {
    const response = await api.put('/auth/update-password', data);
    return response.data;
  },
  
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
  
  resetPassword: async (token, data) => {
    const response = await api.patch(`/auth/reset-password/${token}`, data);
    return response.data;
  }
};
