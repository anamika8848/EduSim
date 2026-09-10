import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/userService'
import { assignmentService } from '../../services/assignmentService'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import EmptyState from '../../components/ui/EmptyState'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4']

function Students() {
  const { user }                  = useAuth()
  const [students, setStudents]   = useState([])
  const [assignments, setAssign]  = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('name')

  useEffect(() => {
    Promise.allSettled([
      userService.getStudents(),
      user?.id ? assignmentService.getTeacherAssignments(user.id) : Promise.resolve({ data: [] }),
    ])
      .then(([sRes, aRes]) => {
        setStudents(sRes.status === 'fulfilled' ? (sRes.value.data ?? []) : [])
        setAssign(aRes.status === 'fulfilled'   ? (aRes.value.data ?? []) : [])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  const getStudentStats = (studentId) => {
    const studentAssign = assignments.filter(a => a.student?.id === studentId)
    const completed = studentAssign.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED').length
    const total     = studentAssign.length
    const scores    = studentAssign.filter(a => a.score != null).map(a => a.score)
    const avg       = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null
    return { total, completed, avg, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const filtered = students
    .filter(s =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '')
      const sa = getStudentStats(a.id), sb = getStudentStats(b.id)
      if (sortBy === 'progress') return sb.pct - sa.pct
      if (sortBy === 'score') return (sb.avg || 0) - (sa.avg || 0)
      return 0
    })

  const totalStudents = students.length
  const avgCompletion = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + getStudentStats(s.id).pct, 0) / students.length)
    : 0

  if (loading) return <LoadingSkeleton variant="list" count={6} />

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter,sans-serif', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Students Overview
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>{totalStudents} registered students across all labs</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Total Students', value: totalStudents, color: '#3b82f6' },
          { icon: '✅', label: 'Avg Completion', value: `${avgCompletion}%`, color: '#10b981' },
          { icon: '📋', label: 'Total Assignments', value: assignments.length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ padding: '20px', borderRadius: 12, background: `${s.color}10`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search students…"
          style={{ flex: '1 1 260px', padding: '9px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', maxWidth: 360 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[['name','A–Z'],['progress','Progress'],['score','Score']].map(([val,label]) => (
            <button key={val} onClick={() => setSortBy(val)} style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: sortBy === val ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sortBy === val ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`, color: sortBy === val ? '#93c5fd' : '#64748b', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Student cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No students found" description={search ? 'Try a different search term.' : 'No students are registered yet.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
          {filtered.map((s, idx) => {
            const stats = getStudentStats(s.id)
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
            return (
              <div key={s.id} style={{ padding: '20px', borderRadius: 14, background: 'rgba(15,22,45,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${avatarColor}25`, border: `2px solid ${avatarColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: avatarColor, flexShrink: 0 }}>
                    {getInitials(s.fullName)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.fullName}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: stats.pct >= 70 ? '#10b981' : stats.pct >= 40 ? '#f59e0b' : '#ef4444' }}>{stats.pct}%</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Complete</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: `${stats.pct}%`, height: '100%', background: `linear-gradient(90deg, ${avatarColor}, ${avatarColor}99)`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>

                {/* Mini stats */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { label: 'Assigned', value: stats.total, color: '#3b82f6' },
                    { label: 'Done',     value: stats.completed, color: '#10b981' },
                    { label: 'Avg Score', value: stats.avg != null ? `${stats.avg}%` : '—', color: '#8b5cf6' },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, padding: '8px 6px', borderRadius: 8, background: `${m.color}08`, border: `1px solid ${m.color}20`, textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Students
