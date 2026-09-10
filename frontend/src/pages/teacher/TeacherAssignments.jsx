import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { assignmentService } from '../../services/assignmentService'
import { experimentService } from '../../services/experimentService'
import { classroomService } from '../../services/classroomService'
import Modal from '../../components/ui/Modal'
import { EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'
import LabRecordSheet from '../../components/LabRecordSheet'
import { exportReportPDF, printReport } from '../../utils/reportExport'

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const styles = {
    PENDING:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    SUBMITTED: { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
    GRADED:    { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    OVERDUE:   { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  }
  const s = styles[status] ?? styles.PENDING
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '6px',
      fontSize: '0.72rem',
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

/* ── Assignment Card ──────────────────────────────────────────── */
function AssignmentCard({ assignment, onGrade }) {
  const [expanded, setExpanded] = useState(false)
  const exp = assignment.experiment
  const subject = exp?.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const isOverdue = assignment.status === 'PENDING' && new Date(assignment.dueDate) < new Date()
  const effectiveStatus = isOverdue ? 'OVERDUE' : assignment.status
  const canGrade = assignment.status === 'SUBMITTED' || assignment.status === 'GRADED'

  const borderColors = {
    GRADED:    '#10b981',
    SUBMITTED: '#3b82f6',
    PENDING:   '#f59e0b',
    OVERDUE:   '#ef4444',
  }

  let reportObj = null
  if (assignment.reportData) {
    try {
      reportObj = JSON.parse(assignment.reportData)
    } catch(e) {
      console.error(e)
    }
  }

  if (!reportObj && (assignment.observation || assignment.result || assignment.conclusion || assignment.notes)) {
    reportObj = {
      reportId: `EDU-LAB-2026-${String(assignment.id).padStart(5, '0')}`,
      date: assignment.completionDate ? new Date(assignment.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      experiment: exp?.name,
      subject: exp?.subject,
      studentName: assignment.student?.fullName || 'Student',
      rollNumber: `EDU-${assignment.student?.id || ''}`,
      className: assignment.classroom?.className || 'N/A',
      teacherName: assignment.teacher?.name || 'N/A',
      parameters: {},
      results: {},
      trials: [],
      observation: assignment.observation,
      conclusion: assignment.conclusion,
      notes: assignment.notes,
      isDraft: false,
      metadata: {
        generatedOn: assignment.completionDate ? new Date(assignment.completionDate).toLocaleString() : new Date().toLocaleString(),
        submittedOn: assignment.completionDate ? new Date(assignment.completionDate).toLocaleString() : new Date().toLocaleString(),
        generatedBy: assignment.student?.fullName || 'Student',
        reportVersion: 1
      },
      evaluation: assignment.remarks || assignment.score !== null ? {
        score: assignment.score,
        remarks: assignment.remarks,
        dateReviewed: assignment.completionDate ? new Date(assignment.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')
      } : null
    }
  }

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderLeft: `3px solid ${borderColors[effectiveStatus] ?? '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      transition: 'all 0.25s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          {/* Student Avatar */}
          <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '0.9rem', flexShrink: 0 }}>
            {assignment.student?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {assignment.student?.fullName || 'Student'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assignment.student?.email}</div>
          </div>
        </div>
        <StatusBadge status={effectiveStatus} />
      </div>

      {/* Experiment info */}
      <div style={{
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px',
        border: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className={subjectClass}>{EXPERIMENT_ICONS[subject]} {subject}</span>
          {exp?.difficulty && (
            <span className={`badge-${exp.difficulty.toLowerCase()}`}>{exp.difficulty}</span>
          )}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {exp?.name ?? 'Experiment'}
        </div>
        {expanded && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>{exp?.description}</div>
            {assignment.classroom && (
              <div style={{ marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                🏫 Class: <span style={{ fontWeight: 'bold' }}>{assignment.classroom.className}</span>
              </div>
            )}
            {reportObj && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.6rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.2rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.8rem' }}>
                    📄 Submitted Lab Report
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        exportReportPDF(reportObj)
                      }}
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                    >
                      Download PDF 📥
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        printReport(reportObj)
                      }}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                    >
                      Print 🖨
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <LabRecordSheet report={reportObj} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Due Date + Score row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
          📅 Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
          {isOverdue && ' ⚠️'}
        </span>
        {assignment.score != null && (
          <span style={{
            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
            background: assignment.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: assignment.score >= 70 ? '#10b981' : '#f59e0b',
            border: `1px solid ${assignment.score >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            🎯 {assignment.score}/100
          </span>
        )}
      </div>

      {/* Completion date */}
      {assignment.completionDate && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          ✅ Completed: {new Date(assignment.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}

      {/* Remarks */}
      {assignment.remarks && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(139,92,246,0.06)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '8px',
          fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic',
        }}>
          💬 {assignment.remarks}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        {canGrade && (
          <button
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.55rem' }}
            onClick={() => onGrade(assignment)}
          >
            📝 {assignment.score != null ? 'Re-grade' : 'Grade'}
          </button>
        )}
        <button
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.55rem 0.875rem' }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less ▲' : 'More ▼'}
        </button>
      </div>
    </div>
  )
}

/* ── Create Assignment Modal ──────────────────────────────────── */
function CreateAssignmentModal({ isOpen, onClose, onCreated, experiments, classrooms }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ classroomId: '', experimentId: '', dueDate: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      teacherId: user.id,
      experimentId: parseInt(form.experimentId),
      dueDate: form.dueDate,
      classroomId: parseInt(form.classroomId)
    }

    if (!payload.classroomId) {
      setError('Classroom is required.')
      return
    }

    if (!payload.experimentId || !payload.dueDate) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      await assignmentService.create(payload)
      toast.success('Assignment created successfully for classroom! 🎉')
      setForm({ classroomId: '', experimentId: '', dueDate: '' })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create assignment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Create New Assignment" size="md">
      {error && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#ef4444', fontSize: '0.85rem',
        }}>⚠️ {error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Classroom Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            🏫 Select Classroom
          </label>
          <select
            className="input-field"
            value={form.classroomId}
            onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
            required
          >
            <option value="">-- Choose a class --</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.className} ({c.classCode})</option>
            ))}
          </select>
        </div>

        {/* Experiment */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            🔬 Select Experiment
          </label>
          <select
            className="input-field"
            value={form.experimentId}
            onChange={(e) => setForm({ ...form, experimentId: e.target.value })}
            required
          >
            <option value="">-- Choose an experiment --</option>
            {experiments.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {EXPERIMENT_ICONS[ex.subject] ?? '🔬'} {ex.name} [{ex.subject}]
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            📅 Due Date
          </label>
          <input
            type="date"
            className="input-field"
            value={form.dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? '⏳ Creating...' : '✅ Create Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Grade Modal ──────────────────────────────────────────────── */
function GradeModal({ isOpen, onClose, assignment, onGraded }) {
  const [score, setScore]     = useState(assignment?.score ?? 0)
  const [remarks, setRemarks] = useState(assignment?.remarks ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assignment) {
      setScore(assignment.score ?? 0)
      setRemarks(assignment.remarks ?? '')
    }
  }, [assignment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await assignmentService.grade(assignment.id, { score: parseInt(score), remarks })
      toast.success('Assignment graded successfully! ✅')
      onGraded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to grade assignment.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  let reportObj = null
  if (assignment && assignment.reportData) {
    try {
      reportObj = JSON.parse(assignment.reportData)
    } catch (e) {
      console.error("Failed to parse reportData:", e)
    }
  }

  if (!reportObj && assignment && (assignment.observation || assignment.result || assignment.conclusion || assignment.notes)) {
    reportObj = {
      reportId: `EDU-LAB-2026-${String(assignment.id).padStart(5, '0')}`,
      date: assignment.completionDate ? new Date(assignment.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      experiment: assignment.experiment?.name,
      subject: assignment.experiment?.subject,
      studentName: assignment.student?.fullName || 'Student',
      rollNumber: `EDU-${assignment.student?.id || ''}`,
      className: assignment.classroom?.className || 'N/A',
      teacherName: assignment.teacher?.name || 'N/A',
      parameters: {},
      results: {},
      trials: [],
      observation: assignment.observation,
      conclusion: assignment.conclusion,
      notes: assignment.notes,
      isDraft: false,
      metadata: {
        generatedOn: assignment.completionDate ? new Date(assignment.completionDate).toLocaleString() : new Date().toLocaleString(),
        submittedOn: assignment.completionDate ? new Date(assignment.completionDate).toLocaleString() : new Date().toLocaleString(),
        generatedBy: assignment.student?.fullName || 'Student',
        reportVersion: 1
      },
      evaluation: assignment.remarks || assignment.score !== null ? {
        score: assignment.score,
        remarks: assignment.remarks,
        dateReviewed: assignment.completionDate ? new Date(assignment.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')
      } : null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Grade Assignment" size="md">
      {assignment && (
        <div>
          {/* Assignment summary */}
          <div style={{
            padding: '0.875rem', borderRadius: '10px', marginBottom: '1.5rem',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              👤 {assignment.student?.fullName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🔬 {assignment.experiment?.name}
            </div>
            {assignment.classroom && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                🏫 Class: {assignment.classroom.className}
              </div>
            )}
          </div>

          {/* Lab Report Display */}
          {reportObj && (
            <div style={{
              padding: '0.875rem', borderRadius: '10px', marginBottom: '1.5rem',
              background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)',
              fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16,185,129,0.15)', paddingBottom: '0.3rem', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                  📄 Submitted Lab Report
                </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => exportReportPDF(reportObj)}
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                    >
                      Download PDF 📥
                    </button>
                    <button
                      type="button"
                      onClick={() => printReport(reportObj)}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                    >
                      Print 🖨
                    </button>
                  </div>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <LabRecordSheet report={reportObj} />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Score
                </label>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '999px',
                  background: `${scoreColor}20`, color: scoreColor,
                  border: `1px solid ${scoreColor}40`,
                  fontSize: '1.1rem', fontWeight: 800,
                }}>
                  {score} / 100
                </span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>0</span>
                <span style={{ color: '#f59e0b' }}>50</span>
                <span style={{ color: '#10b981' }}>100</span>
              </div>
              {/* Number input alternative */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Or type:</label>
                <input
                  type="number" min={0} max={100}
                  className="input-field"
                  style={{ width: '90px', padding: '0.4rem 0.75rem', textAlign: 'center' }}
                  value={score}
                  onChange={(e) => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                💬 Remarks (Optional)
              </label>
              <textarea
                className="input-field"
                placeholder="Provide feedback to the student..."
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? '⏳ Saving...' : '✅ Submit Grade'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function TeacherAssignments() {
  const { user } = useAuth()

  const [assignments, setAssignments] = useState([])
  const [experiments, setExperiments] = useState([])
  const [classrooms,  setClassrooms]  = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('ALL')
  const [showCreate, setShowCreate]   = useState(false)
  const [gradeTarget, setGradeTarget] = useState(null)

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [assignRes, expRes, classRes] = await Promise.allSettled([
        assignmentService.getTeacherAssignments(user.id),
        experimentService.getAll(),
        classroomService.getTeacherClasses(user.id),
      ])
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data ?? [])
      if (expRes.status === 'fulfilled')    setExperiments(expRes.value.data ?? [])
      if (classRes.status === 'fulfilled')  setClassrooms(classRes.value.data ?? [])
    } catch {
      toast.error('Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.id])

  /* ── Filtered list ──────────────────────────────────────────── */
  const filtered = assignments.filter((a) => {
    const isOverdue = a.status === 'PENDING' && new Date(a.dueDate) < new Date()
    const effectiveStatus = isOverdue ? 'OVERDUE' : a.status
    if (filter === 'ALL') return true
    return effectiveStatus === filter
  })

  const tabs = [
    { key: 'ALL',       label: 'All', count: assignments.length },
    { key: 'PENDING',   label: 'Pending',   count: assignments.filter(a => a.status === 'PENDING' && new Date(a.dueDate) >= new Date()).length },
    { key: 'SUBMITTED', label: 'Submitted', count: assignments.filter(a => a.status === 'SUBMITTED').length },
    { key: 'GRADED',    label: 'Graded',    count: assignments.filter(a => a.status === 'GRADED').length },
    { key: 'OVERDUE',   label: 'Overdue',   count: assignments.filter(a => a.status === 'PENDING' && new Date(a.dueDate) < new Date()).length },
  ]

  /* ── Loading ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: '220px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }} className="page-enter">

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchData() }}
        experiments={experiments}
        classrooms={classrooms}
      />
      <GradeModal
        isOpen={!!gradeTarget}
        onClose={() => setGradeTarget(null)}
        assignment={gradeTarget}
        onGraded={() => { setGradeTarget(null); fetchData() }}
      />

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.3rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>📋 Assignment Management</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage, track, and grade student experiments
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          ➕ Create Assignment
        </button>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '999px',
              border: filter === tab.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid var(--border-glass)',
              background: filter === tab.key ? 'rgba(59,130,246,0.15)' : 'rgba(15,22,45,0.5)',
              color: filter === tab.key ? '#3b82f6' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.2s',
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

      {/* Count */}
      <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Showing {filtered.length} {filter !== 'ALL' ? filter.toLowerCase() : ''} assignment{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* ── Cards Grid ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center',
          borderRadius: '16px', border: '1px dashed var(--border-glass)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No Assignments Found</h3>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {filter === 'ALL' ? "Create your first assignment to get started!" : `No ${filter.toLowerCase()} assignments.`}
          </p>
          {filter === 'ALL' && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>➕ Create Assignment</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onGrade={setGradeTarget} />
          ))}
        </div>
      )}
    </div>
  )
}
