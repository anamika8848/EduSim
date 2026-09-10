import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { experimentService } from '../services/experimentService'
import { assignmentService } from '../services/assignmentService'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import { ROUTES } from '../utils/constants'
import LabRecordSheet from '../components/LabRecordSheet'
import PracticeObservationModal from '../components/PracticeObservationModal'

const SimplePendulum     = React.lazy(() => import('../experiments/SimplePendulum'))
const OhmsLaw            = React.lazy(() => import('../experiments/OhmsLaw'))
const ProjectileMotion   = React.lazy(() => import('../experiments/ProjectileMotion'))
const AcidBaseTitration  = React.lazy(() => import('../experiments/AcidBaseTitration'))
const ElectrolysisOfWater = React.lazy(() => import('../experiments/ElectrolysisOfWater'))
const PHMeasurement      = React.lazy(() => import('../experiments/PHMeasurement'))
const OsmosisDiffusion   = React.lazy(() => import('../experiments/OsmosisDiffusion'))
const CellMicroscope     = React.lazy(() => import('../experiments/CellMicroscope'))
const BloodGrouping      = React.lazy(() => import('../experiments/BloodGrouping'))

const EXPERIMENT_MAP = {
  'simple pendulum': SimplePendulum,
  "ohm's law": OhmsLaw,
  'projectile motion': ProjectileMotion,
  'acid-base titration': AcidBaseTitration,
  'electrolysis of water': ElectrolysisOfWater,
  'ph measurement': PHMeasurement,
  'osmosis & diffusion': OsmosisDiffusion,
  'cell under microscope': CellMicroscope,
  'blood grouping test': BloodGrouping,
}

const SUBJECT_COLORS = { PHYSICS: '#3b82f6', CHEMISTRY: '#f59e0b', BIOLOGY: '#10b981' }
const SUBJECT_ICONS  = { PHYSICS: '⚛️', CHEMISTRY: '🧪', BIOLOGY: '🧬' }

