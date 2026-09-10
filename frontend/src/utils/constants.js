/**
 * Application-wide constants
 */

/** Base URL for the backend API (used for non-proxied fetch if needed) */
export const API_BASE_URL = 'http://localhost:8080'

/** User role constants */
export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN:   'ADMIN',
}

/** Academic subject constants */
export const SUBJECTS = {
  PHYSICS:   'PHYSICS',
  CHEMISTRY: 'CHEMISTRY',
  BIOLOGY:   'BIOLOGY',
}

/** Experiment difficulty levels */
export const DIFFICULTIES = {
  BEGINNER:     'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED:     'ADVANCED',
}

/** Assignment / experiment status values */
export const STATUS = {
  PENDING:   'PENDING',
  SUBMITTED: 'SUBMITTED',
  GRADED:    'GRADED',
  OVERDUE:   'OVERDUE',
}

/** Emoji icons for each subject */
export const EXPERIMENT_ICONS = {
  PHYSICS:   '⚛️',
  CHEMISTRY: '🧪',
  BIOLOGY:   '🧬',
}

/** Brand colors for each subject (matches CSS design system) */
export const SUBJECT_COLORS = {
  PHYSICS:   '#3b82f6',
  CHEMISTRY: '#f59e0b',
  BIOLOGY:   '#10b981',
}

/** Gradient pairs for subject cards */
export const SUBJECT_GRADIENTS = {
  PHYSICS:   ['#3b82f6', '#8b5cf6'],
  CHEMISTRY: ['#f59e0b', '#ef4444'],
  BIOLOGY:   ['#10b981', '#06b6d4'],
}

/** Difficulty ordering (for sorting) */
export const DIFFICULTY_ORDER = {
  BEGINNER:     1,
  INTERMEDIATE: 2,
  ADVANCED:     3,
}

/** localStorage key names */
export const STORAGE_KEYS = {
  TOKEN: 'edusim_token',
  USER:  'edusim_user',
}

/** Route paths */
export const ROUTES = {
  LANDING:             '/',
  LOGIN:               '/login',
  REGISTER:            '/register',
  UNAUTHORIZED:        '/unauthorized',
  TEACHER_DASHBOARD:   '/teacher/dashboard',
  TEACHER_ASSIGNMENTS: '/teacher/assignments',
  TEACHER_STUDENTS:    '/teacher/students',
  TEACHER_CLASSROOMS:  '/teacher/classrooms',
  STUDENT_DASHBOARD:   '/student/dashboard',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_HISTORY:     '/student/history',
  STUDENT_PRACTICE_NOTEBOOK: '/student/practice-notebook',
  EXPERIMENTS:         '/experiments',
  PROFILE:             '/profile',
  ADMIN_DASHBOARD:     '/admin/dashboard',
  ADMIN_USERS:         '/admin/users',
  ADMIN_CLASSES:       '/admin/classes',
  ADMIN_ASSIGNMENTS:   '/admin/assignments',
  TEACHER_TESTS:       '/teacher/tests',
  STUDENT_TESTS:       '/student/tests',
  STUDENT_TEST_RUN:    '/student/tests/run/:id',
  STUDENT_TEST_RESULT: '/student/tests/result/:id',
}
