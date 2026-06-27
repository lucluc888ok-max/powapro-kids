import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL: BASE });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    sessionStorage.setItem('parent_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    sessionStorage.removeItem('parent_token');
  }
}

// 起動時にsessionStorageから復元
const saved = sessionStorage.getItem('parent_token');
if (saved) api.defaults.headers.common['Authorization'] = `Bearer ${saved}`;

export const playerApi = {
  get: () => api.get('/player').then(r => r.data),
  update: (data: object) => api.put('/player', data).then(r => r.data),
  updateStats: (data: object) => api.put('/player/stats', data).then(r => r.data),
};

export const trainingApi = {
  getMenus: () => api.get('/training/menus').then(r => r.data),
  submitLog: (menuIds: number[]) => api.post('/training/log', { menuIds }).then(r => r.data),
  getPending: () => api.get('/training/pending').then(r => r.data),
};

export const approvalApi = {
  login: (password: string) => api.post('/approval/login', { password }).then(r => r.data),
  approve: (id: number) => api.post(`/approval/approve/${id}`).then(r => r.data),
  reject: (id: number) => api.post(`/approval/reject/${id}`).then(r => r.data),
};

export const skillsApi = {
  getAll: () => api.get('/skills').then(r => r.data),
  add: (name: string) => api.post('/skills', { name }).then(r => r.data),
  promoteGold: (id: number) => api.put(`/skills/${id}/gold`).then(r => r.data),
  remove: (id: number) => api.delete(`/skills/${id}`).then(r => r.data),
};

export const historyApi = {
  getAll: () => api.get('/history').then(r => r.data),
  getByDate: (date: string) => api.get(`/history/${date}`).then(r => r.data),
};