export default function ExperimentLab() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')

  const [experiment, setExperiment] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [assignment, setAssignment] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  const [simulationData, setSimulationData] = useState(null)

  const handleRecordObservationClick = () => {
    if (!simulationData || !simulationData.trials || simulationData.trials.length === 0) {
      toast.error("Please complete the experiment before recording your laboratory report.")
      return
    }
    setShowPracticeModal(true)
  }

  useEffect(() => {
    // Load experiment details
    experimentService.getAll()
      .then(res => {
        const list = res.data || []
        const found = list.find(e => String(e.id) === String(id))
        if (found) {
          setExperiment(found)
        } else {
          toast.error('Experiment not found')
          navigate(ROUTES.EXPERIMENTS)
        }
      })
      .catch(() => {
        toast.error('Could not load experiment')
        navigate(ROUTES.EXPERIMENTS)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (assignmentId) {
      assignmentService.getById(assignmentId)
        .then(res => {
          setAssignment(res.data)
          if (res.data.reportData) {
            try {
              const report = JSON.parse(res.data.reportData)
              if (report) {
                setSimulationData({
                  interacted: true,
                  parameters: report.parameters || {},
                  results: report.results || {},
                  trials: report.trials || []
                })
              }
            } catch (e) {
              console.error("Error parsing draft reportData:", e)
            }
          }
        })
        .catch(err => {
          console.error("Could not fetch assignment details", err)
        })
    }
  }, [assignmentId])

  const handleFinishPractice = () => {
    toast.success('Practice Lab completed successfully! 🎉')
    navigate(ROUTES.EXPERIMENTS)
  }

  const getSimComponent = () => {
    if (!experiment) return null
    const Comp = EXPERIMENT_MAP[experiment.name?.toLowerCase()]
    if (!Comp) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <div style={{ fontSize: 16, color: '#94a3b8' }}>Interactive simulation coming soon</div>
        <div style={{ fontSize: 13, marginTop: 6, color: '#64748b' }}>{experiment.name}</div>
      </div>
    )
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3b82f6', fontSize: 16 }}>Loading simulation…</div>}>
        <Comp experimentData={experiment} onProgressUpdate={() => {}} onSimulationData={setSimulationData} />
      </Suspense>
    )
  }

  const color = SUBJECT_COLORS[experiment?.subject] || '#3b82f6'
  const icon  = SUBJECT_ICONS[experiment?.subject] || '🔬'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a', color: '#3b82f6', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>⚗️</div>
      <div style={{ fontSize: 18 }}>Loading Laboratory…</div>
    </div>
  )

  const isCompleted = assignment && (assignment.status === 'SUBMITTED' || assignment.status === 'GRADED')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0e1a', fontFamily: 'Inter,sans-serif', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 54, background: 'rgba(15,22,45,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14, flexShrink: 0, backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{experiment?.name || 'Virtual Lab'}</div>
          <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${color}20`, border: `1px solid ${color}40`, color }}>{icon} {experiment?.subject}</span>
        </div>

        {/* Display Status or Action Buttons */}
        {assignmentId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isCompleted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: assignment.status === 'GRADED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: assignment.status === 'GRADED' ? '#10b981' : '#f59e0b',
                  border: `1px solid ${assignment.status === 'GRADED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                }}>
                  {assignment.status === 'GRADED' ? `GRADED (Score: ${assignment.score}/100)` : 'SUBMITTED'}
                </span>
                <button
                  onClick={() => setShowReportModal(true)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  View Report 📄
                </button>
                <button
                  onClick={() => {
                    try {
                      const reportObj = JSON.parse(assignment.reportData)
                      import('../utils/reportExport').then(module => {
                        module.exportReportPDF(reportObj)
                      })
                    } catch (e) {
                      toast.error("Failed to download report.")
                    }
                  }}
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Download PDF 📥
                </button>
                <button
                  onClick={() => {
                    try {
                      const reportObj = JSON.parse(assignment.reportData)
                      import('../utils/reportExport').then(module => {
                        module.printReport(reportObj)
                      })
                    } catch (e) {
                      toast.error("Failed to print report.")
                    }
                  }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Print 🖨
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(!simulationData || !simulationData.trials || simulationData.trials.length === 0) && (
                  <span style={{ fontSize: '11px', color: '#ef4444', opacity: 0.8 }}>
                    ⚠️ Record at least one trial to enable report
                  </span>
                )}
                <button
                  disabled={!simulationData || !simulationData.trials || simulationData.trials.length === 0}
                  onClick={() => setShowReportModal(true)}
                  style={{
                    background: (!simulationData || !simulationData.trials || simulationData.trials.length === 0)
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg,#10b981,#059669)',
                    border: 'none',
                    color: (!simulationData || !simulationData.trials || simulationData.trials.length === 0) ? '#475569' : '#fff',
                    padding: '6px 16px',
                    borderRadius: 6,
                    cursor: (!simulationData || !simulationData.trials || simulationData.trials.length === 0) ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                  title={(!simulationData || !simulationData.trials || simulationData.trials.length === 0) ? "Record at least one observation before generating a report." : ""}
                >
                  {(() => {
                    let isDraftVal = false;
                    if (assignment && assignment.reportData) {
                      try {
                        const parsed = JSON.parse(assignment.reportData);
                        isDraftVal = parsed.isDraft === true;
                      } catch (e) {}
                    }
                    return isDraftVal ? 'Resume Lab Report 📝' : 'Generate Lab Report 📝';
                  })()}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(!simulationData || !simulationData.trials || simulationData.trials.length === 0) && (
              <span style={{ fontSize: '11px', color: '#ef4444', opacity: 0.8 }}>
                ⚠️ Record at least one trial to enable observation
              </span>
            )}
            <button
              onClick={handleRecordObservationClick}
              style={{
                background: (!simulationData || !simulationData.trials || simulationData.trials.length === 0)
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg,#10b981,#059669)',
                border: 'none',
                color: (!simulationData || !simulationData.trials || simulationData.trials.length === 0) ? '#475569' : '#fff',
                padding: '6px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Record Observation 📝
            </button>
            <button
              onClick={handleFinishPractice}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Finish Practice ➔
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Read-only notification banner */}
        {isCompleted && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
            color: '#fbbf24',
            padding: '8px 16px',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 500,
            zIndex: 10
          }}>
            ⚠️ This assignment report has already been submitted. You can interact with the simulation, but no further report modifications can be made.
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {getSimComponent()}
        </div>
      </div>

      {/* Report Modal */}
      {assignmentId && (
        <SubmitReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          assignment={assignment}
          setAssignment={setAssignment}
          simulationData={simulationData}
          experiment={experiment}
          onSubmitted={() => {
            setShowReportModal(false)
            navigate(ROUTES.STUDENT_DASHBOARD)
          }}
        />
      )}

      {/* Practice Observation Modal */}
      {!assignmentId && (
        <PracticeObservationModal
          isOpen={showPracticeModal}
          onClose={() => setShowPracticeModal(false)}
          simulationData={simulationData}
          experiment={experiment}
        />
      )}
    </div>
  )
}

/* ── Submit Lab Report Modal ──────────────────────────────────── */
function SubmitReportModal({ isOpen, onClose, assignment, setAssignment, simulationData, experiment, onSubmitted }) {
  const [form, setForm] = useState({ observation: '', conclusion: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Edit, 2: Preview

  const isCompleted = assignment && (assignment.status === 'SUBMITTED' || assignment.status === 'GRADED')

  useEffect(() => {
    if (isOpen && assignment) {
      if (isCompleted) {
        setStep(2) // directly show preview if completed
      } else {
        setForm({
          observation: assignment.observation || '',
          conclusion: assignment.conclusion || '',
          notes: assignment.notes || ''
        })
        setStep(1)
      }
    }
  }, [isOpen, assignment, isCompleted])

  const constructReport = (isDraftVal) => {
    return {
      reportId: `EDU-LAB-2026-${String(assignment.id).padStart(5, '0')}`,
      date: new Date().toLocaleDateString('en-IN'),
      experiment: experiment?.name,
      subject: experiment?.subject,
      studentName: assignment.student?.name,
      rollNumber: `EDU-${assignment.student?.id}`,
      className: assignment.classroom?.className || 'N/A',
      teacherName: assignment.teacher?.name || 'N/A',
      parameters: simulationData?.parameters || {},
      results: simulationData?.results || {},
      trials: simulationData?.trials || [],
      observation: form.observation,
      conclusion: form.conclusion,
      notes: form.notes,
      isDraft: isDraftVal,
      metadata: {
        generatedOn: new Date().toLocaleString(),
        submittedOn: isDraftVal ? null : new Date().toLocaleString(),
        generatedBy: assignment.student?.name,
        reportVersion: 1
      },
      evaluation: assignment.remarks || assignment.score !== null ? {
        score: assignment.score,
        remarks: assignment.remarks,
        dateReviewed: assignment.completionDate ? new Date(assignment.completionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')
      } : null
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const reportObj = constructReport(true)
      const resultsStr = simulationData ? Object.entries(simulationData.results).map(([k, v]) => `${k}: ${v}`).join(', ') : ''
      const requestPayload = {
        observation: form.observation,
        result: resultsStr,
        conclusion: form.conclusion,
        notes: form.notes,
        reportData: JSON.stringify(reportObj)
      }
      const res = await assignmentService.saveDraft(assignment.id, requestPayload)
      setAssignment(res.data)
      toast.success('Lab Report draft saved successfully! 💾')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save draft.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const reportObj = constructReport(false)
      const resultsStr = simulationData ? Object.entries(simulationData.results).map(([k, v]) => `${k}: ${v}`).join(', ') : ''
      const requestPayload = {
        observation: form.observation,
        result: resultsStr,
        conclusion: form.conclusion,
        notes: form.notes,
        reportData: JSON.stringify(reportObj)
      }
      await assignmentService.complete(assignment.id, requestPayload)
      toast.success('Lab Report submitted successfully! 🎉')
      onSubmitted()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to submit lab report.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (e) => {
    e.preventDefault()
    if (!form.observation.trim() || !form.conclusion.trim()) {
      toast.error('Please fill in the Experimental Observations and Conclusion first.')
      return
    }
    setStep(2)
  }

  const handleDownload = () => {
    try {
      const reportObj = assignment.reportData ? JSON.parse(assignment.reportData) : constructReport(false)
      import('../utils/reportExport').then(module => {
        module.exportReportPDF(reportObj)
      })
    } catch (e) {
      toast.error("Failed to download PDF.")
    }
  }

  const handlePrint = () => {
    try {
      const reportObj = assignment.reportData ? JSON.parse(assignment.reportData) : constructReport(false)
      import('../utils/reportExport').then(module => {
        module.printReport(reportObj)
      })
    } catch (e) {
      toast.error("Failed to print report.")
    }
  }

  let reportToPreview = null
  if (isOpen) {
    if (isCompleted && assignment.reportData) {
      try {
        reportToPreview = JSON.parse(assignment.reportData)
      } catch(e) {}
    } else {
      reportToPreview = constructReport(step === 1)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCompleted ? "📄 View Lab Report" : "📝 Submit Lab Report"}
      size={step === 2 ? "lg" : "md"}
    >
      {step === 1 && !isCompleted ? (
        <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
            fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            🔬 Experiment: <strong style={{ color: 'var(--text-primary)' }}>{experiment?.name}</strong>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Experimental Observations <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="input-field"
              rows={3}
              style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Record your observations during the simulation..."
              value={form.observation}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Conclusion <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="input-field"
              rows={3}
              style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="What is the scientific conclusion derived from this experiment?"
              value={form.conclusion}
              onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Additional Remarks (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Add any additional notes, remarks, or observations..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-secondary" style={{ flex: 1, border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }} onClick={handleSaveDraft} disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Draft'}
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              🔍 Preview Report
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', background: '#0b0f19', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            {reportToPreview && <LabRecordSheet report={reportToPreview} />}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {isCompleted ? (
              <>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button type="button" className="btn-secondary" onClick={handlePrint}>
                  Print 🖨
                </button>
                <button type="button" className="btn-primary" onClick={handleDownload}>
                  Download PDF 📥
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                  ← Back to Edit
                </button>
                <button type="button" className="btn-secondary" style={{ border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }} onClick={handleSaveDraft} disabled={loading}>
                  {loading ? '⏳ Saving...' : '💾 Save Draft'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleDownload}>
                  Download PDF 📥
                </button>
                <button type="button" className="btn-primary" onClick={() => handleSubmit()} disabled={loading}>
                  {loading ? '⏳ Submitting...' : '🚀 Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
