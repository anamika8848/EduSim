import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { assignmentService } from '../../services/assignmentService'
import Modal from '../../components/ui/Modal'
import { ROUTES, EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    PENDING:   'status-pending',
    SUBMITTED: 'status-completed',
    GRADED:    'status-completed',
    OVERDUE:   'status-overdue',
  }
  return <span className={map[status] ?? 'status-pending'}>{status}</span>
}

/* ── Assignment Card ──────────────────────────────────────────── */
function AssignmentCard({ assignment, onMarkDone }) {
  const navigate = useNavigate()
  const exp     = assignment.experiment
  const subject = exp?.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const isOverdue  = assignment.status === 'PENDING' && new Date(assignment.dueDate) < new Date()
  const effectiveStatus = isOverdue ? 'OVERDUE' : assignment.status
  const isPending = assignment.status === 'PENDING'

  const borderColor = {
    PENDING:   isOverdue ? '#ef4444' : '#f59e0b',
    SUBMITTED: '#10b981',
    GRADED:    '#10b981',
    OVERDUE:   '#ef4444',
  }[effectiveStatus] ?? '#3b82f6'

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderTop: `3px solid ${borderColor}`,
      display: 'flex', flexDirection: 'column', gap: '0.875rem',
    }}>
      {/* Subject + Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={subjectClass}>{EXPERIMENT_ICONS[subject]} {subject}</span>
        <StatusBadge status={effectiveStatus} />
      </div>

      {/* Experiment name */}
      <div>
        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {exp?.name ?? 'Experiment'}
        </h4>
        <p style={{
          margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{exp?.description}</p>
      </div>

      {/* Teacher + Due Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem' }}>👨‍🏫</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Assigned by: <strong style={{ color: 'var(--text-secondary)' }}>{assignment.teacher?.fullName ?? 'Teacher'}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem' }}>📅</span>
          <span style={{
            fontSize: '0.78rem',
            color: isOverdue ? '#ef4444' : 'var(--text-muted)',
            fontWeight: isOverdue ? 700 : 400,
          }}>
            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            {isOverdue && ' ⚠️ Overdue'}
          </span>
        </div>
      </div>

      {/* Score + Completion (if done) */}
      {(assignment.status === 'SUBMITTED' || assignment.status === 'GRADED') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {assignment.completionDate && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ✅ Completed: {new Date(assignment.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {assignment.score != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Score:</span>
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                background: assignment.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: assignment.score >= 70 ? '#10b981' : '#f59e0b',
                border: `1px solid ${assignment.score >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>🎯 {assignment.score}/100</span>
            </div>
          )}
          {assignment.remarks && (
            <div style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '8px',
              fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic',
            }}>
              💬 "{assignment.remarks}"
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
        {exp?.id && (
          <button
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.55rem' }}
            onClick={() => navigate(`/experiments/${exp.id}?assignmentId=${assignment.id}`)}
          >
            🧪 Open Lab
          </button>
        )}
        {isPending && (
          <button
            className="btn-secondary"
            style={{
              fontSize: '0.8rem', padding: '0.55rem 0.875rem',
              borderColor: 'rgba(16,185,129,0.35)', color: '#10b981',
              background: 'rgba(16,185,129,0.08)',
            }}
            onClick={() => onMarkDone(assignment)}
          >
            ✅ Mark Done
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Submit Lab Report Modal ──────────────────────────────────── */
function SubmitReportModal({ isOpen, onClose, assignment, onSubmitted }) {
  const [form, setForm] = useState({ observation: '', result: '', conclusion: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await assignmentService.complete(assignment.id, form)
      toast.success('Lab Report submitted successfully! 🎉')
      setForm({ observation: '', result: '', conclusion: '', notes: '' })
      onSubmitted()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to submit lab report.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Submit Lab Report" size="md">
      {assignment && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
            fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            🔬 Experiment: <strong style={{ color: 'var(--text-primary)' }}>{assignment.experiment?.name}</strong>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Observation
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="What did you observe during the simulation?"
              value={form.observation}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Result
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="What was the result of your measurements/data?"
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Conclusion
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="What is your conclusion from this experiment?"
              value={form.conclusion}
              onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Experiment Notes (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Add any additional findings or notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? '⏳ Submitting...' : '✅ Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function StudentAssignments() {
  const { user } = useAuth()

  const [assignments, setAssignments]   = useState([])
  const [reportTarget, setReportTarget] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('ALL')

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await assignmentService.getStudentAssignments(user.id)
      setAssignments(res.data ?? [])
    } catch {
      toast.error('Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.id])

  /* ── Derived ────────────────────────────────────────────────── */
  const total     = assignments.length
  const completed = assignments.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED').length
  const percent   = total ? Math.round((completed / total) * 100) : 0

  const filtered = assignments.filter((a) => {
    const isOverdue = a.status === 'PENDING' && new Date(a.dueDate) < new Date()
    if (filter === 'PENDING')   return a.status === 'PENDING' && !isOverdue
    if (filter === 'COMPLETED') return a.status === 'SUBMITTED' || a.status === 'GRADED'
    if (filter === 'OVERDUE')   return isOverdue
    return true
  })

  const tabs = [
    { key: 'ALL',       label: 'All',        count: total },
    { key: 'PENDING',   label: 'Pending',    count: assignments.filter(a => a.status === 'PENDING' && new Date(a.dueDate) >= new Date()).length },
    { key: 'COMPLETED', label: 'Completed',  count: completed },
    { key: 'OVERDUE',   label: 'Overdue',    count: assignments.filter(a => a.status === 'PENDING' && new Date(a.dueDate) < new Date()).length },
  ]

  /* ── Loading ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ height: '60px', borderRadius: '12px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: '260px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }} className="page-enter">

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.3rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>📋 My Assignments</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Track your experiment progress and lab assignments
        </p>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────── */}
      {total > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Overall Progress
              </span>
              <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {completed} / {total} experiments completed
              </span>
            </div>
            <span style={{
              fontSize: '1.1rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{percent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${percent}%`, borderRadius: '999px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: '999px',
              border: filter === tab.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid var(--border-glass)',
              background: filter === tab.key ? 'rgba(59,130,246,0.15)' : 'rgba(15,22,45,0.5)',
              color: filter === tab.key ? '#3b82f6' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {tab.label}
            <span style={{
              padding: '0.1rem 0.45rem', borderRadius: '999px', fontSize: '0.7rem',
              background: filter === tab.key ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
              color: filter === tab.key ? '#3b82f6' : 'var(--text-muted)',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Cards Grid ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center',
          borderRadius: '16px', border: '1px dashed var(--border-glass)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {total === 0 ? '📭' : '🎉'}
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            {total === 0 ? 'No Assignments Yet' : `No ${filter.toLowerCase()} assignments`}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {total === 0
              ? 'Your teacher will assign experiments for you. Stay tuned!'
              : filter === 'COMPLETED'
              ? 'Complete some experiments to see them here.'
              : 'Great work! Nothing in this category.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onMarkDone={setReportTarget} />
          ))}
        </div>
      )}

      {/* Report Modal */}
      <SubmitReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        assignment={reportTarget}
        onSubmitted={() => { setReportTarget(null); fetchData() }}
      />
    </div>
  )
}
