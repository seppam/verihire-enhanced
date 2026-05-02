import api from './api';

export const historyService = {
  // Scan Job History
  getScanHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/scan/my-history', {
      params: { page, limit }
    });
    return response.data;
  },

  getScanDetail: async (id) => {
    const response = await api.get(`/scan/my-history/${id}`);
    return response.data;
  },

  deleteScan: async (id) => {
    const response = await api.delete(`/scan/my-history/${id}`);
    return response.data;
  },

  // CV Analysis History
  getCvHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/cv/history', {
      params: { page, limit }
    });
    return response.data;
  },

  getCvDetail: async (id) => {
    const response = await api.get(`/cv/history/${id}`);
    return response.data;
  },

  deleteCv: async (id) => {
    const response = await api.delete(`/cv/history/${id}`);
    return response.data;
  }
};
