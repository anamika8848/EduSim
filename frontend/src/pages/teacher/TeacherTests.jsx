import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { labTestService } from '../../services/labTestService'
import { labTestSubmissionService } from '../../services/labTestSubmissionService'
import { vivaQuestionService } from '../../services/vivaQuestionService'
import { experimentService } from '../../services/experimentService'
import { classroomService } from '../../services/classroomService'
import Modal from '../../components/ui/Modal'
import { EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'
import { exportReportPDF, printReport } from '../../utils/reportExport'

/* ── Status badge color mapping for student attempts ───────────────── */
function getAttemptStatusBadge(status, warnings) {
  const styles = {
    NOT_STARTED: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)', label: 'Absent' },
    IN_PROGRESS: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', label: 'In Progress' },
    SUBMITTED:   { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', label: 'Submitted' },
    EXPIRED:     { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', label: 'Auto Submitted' },
    EVALUATED:   { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', label: 'Evaluated' },
  }
  const s = styles[status] ?? styles.NOT_STARTED
  // If not started but warnings? Impossible, but just mapping
  let label = s.label
  if (status === 'EXPIRED' && warnings >= 3) {
    label = 'Auto Submitted (Violated)'
  }
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.5rem',
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      background: s.bg,
      color: s.color,
      border: s.border,
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
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

export default function TeacherTests() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('SCHEDULED') // DRAFT, SCHEDULED, ACTIVE, ENDED, ARCHIVED
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  // Dropdown lists
  const [classrooms, setClassrooms] = useState([])
  const [experiments, setExperiments] = useState([])

  // Modal Toggles
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [showEvaluateModal, setShowEvaluateModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)

  // Active Selections
  const [selectedTest, setSelectedTest] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [questionPool, setQuestionPool] = useState([])
  const [newQuestionText, setNewQuestionText] = useState('')
  const [editingQuestion, setEditingQuestion] = useState(null)

  // Analytics Stats
  const [analytics, setAnalytics] = useState(null)

  // Create/Edit Test Form
  const [testForm, setTestForm] = useState({
    testName: '',
    subject: 'PHYSICS',
    experimentId: '',
    classroomId: '',
    date: '',
    startTime: '',
    endTime: '',
    lateEntryGracePeriod: 10, // Default 10 minutes grace
    duration: 45,
    practicalMarks: 40,
    vivaMarks: 10,
    passingMarks: 20,
    instructions: '',
    questionSelectionMode: 'RANDOM',
    selectedQuestionIds: []
  })

  // Dynamic state evaluator for active listings
  const getDynamicTestState = (test) => {
    if (test.testState === 'DRAFT' || test.testState === 'ARCHIVED') {
      return test.testState;
    }
    const now = new Date();
    const start = new Date(test.startDateTime);
    const end = new Date(test.endDateTime);
    if (now < start) {
      return 'SCHEDULED';
    } else if (now >= start && now <= end) {
      return 'ACTIVE';
    } else {
      return 'ENDED';
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadData()
      // Polling every 30 seconds
      const pollInterval = setInterval(loadData, 30000);
      // Auto re-render ticker every 1 second
      const renderInterval = setInterval(() => {
        setTests(prev => [...prev]);
      }, 1000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(renderInterval);
      };
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [testsRes, classRes, expRes] = await Promise.all([
        labTestService.getTeacherTests(user.id),
        classroomService.getTeacherClasses(user.id),
        experimentService.getAll()
      ])
      setTests(testsRes.data || [])
      setClassrooms(classRes.data || [])
      setExperiments(expRes.data || [])
    } catch (err) {
      toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // Load questions pool for the current chosen experiment in the form
  useEffect(() => {
    if (testForm.experimentId) {
      vivaQuestionService.getByExperiment(testForm.experimentId)
        .then(res => setQuestionPool(res.data || []))
        .catch(() => toast.error('Failed to load questions pool.'))
    } else {
      setQuestionPool([])
    }
  }, [testForm.experimentId])

  // Grading Form
  const [evalForm, setEvalForm] = useState({
    observationMarks: 0,
    calculationMarks: 0,
    conclusionMarks: 0,
    vivaMarks: 0,
    teacherRemarks: ''
  })

  const totalInput = Number(evalForm.observationMarks || 0) + Number(evalForm.calculationMarks || 0) + Number(evalForm.conclusionMarks || 0) + Number(evalForm.vivaMarks || 0)

  const handleCreateTestSubmit = async (e) => {
    e.preventDefault()
    if (!testForm.testName.trim()) {
      toast.error('Test Name is required.')
      return
    }
    if (!testForm.experimentId) {
      toast.error('Please select an experiment.')
      return
    }
    if (!testForm.classroomId) {
      toast.error('Please select a classroom.')
      return
    }
    if (!testForm.date || !testForm.startTime || !testForm.endTime) {
      toast.error('Date and time slots are required.')
      return
    }

    try {
      // Problem 1: Handle cross-midnight end time transition
      let startDateTime = `${testForm.date}T${testForm.startTime}:00`;
      let endDateTime = `${testForm.date}T${testForm.endTime}:00`;

      if (testForm.endTime < testForm.startTime) {
        const dt = new Date(testForm.date);
        dt.setDate(dt.getDate() + 1);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        endDateTime = `${yyyy}-${mm}-${dd}T${testForm.endTime}:00`;
      }

      const payload = {
        testName: testForm.testName,
        subject: testForm.subject,
        experimentId: testForm.experimentId,
        classroomId: testForm.classroomId,
        teacherId: user.id,
        startDateTime,
        endDateTime,
        lateEntryGracePeriod: testForm.lateEntryGracePeriod,
        duration: testForm.duration,
        practicalMarks: testForm.practicalMarks,
        vivaMarks: testForm.vivaMarks,
        passingMarks: testForm.passingMarks,
        instructions: testForm.instructions,
        questionSelectionMode: testForm.questionSelectionMode,
        selectedQuestionIds: testForm.selectedQuestionIds,
        testState: 'SCHEDULED' // Automatically schedule
      }

      if (selectedTest) {
        await labTestService.update(selectedTest.id, payload)
        toast.success('Laboratory examination updated! 🧪')
      } else {
        await labTestService.create(payload)
        toast.success('Laboratory examination scheduled successfully! 🧪')
      }

      setShowCreateModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule laboratory examination.')
    }
  }

  const handleOpenEdit = (test) => {
    setSelectedTest(test)
    setTestForm({
      testName: test.testName,
      subject: test.subject,
      experimentId: test.experiment?.id,
      classroomId: test.classroom?.id,
      date: test.startDateTime ? test.startDateTime.split('T')[0] : '',
      startTime: test.startDateTime ? test.startDateTime.split('T')[1].slice(0, 5) : '',
      endTime: test.endDateTime ? test.endDateTime.split('T')[1].slice(0, 5) : '',
      lateEntryGracePeriod: test.lateEntryGracePeriod || 10,
      duration: test.duration,
      practicalMarks: test.practicalMarks,
      vivaMarks: test.vivaMarks,
      passingMarks: test.passingMarks,
      instructions: test.instructions || '',
      questionSelectionMode: test.questionSelectionMode || 'RANDOM',
      selectedQuestionIds: test.selectedQuestions ? test.selectedQuestions.map(q => q.id) : []
    })
    setShowCreateModal(true)
  }

  const handleOpenCreate = () => {
    setSelectedTest(null)
    setTestForm({
      testName: '',
      subject: 'PHYSICS',
      experimentId: '',
      classroomId: '',
      date: '',
      startTime: '',
      endTime: '',
      lateEntryGracePeriod: 10, // Default 10 minutes grace
      duration: 45,
      practicalMarks: 40,
      vivaMarks: 10,
      passingMarks: 20,
      instructions: "• Read every instruction carefully.\n• Complete the practical simulation before the viva starts.\n• Switching tabs or exiting full screen is strictly prohibited.\n• Copy, Paste, Cut, and Right-Click are disabled during the examination.\n• Your responses are automatically saved every 10 seconds.\n• 3 warnings will result in an immediate automatic submission of your paper.",
      questionSelectionMode: 'RANDOM',
      selectedQuestionIds: []
    })
    setShowCreateModal(true)
  }

  const handleDeleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this examination? All student submissions will be lost.')) {
      try {
        await labTestService.delete(id)
        toast.success('Examination deleted.')
        loadData()
      } catch (err) {
        toast.error('Failed to delete examination.')
      }
    }
  }

  const handleArchiveTest = async (test) => {
    try {
      await labTestService.updateState(test.id, 'ARCHIVED')
      toast.success('Examination archived.')
      loadData()
    } catch (err) {
      toast.error('Failed to archive examination.')
    }
  }

  // --- Questions Pool Handlers ---
  const handleOpenQuestions = (test) => {
    setSelectedTest(test)
    vivaQuestionService.getByExperiment(test.experiment.id)
      .then(res => {
        setQuestionPool(res.data || [])
        setShowQuestionsModal(true)
      })
      .catch(() => toast.error('Failed to load questions pool.'))
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    if (!newQuestionText.trim()) return

    try {
      if (editingQuestion) {
        const res = await vivaQuestionService.update(editingQuestion.id, { questionText: newQuestionText })
        setQuestionPool(questionPool.map(q => q.id === editingQuestion.id ? res.data : q))
        toast.success('Question updated.')
      } else {
        const res = await vivaQuestionService.add(selectedTest.experiment.id, { questionText: newQuestionText })
        setQuestionPool([...questionPool, res.data])
        toast.success('Question added to bank.')
      }
      setNewQuestionText('')
      setEditingQuestion(null)
    } catch (err) {
      toast.error('Failed to save question.')
    }
  }

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm('Are you sure you want to delete this question from the bank?')) {
      try {
        await vivaQuestionService.delete(qId)
        setQuestionPool(questionPool.filter(q => q.id !== qId))
        toast.success('Question removed.')
      } catch (err) {
        toast.error('Failed to delete question.')
      }
    }
  }

  // --- Submissions & Evaluation Handlers ---
  const handleOpenSubmissions = async (test) => {
    setSelectedTest(test)
    try {
      const res = await labTestSubmissionService.getSubmissionsByTest(test.id)
      setSubmissions(res.data || [])
      setShowSubmissionsModal(true)
    } catch (err) {
      toast.error('Failed to load student submissions.')
    }
  }

  const handleOpenGrade = (sub) => {
    setSelectedSubmission(sub)
    setEvalForm({
      observationMarks: sub.observationMarks || 0,
      calculationMarks: sub.calculationMarks || 0,
      conclusionMarks: sub.conclusionMarks || 0,
      vivaMarks: sub.vivaMarks || 0,
      teacherRemarks: sub.teacherRemarks || ''
    })
    setShowEvaluateModal(true)
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    if (totalInput > selectedTest.totalMarks) {
      toast.error(`Total marks cannot exceed the maximum test marks of ${selectedTest.totalMarks}`)
      return
    }

    try {
      await labTestSubmissionService.evaluate(selectedSubmission.id, evalForm)
      toast.success('Marks published successfully! 🎓')
      setShowEvaluateModal(false)
      // reload submissions list
      const res = await labTestSubmissionService.getSubmissionsByTest(selectedTest.id)
      setSubmissions(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation.')
    }
  }

  const handleReopenEvaluation = async () => {
    try {
      await labTestSubmissionService.reopenEvaluation(selectedSubmission.id)
      toast.success('Evaluation unlocked. You can now edit grades.')
      // update state
      const updatedRes = await labTestSubmissionService.getById(selectedSubmission.id)
      setSelectedSubmission(updatedRes.data)
    } catch (err) {
      toast.error('Failed to unlock evaluation.')
    }
  }

  const handleForceSubmit = async (subId) => {
    if (window.confirm('Are you sure you want to manually force submit this student\'s attempt?')) {
      try {
        await labTestSubmissionService.forceSubmit(subId)
        toast.success('Attempt submitted.')
        const res = await labTestSubmissionService.getSubmissionsByTest(selectedTest.id)
        setSubmissions(res.data || [])
      } catch (err) {
        toast.error('Failed to force submit attempt.')
      }
    }
  }

  const handleAllowReentry = async (subId) => {
    if (window.confirm('Are you sure you want to allow re-entry? This will reset their warning counts and change status back to In Progress.')) {
      try {
        await labTestSubmissionService.allowReentry(subId)
        toast.success('Re-entry allowed. Student warning count has been reset.')
        const res = await labTestSubmissionService.getSubmissionsByTest(selectedTest.id)
        setSubmissions(res.data || [])
      } catch (err) {
        toast.error('Failed to allow re-entry.')
      }
    }
  }

  // --- Analytics Handlers ---
  const handleOpenAnalytics = async (test) => {
    setSelectedTest(test)
    try {
      const res = await labTestService.getStats(test.id)
      setAnalytics(res.data)
      setShowAnalyticsModal(true)
    } catch (err) {
      toast.error('Failed to fetch test analytics.')
    }
  }

  const exportCSV = () => {
    if (!submissions || submissions.length === 0) return
    const headers = ['Student Name', 'Email', 'Status', 'Warnings', 'Practical Marks', 'Viva Marks', 'Total Score', 'Grade', 'Teacher Remarks']
    const rows = submissions.map(sub => [
      sub.student?.fullName || 'N/A',
      sub.student?.email || 'N/A',
      sub.status || 'N/A',
      sub.warningsCount || 0,
      sub.observationMarks !== null ? (sub.observationMarks + sub.calculationMarks + sub.conclusionMarks) : 'N/A',
      sub.vivaMarks !== null ? sub.vivaMarks : 'N/A',
      sub.totalMarks !== null ? sub.totalMarks : 'N/A',
      sub.grade || 'N/A',
      sub.teacherRemarks || 'N/A'
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `${selectedTest.testName.replace(/\s+/g, '_')}_results.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredTests = tests.filter(t => getDynamicTestState(t) === activeTab)

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🧪 Laboratory Examination Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Schedule virtual tests, manage viva pools, view integrity warnings, and publish marks.
          </p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          + Create Examination
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {['SCHEDULED', 'ACTIVE', 'ENDED', 'DRAFT', 'ARCHIVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: activeTab === tab ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              background: activeTab === tab ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: activeTab === tab ? '#3b82f6' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#3b82f6' }}>Loading examinations…</div>
      ) : filteredTests.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>No examinations found in this status category.</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click "Create Examination" to schedule a new laboratory exam.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredTests.map(test => {
            const exp = test.experiment
            const color = SUBJECT_COLORS[exp?.subject] || '#3b82f6'
            const icon = EXPERIMENT_ICONS[exp?.subject] || '⚛️'
            
            return (
              <div key={test.id} className="glass-card" style={{
                padding: '1.25rem',
                borderLeft: `3px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative'
              }}>
                {/* Exp Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge-${exp?.subject?.toLowerCase()}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                    {icon} {exp?.subject}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ⏱️ {test.duration} mins
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{test.testName}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Experiment: <span style={{ color: '#fff', fontWeight: 600 }}>{exp?.name}</span>
                  </div>
                </div>

                {/* Classroom, date & timings */}
                <div style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  color: '#cbd5e1'
                }}>
                  <div>🏫 Class: <strong>{test.classroom?.className}</strong></div>
                  <div>📅 Start: <strong>{new Date(test.startDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div>🕒 End: <strong>{new Date(test.endDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div>⏳ Grace Period: <strong>{test.lateEntryGracePeriod} minutes</strong></div>
                  <div>🎯 Max Marks: <strong>{test.practicalMarks + test.vivaMarks} (Prac: {test.practicalMarks}, Viva: {test.vivaMarks})</strong></div>
                  <div>Selection: <strong>{test.questionSelectionMode === 'RANDOM' ? '🎲 Random 5' : '✍️ Manual'}</strong></div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
                    onClick={() => handleOpenSubmissions(test)}
                  >
                    👥 Student Results
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                    onClick={() => handleOpenAnalytics(test)}
                    title="Analytics"
                  >
                    📊 Stats
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                    onClick={() => handleOpenQuestions(test)}
                    title="Viva Pool"
                  >
                    ❓ Bank
                  </button>
                </div>

                {/* Edit/Delete for Drafts & Scheduled */}
                {(activeTab === 'DRAFT' || activeTab === 'SCHEDULED') && (
                  <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' }}
                      onClick={() => handleOpenEdit(test)}
                    >
                      ✏️ Edit Test
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {/* Archive Button for Ended */}
                {activeTab === 'ENDED' && (
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem', borderColor: 'rgba(100,116,139,0.3)', color: '#94a3b8', marginTop: '0.2rem' }}
                    onClick={() => handleArchiveTest(test)}
                  >
                    📦 Archive Test
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── CREATE/EDIT TEST MODAL ───────────────────────────────────── */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={selectedTest ? "✏️ Edit Practical Examination" : "🧪 Create Practical Examination"} size="md">
        <form onSubmit={handleCreateTestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Examination Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. physics practical exam 1"
                value={testForm.testName}
                onChange={e => setFormAndValidate('testName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subject *</label>
              <select
                className="input-field"
                value={testForm.subject}
                onChange={e => {
                  setTestForm({ ...testForm, subject: e.target.value })
                }}
              >
                <option value="PHYSICS">PHYSICS</option>
                <option value="CHEMISTRY">CHEMISTRY</option>
                <option value="BIOLOGY">BIOLOGY</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Experiment *</label>
              <select
                className="input-field"
                value={testForm.experimentId}
                onChange={e => setTestForm({ ...testForm, experimentId: e.target.value, selectedQuestionIds: [] })}
                required
              >
                <option value="">-- Choose Experiment --</option>
                {experiments.filter(e => e.subject === testForm.subject).map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Classroom *</label>
              <select
                className="input-field"
                value={testForm.classroomId}
                onChange={e => setTestForm({ ...testForm, classroomId: e.target.value })}
                required
              >
                <option value="">-- Choose Classroom --</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.className}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Exam Date *</label>
              <input
                type="date"
                className="input-field"
                value={testForm.date}
                onChange={e => setFormAndValidate('date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start Time *</label>
              <input
                type="time"
                className="input-field"
                value={testForm.startTime}
                onChange={e => setFormAndValidate('startTime', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>End Time *</label>
              <input
                type="time"
                className="input-field"
                value={testForm.endTime}
                onChange={e => setFormAndValidate('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Duration (Mins) *</label>
              <input
                type="number"
                className="input-field"
                value={testForm.duration}
                onChange={e => setFormAndValidate('duration', parseInt(e.target.value))}
                required
                min="5"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Grace Period *</label>
              <select
                className="input-field"
                value={testForm.lateEntryGracePeriod}
                onChange={e => setFormAndValidate('lateEntryGracePeriod', parseInt(e.target.value))}
                required
              >
                <option value={0}>0 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Prac Marks *</label>
              <input
                type="number"
                className="input-field"
                value={testForm.practicalMarks}
                onChange={e => setFormAndValidate('practicalMarks', parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Viva Marks *</label>
              <input
                type="number"
                className="input-field"
                value={testForm.vivaMarks}
                onChange={e => setFormAndValidate('vivaMarks', parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pass Marks *</label>
              <input
                type="number"
                className="input-field"
                value={testForm.passingMarks}
                onChange={e => setFormAndValidate('passingMarks', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Question Selection Mode</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="selectionMode"
                  value="RANDOM"
                  checked={testForm.questionSelectionMode === 'RANDOM'}
                  onChange={() => setTestForm({ ...testForm, questionSelectionMode: 'RANDOM' })}
                />
                Random (Pick 5 automatically)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="selectionMode"
                  value="MANUAL"
                  checked={testForm.questionSelectionMode === 'MANUAL'}
                  onChange={() => setTestForm({ ...testForm, questionSelectionMode: 'MANUAL', selectedQuestionIds: [] })}
                />
                Teacher Selected (Manual)
              </label>
            </div>
          </div>

          {/* Manual Question Picker */}
          {testForm.questionSelectionMode === 'MANUAL' && testForm.experimentId && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                Select Exactly 5 Questions from Bank ({testForm.selectedQuestionIds.length} / 5 selected):
              </label>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                {questionPool.map(q => {
                  const isChecked = testForm.selectedQuestionIds.includes(q.id)
                  return (
                    <label key={q.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '5px 8px',
                      background: isChecked ? 'rgba(59,130,246,0.06)' : 'transparent',
                      border: '1px solid rgba(255,255,255,0.02)',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        style={{ marginTop: '3px' }}
                        onChange={() => {
                          let list = [...testForm.selectedQuestionIds]
                          if (list.includes(q.id)) {
                            list = list.filter(id => id !== q.id)
                          } else {
                            if (list.length >= 5) {
                              toast.error('You can select a maximum of 5 questions.')
                              return
                            }
                            list.push(q.id)
                          }
                          setTestForm({ ...testForm, selectedQuestionIds: list })
                        }}
                      />
                      <span>{q.questionText}</span>
                    </label>
                  )
                })}
                {questionPool.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
                    No questions in pool. Click 'Bank' next to the test on the dashboard to populate them.
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Instructions (Markdown supported)</label>
            <textarea
              className="input-field"
              rows={4}
              value={testForm.instructions}
              onChange={e => setFormAndValidate('instructions', e.target.value)}
              placeholder="e.g. read instructions carefully..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={testForm.questionSelectionMode === 'MANUAL' && testForm.selectedQuestionIds.length !== 5}
              title={testForm.questionSelectionMode === 'MANUAL' && testForm.selectedQuestionIds.length !== 5 ? "Please select exactly 5 questions." : ""}
            >
              {selectedTest ? "Save Changes" : "Schedule Test"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── VIVA QUESTION BANK MODAL ─────────────────────────────────── */}
      <Modal isOpen={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} title={`❓ Question Bank: ${selectedTest?.experiment?.name}`} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Question List */}
          <div style={{
            maxHeight: '350px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            padding: '0.75rem'
          }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#8b5cf6', textTransform: 'uppercase' }}>
              Experiment Pool ({questionPool.length} questions)
            </h4>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '4px' }} />
            
            {questionPool.map((q, idx) => (
              <div key={q.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 'bold', marginRight: '6px' }}>{idx + 1}.</span>
                  <span>{q.questionText}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}
                    onClick={() => {
                      setEditingQuestion(q)
                      setNewQuestionText(q.questionText)
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {questionPool.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                No questions seeded for this experiment. Add some below!
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <form onSubmit={handleAddQuestion} style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <h5 style={{ margin: 0, fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
              {editingQuestion ? '✏️ Edit Question Text' : '➕ Add New descriptive Question'}
            </h5>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Enter descriptive question text..."
              value={newQuestionText}
              onChange={e => setNewQuestionText(e.target.value)}
              style={{ resize: 'vertical' }}
              required
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              {editingQuestion && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => {
                    setEditingQuestion(null)
                    setNewQuestionText('')
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                {editingQuestion ? 'Update' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── STUDENT RESULTS / SUBMISSIONS LIST MODAL ────────────────── */}
      <Modal isOpen={showSubmissionsModal} onClose={() => setShowSubmissionsModal(false)} title={`👥 Results roster: ${selectedTest?.testName}`} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Action / Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Assigned Class: <strong style={{ color: '#fff' }}>{selectedTest?.classroom?.className}</strong> | Max Marks: <strong style={{ color: '#fff' }}>{selectedTest?.totalMarks}</strong>
            </span>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={exportCSV}>
              📥 Export CSV (Excel)
            </button>
          </div>

          {/* Submissions Table */}
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Warnings</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Grade</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.15s' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{sub.student?.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{sub.student?.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {getAttemptStatusBadge(sub.status, sub.warningsCount)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {getWarningBadge(sub.warningsCount)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>
                      {sub.totalMarks !== null ? `${sub.totalMarks} / ${selectedTest.totalMarks}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: sub.grade === 'F' ? '#ef4444' : '#10b981' }}>
                      {sub.grade || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {/* Evaluate Action */}
                        {(sub.status === 'SUBMITTED' || sub.status === 'EXPIRED' || sub.status === 'EVALUATED') && (
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => handleOpenGrade(sub)}
                          >
                            {sub.status === 'EVALUATED' ? '🔍 View / Edit' : '📝 Grade'}
                          </button>
                        )}

                        {/* Force Submit (for In Progress) */}
                        {sub.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                              onClick={() => handleForceSubmit(sub.id)}
                            >
                              Force Submit
                            </button>
                          </>
                        )}

                        {/* Allow Re-entry */}
                        {(sub.status === 'SUBMITTED' || sub.status === 'EXPIRED') && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }}
                            onClick={() => handleAllowReentry(sub.id)}
                          >
                            Allow Re-entry
                          </button>
                        )}
                        {sub.status === 'NOT_STARTED' && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>No attempt recorded</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No students enrolled in this classroom.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* ── EVALUATION & GRADING MODAL ───────────────────────────────── */}
      <Modal isOpen={showEvaluateModal} onClose={() => setShowEvaluateModal(false)} title={`📝 Grade submission: ${selectedSubmission?.student?.fullName}`} size="lg">
        {selectedSubmission && (
          <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
            
            {/* Frozen Metadata Objective */}
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div>🏫 Experiment: <strong style={{ color: '#fff' }}>{selectedTest.experiment.name}</strong></div>
              <div>📖 Objective: <span style={{ color: '#cbd5e1' }}>{selectedTest.frozenObjective}</span></div>
            </div>

            {/* Warning Count + State Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Integrity: {getWarningBadge(selectedSubmission.warningsCount)}</div>
              {selectedSubmission.status === 'EVALUATED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>🔒 EVALUATION LOCKED</span>
                  <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={handleReopenEvaluation}>
                    Unlock / Edit Marks 🔓
                  </button>
                </div>
              )}
            </div>

            {/* Audit Log Collapse */}
            <details style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '8px',
              padding: '0.6rem 0.75rem'
            }}>
              <summary style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                📋 View Student Examination Audit Log ({selectedSubmission.auditLogs?.length || 0} events)
              </summary>
              <div style={{
                marginTop: '0.6rem',
                maxHeight: '140px',
                overflowY: 'auto',
                fontSize: '0.74rem',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                color: '#94a3b8'
              }}>
                {selectedSubmission.auditLogs && [...selectedSubmission.auditLogs].sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp)).map((log, index) => (
                  <div key={index} style={{
                    padding: '2px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <span style={{ color: '#8b5cf6' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span style={{
                      color: log.eventType === 'AUTO_SUBMITTED' || log.eventType.includes('EXIT') || log.eventType.includes('SWITCH') ? '#ef4444' : '#10b981',
                      fontWeight: 'bold'
                    }}>
                      [{log.eventType}]
                    </span>
                    <span>{log.details}</span>
                  </div>
                ))}
                {(!selectedSubmission.auditLogs || selectedSubmission.auditLogs.length === 0) && (
                  <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No audit history found.</div>
                )}
              </div>
            </details>

            {/* Tab/Simulation snapshot details */}
            {selectedSubmission.reportData && (
              <details style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem'
              }}>
                <summary style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                  ⚙️ View Interactive Simulation Snapshot Readings
                </summary>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>
                  {(() => {
                    try {
                      const data = JSON.parse(selectedSubmission.reportData)
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <strong style={{ color: '#10b981', display: 'block', marginBottom: '2px' }}>Parameters Snapshot:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {Object.entries(data.parameters || {}).map(([k,v]) => (
                                <span key={k} style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '4px', fontSize: '0.72rem' }}>
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>Recorded Trials ({data.trials?.length || 0}):</strong>
                            <div style={{ maxHeight: '100px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '6px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {data.trials?.[0] && Object.keys(data.trials[0]).map(k => <th key={k} style={{ padding: '4px', color: 'var(--text-muted)' }}>{k}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.trials?.map((tr, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                      {Object.values(tr).map((val, idx) => <td key={idx} style={{ padding: '4px', color: '#cbd5e1' }}>{String(val)}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )
                    } catch(e) {
                      return <span style={{ color: '#ef4444' }}>Invalid simulation data snapshot.</span>
                    }
                  })()}
                </div>
              </details>
            )}

            {/* Practical observations responses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Practical Observations & Report Responses
              </h4>
              
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Student Experimental Observations:</label>
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', minHeight: '40px' }}>
                  {selectedSubmission.observation || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None provided</span>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Student Calculations & Formulas:</label>
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', minHeight: '40px' }}>
                  {selectedSubmission.calculations || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None provided</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Student Result Summary:</label>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', minHeight: '40px' }}>
                    {selectedSubmission.result || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None provided</span>}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Student Conclusion:</label>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', minHeight: '40px' }}>
                    {selectedSubmission.conclusion || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None provided</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Viva answers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Student Viva Answers
              </h4>
              {selectedSubmission.vivaAnswers?.map((ans, index) => (
                <div key={ans.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: index !== selectedSubmission.vivaAnswers.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: index !== selectedSubmission.vivaAnswers.length-1 ? '0.75rem' : 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                    Q{index + 1}. <span style={{ color: '#fff' }}>{ans.questionText}</span>
                  </div>
                  <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Ans: {ans.studentAnswer || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No answer submitted</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Marks evaluation inputs */}
            <div style={{
              background: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#3b82f6', fontWeight: 800 }}>
                🎓 Enter Marks Awarded (Maximum Test Marks: {selectedTest.totalMarks})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Observation Marks</label>
                  <input
                    type="number"
                    className="input-field"
                    value={evalForm.observationMarks}
                    disabled={selectedSubmission.status === 'EVALUATED'}
                    onChange={e => setEvalForm({ ...evalForm, observationMarks: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Calculation Marks</label>
                  <input
                    type="number"
                    className="input-field"
                    value={evalForm.calculationMarks}
                    disabled={selectedSubmission.status === 'EVALUATED'}
                    onChange={e => setEvalForm({ ...evalForm, calculationMarks: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Conclusion Marks</label>
                  <input
                    type="number"
                    className="input-field"
                    value={evalForm.conclusionMarks}
                    disabled={selectedSubmission.status === 'EVALUATED'}
                    onChange={e => setEvalForm({ ...evalForm, conclusionMarks: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Viva Marks</label>
                  <input
                    type="number"
                    className="input-field"
                    value={evalForm.vivaMarks}
                    disabled={selectedSubmission.status === 'EVALUATED'}
                    onChange={e => setEvalForm({ ...evalForm, vivaMarks: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Teacher Remarks & Comments</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={evalForm.teacherRemarks}
                  disabled={selectedSubmission.status === 'EVALUATED'}
                  onChange={e => setEvalForm({ ...evalForm, teacherRemarks: e.target.value })}
                  placeholder="Provide comments on observations, practical calculations or general feedback..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Sum Total Marks: <span style={{ color: '#3b82f6' }}>{totalInput}</span> / {selectedTest.totalMarks}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => setShowEvaluateModal(false)}>
                    Close
                  </button>
                  {selectedSubmission.status !== 'EVALUATED' && (
                    <button type="submit" className="btn-primary" style={{ padding: '6px 20px' }}>
                      Publish Graded Result 🎓
                    </button>
                  )}
                </div>
              </div>
            </div>

          </form>
        )}
      </Modal>

      {/* ── TEST ANALYTICS & STATISTICS MODAL ───────────────────────── */}
      <Modal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} title={`📊 Examination Analytics: ${selectedTest?.testName}`} size="md">
        {analytics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
            
            {/* Header / Export */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Integrity and performance metrics overview.</span>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => window.print()}>
                🖨 Print Summary
              </button>
            </div>

            {/* Metrics cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Students Assigned</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{analytics.totalAssigned}</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Participation Rate</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
                  {analytics.totalAssigned > 0 ? ((analytics.startedCount / analytics.totalAssigned) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Started: {analytics.startedCount} | Absent: {analytics.absentCount}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Completion Time</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{analytics.averageTimeMinutes.toFixed(1)} mins</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Warnings Count</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{analytics.averageWarningCount.toFixed(2)}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Total Auto-Submitted: {analytics.totalAutoSubmissions}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Score</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {analytics.averageMarks.toFixed(1)} / {selectedTest.totalMarks}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High / Low Score</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {analytics.highestMarks} / {analytics.lowestMarks}
                </div>
              </div>

            </div>

            {/* Performance charts */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase' }}>
                Pass vs Fail Ratio
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${analytics.passPercentage}%`, background: '#10b981', height: '100%' }} />
                  <div style={{ width: `${analytics.failPercentage}%`, background: '#ef4444', height: '100%' }} />
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>🟢 Pass: {analytics.passPercentage.toFixed(1)}%</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Fail: {analytics.failPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Submissions stats details summary list */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.8rem'
            }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#3b82f6', textTransform: 'uppercase' }}>
                Submission Breakdown
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Awaiting Evaluation:</span>
                <span style={{ fontWeight: 'bold' }}>{analytics.submittedCount} students</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Evaluated / Graded:</span>
                <span style={{ fontWeight: 'bold' }}>{analytics.evaluatedCount} students</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active / In Progress:</span>
                <span style={{ fontWeight: 'bold' }}>{analytics.inProgressCount} students</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Absent / Not Started:</span>
                <span style={{ fontWeight: 'bold' }}>{analytics.absentCount} students</span>
              </div>
            </div>

            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowAnalyticsModal(false)}>
              Close Analytics Panel
            </button>
          </div>
        )}
      </Modal>

    </div>
  )

  function setFormAndValidate(field, value) {
    setTestForm(prev => ({
      ...prev,
      [field]: value
    }))
  }
}
