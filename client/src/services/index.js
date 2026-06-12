import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }).then(r => r.data),
  getFeatured: () => api.get('/products/featured').then(r => r.data),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`).then(r => r.data),
  getById: (id) => api.get(`/products/id/${id}`).then(r => r.data),
  createProduct: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  updateProduct: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(r => r.data),
  deleteImage: (productId, cloudinaryId) => api.delete(`/products/${productId}/image/${encodeURIComponent(cloudinaryId)}`).then(r => r.data),
};

export const collectionService = {
  getAll: (params) => api.get('/collections', { params }).then(r => r.data),
  getBySlug: (slug) => api.get(`/collections/${slug}`).then(r => r.data),
  create: (formData) => api.post('/collections', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update: (id, formData) => api.put(`/collections/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  delete: (id) => api.delete(`/collections/${id}`).then(r => r.data),
};

export const orderService = {
  place: (data) => api.post('/orders', data).then(r => r.data),
  getMyOrders: (params) => api.get('/orders/my', { params }).then(r => r.data),
  getAll: (params) => api.get('/orders', { params }).then(r => r.data),
  getById: (id) => api.get(`/orders/${id}`).then(r => r.data),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`).then(r => r.data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data).then(r => r.data),
  assign: (id, staffId) => api.put(`/orders/${id}/assign`, { staffId }).then(r => r.data),
  uploadProof: (formData) => api.post('/payments/upload-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
};

export const paymentService = {
  getPending: () => api.get('/payments/pending').then(r => r.data),
  getAll: (params) => api.get('/payments', { params }).then(r => r.data),
  verify: (data) => api.post('/payments/verify', data).then(r => r.data),
  approveCOD: (orderId) => api.put(`/payments/approve-cod/${orderId}`).then(r => r.data),
};

export const statsService = {
  getDashboard: () => api.get('/stats/dashboard').then(r => r.data),
  getRevenueChart: () => api.get('/stats/revenue-chart').then(r => r.data),
  getOrderStatus: () => api.get('/stats/order-status').then(r => r.data),
  getTopCollections: () => api.get('/stats/top-collections').then(r => r.data),
  getPaymentMethods: () => api.get('/stats/payment-methods').then(r => r.data),
  getFinance: () => api.get('/stats/finance').then(r => r.data),
  getTopProducts: () => api.get('/stats/top-products').then(r => r.data),
  getFinanceOverview: (year) => api.get('/finance/overview', { params: { year } }).then(r => r.data),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }).then(r => r.data),
  getById: (id) => api.get(`/users/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
  updateProfile: (formData) => api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  changePassword: (data) => api.put('/users/change-password', data).then(r => r.data),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`).then(r => r.data),
};

export const supportService = {
  create: (data) => api.post('/support', data).then(r => r.data),
  getMy: () => api.get('/support/my').then(r => r.data),
  getAll: (params) => api.get('/support', { params }).then(r => r.data),
  getById: (id) => api.get(`/support/${id}`).then(r => r.data),
  reply: (id, message) => api.post(`/support/${id}/reply`, { message }).then(r => r.data),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data).then(r => r.data),
};

export const inventoryService = {
  getLogs: (params) => api.get('/inventory', { params }).then(r => r.data),
  getLowStock: () => api.get('/inventory/low-stock').then(r => r.data),
  getOverview: () => api.get('/inventory/overview').then(r => r.data),
  adjust: (data) => api.post('/inventory/adjust', data).then(r => r.data),
};
