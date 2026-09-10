import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { assignmentService } from '../../services/assignmentService'
import { experimentService } from '../../services/experimentService'
import { classroomService } from '../../services/classroomService'
import { announcementService } from '../../services/announcementService'
import { practiceObservationService } from '../../services/practiceObservationService'
import { labTestService } from '../../services/labTestService'
import { labTestSubmissionService } from '../../services/labTestSubmissionService'
import StatCard from '../../components/ui/StatCard'
import { ROUTES, EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'

/* ── Lab Exam Reminder Banner Card ──────────────────────────────── */
function LabExamReminder({ tests, submissions, navigate }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!tests || tests.length === 0) return null

  // Filter candidates: Scheduled/Upcoming or Active tests not submitted/completed yet
  const candidates = tests.map(test => {
    if (test.testState === 'DRAFT' || test.testState === 'ARCHIVED') return null

    const sub = submissions.find(s => s.labTest?.id === test.id)
    const isSubmitted = sub && (sub.status === 'SUBMITTED' || sub.status === 'EXPIRED' || sub.status === 'EVALUATED')
    if (isSubmitted) return null

    const startTime = new Date(test.startDateTime)
    const endTime = new Date(test.endDateTime)
    const graceLimit = new Date(startTime.getTime() + (test.lateEntryGracePeriod || 10) * 60 * 1000)

    if (now < startTime) {
      return { type: 'UPCOMING', test, sub, startTime, endTime }
    } else if (now >= startTime && now <= endTime) {
      const hasStarted = sub && sub.status === 'IN_PROGRESS'
      const withinGrace = now <= graceLimit
      if (hasStarted || withinGrace) {
        return { type: 'ACTIVE', test, sub, startTime, endTime, hasStarted }
      }
    }
    return null
  }).filter(Boolean)

  if (candidates.length === 0) return null

  const candidate = candidates[0]
  const { type, test, sub, startTime, endTime, hasStarted } = candidate

  if (type === 'UPCOMING') {
    const diffMs = startTime.getTime() - now.getTime()
    const diffMins = Math.max(0, Math.floor(diffMs / (60 * 1000)))
    const hrs = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    const startsInStr = hrs > 0 ? `${hrs} Hour(s) ${mins} Minute(s)` : `${mins} Minute(s)`

    return (
      <div className="glass-card" style={{
        padding: '1.25rem',
        borderLeft: '4px solid #f59e0b',
        background: 'rgba(245,158,11,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🧪</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              Upcoming Laboratory Examination: <span style={{ color: '#fca5a5' }}>{test.testName}</span>
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px' }}>
              <span>Class: <strong>{test.classroom?.className}</strong></span>
              <span>Start Time: <strong>{startTime.toLocaleTimeString()}</strong></span>
              <span>Grace Period: <strong>{test.lateEntryGracePeriod} Mins</strong></span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>
              ⏳ Starts In: {startsInStr}
            </div>
          </div>
        </div>
        <button className="btn-secondary" style={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={() => navigate(ROUTES.STUDENT_TESTS)}>
          View Details
        </button>
      </div>
    )
  } else {
    // ACTIVE
    const durationLimit = new Date(startTime.getTime() + test.duration * 60 * 1000)
    const diffMs = durationLimit.getTime() - now.getTime()
    const remainingMins = Math.max(0, Math.floor(diffMs / (60 * 1000)))

    return (
      <div className="glass-card" style={{
        padding: '1.25rem',
        borderLeft: '4px solid #10b981',
        background: 'rgba(16,185,129,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2.2rem' }}>🟢</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              Examination in Progress: <span style={{ color: '#10b981' }}>{test.testName}</span>
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px' }}>
              <span>Class: <strong>{test.classroom?.className}</strong></span>
              <span>Duration: <strong>{test.duration} Mins</strong></span>
              <span>End Time: <strong>{new Date(test.endDateTime).toLocaleTimeString()}</strong></span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 'bold', marginTop: '4px' }}>
              ⏰ Time Remaining: {remainingMins} Minute(s)
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg,#10b981,#047857)', padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
          onClick={() => {
            if (hasStarted) {
              navigate(`/student/tests/run/${test.id}`)
            } else {
              navigate(ROUTES.STUDENT_TESTS)
            }
          }}
        >
          {hasStarted ? 'Resume Examination' : 'Start Examination'}
        </button>
      </div>
    )
  }
}

/* ── Assignment Card (Pending) ───────────────────────────────── */
function PendingCard({ assignment, onNavigate }) {
  const exp = assignment.experiment
  const subject = exp?.subject ?? 'PHYSICS'
  const isOverdue = assignment.status === 'PENDING' && new Date(assignment.dueDate) < new Date()
  const subjectClass = `badge-${subject.toLowerCase()}`
  const difficultyClass = `badge-${(exp?.difficulty ?? 'BEGINNER').toLowerCase()}`

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderTop: `3px solid ${SUBJECT_COLORS[subject] ?? '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {/* Subject + Difficulty */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={subjectClass}>{EXPERIMENT_ICONS[subject]} {subject}</span>
        <span className={difficultyClass}>{exp?.difficulty}</span>
      </div>

      {/* Name */}
      <div>
        <h4 style={{ margin: '0 0 0.2rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {exp?.name ?? 'Experiment'}
        </h4>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {exp?.description ?? 'Virtual laboratory experiment'}
        </p>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
          📅 Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
          {isOverdue && ' ⚠️'}
        </span>
        {exp?.estimatedTime && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱️ {exp.estimatedTime} min</span>
        )}
      </div>

      {/* CTA Button */}
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 'auto' }}
        onClick={() => onNavigate(exp?.id)}
      >
        🧪 Start Lab
      </button>
    </div>
  )
}

/* ── Completed / History Card ───────────────────────────────── */
function CompletedCard({ assignment }) {
  const exp = assignment.experiment
  const subject = exp?.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const score = assignment.score

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderTop: `3px solid ${assignment.status === 'GRADED' ? '#10b981' : '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={subjectClass}>{EXPERIMENT_ICONS[subject]} {subject}</span>
        {assignment.status === 'GRADED' ? (
          <span style={{
            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
            background: score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: score >= 70 ? '#10b981' : '#f59e0b',
            border: `1px solid ${score >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>🎯 {score}/100</span>
        ) : (
          <span style={{
            padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
            background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)'
          }}>SUBMITTED</span>
        )}
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {exp?.name ?? 'Experiment'}
        </h4>
        {assignment.remarks && (
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            💬 "{assignment.remarks}"
          </p>
        )}
      </div>

      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ✅ Submitted: {assignment.completionDate
          ? new Date(assignment.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A'}
      </span>
    </div>
  )
}

/* ── Practice / Available Experiment Card ─────────────────────── */
function PracticeCard({ experiment, onNavigate }) {
  const subject = experiment.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const difficultyClass = `badge-${(experiment.difficulty ?? 'BEGINNER').toLowerCase()}`

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderTop: `3px solid ${SUBJECT_COLORS[subject] ?? '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {/* Subject + Difficulty */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={subjectClass}>{EXPERIMENT_ICONS[subject]} {subject}</span>
        <span className={difficultyClass}>{experiment.difficulty}</span>
      </div>

      {/* Name */}
      <div>
        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {experiment.name ?? 'Experiment'}
        </h4>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {experiment.description ?? 'Virtual laboratory experiment'}
        </p>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>
        {experiment.estimatedTime && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱️ {experiment.estimatedTime} min</span>
        )}
      </div>

      {/* CTA Button */}
      <button
        className="btn-secondary"
        style={{ width: '100%', borderColor: 'rgba(59,130,246,0.35)', color: '#3b82f6', background: 'rgba(59,130,246,0.08)' }}
        onClick={() => onNavigate(experiment.id)}
      >
        🧪 Try Lab (Free Play)
      </button>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]             = useState(null)
  const [assignments, setAssignments] = useState([])
  const [experiments, setExperiments] = useState([])
  const [classroom, setClassroom]     = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [classCode, setClassCode]     = useState('')
  const [joining, setJoining]         = useState(false)
  const [activeTab, setActiveTab]     = useState('ASSIGNED')
  const [completedSubTab, setCompletedSubTab] = useState('SUBMITTED')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const [practiceObs, setPracticeObs] = useState([])
  const [labTests, setLabTests] = useState([])
  const [labSubmissions, setLabSubmissions] = useState([])

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const [statsRes, assignRes, expRes, classRes, announRes, practiceRes, testsRes, subsRes] = await Promise.allSettled([
        assignmentService.getStudentStats(user.id),
        assignmentService.getStudentAssignments(user.id),
        experimentService.getAll(),
        classroomService.getStudentClass(user.id),
        announcementService.getForStudent(user.id),
        practiceObservationService.getAll(),
        labTestService.getStudentTests(user.id),
        labTestSubmissionService.getStudentHistory(user.id)
      ])
      if (statsRes.status === 'fulfilled')  setStats(statsRes.value.data)
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data ?? [])
      if (expRes.status === 'fulfilled')    setExperiments(expRes.value.data ?? [])
      if (classRes.status === 'fulfilled')  setClassroom(classRes.value.data || null)
      if (announRes.status === 'fulfilled') setAnnouncements(announRes.value.data ?? [])
      if (practiceRes.status === 'fulfilled') setPracticeObs(practiceRes.value.data ?? [])
      if (testsRes.status === 'fulfilled')    setLabTests(testsRes.value.data ?? [])
      if (subsRes.status === 'fulfilled')    setLabSubmissions(subsRes.value.data ?? [])
    } catch {
      setError('Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = async (e) => {
    e.preventDefault()
    if (!classCode.trim()) return
    setJoining(true)
    try {
      await classroomService.join({
        studentId: user.id,
        classCode: classCode.trim()
      })
      toast.success('Successfully joined the classroom! 🏫')
      setClassCode('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to join classroom. Check the code.')
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveClass = async () => {
    if (!window.confirm('Are you sure you want to leave this classroom? You will lose access to all its assignments.')) return
    try {
      await classroomService.leave()
      toast.success('Successfully left the classroom. 🏫')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to leave classroom.')
    }
  }

  useEffect(() => {
    fetchData()
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

  const avgScore = (() => {
    const graded = assignments.filter(a => a.score != null)
    if (!graded.length) return null
    return Math.round(graded.reduce((s, a) => s + a.score, 0) / graded.length)
  })()

  const pendingAssignments   = assignments.filter(a => a.status === 'PENDING')
  const submittedAssignments = assignments.filter(a => a.status === 'SUBMITTED')
  const gradedAssignments    = assignments.filter(a => a.status === 'GRADED')
  const completedCount       = submittedAssignments.length + gradedAssignments.length
  const practiceExperiments  = experiments.filter(e => !pendingAssignments.some(a => a.experiment?.id === e.id))

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? '🌅 Good Morning' : getHour() < 18 ? '☀️ Good Afternoon' : '🌙 Good Evening'

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: '130px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: '220px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn-primary" onClick={fetchData}>🔄 Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }} className="page-enter">

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{greeting}</p>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.3rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {user?.fullName ?? 'Student'}'s Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Welcome back to your school virtual laboratory.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate(ROUTES.EXPERIMENTS)}>
          🔬 Browse All Labs
        </button>
      </div>

      {/* ── Practical Examination Reminder Banner ─────────────────── */}
      <LabExamReminder tests={labTests} submissions={labSubmissions} navigate={navigate} />

      {/* ── Classroom & Announcements Grid ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {classroom ? (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏫 Classroom
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', flex: 1 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Class Name:</span> <strong style={{ color: '#3b82f6' }}>{classroom.className}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Teacher:</span> <strong style={{ color: 'var(--text-secondary)' }}>{classroom.teacher?.fullName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Code:</span> <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>{classroom.classCode}</code></div>
              
              <button
                onClick={handleLeaveClass}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.06)',
                  color: '#ef4444',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
                }}
              >
                🚪 Leave Classroom
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>🏫 Join a Class</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Join using the class code provided by your teacher to access assignments and announcements.
            </p>
            <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. CL9A4829"
                style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={joining} style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                {joining ? 'Joining...' : 'Join'}
              </button>
            </form>
          </div>
        )}

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>📢 Announcements</h3>
          {announcements.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '1.5rem' }}>
              No announcements yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ann.content}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>By {ann.teacher?.fullName}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Practice Notebook Card */}
        <div
          className="glass-card"
          onClick={() => navigate(ROUTES.STUDENT_PRACTICE_NOTEBOOK)}
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            cursor: 'pointer',
            borderLeft: '3px solid #f59e0b',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📒 Practice Notebook
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', flex: 1 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total Practice Notes:</span>{' '}
              <strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{practiceObs.length}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Last Updated:</span>{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {practiceObs.length > 0
                  ? (() => {
                      const latest = new Date(Math.max(...practiceObs.map(o => new Date(o.updatedAt).getTime())))
                      return latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    })()
                  : 'N/A'}
              </strong>
            </div>
            <div style={{ marginTop: 'auto', color: 'var(--accent-blue)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Notebook ➔
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Assigned" value={stats?.totalAssignments ?? 0} icon="📋" gradient={['#3b82f6', '#8b5cf6']} />
        <StatCard title="Completed" value={completedCount} icon="✅" gradient={['#10b981', '#06b6d4']} />
        <StatCard title="Pending" value={stats?.pendingAssignments ?? 0} icon="⏳" gradient={['#f59e0b', '#ef4444']} />
        <StatCard
          title="Avg. Score"
          value={avgScore != null ? `${avgScore}/100` : 'N/A'}
          icon="🎯"
          gradient={['#8b5cf6', '#ec4899']}
          subtitle={avgScore != null ? (avgScore >= 70 ? 'Great work!' : 'Keep going!') : 'No graded yet'}
        />
      </div>

      {/* ── Experiments Navigation Tabs ────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('ASSIGNED')}
          style={{
            padding: '0.6rem 1.2rem',
            background: activeTab === 'ASSIGNED' ? 'rgba(59,130,246,0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ASSIGNED' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'ASSIGNED' ? '#3b82f6' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          ⏳ Assigned Labs ({pendingAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab('PRACTICE')}
          style={{
            padding: '0.6rem 1.2rem',
            background: activeTab === 'PRACTICE' ? 'rgba(139,92,246,0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'PRACTICE' ? '2px solid #8b5cf6' : '2px solid transparent',
            color: activeTab === 'PRACTICE' ? '#8b5cf6' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          🔬 Practice / Available ({practiceExperiments.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          style={{
            padding: '0.6rem 1.2rem',
            background: activeTab === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'COMPLETED' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'COMPLETED' ? '#10b981' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          ✅ Completed Labs ({completedCount})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'ASSIGNED' && (
        <div style={{ marginBottom: '2rem' }}>
          {pendingAssignments.length === 0 ? (
            <div style={{
              padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px',
              background: 'rgba(16,185,129,0.03)', border: '1px dashed var(--border-glass)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
              <h3 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>No Assigned Experiments</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>All caught up! No pending lab tasks.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {pendingAssignments.map((a) => (
                <PendingCard key={a.id} assignment={a} onNavigate={(id) => id && navigate(`/experiments/${id}?assignmentId=${a.id}`)} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'PRACTICE' && (
        <div style={{ marginBottom: '2rem' }}>
          {practiceExperiments.length === 0 ? (
            <div style={{
              padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
              <h3 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>No Practice Labs</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No other experiments found in catalog.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {practiceExperiments.map((e) => (
                <PracticeCard key={e.id} experiment={e} onNavigate={(id) => id && navigate(`/experiments/${id}`)} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'COMPLETED' && (
        <div style={{ marginBottom: '2rem' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setCompletedSubTab('SUBMITTED')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: completedSubTab === 'SUBMITTED' ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border-glass)',
                background: completedSubTab === 'SUBMITTED' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                color: completedSubTab === 'SUBMITTED' ? '#3b82f6' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Submitted Reports ({submittedAssignments.length})
            </button>
            <button
              onClick={() => setCompletedSubTab('GRADED')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: completedSubTab === 'GRADED' ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-glass)',
                background: completedSubTab === 'GRADED' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                color: completedSubTab === 'GRADED' ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Graded Reports ({gradedAssignments.length})
            </button>
          </div>

          {completedSubTab === 'SUBMITTED' ? (
            submittedAssignments.length === 0 ? (
              <div style={{
                padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)',
              }}>
                <h3 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>No Submitted Reports</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>You have no reports awaiting grading.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {submittedAssignments.map((a) => (
                  <CompletedCard key={a.id} assignment={a} />
                ))}
              </div>
            )
          ) : (
            gradedAssignments.length === 0 ? (
              <div style={{
                padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)',
              }}>
                <h3 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>No Graded Reports</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your reports have not been graded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {gradedAssignments.map((a) => (
                  <CompletedCard key={a.id} assignment={a} />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ── Browse All Experiments CTA ────────────────────────── */}
      <div style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔬</div>
          <h3 style={{
            margin: '0 0 0.3rem', fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Explore Virtual Labs</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {experiments.length} experiments available across Physics, Chemistry & Biology
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate(ROUTES.EXPERIMENTS)}>
          Browse All Experiments →
        </button>
      </div>
    </div>
  )
}
