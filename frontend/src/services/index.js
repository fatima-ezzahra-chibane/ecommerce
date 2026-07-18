import api from './api';

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
  create: (productId, { rating, comment, imageFile }) => {
    const fd = new FormData();
    fd.append('rating', String(rating));
    if (comment) fd.append('comment', comment);
    if (imageFile) fd.append('image', imageFile);
    return api.post(`/products/${productId}/reviews`, fd);
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
  searchImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/ai/search-image', fd);
  },
};

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  products: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  uploadProductImage: (id, file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post(`/admin/products/${id}/image`, fd);
  },
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  categories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  orders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  users: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
};
