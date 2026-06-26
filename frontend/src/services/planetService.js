import api from './api';

export const planetService = {
  getAll: () => api.get('/planets'),
  getById: (id) => api.get(`/planets/${id}`)
};
