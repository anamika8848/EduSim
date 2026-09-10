import api from './api'

/**
 * Service for experiment viva question banks.
 */
export const vivaQuestionService = {
  getByExperiment: (experimentId) => api.get(`/experiments/${experimentId}/viva-questions`),
  add: (experimentId, data) => api.post(`/experiments/${experimentId}/viva-questions`, data),
  update: (id, data) => api.put(`/experiments/viva-questions/${id}`, data),
  delete: (id) => api.delete(`/experiments/viva-questions/${id}`),
}
