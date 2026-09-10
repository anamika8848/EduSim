import api from './api'

/**
 * Assignment service
 * Wraps all /assignments endpoints.
 */
export const assignmentService = {
  /** Create a new assignment (teacher action) */
  create: (data) => api.post('/assignments', data),

  /** Get all assignments for a specific student */
  getStudentAssignments: (studentId) =>
    api.get(`/assignments/student/${studentId}`),

  /** Get a single assignment by ID */
  getById: (id) => api.get(`/assignments/${id}`),

  /** Get all assignments created by a specific teacher */
  getTeacherAssignments: (teacherId) =>
    api.get(`/assignments/teacher/${teacherId}`),

  /** Mark an assignment as completed (student action) */
  complete: (id, data) => api.put(`/assignments/${id}/complete`, data),

  /** Save a draft of the assignment report (student action) */
  saveDraft: (id, data) => api.put(`/assignments/${id}/draft`, data),

  /** Grade an assignment (teacher action) */
  grade: (id, data) => api.put(`/assignments/${id}/grade`, data),

  /** Get aggregate stats for a student */
  getStudentStats: (studentId) =>
    api.get(`/assignments/student/${studentId}/stats`),

  /** Get aggregate stats for a teacher */
  getTeacherStats: (teacherId) =>
    api.get(`/assignments/teacher/${teacherId}/stats`),
}
