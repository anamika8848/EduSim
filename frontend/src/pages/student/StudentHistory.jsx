import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { assignmentService } from '../../services/assignmentService'
import { EXPERIMENT_ICONS } from '../../utils/constants'
import EmptyState from '../../components/ui/EmptyState'
import LabRecordSheet from '../../components/LabRecordSheet'
import { exportReportPDF, printReport } from '../../utils/reportExport'

function CompletedRecordCard({ record }) {
  const [expanded, setExpanded] = useState(false)
  const exp = record.experiment
  const subject = exp?.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const score = record.score

  let reportObj = null
  if (record.reportData) {
    try {
      reportObj = JSON.parse(record.reportData)
    } catch (e) {
      console.error("Failed to parse reportData:", e)
    }
  }

  if (!reportObj) {
    reportObj = {
      reportId: `EDU-LAB-2026-${String(record.id).padStart(5, '0')}`,
      date: record.completionDate ? new Date(record.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      experiment: exp?.name,
      subject: exp?.subject,
      studentName: record.student?.name || 'Student',
      rollNumber: `EDU-${record.student?.id || ''}`,
      className: record.classroom?.className || 'N/A',
      teacherName: record.teacher?.name || 'N/A',
      parameters: {},
      results: {},
      trials: [],
      observation: record.observation,
      conclusion: record.conclusion,
      notes: record.notes,
      isDraft: false,
      metadata: {
        generatedOn: record.completionDate ? new Date(record.completionDate).toLocaleString() : new Date().toLocaleString(),
        submittedOn: record.completionDate ? new Date(record.completionDate).toLocaleString() : new Date().toLocaleString(),
        generatedBy: record.student?.name || 'Student',
        reportVersion: 1
      },
      evaluation: record.remarks || record.score !== null ? {
        score: record.score,
        remarks: record.remarks,
        dateReviewed: record.completionDate ? new Date(record.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')
      } : null
    }
  }

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      borderLeft: `3px solid ${record.status === 'GRADED' ? '#10b981' : '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '1rem'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className={subjectClass} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
            {EXPERIMENT_ICONS[subject]} {subject}
          </span>
          <h3 style={{ margin: '0.4rem 0 0.2rem', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{exp?.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ✅ Completed on: {record.completionDate ? new Date(record.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
          </span>
        </div>

        {/* Score badge */}
        <div>
          {score != null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800,
                background: score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
                border: `1px solid ${score >= 70 ? 'rgba(16,185,129,0.3)' : score >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
                🎯 {score}/100
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Graded</span>
            </div>
          ) : (
            <span className="status-completed" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.75rem' }}>
              Awaiting Grading
            </span>
          )}
        </div>
      </div>

      {/* Teacher remarks */}
      {record.remarks && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(139,92,246,0.05)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '8px',
          fontSize: '0.8rem', color: 'var(--text-secondary)'
        }}>
          💬 <strong>Teacher Feedback:</strong> <span style={{ fontStyle: 'italic' }}>"{record.remarks}"</span>
        </div>
      )}

      {/* Lab Report toggle and actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Submitted Lab Report ▲' : 'View Submitted Lab Report ▼'}
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}
            onClick={() => exportReportPDF(reportObj)}
          >
            Download PDF 📥
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            onClick={() => printReport(reportObj)}
          >
            Print 🖨
          </button>
        </div>

        {expanded && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            animation: 'slide-in-up 0.2s ease-out',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <LabRecordSheet report={reportObj} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentHistory() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await assignmentService.getStudentAssignments(user.id)
      const completed = (res.data ?? []).filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED')
      setRecords(completed)
    } catch {
      toast.error('Failed to load lab history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user?.id])

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: '180px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📜</span>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>My Lab History</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Review your completed virtual experiments, reports, grades, and teacher remarks.
        </p>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="📜" title="No Lab History" description="Your completed assignments will appear here after you finish and submit reports." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {records.map(r => (
            <CompletedRecordCard key={r.id} record={r} />
          ))}
        </div>
      )}
    </div>
  )
}
