import api from './api';

export const orderService = {
  createOrder: (cartId, deliveryInfo) =>
    api.post('/orders', { cartId, deliveryInfo }),

  getMyOrders: () =>
    api.get('/orders'),

  getOrderById: (id) =>
    api.get(`/orders/${id}`),

  cancelOrder: (id) =>
    api.post(`/orders/${id}/cancel`),
};