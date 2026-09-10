import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './ui/Modal'
import { practiceObservationService } from '../services/practiceObservationService'

export default function PracticeObservationModal({ isOpen, onClose, simulationData, experiment }) {
  const [form, setForm] = useState({ observation: '', conclusion: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const parameters = simulationData?.parameters || {}
  const results = simulationData?.results || {}
  const trials = simulationData?.trials || []
  const timestamp = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const year = new Date().getFullYear()
  const draftId = `PRACTICE-${year}-XXXXXX (Assigned on save)`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.observation.trim()) {
      toast.error('Observation is required.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        experimentId: experiment?.id,
        experimentName: experiment?.name,
        subject: experiment?.subject,
        observation: form.observation,
        conclusion: form.conclusion,
        notes: form.notes,
        simulationParameters: JSON.stringify(parameters),
        simulationReadings: JSON.stringify({ results, trials })
      }
      await practiceObservationService.create(payload)
      toast.success('Observation saved in your Practice Notebook! 📒')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save practice observation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Record Practice Observation" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        {/* Experiment Metadata */}
        <div style={{
          padding: '0.875rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Experiment: </span>
            <strong style={{ color: '#fff' }}>{experiment?.name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
            <strong style={{ color: 'var(--accent-blue)' }}>{experiment?.subject}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Date & Time: </span>
            <span style={{ color: '#94a3b8' }}>{timestamp}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Practice ID: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{draftId}</span>
          </div>
        </div>

        {/* Simulation Summary */}
        <div style={{
          padding: '0.875rem',
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          fontSize: '0.82rem'
        }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Simulation Summary
          </h4>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '8px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Parameters Used:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(parameters).map(([k, v]) => (
                  <span key={k} style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {k}: {String(v)}
                  </span>
                ))}
                {Object.keys(parameters).length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>}
              </div>
            </div>
            
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Recorded Readings:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(results).map(([k, v]) => (
                  <span key={k} style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {k}: {String(v)}
                  </span>
                ))}
                {Object.keys(results).length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>}
              </div>
            </div>
            
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Trials Completed: </strong>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{trials.length} trial{trials.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Experimental Observation <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            className="input-field"
            rows={3}
            style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
            placeholder="Describe your observations during this practice run..."
            value={form.observation}
            onChange={(e) => setForm({ ...form, observation: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Conclusion (Optional)
          </label>
          <textarea
            className="input-field"
            rows={2}
            style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
            placeholder="Scientific conclusions derived from the observation..."
            value={form.conclusion}
            onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Personal Notes (Optional)
          </label>
          <textarea
            className="input-field"
            rows={2}
            style={{ resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
            placeholder="Add any extra comments, revision notes, or learning tips..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Observation'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
