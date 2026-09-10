import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminService.getUsers()
      setUsers(res.data ?? [])
    } catch {
      toast.error('Failed to load user accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await adminService.deleteUser(confirmTarget.id)
      toast.success(`User "${confirmTarget.fullName}" deleted successfully.`)
      setConfirmTarget(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete user.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const getRoleBadgeClass = (role) => {
    if (role === 'ADMIN') return 'badge-chemistry' // orange/yellow
    if (role === 'TEACHER') return 'badge-physics' // blue
    return 'badge-biology' // green
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.3rem',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>👥 User Management</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Monitor and manage teachers, students, and administrative users.
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
        borderRadius: '12px', marginBottom: '1.5rem'
      }}>
        <input
          type="search"
          placeholder="🔍 Search users by name or email..."
          className="input-field"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', flex: 1 }}
        />

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'TEACHER', 'STUDENT', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                background: roleFilter === role ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                color: roleFilter === role ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: `1px solid ${roleFilter === role ? 'rgba(59,130,246,0.3)' : 'var(--border-glass)'}`
              }}
            >
              {role === 'ALL' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {users.length} users
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
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete User Account?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{confirmTarget.fullName}</strong> ({confirmTarget.email})?
              This action is permanent and will delete all associated assignments, classrooms, and records.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-red)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            color: 'var(--text-muted)',
            fontSize: '1rem',
          }}
        >
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No Users Found" description="Try broadening your search criteria." />
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classroom</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {u.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        {u.fullName}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={getRoleBadgeClass(u.role)} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {u.className ? (
                        <span>🏫 {u.className} <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({u.classCode})</code></span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                          color: '#ef4444', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                        onClick={() => setConfirmTarget(u)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
