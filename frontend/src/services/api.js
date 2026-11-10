import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fittrack_token');
      localStorage.removeItem('fittrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

// User
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
};

// Goals
export const goalAPI = {
  getAll: () => API.get('/goals'),
  create: (data) => API.post('/goals', data),
  update: (id, data) => API.put(`/goals/${id}`, data),
  delete: (id) => API.delete(`/goals/${id}`),
  updateProgress: (id, currentValue) => API.patch(`/goals/${id}/progress`, { currentValue }),
};

// Exercises
export const exerciseAPI = {
  getAll: (params) => API.get('/exercises', { params }),
  getById: (id) => API.get(`/exercises/${id}`),
};

// Workout Plans
export const planAPI = {
  getAll: () => API.get('/workout-plans'),
  create: (data) => API.post('/workout-plans', data),
  update: (id, data) => API.put(`/workout-plans/${id}`, data),
  delete: (id) => API.delete(`/workout-plans/${id}`),
};

// Workout Logs
export const logAPI = {
  getAll: (params) => API.get('/workout-logs', { params }),
  create: (data) => API.post('/workout-logs', data),
  update: (id, data) => API.put(`/workout-logs/${id}`, data),
  delete: (id) => API.delete(`/workout-logs/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
  getWeeklyActivity: () => API.get('/dashboard/weekly-activity'),
  getMonthlyProgress: () => API.get('/dashboard/monthly-progress'),
  getCategoryDistribution: () => API.get('/dashboard/category-distribution'),
};

// Reports
export const reportAPI = {
  getWeekly: () => API.get('/reports/weekly'),
  getMonthly: () => API.get('/reports/monthly'),
  getGoals: () => API.get('/reports/goals'),
  getHistory: (params) => API.get('/reports/history', { params }),
  exportCSV: () => API.get('/reports/export-csv', { responseType: 'blob' }),
};

// Trainer
export const trainerAPI = {
  getDashboard: () => API.get('/trainer/dashboard'),
  getClients: (params) => API.get('/trainer/clients', { params }),
  getClientDetails: (id) => API.get(`/trainer/clients/${id}`),
  submitFeedback: (data) => API.post('/trainer/feedback', data),
  getFeedback: (clientId) => API.get(`/trainer/feedback/${clientId}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getTrainers: () => API.get('/admin/trainers'),
  toggleStatus: (id) => API.put(`/admin/users/${id}/status`),
  assignTrainer: (id, trainerId) => API.put(`/admin/users/${id}/assign-trainer`, { trainerId }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
