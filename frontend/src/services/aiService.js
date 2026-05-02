import api from './api';

export const aiService = {
  detectJob: async (data, isFormData = false) => {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/scan/detect', data, config);
    return response.data;
  },

  analyzeCV: async (formData) => {
    const response = await api.post('/cv/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  chatBuddy: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  }
};
