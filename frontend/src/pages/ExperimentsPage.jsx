import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { experimentService } from '../services/experimentService'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import { EXPERIMENT_ICONS, SUBJECT_COLORS, SUBJECTS, ROUTES } from '../utils/constants'

const SUBJECT_TABS = ['ALL', ...Object.values(SUBJECTS)]

function SubjectBadge({ subject }) {
  const cls = { PHYSICS: 'badge-physics', CHEMISTRY: 'badge-chemistry', BIOLOGY: 'badge-biology' }
  const icon = EXPERIMENT_ICONS[subject] ?? '🔬'
  return <span className={cls[subject] ?? 'badge-physics'}>{icon} {subject}</span>
}

function DifficultyBadge({ difficulty }) {
  const cls = { BEGINNER: 'badge-beginner', INTERMEDIATE: 'badge-intermediate', ADVANCED: 'badge-advanced' }
  return <span className={cls[difficulty] ?? 'badge-beginner'}>{difficulty}</span>
}

function ExperimentsPage() {
  const { isAuthenticated } = useAuth()
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('ALL')
  const [search, setSearch]           = useState('')
  const navigate = useNavigate()

  const handleLaunch = (expId) => {
    if (!isAuthenticated) {
      toast.error('Please login to access virtual laboratories.')
      navigate(ROUTES.LOGIN)
    } else {
      navigate(`${ROUTES.EXPERIMENTS}/${expId}`)
    }
  }

  useEffect(() => {
    experimentService.getAll()
      .then((r) => setExperiments(r.data ?? []))
      .catch(() => setExperiments([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = experiments.filter((e) => {
    const matchSubject = activeTab === 'ALL' || e.subject === activeTab
    const matchSearch  = !search || (e.title || e.name || '')?.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || '')?.toLowerCase().includes(search.toLowerCase())
    return matchSubject && matchSearch
  })

  if (loading) return <LoadingSkeleton variant="card" count={6} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Virtual Labs ⚗️</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Explore {experiments.length} interactive experiments
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Subject tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
          {SUBJECT_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                background: activeTab === tab ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
              }}>
              {EXPERIMENT_ICONS[tab] ?? ''} {tab === 'ALL' ? 'All Subjects' : tab}
            </button>
          ))}
        </div>
        <input type="search" placeholder="🔍  Search experiments…" className="input-field" value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: '280px', flex: 1 }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔬" title="No experiments found"
          description={search ? 'Try a different search term.' : 'No experiments available in this category.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((exp) => (
            <div key={exp.id} className="experiment-card" onClick={() => handleLaunch(exp.id)}>
              {/* Color bar */}
              <div style={{
                height: '4px',
                background: `linear-gradient(90deg, ${SUBJECT_COLORS[exp.subject] ?? '#3b82f6'}, transparent)`,
              }} />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ fontSize: '2rem' }}>{EXPERIMENT_ICONS[exp.subject] ?? '🔬'}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                    <SubjectBadge subject={exp.subject} />
                    {exp.difficulty && <DifficultyBadge difficulty={exp.difficulty} />}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.3 }}>
                    {exp.name || exp.title}
                  </div>
                  {exp.description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {exp.description}
                    </div>
                  )}
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.82rem' }}
                  onClick={(e) => { e.stopPropagation(); handleLaunch(exp.id) }}>
                  🚀 Launch Lab
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExperimentsPage
