import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import EmptyState from '../../components/ui/EmptyState'

function StatusBadge({ status }) {
  const styles = {
    PENDING:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    SUBMITTED: { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
    GRADED:    { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  }
  const s = styles[status] ?? styles.PENDING
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      background: s.bg,
      color: s.color,
      border: s.border,
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  )
}

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAssignments()
      setAssignments(res.data ?? [])
    } catch {
      toast.error('Failed to load assignments list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const filtered = assignments.filter(a => {
    const isOverdue = a.status === 'PENDING' && new Date(a.dueDate) < new Date()
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter || (statusFilter === 'OVERDUE' && isOverdue)
    
    const searchLower = search.toLowerCase()
    const matchSearch = !search ||
      a.student?.fullName?.toLowerCase().includes(searchLower) ||
      a.student?.email?.toLowerCase().includes(searchLower) ||
      a.teacher?.fullName?.toLowerCase().includes(searchLower) ||
      a.experiment?.name?.toLowerCase().includes(searchLower) ||
      a.classroom?.className?.toLowerCase().includes(searchLower)
      
    return matchStatus && matchSearch
  })

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>All Assignments</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Monitor and track all student assignments, lab report completions, and scores across the platform.
        </p>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="🔍 Search student, teacher, experiment..."
          className="input-field"
          style={{ maxWidth: '340px', flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
          {['ALL', 'PENDING', 'SUBMITTED', 'GRADED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: statusFilter === status ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: statusFilter === status ? 'var(--accent-blue)' : 'var(--text-muted)'
              }}
            >
              {status === 'ALL' ? 'All Statuses' : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>
          <div style={{ height: '45px', borderRadius: '8px', marginBottom: '1rem' }} className="skeleton" />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '55px', borderRadius: '8px', marginBottom: '0.75rem' }} className="skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No Assignments Found" description={search ? "No assignments match your search query." : "No assignments have been created on the platform yet."} />
      ) : (
        <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Student</th>
                <th style={{ padding: '12px 16px' }}>Classroom</th>
                <th style={{ padding: '12px 16px' }}>Teacher</th>
                <th style={{ padding: '12px 16px' }}>Experiment</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Score</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
                <th style={{ padding: '12px 16px' }}>Completion Date</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.85rem' }}>
              {filtered.map((a) => {
                const isOverdue = a.status === 'PENDING' && new Date(a.dueDate) < new Date()
                const status = isOverdue ? 'OVERDUE' : a.status
                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.2s',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>#{a.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{a.student?.fullName || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{a.student?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#fff' }}>
                      {a.classroom?.className ? (
                        <>
                          <span style={{ fontWeight: 600 }}>{a.classroom.className}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Code: {a.classroom.classCode}</span>
                        </>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>{a.teacher?.fullName || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{a.teacher?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {a.experiment?.name}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {a.score != null ? (
                        <strong style={{
                          color: a.score >= 70 ? '#10b981' : a.score >= 50 ? '#f59e0b' : '#ef4444',
                          fontWeight: 700
                        }}>
                          🎯 {a.score}/100
                        </strong>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {a.completionDate ? new Date(a.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
