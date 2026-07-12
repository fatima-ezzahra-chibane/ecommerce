import api from './api';
import { prepareUploadFile, postMultipart } from '../utils/uploadImage';

export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  forgotPassword: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
};

export const profileService = {
  update: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
};

export const productService = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
};

export const reviewService = {
  list: (productId) => api.get(`/products/${productId}/reviews`),
  create: async (productId, { rating, comment, imageAsset }) => {
    const fd = new FormData();
    fd.append('rating', String(rating));
    if (comment) fd.append('comment', comment);
    let file;
    if (imageAsset?.uri) {
      file = await prepareUploadFile(imageAsset);
      fd.append('image', file);
    }
    return postMultipart(`/products/${productId}/reviews`, fd, { file, fileField: 'image' });
  },
};

export const categoryService = {
  list: () => api.get('/categories'),
};

export const cartService = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { product_id: productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
};

export const wishlistService = {
  list: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderService = {
  list: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  get: (id) => api.get(`/orders/${id}`),
};

export const aiService = {
  status: () => api.get('/ai/status'),
  recommendations: (params) => api.get('/ai/recommendations', { params }),
  productRecommendations: (productId) => api.get(`/products/${productId}/recommendations`),
  searchImage: async (imageAsset) => {
    const fd = new FormData();
    const file = await prepareUploadFile(imageAsset);
    fd.append('image', file);
    return postMultipart('/ai/search-image', fd, { file, fileField: 'image' });
  },
};
