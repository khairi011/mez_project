import api from './api';

export const productService = {
  getAllProducts: (page = 0, limit = 12) =>
    api.get(`/products?page=${page}&limit=${limit}`),

  getProductById: (id) =>
    api.get(`/products/${id}`),

  searchProducts: (query, page = 0) =>
    api.get(`/products/search?q=${query}&page=${page}`),

  getProductsByCategory: (categoryId, page = 0) =>
    api.get(`/products/category/${categoryId}?page=${page}`),

  getAllCategories: () =>
    api.get('/categories'),
};