import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { practiceObservationService } from '../../services/practiceObservationService'
import { exportPracticePDF } from '../../utils/reportExport'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'

function ProgressIndicator({ observation, conclusion, notes }) {
  const hasObs = !!observation?.trim()
  const hasConc = !!conclusion?.trim()
  const hasNotes = !!notes?.trim()

  if (hasObs && hasConc && hasNotes) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
        background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)'
      }}>
        ✓ Complete Practice Note
      </span>
    )
  }

  if (hasObs && hasConc) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
        background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)'
      }}>
        ✓ Observation Recorded | ✓ Conclusion Written
      </span>
    )
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
      background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)'
    }}>
      ✓ Observation Recorded
    </span>
  )
}

function PracticeRecordCard({ record, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    observation: record.observation || '',
    conclusion: record.conclusion || '',
    notes: record.notes || ''
  })
  const [saving, setSaving] = useState(false)

  const subject = record.subject || 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`

  let parameters = {}
  let results = {}
  let trials = []
  try {
    parameters = JSON.parse(record.simulationParameters || '{}')
  } catch (e) {}
  try {
    const readings = JSON.parse(record.simulationReadings || '{}')
    results = readings.results || {}
    trials = readings.trials || []
  } catch (e) {}

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editForm.observation.trim()) {
      toast.error('Observation is required.')
      return
    }

    setSaving(true)
    try {
      const res = await practiceObservationService.update(record.id, {
        observation: editForm.observation,
        conclusion: editForm.conclusion,
        notes: editForm.notes
      })
      toast.success('Observation updated successfully! 💾')
      setIsEditing(false)
      onUpdate(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update observation.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to permanently delete this practice observation? This action cannot be undone.')) {
      onDelete(record.id)
    }
  }

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      borderLeft: `3px solid ${record.subject === 'CHEMISTRY' ? '#f59e0b' : record.subject === 'BIOLOGY' ? '#10b981' : '#3b82f6'}`,
      display: 'flex', flexDirection: 'column', gap: '1rem',
      animation: 'slide-in-up 0.25s ease-out'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span className={subjectClass} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
              {record.subject === 'PHYSICS' ? '⚛️' : record.subject === 'CHEMISTRY' ? '🧪' : '🧬'} {subject}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {record.practiceObservationId}
            </span>
          </div>
          <h3 style={{ margin: '0', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>
            {record.experimentName}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Recorded: {new Date(record.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        </div>

        {/* Completion progress badge */}
        <div>
          <ProgressIndicator
            observation={record.observation}
            conclusion={record.conclusion}
            notes={record.notes}
          />
        </div>
      </div>

      {/* Observation Snippet */}
      {!expanded && !isEditing && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
          "{record.observation}"
        </div>
      )}

      {/* Editing Form */}
      {isEditing && (
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
            ✏️ Edit Personal Notes
          </h4>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Observation <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={editForm.observation}
              onChange={(e) => setEditForm({ ...editForm, observation: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Conclusion
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={editForm.conclusion}
              onChange={(e) => setEditForm({ ...editForm, conclusion: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Personal Notes
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }} onClick={() => setIsEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Expanded view */}
      {expanded && !isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'slide-in-up 0.2s ease-out' }}>
          
          {/* Simulation Summary (Read-Only) */}
          <div style={{ padding: '0.875rem', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Captured Experiment Data (Read-Only)
            </h4>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '8px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Parameters:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(parameters).map(([k, v]) => (
                    <span key={k} style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.72rem' }}>
                      {k}: {String(v)}
                    </span>
                  ))}
                  {Object.keys(parameters).length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>None</span>}
                </div>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Readings:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(results).map(([k, v]) => (
                    <span key={k} style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '4px', fontSize: '0.72rem' }}>
                      {k}: {String(v)}
                    </span>
                  ))}
                  {Object.keys(results).length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>None</span>}
                </div>
              </div>

              {trials.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Recorded Trials:</strong>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                          {Object.keys(trials[0]).map(k => (
                            <th key={k} style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '4px 8px', textAlign: 'left', color: '#3b82f6' }}>{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {trials.map((t, i) => (
                          <tr key={i}>
                            {Object.values(t).map((val, vIdx) => (
                              <td key={vIdx} style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '4px 8px' }}>{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Texts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Observations:</strong>
              <p style={{ margin: '4px 0 0', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                "{record.observation}"
              </p>
            </div>
            {record.conclusion && (
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Conclusion:</strong>
                <p style={{ margin: '4px 0 0', background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  {record.conclusion}
                </p>
              </div>
            )}
            {record.notes && (
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Personal Notes:</strong>
                <p style={{ margin: '4px 0 0', background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  {record.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.2rem' }}>
        <button
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          onClick={() => {
            if (!expanded) setExpanded(true)
            else setExpanded(false)
          }}
          disabled={isEditing}
        >
          {expanded ? 'Collapse Detail ▲' : 'View Detail ▼'}
        </button>
        
        {!isEditing && (
          <button
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            onClick={() => {
              setEditForm({
                observation: record.observation || '',
                conclusion: record.conclusion || '',
                notes: record.notes || ''
              })
              setIsEditing(true)
            }}
          >
            ✏️ Edit
          </button>
        )}

        <button
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}
          onClick={() => exportPracticePDF(record)}
        >
          Download PDF 📥
        </button>

        <button
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', marginLeft: 'auto' }}
          onClick={handleDeleteClick}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

export default function PracticeNotebook() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filtering states
  const [search, setSearch]   = useState('')
  const [subjectFilter, setSubjectFilter] = useState('ALL')
  const [sortBy, setSortBy]   = useState('NEWEST')

  const fetchObservations = async () => {
    setLoading(true)
    try {
      const res = await practiceObservationService.getAll()
      setRecords(res.data ?? [])
    } catch {
      toast.error('Failed to load Practice Notebook.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchObservations()
  }, [])

  const handleUpdate = (updatedRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r))
  }

  const handleDelete = async (id) => {
    try {
      await practiceObservationService.delete(id)
      setRecords(records.filter(r => r.id !== id))
      toast.success('Practice observation deleted successfully.')
    } catch {
      toast.error('Failed to delete practice observation.')
    }
  }

  // Dynamic filter and sorting logic (does not require page refresh)
  const filteredRecords = records
    .filter(r => {
      const matchSearch = (r.experimentName || '').toLowerCase().includes(search.toLowerCase())
      const matchSubject = subjectFilter === 'ALL' || String(r.subject).toUpperCase() === subjectFilter
      return matchSearch && matchSubject
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'NEWEST' ? dateB - dateA : dateA - dateB
    })

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ height: '40px', borderRadius: '8px', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: '140px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 2rem' }} className="page-enter">
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.6rem' }}>📒</span>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>My Practice Notebook</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Review and manage your self-learning practice observations. These records are private and visible only to you.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '1rem',
        borderRadius: '12px', marginBottom: '1.5rem'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search by experiment name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Subject Filter Tabbed Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['ALL', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'].map(sub => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                border: subjectFilter === sub ? '1px solid rgba(245,158,11,0.5)' : '1px solid var(--border-glass)',
                background: subjectFilter === sub ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: subjectFilter === sub ? '#f59e0b' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {sub === 'ALL' ? 'All' : sub.charAt(0) + sub.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div style={{ minWidth: '130px' }}>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Cards list */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon="📒"
          title="No observations found"
          description={records.length === 0 ? "You haven't recorded any practice observations yet. Start a practice lab to write notes!" : "No results match your search filter."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredRecords.map(r => (
            <PracticeRecordCard
              key={r.id}
              record={r}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
