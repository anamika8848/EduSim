import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import StatCard from '../../components/ui/StatCard'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getStats()
      setStats(res.data)
    } catch (err) {
      setError('Failed to fetch platform metrics.')
      toast.error('Error loading admin statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: '130px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn-primary" onClick={fetchStats}>🔄 Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚙️</span>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>Admin Portal</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Platform monitor, statistics, and system administration overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="👥" gradient={['#3b82f6', '#8b5cf6']} subtitle="Active registrations" />
        <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon="🎓" gradient={['#06b6d4', '#10b981']} subtitle="Enrolled pupils" />
        <StatCard title="Total Teachers" value={stats?.totalTeachers ?? 0} icon="👨‍🏫" gradient={['#ec4899', '#8b5cf6']} subtitle="Staff accounts" />
        <StatCard title="Total Classrooms" value={stats?.totalClasses ?? 0} icon="🏫" gradient={['#10b981', '#06b6d4']} subtitle="Active classes" />
        <StatCard title="Total Assignments" value={stats?.totalAssignments ?? 0} icon="📋" gradient={['#f59e0b', '#ef4444']} subtitle="Assigned labs" />
        <StatCard title="Total Experiments" value={stats?.totalExperiments ?? 0} icon="🔬" gradient={['#8b5cf6', '#ec4899']} subtitle="Active simulations" />
      </div>

      {/* Admin Quick Action Description */}
      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>🛡️ Administrative Controls</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Use the navigation links in the sidebar to perform platform administrative tasks:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>Manage Users:</strong> View, create, and remove user accounts (Students, Teachers, Admins).</li>
          <li><strong>Manage Classes:</strong> View and clean up academic classrooms and active groups.</li>
          <li><strong>Assignments:</strong> Monitor all student lab assignments, report completion status, and grades across the platform.</li>
        </ul>
      </div>
    </div>
  )
}
