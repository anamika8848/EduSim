import api from './api'

/**
 * Experiment service
 * Wraps all /experiments endpoints.
 */
export const experimentService = {
  /** Fetch all available experiments */
  getAll: () => api.get('/experiments'),

  /** Fetch experiments filtered by subject (PHYSICS | CHEMISTRY | BIOLOGY) */
  getBySubject: (subject) => api.get(`/experiments/subject/${subject}`),

  /** Fetch a single experiment by ID */
  getById: (id) => api.get(`/experiments/${id}`),
}
