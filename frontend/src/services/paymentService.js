import api from './api';

export const paymentService = {
  createCheckoutSession: async (data) => {
    const response = await api.post('/payment/checkout', data);
    return response.data;
  }
};
