import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { experimentService } from '../../services/experimentService'
import { EXPERIMENT_ICONS, SUBJECT_COLORS } from '../../utils/constants'

/* ── Experiment Card ──────────────────────────────────────────── */
function ExperimentCard({ experiment }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const subject = experiment.subject ?? 'PHYSICS'
  const subjectClass = `badge-${subject.toLowerCase()}`
  const difficultyClass = `badge-${(experiment.difficulty ?? 'BEGINNER').toLowerCase()}`
  const colors = {
    PHYSICS:   ['#3b82f6', '#8b5cf6'],
    CHEMISTRY: ['#f59e0b', '#ef4444'],
    BIOLOGY:   ['#10b981', '#06b6d4'],
  }
  const [c1, c2] = colors[subject] ?? ['#3b82f6', '#8b5cf6']

  return (
    <div
      className="experiment-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/experiments/${experiment.id}`)}
      style={{
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hovered ? `0 0 40px ${c1}30, 0 20px 60px rgba(0,0,0,0.5)` : 'none',
        border: hovered ? `1px solid ${c1}4D` : '1px solid var(--border-glass)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
      }}
    >
      {/* Subject Color Top Strip */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${c1}, ${c2})`,
      }} />

      {/* Card content */}
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Subject + Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={subjectClass}>
            {EXPERIMENT_ICONS[subject]} {subject}
          </span>
          <span className={difficultyClass}>{experiment.difficulty}</span>
        </div>

        {/* Name */}
        <div>
          <h3 style={{
            margin: '0 0 0.4rem',
            fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.3,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {experiment.name}
          </h3>
          <p style={{
            margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {experiment.description ?? 'Explore this virtual laboratory experiment.'}
          </p>
        </div>

        {/* Estimated time */}
        {experiment.estimatedTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem' }}>⏱️</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Est. {experiment.estimatedTime} minutes
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button
          className="btn-primary"
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            boxShadow: `0 4px 15px ${c1}50`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/experiments/${experiment.id}`)
          }}
        >
          🚀 Explore Lab
        </button>
      </div>
    </div>
  )
}

/* ── Skeleton Card ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
      <div style={{ height: '4px' }} className="skeleton" />
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '70px', height: '20px', borderRadius: '999px' }} className="skeleton" />
          <div style={{ width: '60px', height: '20px', borderRadius: '999px' }} className="skeleton" />
        </div>
        <div>
          <div style={{ width: '80%', height: '22px', borderRadius: '6px', marginBottom: '0.5rem' }} className="skeleton" />
          <div style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '0.3rem' }} className="skeleton" />
          <div style={{ width: '70%', height: '14px', borderRadius: '4px' }} className="skeleton" />
        </div>
        <div style={{ width: '50%', height: '14px', borderRadius: '4px' }} className="skeleton" />
        <div style={{ width: '100%', height: '36px', borderRadius: '10px' }} className="skeleton" />
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [subjectFilter, setSubjectFilter] = useState('ALL')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await experimentService.getAll()
      setExperiments(res.data ?? [])
    } catch {
      setError('Failed to load experiments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  /* ── Client-side filter ─────────────────────────────────────── */
  const filtered = experiments.filter((exp) => {
    const matchesSubject = subjectFilter === 'ALL' || exp.subject === subjectFilter
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      exp.name?.toLowerCase().includes(q) ||
      exp.description?.toLowerCase().includes(q) ||
      exp.subject?.toLowerCase().includes(q)
    return matchesSubject && matchesSearch
  })

  const subjectTabs = [
    { key: 'ALL',       label: 'All Labs',  icon: '🔬' },
    { key: 'PHYSICS',   label: 'Physics',   icon: '⚛️' },
    { key: 'CHEMISTRY', label: 'Chemistry', icon: '🧪' },
    { key: 'BIOLOGY',   label: 'Biology',   icon: '🧬' },
  ]

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }} className="page-enter">

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.4))' }}>
          🔬
        </div>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Virtual Laboratory</h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Explore interactive experiments across Physics, Chemistry, and Biology
        </p>
      </div>

      {/* ── Search Bar ───────────────────────────────────────── */}
      <div style={{ maxWidth: '600px', margin: '0 auto 2rem', position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          fontSize: '1.1rem', userSelect: 'none',
        }}>🔍</span>
        <input
          type="text"
          className="input-field"
          placeholder="Search experiments by name, subject, or description..."
          style={{ paddingLeft: '2.75rem', fontSize: '0.9rem', borderRadius: '12px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
              color: 'var(--text-muted)',
            }}
          >✕</button>
        )}
      </div>

      {/* ── Subject Filter Tabs ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {subjectTabs.map((tab) => {
          const count = tab.key === 'ALL' ? experiments.length : experiments.filter(e => e.subject === tab.key).length
          const isActive = subjectFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setSubjectFilter(tab.key)}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '999px',
                border: isActive ? '1px solid rgba(59,130,246,0.5)' : '1px solid var(--border-glass)',
                background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(15,22,45,0.5)',
                color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                padding: '0.1rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem',
                background: isActive ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                color: isActive ? '#3b82f6' : 'var(--text-muted)',
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Count indicator */}
      {!loading && (
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Showing <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> experiment{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
          {subjectFilter !== 'ALL' && ` in ${subjectFilter}`}
        </p>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn-primary" onClick={fetchData}>🔄 Retry</button>
        </div>
      )}

      {/* ── Cards Grid ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center',
          borderRadius: '16px', border: '1px dashed var(--border-glass)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            {search ? 'No experiments match your search' : 'No experiments available'}
          </h3>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {search ? 'Try a different search term or clear filters.' : 'Experiments will appear here once added.'}
          </p>
          {(search || subjectFilter !== 'ALL') && (
            <button
              className="btn-secondary"
              onClick={() => { setSearch(''); setSubjectFilter('ALL') }}
            >🔄 Clear Filters</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      )}
    </div>
  )
}
