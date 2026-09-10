import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { ROLES, ROUTES } from '../utils/constants'
import Layout from '../components/layout/Layout'

/* ── Lazy page imports ───────────────────────────────────────── */
const LandingPage         = lazy(() => import('../pages/LandingPage'))
const LoginPage           = lazy(() => import('../pages/LoginPage'))
const TeacherDashboard    = lazy(() => import('../pages/teacher/TeacherDashboard'))
const TeacherClassrooms   = lazy(() => import('../pages/teacher/TeacherClassrooms'))
const TeacherAssignments  = lazy(() => import('../pages/teacher/TeacherAssignments'))
const Students            = lazy(() => import('../pages/teacher/Students'))
const StudentDashboard    = lazy(() => import('../pages/student/StudentDashboard'))
const StudentAssignments  = lazy(() => import('../pages/student/StudentAssignments'))
const StudentHistory      = lazy(() => import('../pages/student/StudentHistory'))
const PracticeNotebook    = lazy(() => import('../pages/student/PracticeNotebook'))
const ExperimentsPage     = lazy(() => import('../pages/ExperimentsPage'))
const ExperimentLab       = lazy(() => import('../pages/ExperimentLab'))
const ProfilePage         = lazy(() => import('../pages/ProfilePage'))
const NotFound            = lazy(() => import('../pages/NotFound'))
const Unauthorized        = lazy(() => import('../pages/Unauthorized'))
const AdminDashboard      = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers          = lazy(() => import('../pages/admin/AdminUsers'))
const AdminClasses        = lazy(() => import('../pages/admin/AdminClasses'))
const AdminAssignments    = lazy(() => import('../pages/admin/AdminAssignments'))
const TeacherTests        = lazy(() => import('../pages/teacher/TeacherTests'))
const StudentTests        = lazy(() => import('../pages/student/StudentTests'))
const StudentTestRun      = lazy(() => import('../pages/student/StudentTestRun'))
const StudentTestResult   = lazy(() => import('../pages/student/StudentTestResult'))

/* ── Full-screen loading fallback ───────────────────────────── */
function PageLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
        style={{
          borderTopColor: 'var(--accent-blue)',
          borderRightColor: 'var(--accent-purple)',
        }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
    </div>
  )
}

/* ── Router ─────────────────────────────────────────────────── */
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes ─────────────────────────────────── */}
          <Route path={ROUTES.LANDING}      element={<LandingPage />} />
          <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
          <Route path="/register"           element={<LoginPage />} />
          <Route path="/unauthorized"       element={<Unauthorized />} />

          {/* ── Public Catalogue Route (nested in Layout) ─────── */}
          <Route element={<Layout />}>
            <Route path={ROUTES.EXPERIMENTS} element={<ExperimentsPage />} />
          </Route>

          {/* ── Admin routes ──────────────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole={ROLES.ADMIN} />}>
            <Route element={<Layout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD}   element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_USERS}       element={<AdminUsers />} />
              <Route path={ROUTES.ADMIN_CLASSES}     element={<AdminClasses />} />
              <Route path={ROUTES.ADMIN_ASSIGNMENTS} element={<AdminAssignments />} />
            </Route>
          </Route>

          {/* ── Teacher routes ────────────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole={ROLES.TEACHER} />}>
            <Route element={<Layout />}>
              <Route path={ROUTES.TEACHER_DASHBOARD}   element={<TeacherDashboard />} />
              <Route path={ROUTES.TEACHER_CLASSROOMS}  element={<TeacherClassrooms />} />
              <Route path={ROUTES.TEACHER_ASSIGNMENTS} element={<TeacherAssignments />} />
              <Route path={ROUTES.TEACHER_TESTS}       element={<TeacherTests />} />
              <Route path={ROUTES.TEACHER_STUDENTS}    element={<Students />} />
            </Route>
          </Route>

          {/* ── Student routes ────────────────────────────────── */}
          <Route element={<ProtectedRoute requiredRole={ROLES.STUDENT} />}>
            <Route element={<Layout />}>
              <Route path={ROUTES.STUDENT_DASHBOARD}    element={<StudentDashboard />} />
              <Route path={ROUTES.STUDENT_ASSIGNMENTS}  element={<StudentAssignments />} />
              <Route path={ROUTES.STUDENT_TESTS}        element={<StudentTests />} />
              <Route path={ROUTES.STUDENT_HISTORY}      element={<StudentHistory />} />
              <Route path={ROUTES.STUDENT_PRACTICE_NOTEBOOK} element={<PracticeNotebook />} />
            </Route>
            {/* Run and Result pages rendered outside the Layout frame */}
            <Route path={ROUTES.STUDENT_TEST_RUN}       element={<StudentTestRun />} />
            <Route path={ROUTES.STUDENT_TEST_RESULT}    element={<StudentTestResult />} />
          </Route>

          {/* ── Shared authenticated routes ───────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path={`${ROUTES.EXPERIMENTS}/:id`} element={<ExperimentLab />} />
              <Route path={ROUTES.PROFILE}              element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ── 404 ───────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
