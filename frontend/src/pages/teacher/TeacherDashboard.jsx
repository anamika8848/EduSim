import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { assignmentService } from '../../services/assignmentService'
import { classroomService } from '../../services/classroomService'
import StatCard from '../../components/ui/StatCard'
import { ROUTES } from '../../utils/constants'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]             = useState(null)
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const [statsRes, assignRes, classesRes] = await Promise.allSettled([
        assignmentService.getTeacherStats(user.id),
        assignmentService.getTeacherAssignments(user.id),
        classroomService.getTeacherClasses(user.id),
      ])

      if (statsRes.status === 'fulfilled')   setStats(statsRes.value.data)
      if (assignRes.status === 'fulfilled')  setAssignments(assignRes.value.data ?? [])
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.data ?? [])
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
      toast.error('Error loading dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.id])

  const studentCount = classes.reduce((sum, c) => sum + (c.students?.length ?? 0), 0)

  const recentSubmissions = assignments
    .filter(a => a.status === 'SUBMITTED')
    .slice(0, 5)

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '130px', borderRadius: '16px' }} className="skeleton" />
          ))}
        </div>
        <div style={{ height: '300px', borderRadius: '16px' }} className="skeleton" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏫</span>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 900, margin: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Teacher Dashboard</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Welcome back, <strong style={{ color: 'var(--text-secondary)' }}>{user?.fullName}</strong>! Manage your classroom activities here.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Classes" value={classes.length} icon="🏫" gradient={['#3b82f6', '#8b5cf6']} />
        <StatCard title="Total Students" value={studentCount} icon="🎓" gradient={['#06b6d4', '#10b981']} />
        <StatCard title="Total Assignments" value={stats?.totalAssignments ?? 0} icon="📋" gradient={['#8b5cf6', '#ec4899']} />
        <StatCard title="Submitted Reports" value={stats?.submittedAssignments ?? 0} icon="📤" gradient={['#f59e0b', '#ef4444']} />
        <StatCard title="Graded Reports" value={stats?.gradedAssignments ?? 0} icon="✅" gradient={['#10b981', '#06b6d4']} />
      </div>

      {/* ── Quick Actions Grid ───────────────────────────────── */}
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>⚡ Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.8rem' }}>🏫</div>
          <h4 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Create Classroom</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Create a new classroom and generate a code for your students to join.</p>
          <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate(ROUTES.TEACHER_CLASSROOMS)}>Create Class</button>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.8rem' }}>📋</div>
          <h4 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Assign Experiment</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Create homework tasks by assigning virtual science experiments to your classrooms.</p>
          <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENTS)}>Assign Lab</button>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.8rem' }}>📢</div>
          <h4 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Post Announcement</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Share quick announcements, instructions, or exam dates with your classes.</p>
          <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate(ROUTES.TEACHER_CLASSROOMS)}>Post Announcement</button>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.8rem' }}>📝</div>
          <h4 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Grade Reports</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Review observations, conclusions, and notes submitted by students, and enter grades.</p>
          <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENTS)}>View Reports</button>
        </div>
      </div>

      {/* ── Submissions Awaiting Grading ──────────────────────── */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            📤 Submissions Awaiting Grading
          </h3>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            onClick={() => navigate(ROUTES.TEACHER_ASSIGNMENTS)}
          >
            View All Reports →
          </button>
        </div>

        {recentSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🎉 All submitted reports are graded! Good job!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {recentSubmissions.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                    {a.student?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{a.student?.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.classroom?.className}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🔬 {a.experiment?.name}
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '0.4rem', fontSize: '0.78rem', marginTop: '0.4rem' }}
                  onClick={() => navigate(`${ROUTES.TEACHER_ASSIGNMENTS}`)}
                >
                  Grade Report 📝
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
