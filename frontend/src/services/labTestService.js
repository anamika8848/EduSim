import api from './api'

/**
 * Service for scheduled laboratory examinations.
 */
export const labTestService = {
  create: (data) => api.post('/lab-tests', data),
  update: (id, data) => api.put(`/lab-tests/${id}`, data),
  getById: (id) => api.get(`/lab-tests/${id}`),
  delete: (id) => api.delete(`/lab-tests/${id}`),
  getTeacherTests: (teacherId) => api.get(`/lab-tests/teacher/${teacherId}`),
  getStudentTests: (studentId) => api.get(`/lab-tests/student/${studentId}`),
  updateState: (id, state) => api.put(`/lab-tests/${id}/state?state=${state}`),
  getStats: (testId) => api.get(`/lab-tests/${testId}/stats`),
}
