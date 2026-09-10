import api from './api'

/**
 * Announcement service
 * Wraps /announcements endpoints.
 */
export const announcementService = {
  /** Create a new announcement (teacher action) */
  create: (data) => api.post('/announcements', data),

  /** Get announcements for a specific classroom */
  getByClassroom: (classroomId) => api.get(`/announcements/classroom/${classroomId}`),

  /** Get announcements for a specific student (based on their joined class) */
  getForStudent: (studentId) => api.get(`/announcements/student/${studentId}`),

  /** Update an announcement (teacher action) */
  update: (id, data) => api.put(`/announcements/${id}`, data),

  /** Delete an announcement (teacher action) */
  delete: (id) => api.delete(`/announcements/${id}`),
}
