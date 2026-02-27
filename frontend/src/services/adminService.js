import api from './api';

export const adminService = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  // Orders
  getAllOrders: (page = 0, limit = 20) =>
    api.get(`/admin/orders?page=${page}&limit=${limit}`),
  getOrdersByStatus: (status) =>
    api.get(`/admin/orders/status/${status}`),
  getOrderDetails: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }),

  // Users
  getAllUsers: (page = 0, limit = 20) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),

  // Products (admin CRUD)
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Categories (admin CRUD)
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};
