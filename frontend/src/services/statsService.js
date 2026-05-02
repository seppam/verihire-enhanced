import api from './api';
import axios from 'axios';

export const statsService = {
  getPublicStats: async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/stats/public`);
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get('/stats/my-stats');
    return response.data;
  }
};
