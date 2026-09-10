import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { labTestService } from '../../services/labTestService'
import { labTestSubmissionService } from '../../services/labTestSubmissionService'
import Modal from '../../components/ui/Modal'
import { ROUTES } from '../../utils/constants'

// Lazy loaded virtual experiments matching ExperimentLab map
const SimplePendulum     = React.lazy(() => import('../../experiments/SimplePendulum'))
const OhmsLaw            = React.lazy(() => import('../../experiments/OhmsLaw'))
const ProjectileMotion   = React.lazy(() => import('../../experiments/ProjectileMotion'))
const AcidBaseTitration  = React.lazy(() => import('../../experiments/AcidBaseTitration'))
const ElectrolysisOfWater = React.lazy(() => import('../../experiments/ElectrolysisOfWater'))
const PHMeasurement      = React.lazy(() => import('../../experiments/PHMeasurement'))
const OsmosisDiffusion   = React.lazy(() => import('../../experiments/OsmosisDiffusion'))
const CellMicroscope     = React.lazy(() => import('../../experiments/CellMicroscope'))
const BloodGrouping      = React.lazy(() => import('../../experiments/BloodGrouping'))

const EXPERIMENT_MAP = {
  'simple pendulum': SimplePendulum,
  "ohm's law": OhmsLaw,
  'projectile motion': ProjectileMotion,
  'acid-base titration': AcidBaseTitration,
  'electrolysis of water': ElectrolysisOfWater,
  'ph measurement': PHMeasurement,
  'osmosis & diffusion': OsmosisDiffusion,
  'cell under microscope': CellMicroscope,
}

/* ── Warning counts colored indicators ──────────────────────────────── */
function getWarningBadge(warnings) {
  if (!warnings || warnings === 0) {
    return <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>🟢 0 warnings</span>
  } else if (warnings === 1) {
    return <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>🟡 1 warning</span>
  } else if (warnings === 2) {
    return <span style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 600 }}>🟠 2 warnings</span>
  } else {
    return <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>🔴 {warnings} warnings</span>
  }
}

