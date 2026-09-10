import api from './api'

/**
 * Classroom service
 * Wraps /classrooms endpoints.
 */
export const classroomService = {
  /** Create a new classroom (teacher action) */
  create: (data) => api.post('/classrooms', data),

  /** Join a classroom using a classCode (student action) */
  join: (data) => api.post('/classrooms/join', data),

  /** Get all classrooms created by a teacher */
  getTeacherClasses: (teacherId) => api.get(`/classrooms/teacher/${teacherId}`),

  /** Get the classroom joined by a student */
  getStudentClass: (studentId) => api.get(`/classrooms/student/${studentId}`),

  /** Get classroom details by ID */
  getDetails: (id) => api.get(`/classrooms/${id}`),

  /** Get students enrolled in a classroom */
  getStudents: (classId) => api.get(`/classrooms/${classId}/students`),

  /** Leave a classroom (student action) */
  leave: () => api.post('/classrooms/leave'),

  /** Remove a student from a classroom roster (teacher action) */
  removeStudent: (studentId) => api.post(`/classrooms/remove-student?studentId=${studentId}`),
}
