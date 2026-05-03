import api from './api';

const adminAPI = api;

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await adminAPI.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await adminAPI.get('/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await adminAPI.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await adminAPI.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminAPI.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Scans
  getAllScans: async (params = {}) => {
    const response = await adminAPI.get('/admin/scans', { params });
    return response.data;
  },

  // CV Analyses
  getAllCvAnalyses: async (params = {}) => {
    const response = await adminAPI.get('/admin/cv-analyses', { params });
    return response.data;
  }
};
