import api from './api'

/**
 * Service for student examination attempts and evaluations.
 */
export const labTestSubmissionService = {
  start: (testId, studentId) => api.post(`/lab-tests/${testId}/submissions/start?studentId=${studentId}`),
  autosave: (id, data) => api.put(`/lab-tests/submissions/${id}/autosave`, data),
  logEvent: (id, eventType, details) => api.post(`/lab-tests/submissions/${id}/log-event?eventType=${eventType}&details=${encodeURIComponent(details)}`),
  submit: (id) => api.put(`/lab-tests/submissions/${id}/submit`),
  forceSubmit: (id) => api.put(`/lab-tests/submissions/${id}/force-submit`),
  allowReentry: (id) => api.put(`/lab-tests/submissions/${id}/re-entry`),
  evaluate: (id, data) => api.put(`/lab-tests/submissions/${id}/evaluate`, data),
  reopenEvaluation: (id) => api.put(`/lab-tests/submissions/${id}/reopen-evaluation`),
  getSubmissionsByTest: (testId) => api.get(`/lab-tests/${testId}/submissions`),
  getById: (id) => api.get(`/lab-tests/submissions/${id}`),
  getStudentHistory: (studentId) => api.get(`/lab-tests/submissions/student/${studentId}/history`),
}
