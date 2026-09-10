import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await adminService.getClassrooms()
      setClasses(res.data ?? [])
    } catch {
      toast.error('Failed to load classrooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await adminService.deleteClassroom(confirmTarget.id)
      toast.success(`Classroom "${confirmTarget.className}" deleted successfully.`)
      setConfirmTarget(null)
      fetchClasses()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete classroom.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = classes.filter(c => {
    const matchSearch = !search ||
      c.className?.toLowerCase().includes(search.toLowerCase()) ||
      c.classCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.fullName?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.3rem',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>🏫 Classroom Management</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Monitor and manage classrooms, join codes, and teacher assignments globally.
        </p>
      </div>

      {/* Filters row */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
        borderRadius: '12px', marginBottom: '1.5rem'
      }}>
        <input
          type="search"
          placeholder="🔍 Search classes by name, code, or teacher..."
          className="input-field"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '360px', flex: 1 }}
        />

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {classes.length} classrooms
        </span>
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Classroom?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{confirmTarget.className}</strong>?
              Deleting a class will clear classroom links for all enrolled students and delete all classroom assignments and announcements. This action is permanent.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-red)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classrooms List */}
      {loading ? (
        <EmptyState icon="🏫" title="Loading Classrooms..." description="Retrieving classrooms..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏫" title="No Classrooms Found" description="Try adjusting your search criteria." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{c.className}</h3>
                  <code style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
                    🔑 Code: {c.classCode}
                  </code>
                </div>
                <button
                  style={{
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
                  onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.06)'}
                  onClick={() => setConfirmTarget(c)}
                >
                  🗑️ Delete
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>
                  👤 Assigned Teacher: <strong style={{ color: 'var(--text-secondary)' }}>{c.teacher?.fullName}</strong>
                </div>
                <div>
                  ✉️ Teacher Email: <span style={{ fontStyle: 'italic' }}>{c.teacher?.email}</span>
                </div>
                <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>🎓 Enrolled Students:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-green)' }}>{c.students?.length ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
