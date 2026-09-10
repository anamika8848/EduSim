import api from './api'

/**
 * Admin service
 * Wraps /admin endpoints.
 */
export const adminService = {
  /** Fetch dashboard stats and analytics data */
  getStats: () => api.get('/admin/stats'),

  /** Fetch all registered users in the platform */
  getUsers: () => api.get('/admin/users'),

  /** Delete a specific user account */
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  /** Fetch all classrooms in the platform */
  getClassrooms: () => api.get('/admin/classrooms'),

  /** Delete a specific classroom */
  deleteClassroom: (id) => api.delete(`/admin/classrooms/${id}`),

  /** Fetch all assignments in the platform */
  getAssignments: () => api.get('/admin/assignments'),
}
