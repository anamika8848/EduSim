import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { labTestSubmissionService } from '../../services/labTestSubmissionService'
import { ROUTES } from '../../utils/constants'
import { exportReportPDF } from '../../utils/reportExport'

export default function StudentTestResult() {
  const { id } = useParams() // This is the LabTestSubmission ID
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      labTestSubmissionService.getById(id)
        .then(res => setSubmission(res.data))
        .catch(() => {
          toast.error('Failed to load practical examination result.')
          navigate(ROUTES.STUDENT_TESTS)
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a', color: '#10b981', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>⚗️</div>
        <div style={{ fontSize: 18 }}>Loading Results Roster…</div>
      </div>
    )
  }

  if (!submission) return null

  const test = submission.labTest
  const totalPrac = submission.observationMarks + submission.calculationMarks + submission.conclusionMarks
  const finalTotal = submission.totalMarks
  const isPassed = finalTotal >= test.passingMarks

  const handleDownloadPDF = () => {
    const reportObj = {
      reportId: `EDU-EXAM-${String(submission.id).padStart(5, '0')}`,
      date: new Date(submission.completionTime).toLocaleDateString('en-IN'),
      experiment: test.experiment?.name,
      subject: test.experiment?.subject,
      studentName: submission.student?.fullName || 'Student',
      rollNumber: `ROLL-${submission.student?.id || ''}`,
      className: test.classroom?.className || 'N/A',
      teacherName: test.teacher?.fullName || 'N/A',
      parameters: {},
      results: {},
      trials: [],
      observation: submission.observation,
      conclusion: submission.conclusion,
      notes: `Calculations: ${submission.calculations || 'N/A'}\nResult: ${submission.result || 'N/A'}`,
      isDraft: false,
      metadata: {
        generatedOn: new Date(submission.completionTime).toLocaleString(),
        submittedOn: new Date(submission.completionTime).toLocaleString(),
        generatedBy: submission.student?.fullName || 'Student',
        reportVersion: 1
      },
      evaluation: {
        score: submission.totalMarks,
        remarks: `[Observation: ${submission.observationMarks}, Calc: ${submission.calculationMarks}, Concl: ${submission.conclusionMarks}, Viva: ${submission.vivaMarks}] Grade: ${submission.grade}. Remarks: ${submission.teacherRemarks || 'N/A'}`,
        dateReviewed: new Date().toLocaleDateString('en-IN')
      }
    }
    exportReportPDF(reportObj)
  }

  return (
    <div style={{ padding: '2rem 1.5rem', background: '#0a0e1a', minHeight: '100vh', color: '#cbd5e1', fontFamily: 'Inter,sans-serif' }}>
      
      {/* Back to history link */}
      <div style={{ maxWidth: '700px', margin: '0 auto 1.5rem' }}>
        <button onClick={() => navigate(ROUTES.STUDENT_TESTS)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Laboratory Examination
        </button>
      </div>

      {/* Graded Card printable wrapper */}
      <div className="glass-card" style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '2.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        background: '#151c2c',
        position: 'relative',
        fontFamily: "'Courier New', Courier, monospace"
      }}>
        
        {/* Certificate Watermark Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px double rgba(16,185,129,0.3)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#10b981', fontWeight: 800 }}>EDUSIM VIRTUAL LABORATORY</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '3px' }}>
            Practical Examination Transcript
          </p>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.82rem'
        }}>
          <div><strong>Student Name:</strong> {submission.student?.fullName}</div>
          <div><strong>Classroom:</strong> {test.classroom?.className}</div>
          <div><strong>Examination:</strong> {test.testName}</div>
          <div><strong>Experiment:</strong> {test.experiment?.name}</div>
          <div><strong>Attempt Date:</strong> {new Date(submission.completionTime).toLocaleDateString('en-IN')}</div>
          <div><strong>Subject Name:</strong> {test.experiment?.subject}</div>
        </div>

        {/* Detailed Marksheet */}
        <div style={{
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.85rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#10b981', textTransform: 'uppercase', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '4px' }}>
            EXAMINATION SCORE DECOMPOSITION
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Observations Marks:</span>
            <strong>{submission.observationMarks} / {test.practicalMarks * 0.4}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Calculations Marks:</span>
            <strong>{submission.calculationMarks} / {test.practicalMarks * 0.4}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Conclusion Marks:</span>
            <strong>{submission.conclusionMarks} / {test.practicalMarks * 0.2}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Descriptive Viva Marks:</span>
            <strong>{submission.vivaMarks} / {test.vivaMarks}</strong>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
            <span>Aggregate Score:</span>
            <span style={{ color: '#10b981' }}>{finalTotal} / {test.totalMarks}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
            <span>Grade Awarded:</span>
            <span style={{ color: '#3b82f6' }}>{submission.grade}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
            <span>Examination Status:</span>
            <span style={{ color: isPassed ? '#10b981' : '#ef4444' }}>
              {isPassed ? 'PASS' : 'FAIL'} (Passing limit: {test.passingMarks})
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Security Warning Logs:</span>
            <span>{submission.warningsCount} warning(s) accumulated</span>
          </div>
        </div>

        {/* Written Answers Preview details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', borderBottom: '1px solid rgba(59,130,246,0.2)', paddingBottom: '4px' }}>
            SUBMITTED EXPERIMENTAL REPORT
          </h4>
          <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <strong style={{ color: '#fff' }}>I. Observations:</strong>
              <div style={{ marginTop: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', whiteSpace: 'pre-wrap' }}>
                {submission.observation}
              </div>
            </div>
            <div>
              <strong style={{ color: '#fff' }}>II. Calculations:</strong>
              <div style={{ marginTop: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', whiteSpace: 'pre-wrap' }}>
                {submission.calculations}
              </div>
            </div>
            <div>
              <strong style={{ color: '#fff' }}>III. Results & Conclusion:</strong>
              <div style={{ marginTop: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', whiteSpace: 'pre-wrap' }}>
                Result: {submission.result}
                {'\n'}
                Conclusion: {submission.conclusion}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Feedback */}
        {submission.teacherRemarks && (
          <div style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            fontSize: '0.8rem',
            color: '#94a3b8',
            lineHeight: 1.4,
            marginBottom: '1rem'
          }}>
            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>👨‍🏫 Evaluator Feedback Remarks:</strong>
            "{submission.teacherRemarks}"
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
          <button className="btn-secondary" style={{ flex: 1, fontFamily: 'monospace' }} onClick={handleDownloadPDF}>
            Download PDF Transcript 📄
          </button>
          <button className="btn-primary" style={{ flex: 1, fontFamily: 'monospace' }} onClick={() => navigate(ROUTES.STUDENT_TESTS)}>
            Return to Examination list
          </button>
        </div>

      </div>

    </div>
  )
}
