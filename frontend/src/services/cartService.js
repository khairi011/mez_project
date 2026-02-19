import api from './api';

export const cartService = {
  getCart: () =>
    api.get('/cart'),

  addToCart: (productId, quantity) =>
    api.post('/cart/items', { productId, quantity }),

  updateCartItem: (cartItemId, quantity) =>
    api.patch(`/cart/items/${cartItemId}`, { quantity }),

  removeFromCart: (cartItemId) =>
    api.delete(`/cart/items/${cartItemId}`),

  clearCart: () =>
    api.delete('/cart'),
};