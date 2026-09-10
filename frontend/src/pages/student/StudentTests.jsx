import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { labTestService } from '../../services/labTestService'
import { labTestSubmissionService } from '../../services/labTestSubmissionService'
import Modal from '../../components/ui/Modal'
import { ROUTES, EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'
import LabRecordSheet from '../../components/LabRecordSheet'

/* ── Status Badge for Tests ─────────────────────────────────────────── */
function TestStatusBadge({ status }) {
  const styles = {
    UPCOMING:    { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', label: 'Upcoming' },
    AVAILABLE:   { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', label: 'Available' },
    IN_PROGRESS: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', label: 'In Progress' },
    SUBMITTED:   { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', label: 'Submitted' },
    GRADED:      { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', label: 'Graded' },
    EXPIRED:     { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', label: 'Expired' },
  }
  const s = styles[status] ?? styles.AVAILABLE
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
      {s.label}
    </span>
  )
}

export default function StudentTests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Start Exam Modals
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [agreedToRules, setAgreedToRules] = useState(false)

  // Result / Certificate Modal
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadData()
      // Poll every 30 seconds
      const pollInterval = setInterval(loadData, 30000)
      // Ticker every 1 second to update counts/countdown and status badges
      const renderInterval = setInterval(() => {
        setTests(prev => [...prev])
      }, 1000)

      return () => {
        clearInterval(pollInterval)
        clearInterval(renderInterval)
      }
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [testsRes, subsRes] = await Promise.all([
        labTestService.getStudentTests(user.id),
        labTestSubmissionService.getStudentHistory(user.id)
      ])
      setTests(testsRes.data || [])
      setSubmissions(subsRes.data || [])
    } catch (err) {
      toast.error('Failed to load practical examinations roster.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRules = (test) => {
    setSelectedTest(test)
    setAgreedToRules(false)
    setShowRulesModal(true)
  }

  const handleStartExam = async () => {
    if (!agreedToRules) {
      toast.error('You must agree to the examination rules to start.')
      return
    }

    try {
      // Calls start endpoint (checks concurrency, time windows, and duplicate submissions)
      await labTestSubmissionService.start(selectedTest.id, user.id)
      setShowRulesModal(false)
      toast.success('Entering examination room... Please remain in Full Screen! 🧪')
      navigate(`/student/tests/run/${selectedTest.id}`)
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to start examination.'
      if (errMsg.includes('ACTIVE_EXAM_EXISTS')) {
        toast.error('You have another active examination. Redirecting back to it.')
      } else {
        toast.error(errMsg)
      }
    }
  }

  const handleOpenResult = (sub) => {
    setSelectedSubmission(sub)
    setShowResultModal(true)
  }

  const getMappedTestStatus = (test) => {
    const sub = submissions.find(s => s.labTest?.id === test.id)
    if (sub) {
      if (sub.status === 'EVALUATED') return { status: 'GRADED', sub }
      if (sub.status === 'SUBMITTED' || sub.status === 'EXPIRED') return { status: 'SUBMITTED', sub }
      if (sub.status === 'IN_PROGRESS') return { status: 'IN_PROGRESS', sub }
    }

    if (test.testState === 'DRAFT' || test.testState === 'ARCHIVED') {
      return { status: test.testState === 'ARCHIVED' ? 'EXPIRED' : 'UPCOMING', sub: null }
    }

    const now = new Date()
    const start = new Date(test.startDateTime)
    const end = new Date(test.endDateTime)

    if (now < start) {
      return { status: 'UPCOMING', sub: null }
    } else if (now >= start && now <= end) {
      // Problem 2: Grace entry condition check
      const graceLimit = new Date(start.getTime() + (test.lateEntryGracePeriod || 10) * 60 * 1000)
      if (now <= graceLimit) {
        return { status: 'AVAILABLE', sub: null }
      } else {
        return { status: 'EXPIRED', sub: null } // grace limit exceeded
      }
    } else {
      return { status: 'EXPIRED', sub: null }
    }
  }

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,#10b981,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🧪 Laboratory Examination Room
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          View and attempt your assigned practical examinations, or review published results.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#10b981' }}>Loading examinations…</div>
      ) : tests.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>No practical examinations assigned to your classroom.</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Ask your teacher if they have scheduled any practical tests.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {tests.map(test => {
            const exp = test.experiment
            const color = SUBJECT_COLORS[exp?.subject] || '#3b82f6'
            const icon = EXPERIMENT_ICONS[exp?.subject] || '⚛️'
            
            const { status, sub } = getMappedTestStatus(test)
            
            return (
              <div key={test.id} className="glass-card" style={{
                padding: '1.25rem',
                borderTop: `3px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                {/* Subject & State Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge-${exp?.subject?.toLowerCase()}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                    {icon} {exp?.subject}
                  </span>
                  <TestStatusBadge status={status} />
                </div>

                {/* Exam Title */}
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {test.testName}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Experiment: <strong>{exp?.name}</strong>
                  </p>
                </div>

                {/* Class, Date, Duration Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '6px', padding: '0.5rem 0.65rem' }}>
                  <div>👨‍🏫 Teacher: <strong>{test.teacher?.fullName}</strong></div>
                  <div>📅 Start: <strong>{new Date(test.startDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div>🕒 End: <strong>{new Date(test.endDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div>⏳ Grace Period: <strong>{test.lateEntryGracePeriod} minutes</strong></div>
                  <div>⏱️ Duration: <strong>{test.duration} minutes</strong></div>
                  <div>🎯 Total Marks: <strong>{test.totalMarks}</strong></div>
                </div>

                {/* Action Buttons depending on status */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  
                  {status === 'AVAILABLE' && (
                    <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleOpenRules(test)}>
                      Start Examination ✍️
                    </button>
                  )}

                  {status === 'IN_PROGRESS' && (
                    <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: 'linear-gradient(135deg,#8b5cf6,#5b21b6)' }} onClick={() => navigate(`/student/tests/run/${test.id}`)}>
                      Continue Examination ➔
                    </button>
                  )}

                  {status === 'SUBMITTED' && (
                    <button className="btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', cursor: 'not-allowed' }} disabled>
                      📄 Submitted (Awaiting Marks)
                    </button>
                  )}

                  {status === 'GRADED' && sub && (
                    <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: 'linear-gradient(135deg,#10b981,#047857)' }} onClick={() => handleOpenResult(sub)}>
                      🏅 View Result Report Card
                    </button>
                  )}

                  {status === 'UPCOMING' && (
                    <button className="btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', cursor: 'not-allowed' }} disabled>
                      🔒 Upcoming (Starts {new Date(test.startDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                    </button>
                  )}

                  {status === 'EXPIRED' && (
                    <button className="btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', cursor: 'not-allowed' }} disabled>
                      ❌ Expired (Missed Attempt)
                    </button>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── RULES AGREEMENT MODAL ────────────────────────────────────── */}
      <Modal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} title={`⚠️ Examination Room: ${selectedTest?.testName}`} size="md">
        {selectedTest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Metadata summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem' }}>
              <div>Experiment: <strong>{selectedTest.experiment.name}</strong></div>
              <div>Duration: <strong>{selectedTest.duration} minutes</strong></div>
              <div>Total Marks: <strong>{selectedTest.totalMarks}</strong></div>
              <div>Passing Marks: <strong>{selectedTest.passingMarks}</strong></div>
            </div>

            {/* Test Instructions */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#10b981', textTransform: 'uppercase' }}>
                Instructions from Teacher
              </h4>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                {selectedTest.instructions || 'No specific instructions provided.'}
              </div>
            </div>

            {/* Warnings Alert */}
            <div style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.78rem',
              color: '#fca5a5',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <strong style={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🚨 INTEGRITY & CHEATING WARNING POLICY:
              </strong>
              <div>• Switching tabs, exiting full screen, or reloading the page will trigger an immediate warning.</div>
              <div>• You are allowed a maximum of <strong>3 warnings</strong>. Upon the 3rd violation, the system will automatically submit your exam.</div>
              <div>• Right-Click (context menu), text dragging, copy, paste, and cut are disabled.</div>
              <div>• Closing the browser will not pause your timer. The elapsed time keeps ticking!</div>
            </div>

            {/* Agreement Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={e => setAgreedToRules(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span style={{ color: '#fff', fontWeight: 600 }}>
                I agree to the strict examination conditions and wish to enter the examination room.
              </span>
            </label>

            {/* Trigger Button */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRulesModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, background: agreedToRules ? 'linear-gradient(135deg,#10b981,#047857)' : 'rgba(255,255,255,0.05)', color: agreedToRules ? '#fff' : '#64748b', cursor: agreedToRules ? 'pointer' : 'not-allowed' }}
                disabled={!agreedToRules}
                onClick={handleStartExam}
              >
                Enter Examination Room ➔
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* ── GRADED RESULT CERTIFICATE MODAL ────────────────────────── */}
      <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="🏅 Practical Examination Report Card" size="md">
        {selectedSubmission && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'monospace' }}>
            
            {/* Certificate Header */}
            <div style={{ textAlign: 'center', borderBottom: '3px double rgba(16,185,129,0.3)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#10b981', fontWeight: 800 }}>EDUSIM VIRTUAL LABORATORY</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Academic Examination Records
              </p>
            </div>

            {/* Student & Exam Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.6rem',
              fontSize: '0.78rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '8px',
              padding: '0.8rem 1rem'
            }}>
              <div><strong>Student Name:</strong> {selectedSubmission.student?.fullName}</div>
              <div><strong>Student Email:</strong> {selectedSubmission.student?.email}</div>
              <div><strong>Exam Title:</strong> {selectedSubmission.labTest?.testName}</div>
              <div><strong>Experiment:</strong> {selectedSubmission.labTest?.experiment?.name}</div>
              <div><strong>Date Attempted:</strong> {new Date(selectedSubmission.completionTime).toLocaleDateString('en-IN')}</div>
              <div><strong>Attempt Time:</strong> {new Date(selectedSubmission.startTime).toLocaleTimeString()}</div>
            </div>

            {/* Scorecard breakdown */}
            <div style={{
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8rem'
            }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '3px' }}>
                MARKS SCORECARD BREAKDOWN
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1. Experimental Observation:</span>
                <strong>{selectedSubmission.observationMarks} / {selectedSubmission.labTest.practicalMarks * 0.4}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>2. Calculations & Formulas:</span>
                <strong>{selectedSubmission.calculationMarks} / {selectedSubmission.labTest.practicalMarks * 0.4}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>3. Experimental Conclusion:</span>
                <strong>{selectedSubmission.conclusionMarks} / {selectedSubmission.labTest.practicalMarks * 0.2}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>4. descriptive Viva Questions:</span>
                <strong>{selectedSubmission.vivaMarks} / {selectedSubmission.labTest.vivaMarks}</strong>
              </div>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 'bold' }}>
                <span>Sum Total Score:</span>
                <span style={{ color: '#10b981' }}>{selectedSubmission.totalMarks} / {selectedSubmission.labTest.totalMarks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 'bold' }}>
                <span>Grade Awarded:</span>
                <span style={{ color: '#3b82f6' }}>{selectedSubmission.grade}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 'bold' }}>
                <span>Status Result:</span>
                <span style={{ color: selectedSubmission.totalMarks >= selectedSubmission.labTest.passingMarks ? '#10b981' : '#ef4444' }}>
                  {selectedSubmission.totalMarks >= selectedSubmission.labTest.passingMarks ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Integrity Violations (Warnings):</span>
                <span>{selectedSubmission.warningsCount} warning(s)</span>
              </div>
            </div>

            {/* Remarks */}
            {selectedSubmission.teacherRemarks && (
              <div style={{
                padding: '0.6rem 0.8rem',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#94a3b8',
                lineHeight: 1.4
              }}>
                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>👨‍🏫 Teacher Remarks & Feedback:</strong>
                "{selectedSubmission.teacherRemarks}"
              </div>
            )}

            {/* Printable pdf triggers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowResultModal(false)}>
                Close
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
                onClick={() => {
                  // Construct a dummy report object that matches reportExport parameters
                  const reportObj = {
                    reportId: `EDU-EXAM-${String(selectedSubmission.id).padStart(5, '0')}`,
                    date: new Date(selectedSubmission.completionTime).toLocaleDateString('en-IN'),
                    experiment: selectedSubmission.labTest.experiment?.name,
                    subject: selectedSubmission.labTest.experiment?.subject,
                    studentName: selectedSubmission.student?.fullName || 'Student',
                    rollNumber: `ROLL-${selectedSubmission.student?.id || ''}`,
                    className: selectedSubmission.labTest.classroom?.className || 'N/A',
                    teacherName: selectedSubmission.labTest.teacher?.fullName || 'N/A',
                    parameters: {},
                    results: {},
                    trials: [],
                    observation: selectedSubmission.observation,
                    conclusion: selectedSubmission.conclusion,
                    notes: `Calculations: ${selectedSubmission.calculations || 'N/A'}\nResult: ${selectedSubmission.result || 'N/A'}`,
                    isDraft: false,
                    metadata: {
                      generatedOn: new Date(selectedSubmission.completionTime).toLocaleString(),
                      submittedOn: new Date(selectedSubmission.completionTime).toLocaleString(),
                      generatedBy: selectedSubmission.student?.fullName || 'Student',
                      reportVersion: 1
                    },
                    evaluation: {
                      score: selectedSubmission.totalMarks,
                      remarks: `[Observation: ${selectedSubmission.observationMarks}, Calc: ${selectedSubmission.calculationMarks}, Concl: ${selectedSubmission.conclusionMarks}, Viva: ${selectedSubmission.vivaMarks}] Grade: ${selectedSubmission.grade}. Remarks: ${selectedSubmission.teacherRemarks || 'N/A'}`,
                      dateReviewed: new Date().toLocaleDateString('en-IN')
                    }
                  }
                  exportReportPDF(reportObj)
                }}
              >
                Download PDF Report 📄
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  )
}
