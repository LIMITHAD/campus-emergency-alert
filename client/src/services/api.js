import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  createAlert: (data) => api.post('/alerts', data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  acknowledgeAlert: (id) => api.post(`/alerts/${id}/acknowledge`),
};

export const panicAPI = {
  sendPanic: (data) => api.post('/panic', data),
  getMyPanics: () => api.get('/panic/my'),
  getPanicRequests: (params) => api.get('/panic', { params }),
  updatePanicStatus: (id, data) => api.put(`/panic/${id}/status`, data),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.put(`/users/${id}/toggle`),
};

export default api;