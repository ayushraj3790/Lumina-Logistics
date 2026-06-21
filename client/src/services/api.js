import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Shipments
export const shipmentAPI = {
  create: (data) => api.post('/shipments', data),
  getMy: (params) => api.get('/shipments/my', { params }),
  track: (trackingId) => api.get(`/shipments/track/${trackingId}`),
  getOne: (id) => api.get(`/shipments/${id}`),
  updateStatus: (id, data) => api.put(`/shipments/${id}/status`, data),
  assignDriver: (id, driverId) => api.put(`/shipments/${id}/assign`, { driverId }),
  getAll: (params) => api.get('/shipments/all', { params }),
  refreshETA: (id) => api.get(`/shipments/${id}/eta`),
  getRoutes: (id) => api.get(`/shipments/${id}/routes`),
  uploadProof: (id, data) => api.post(`/shipments/${id}/proof`, data),
};

export const driverAPI = {
  getDeliveries: (params) => api.get('/drivers/deliveries', { params }),
  updateLocation: (data) => api.put('/drivers/location', data),
  getStats: () => api.get('/drivers/stats'),
  getAvailable: () => api.get('/drivers/available'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getStats: () => api.get('/admin/stats'),
  getWarehouses: () => api.get('/admin/warehouses'),
  createWarehouse: (data) => api.post('/admin/warehouses', data),
};

export const warehouseAPI = {
  getStats: () => api.get('/warehouse/stats'),
  scan: (data) => api.post('/warehouse/scan', data),
  getInventory: () => api.get('/warehouse/inventory'),
};

export const paymentAPI = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  cod: (data) => api.post('/payments/cod', data),
  retry: (shipmentId, data) => api.post(`/payments/retry/${shipmentId}`, data),
  getHistory: () => api.get('/payments/history'),
  getInvoice: (id) => api.get(`/payments/invoice/${id}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const chatAPI = {
  send: (data) => api.post('/chat/message', data),
  getChats: () => api.get('/chat'),
  getChat: (id) => api.get(`/chat/${id}`),
};
