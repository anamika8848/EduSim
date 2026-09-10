import api from './api'

export const practiceObservationService = {
  create: (data) => api.post('/practice-observations', data),
  getAll: () => api.get('/practice-observations'),
  update: (id, data) => api.put(`/practice-observations/${id}`, data),
  delete: (id) => api.delete(`/practice-observations/${id}`),
}
