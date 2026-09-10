import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { assignmentService } from '../services/assignmentService'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
}

const ROLE_COLOR = {
  TEACHER: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  STUDENT: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  ADMIN:   { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
}

const glass = {
  background: 'rgba(15,22,45,0.8)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '24px',
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.fullName || '')
  const roleStyle = ROLE_COLOR[user?.role] || ROLE_COLOR.STUDENT

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    const svc = user.role === 'TEACHER' ? assignmentService.getTeacherStats : assignmentService.getStudentStats
    svc(user.id)
      .then(res => {
        const d = res.data || {}
        setStats({
          totalAssignments:     d.totalAssignments     || 0,
          completedAssignments: d.completedAssignments || 0,
          pendingAssignments:   d.pendingAssignments   || 0,
          avgScore:             d.avgScore             || 0,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div style={{ padding: '28px 24px', maxWidth: 800, margin: '0 auto', fontFamily: 'Inter,sans-serif', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Manage your account and review performance stats</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Identity card */}
        <div style={glass}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 0 40px rgba(59,130,246,0.4)',
              border: '3px solid rgba(59,130,246,0.3)',
            }}>
              {getInitials(user?.fullName)}
            </div>

            {editing ? (
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 8, color: '#e2e8f0', fontSize: 14, textAlign: 'center', outline: 'none', width: '100%' }}
              />
            ) : (
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e2e8f0', textAlign: 'center' }}>{user?.fullName || 'User'}</div>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
              {user?.role || 'USER'}
            </span>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📧', label: 'Email', value: user?.email || '—' },
                { icon: '🆔', label: 'User ID', value: user?.id || '—' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '1rem', width: 24 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, marginTop: 1 }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer', background: editing ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${editing ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, color: editing ? '#10b981' : '#94a3b8', fontSize: 13, fontWeight: 600 }}
              >
                {editing ? '✓ Save' : '✏️ Edit Name'}
              </button>
              <button onClick={logout} style={{ flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={glass}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>📊 Performance Stats</div>
          {loading ? (
            <div style={{ color: '#64748b', fontSize: 13 }}>Loading stats…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total Assigned', value: stats.totalAssignments, color: '#3b82f6', icon: '📋' },
                { label: 'Completed',      value: stats.completedAssignments, color: '#10b981', icon: '✅' },
                { label: 'Pending',        value: stats.pendingAssignments, color: '#f59e0b', icon: '⏳' },
                { label: 'Avg Score',      value: stats.avgScore ? `${stats.avgScore.toFixed(1)}%` : 'N/A', color: '#8b5cf6', icon: '⭐' },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px', borderRadius: 10, background: `${s.color}10`, border: `1px solid ${s.color}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, margin: '4px 0 2px' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