export default function StudentTestRun() {
  const { id } = useParams() // This is the LabTest ID
  const navigate = useNavigate()
  const { user } = useAuth()

  // Exam Details
  const [labTest, setLabTest] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  // Examination Stages:
  // 1: Rules & Setup
  // 2: Virtual Experiment Simulation
  // 3: Observation Sheet Form
  // 4: Viva Questions
  // 5: Final Review
  const [stage, setStage] = useState(1)

  // Security & State
  const [examStarted, setExamStarted] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [warningsCount, setWarningsCount] = useState(0)

  // Form Answers
  const [observation, setObservation] = useState('')
  const [calculations, setCalculations] = useState('')
  const [result, setResult] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [simulationData, setSimulationData] = useState(null) // Caches trials/parameters

  // Viva variables
  const [vivaAnswers, setVivaAnswers] = useState([]) // Array of cached answers
  const [currentVivaIdx, setCurrentVivaIdx] = useState(0) // 0 to 4

  // Confirmation Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // --- Rehydration & Initialization ---
  useEffect(() => {
    if (user?.id && id) {
      initializeExam()
    }
  }, [user, id])

  const initializeExam = async () => {
    try {
      const testRes = await labTestService.getById(id)
      setLabTest(testRes.data)

      // Start or re-enter
      const subRes = await labTestSubmissionService.start(id, user.id)
      const sub = subRes.data
      setSubmission(sub)
      setWarningsCount(sub.warningsCount || 0)

      // Rehydrate reports fields if they exist
      setObservation(sub.observation || '')
      setCalculations(sub.calculations || '')
      setResult(sub.result || '')
      setConclusion(sub.conclusion || '')

      if (sub.reportData) {
        try {
          setSimulationData(JSON.parse(sub.reportData))
        } catch (e) {}
      }

      // Rehydrate viva answers
      setVivaAnswers(sub.vivaAnswers || [])

      if (sub.status === 'IN_PROGRESS') {
        // Compute timer based on absolute scheduled time
        const testStart = new Date(testRes.data.startDateTime).getTime()
        const durationMins = testRes.data.duration
        const limitTime = testStart + durationMins * 60 * 1000
        const now = new Date().getTime()
        const remaining = Math.max(0, Math.floor((limitTime - now) / 1000))

        if (remaining <= 0) {
          // Auto submit
          toast.error('Time limit has already expired for this attempt.')
          await finalSubmitAttempt(sub.id)
        } else {
          setSecondsLeft(remaining)
          setExamStarted(true)
          setStage(2) // Jump directly to simulation
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enter examination room.')
      navigate(ROUTES.STUDENT_TESTS)
    } finally {
      setLoading(false)
    }
  }

  // --- Countdown Timer ---
  useEffect(() => {
    if (!examStarted || examSubmitted || secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeOutAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, examSubmitted, secondsLeft])

  const handleTimeOutAutoSubmit = async () => {
    toast.error('Time is up! Your examination is being submitted automatically.', { duration: 6000 })
    await finalSubmitAttempt(submission.id, "AUTO_SUBMITTED")
  }

  const finalSubmitAttempt = async (subId, logType = 'SUBMITTED') => {
    setExamSubmitted(true)
    setExamStarted(false)
    try {
      // Trigger one last save
      await saveStateToServer(true)
      
      if (logType === 'AUTO_SUBMITTED') {
        await labTestSubmissionService.logEvent(subId, 'AUTO_SUBMITTED', 'Time limit expired. Papers collected.')
      } else {
        await labTestSubmissionService.submit(subId)
      }
      toast.success('Your examination has been submitted successfully! 🎉')
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      navigate(ROUTES.STUDENT_TESTS)
    } catch (err) {
      toast.error('Failed to submit exam paper. Attempting again...')
    }
  }

  // --- 10-Second Autosave Loop ---
  useEffect(() => {
    if (!examStarted || examSubmitted) return

    const saveInterval = setInterval(() => {
      saveStateToServer(false)
    }, 10000) // 10 seconds

    return () => clearInterval(saveInterval)
  }, [examStarted, examSubmitted, observation, calculations, result, conclusion, simulationData, vivaAnswers])

  const saveStateToServer = async (isFinal = false) => {
    if (!submission) return
    try {
      const payload = {
        observation,
        calculations,
        result,
        conclusion,
        reportData: simulationData ? JSON.stringify(simulationData) : null,
        warningsCount,
        vivaAnswers: vivaAnswers.map(ans => ({ id: ans.id, studentAnswer: ans.studentAnswer }))
      }
      await labTestSubmissionService.autosave(submission.id, payload)
      if (!isFinal) {
        // Silent success, log event
        await labTestSubmissionService.logEvent(submission.id, 'AUTOSAVE', 'Autosave completed.')
      }
    } catch (e) {
      console.error('Autosave failed:', e)
    }
  }

  // --- Security Hooks (Tab Switches & Fullscreen Exit) ---
  const enterFullScreen = () => {
    const docEl = document.documentElement
    if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {})
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(() => {})
    else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen().catch(() => {})
    else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen().catch(() => {})
  }

  const triggerIntegrityWarning = async (type, desc) => {
    if (!submission) return
    const nextWarning = warningsCount + 1
    setWarningsCount(nextWarning)
    toast.error(`⚠️ INTEGRITY VIOLATION DETECTED: ${desc} Warning ${nextWarning}/3`, { duration: 6000 })
    
    try {
      await labTestSubmissionService.logEvent(submission.id, type, `${desc} Warning Count: ${nextWarning}`)
      
      if (nextWarning >= 3) {
        toast.error('Too many warnings! Your exam is being submitted automatically.', { duration: 7000 })
        setExamSubmitted(true)
        setExamStarted(false)
        await finalSubmitAttempt(submission.id, 'AUTO_SUBMITTED')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
      if (!isFullScreen && examStarted && !examSubmitted) {
        triggerIntegrityWarning('FULLSCREEN_EXIT', 'Student exited full screen mode.')
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && examStarted && !examSubmitted) {
        triggerIntegrityWarning('TAB_SWITCH', 'Student switched browser tab.')
      }
    }

    const handleContextMenu = (e) => e.preventDefault()
    const handleDragStart = (e) => e.preventDefault()
    
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault()
        toast.error("Copying, cutting, or pasting is strictly disabled!")
      }
    }

    if (examStarted && !examSubmitted) {
      document.addEventListener('fullscreenchange', handleFullScreenChange)
      document.addEventListener('webkitfullscreenchange', handleFullScreenChange)
      document.addEventListener('mozfullscreenchange', handleFullScreenChange)
      document.addEventListener('MSFullscreenChange', handleFullScreenChange)

      document.addEventListener('visibilitychange', handleVisibilityChange)
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('dragstart', handleDragStart)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange)

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [examStarted, examSubmitted, warningsCount, submission])

  // --- Browser Unload Guard ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStarted && !examSubmitted) {
        e.preventDefault()
        e.returnValue = "Are you sure you want to leave? Your exam timer will continue to tick!"
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [examStarted, examSubmitted])

  // --- Navigation Blockers ---
  // In React Router, we just don't offer links. Since they are outside Layout, they are physically locked.
  
  const handleBeginExam = () => {
    enterFullScreen()
    setExamStarted(true)

    const testStart = new Date(labTest.startDateTime).getTime()
    const limitTime = testStart + labTest.duration * 60 * 1000
    const now = new Date().getTime()
    const remaining = Math.max(0, Math.floor((limitTime - now) / 1000))

    setSecondsLeft(remaining)
    setStage(2) // proceed to simulation
  }

  // --- Render Stages ---

  const renderStage1Rules = () => (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem' }} className="glass-card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '3rem' }}>✍️</span>
        <h2 style={{ margin: '0.5rem 0 0', fontWeight: 800 }}>Practical Examination Room</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{labTest.testName}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.5rem' }}>
        <div>Experiment: <strong>{labTest.experiment?.name}</strong></div>
        <div>Subject: <strong>{labTest.subject}</strong></div>
        <div>Duration: <strong>{labTest.duration} minutes</strong></div>
        <div>Practical Marks: <strong>{labTest.practicalMarks}</strong> | Viva Marks: <strong>{labTest.vivaMarks}</strong></div>
      </div>

      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        padding: '0.875rem',
        fontSize: '0.8rem',
        color: '#fca5a5',
        marginBottom: '1.5rem',
        lineHeight: 1.4
      }}>
        <strong style={{ color: '#ef4444' }}>INTEGRITY POLICY AGREEMENT:</strong>
        <div style={{ marginTop: '6px' }}>• Full Screen will be locked. Exiting full screen yields warnings.</div>
        <div>• Switching tabs or minimizing the browser will yield warnings.</div>
        <div>• <strong>3 warnings = Auto Submit</strong> of your exam script.</div>
        <div>• Autosave runs every 10 seconds. Reloads do not reset your timer.</div>
      </div>

      <button className="btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={handleBeginExam}>
        Request Fullscreen & Begin Exam ➔
      </button>
    </div>
  )

  const renderStage2Simulation = () => {
    const Comp = EXPERIMENT_MAP[labTest.experiment?.name?.toLowerCase()]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '92vh' }}>
        <div style={{ flex: 1, position: 'relative', background: '#070a13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          {Comp ? (
            <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#10b981' }}>Loading simulation workspace…</div>}>
              <Comp experimentData={labTest.experiment} onSimulationData={setSimulationData} onProgressUpdate={() => {}} />
            </Suspense>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Simulation placeholder
            </div>
          )}
        </div>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Record trials in the virtual equipment. They will be cached in your report sheet.
          </span>
          <button
            className="btn-primary"
            style={{ padding: '0.5rem 1.5rem' }}
            disabled={!simulationData || !simulationData.trials || simulationData.trials.length === 0}
            onClick={() => {
              labTestSubmissionService.logEvent(submission.id, 'STAGE_CHANGE', 'Entered Stage: Observation Sheet')
              setStage(3)
            }}
            title={(!simulationData || !simulationData.trials || simulationData.trials.length === 0) ? "Record at least one reading in the simulation." : ""}
          >
            Proceed to Observation Sheet ➔
          </button>
        </div>
      </div>
    )
  }

  const renderStage3Observations = () => (
    <div style={{ maxWidth: '800px', margin: '1rem auto 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
          Experimental Observations Record
        </h3>

        {/* Read-only trials summary */}
        <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>Recorded Readings Summary ({simulationData?.trials?.length || 0} trials):</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            {simulationData?.parameters && Object.entries(simulationData.parameters).map(([k,v]) => (
              <span key={k} style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.72rem' }}>
                {k}: {String(v)}
              </span>
            ))}
          </div>
        </div>

        {/* Observation textareas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Experimental Observation *</label>
            <textarea
              className="input-field"
              rows={4}
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Describe your observations during the practical simulation..."
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Calculations & Formulas *</label>
            <textarea
              className="input-field"
              rows={3}
              value={calculations}
              onChange={e => setCalculations(e.target.value)}
              placeholder="Write the formulas used and calculation steps..."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Final Result *</label>
              <textarea
                className="input-field"
                rows={2}
                value={result}
                onChange={e => setResult(e.target.value)}
                placeholder="Write the final calculated values/results..."
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Conclusion *</label>
              <textarea
                className="input-field"
                rows={2}
                value={conclusion}
                onChange={e => setConclusion(e.target.value)}
                placeholder="Scientific conclusions derived from the practical..."
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStage(2)}>
          ◀ Back to Simulation
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1 }}
          disabled={!observation.trim() || !calculations.trim() || !result.trim() || !conclusion.trim()}
          onClick={() => {
            labTestSubmissionService.logEvent(submission.id, 'STAGE_CHANGE', 'Entered Stage: Viva Questions')
            setStage(4)
          }}
        >
          Proceed to Viva Questions ➔
        </button>
      </div>

    </div>
  )

  const renderStage4Viva = () => {
    if (vivaAnswers.length === 0) {
      return (
        <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem' }} className="glass-card">
          <p>No viva questions assigned to this examination.</p>
          <button className="btn-primary" onClick={() => setStage(5)}>Proceed to Review ➔</button>
        </div>
      )
    }

    const currentQ = vivaAnswers[currentVivaIdx]
    const progressPct = ((currentVivaIdx + 1) / vivaAnswers.length) * 100
    // Generate simple progress blocks: e.g. Question 3 / 5 | ██████░░░░ 60%
    const filledBlocks = Math.round(progressPct / 10)
    const emptyBlocks = 10 - filledBlocks
    const progressBarStr = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks)

    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="glass-card">
        
        {/* Progress header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>descriptive VIVA SECTION</span>
          <span style={{ fontFamily: 'monospace' }}>
            Question {currentVivaIdx + 1} / {vivaAnswers.length} | {progressBarStr} {Math.round(progressPct)}%
          </span>
        </div>

        {/* Question text */}
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
          {currentQ.questionText}
        </div>

        {/* Input box */}
        <div>
          <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Type your descriptive answer below *</label>
          <textarea
            className="input-field"
            rows={5}
            value={currentQ.studentAnswer || ''}
            onChange={e => {
              const updated = [...vivaAnswers]
              updated[currentVivaIdx].studentAnswer = e.target.value
              setVivaAnswers(updated)
            }}
            placeholder="Type your explanation here..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Pagination buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            className="btn-secondary"
            style={{ flex: 1 }}
            disabled={currentVivaIdx === 0}
            onClick={() => setCurrentVivaIdx(prev => prev - 1)}
          >
            ◀ Previous
          </button>
          
          {currentVivaIdx < vivaAnswers.length - 1 ? (
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => setCurrentVivaIdx(prev => prev + 1)}
            >
              Next Question ➔
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ flex: 1, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
              onClick={() => {
                labTestSubmissionService.logEvent(submission.id, 'STAGE_CHANGE', 'Entered Stage: Final Review')
                setStage(5)
              }}
            >
              Proceed to Review ➔
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderStage5Review = () => (
    <div style={{ maxWidth: '800px', margin: '1rem auto 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.02)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
          🏁 Final Examination Review
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Please review all your submitted answers below. You can navigate back to edit any section before final lock.
        </p>
      </div>

      {/* Practical Observation Review */}
      <div className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          onClick={() => setStage(3)}
        >
          ✏️ Edit Report
        </button>
        <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#3b82f6', textTransform: 'uppercase' }}>
          1. Observation Sheet
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          <div><strong>Observations:</strong> {observation}</div>
          <div><strong>Calculations:</strong> {calculations}</div>
          <div><strong>Result:</strong> {result}</div>
          <div><strong>Conclusion:</strong> {conclusion}</div>
        </div>
      </div>

      {/* Viva Answers Review */}
      <div className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          onClick={() => {
            setCurrentVivaIdx(0)
            setStage(4)
          }}
        >
          ✏️ Edit Viva Answers
        </button>
        <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#8b5cf6', textTransform: 'uppercase' }}>
          2. Viva Q&A responses
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          {vivaAnswers.map((ans, idx) => (
            <div key={ans.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
              <strong>Q{idx + 1}. {ans.questionText}</strong>
              <div style={{ color: 'var(--text-secondary)', paddingLeft: '8px', marginTop: '2px' }}>
                Ans: {ans.studentAnswer || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No answer typed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Final Submission */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStage(4)}>
          ◀ Back to Viva questions
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)' }}
          onClick={() => setShowSubmitModal(true)} // Toggles final confirmation modal
        >
          Confirm & Submit Examination ➔
        </button>
      </div>

    </div>
  )

  if (loading || !labTest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a', color: '#10b981', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>⚗️</div>
        <div style={{ fontSize: 18 }}>Entering Examination Room…</div>
      </div>
    )
  }

  // Helper formatting for timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070a14', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
      
      {/* Secure Header bar */}
      {examStarted && (
        <div style={{
          height: '56px',
          background: 'rgba(15,22,45,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>EduSim Practical Exam</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>| {labTest.testName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>{getWarningBadge(warningsCount)}</div>
            
            {/* Floating Timer */}
            <div style={{
              background: secondsLeft < 120 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: secondsLeft < 120 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)',
              color: secondsLeft < 120 ? '#ef4444' : '#10b981',
              padding: '4px 12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>⏰</span>
              <span>{formatTimer(secondsLeft)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div style={{ padding: '1rem 1.5rem' }}>
        {stage === 1 && renderStage1Rules()}
        {stage === 2 && renderStage2Simulation()}
        {stage === 3 && renderStage3Observations()}
        {stage === 4 && renderStage4Viva()}
        {stage === 5 && renderStage5Review()}
      </div>

      {/* ── FINAL SUBMIT CONFIRMATION MODAL ────────────────────────── */}
      <Modal isOpen={showSubmitModal && stage === 5} onClose={() => setShowSubmitModal(false)} title="❓ Confirm Final Submission" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.2rem' }}>⚠️</span>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.4, color: '#cbd5e1' }}>
              <strong>Are you sure you want to submit your laboratory examination?</strong>
              <div style={{ marginTop: '8px', color: '#fca5a5' }}>
                After submission, your script will be locked and you cannot modify any observations or viva answers.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowSubmitModal(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#047857)' }}
              onClick={() => finalSubmitAttempt(submission.id)}
            >
              Submit Examination
            </button>
          </div>

        </div>
      </Modal>

    </div>
  )
}
