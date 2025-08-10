import api from './client';

// Products API (menu items)
export const productsApi = {
  getAll: () => api.get('/products'),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Consumables API (name + price)
export const consumablesApi = {
  getAll: () => api.get('/consumables'),
  create: (consumableData) => api.post('/consumables', consumableData),
  update: (id, data) => api.put(`/consumables/${id}`, data),
  delete: (id) => api.delete(`/consumables/${id}`),
};

// Daily tracking API
export const dailyApi = {
  // Summary for dashboard
  getSummaryByDate: (date) => api.get(`/daily/summary/${date}`),

  // Consumable usage
  getConsumablesByDate: (date) => api.get(`/daily/consumables/${date}`),
  upsertConsumableUsage: (data) => api.post('/daily/consumables', data),
  updateConsumableUsage: (id, data) => api.put(`/daily/consumables/${id}`),
  deleteConsumableUsage: (id) => api.delete(`/daily/consumables/${id}`),

  // Baguettes
  getBaguettesByDate: (date) => api.get(`/daily/baguettes/${date}`),
  saveBaguettes: (data) => api.post('/daily/baguettes', data),

  // Earnings
  getEarningsByDate: (date) => api.get(`/daily/earnings/${date}`),
  saveEarnings: (data) => api.post('/daily/earnings', data),
};

// Utility functions
export const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

export const parseApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return 'An unexpected error occurred';
};