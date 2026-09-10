import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { classroomService } from '../../services/classroomService'
import { announcementService } from '../../services/announcementService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

export default function TeacherClassrooms() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)

  // Classroom details states
  const [students, setStudents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Announcement modal states
  const [showAnnounceModal, setShowAnnounceModal] = useState(false)
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceContent, setAnnounceContent] = useState('')
  const [announcing, setAnnouncing] = useState(false)
  const [editAnnouncement, setEditAnnouncement] = useState(null)

  const fetchClasses = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await classroomService.getTeacherClasses(user.id)
      setClasses(res.data ?? [])
    } catch {
      toast.error('Failed to load classrooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [user?.id])

  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!newClassName.trim()) return
    try {
      await classroomService.create({
        className: newClassName,
        teacherId: user.id
      })
      toast.success(`Classroom "${newClassName}" created successfully!`)
      setNewClassName('')
      setShowCreate(false)
      fetchClasses()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create classroom.')
    }
  }

  const handleSelectClass = async (c) => {
    setSelectedClass(c)
    setStudents([])
    setAnnouncements([])
    setLoadingDetails(true)
    try {
      const [stuRes, annRes] = await Promise.all([
        classroomService.getStudents(c.id),
        announcementService.getByClassroom(c.id)
      ])
      setStudents(stuRes.data ?? [])
      setAnnouncements(annRes.data ?? [])
    } catch {
      toast.error('Failed to load classroom details.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCreateOrUpdateAnnouncement = async (e) => {
    e.preventDefault()
    if (!announceTitle.trim() || !announceContent.trim()) return
    setAnnouncing(true)
    try {
      if (editAnnouncement) {
        // Edit flow
        await announcementService.update(editAnnouncement.id, {
          title: announceTitle,
          content: announceContent
        })
        toast.success('Announcement updated successfully! 📢')
      } else {
        // Create flow
        await announcementService.create({
          classroomId: selectedClass.id,
          teacherId: user.id,
          title: announceTitle,
          content: announceContent
        })
        toast.success('Announcement published successfully! 📢')
      }
      setAnnounceTitle('')
      setAnnounceContent('')
      setEditAnnouncement(null)
      setShowAnnounceModal(false)
      // reload announcements
      const annRes = await announcementService.getByClassroom(selectedClass.id)
      setAnnouncements(annRes.data ?? [])
    } catch {
      toast.error(editAnnouncement ? 'Failed to update announcement.' : 'Failed to post announcement.')
    } finally {
      setAnnouncing(false)
    }
  }

  const handleEditClick = (ann) => {
    setEditAnnouncement(ann)
    setAnnounceTitle(ann.title)
    setAnnounceContent(ann.content)
    setShowAnnounceModal(true)
  }

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      await announcementService.delete(annId)
      toast.success('Announcement deleted successfully.')
      // reload announcements
      const annRes = await announcementService.getByClassroom(selectedClass.id)
      setAnnouncements(annRes.data ?? [])
    } catch {
      toast.error('Failed to delete announcement.')
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the classroom roster?')) return
    try {
      await classroomService.removeStudent(studentId)
      toast.success('Student removed from classroom.')
      // reload details
      handleSelectClass(selectedClass)
    } catch (err) {
      toast.error('Failed to remove student.')
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="page-enter">
      {/* Create Classroom Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="➕ Create New Classroom" size="md">
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Class Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Class 9-A, Class 10-B"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Class</button>
          </div>
        </form>
      </Modal>

      {/* Post/Edit Announcement Modal */}
      <Modal
        isOpen={showAnnounceModal}
        onClose={() => {
          setShowAnnounceModal(false)
          setEditAnnouncement(null)
          setAnnounceTitle('')
          setAnnounceContent('')
        }}
        title={editAnnouncement ? "✏️ Edit Announcement" : "📢 Write Announcement"}
        size="md"
      >
        <form onSubmit={handleCreateOrUpdateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Lab Exam Schedule, Assignment Due Tomorrow"
              value={announceTitle}
              onChange={e => setAnnounceTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Content</label>
            <textarea
              className="input-field"
              placeholder="Write announcement description here..."
              rows={4}
              value={announceContent}
              onChange={e => setAnnounceContent(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setShowAnnounceModal(false)
                setEditAnnouncement(null)
                setAnnounceTitle('')
                setAnnounceContent('')
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={announcing}>
              {announcing ? 'Saving...' : editAnnouncement ? 'Save Changes' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedClass ? '350px 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s' }}>
        {/* Left Side: Classrooms List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>🏫 My Classrooms</h2>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setShowCreate(true)}>
              ➕ New Class
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(3)].map((_, i) => <div key={i} style={{ height: '90px', borderRadius: '12px' }} className="skeleton" />)}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState icon="🏫" title="No Classrooms" description="Create a classroom to invite students." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {classes.map(c => {
                const isSelected = selectedClass?.id === c.id
                return (
                  <div
                    key={c.id}
                    className="glass-card"
                    style={{
                      padding: '1rem 1.25rem', cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--accent-blue)' : '3px solid transparent',
                      background: isSelected ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleSelectClass(c)}
                  >
                    <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.35rem' }}>{c.className}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Code: {c.classCode}</code>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🎓 {c.studentCount ?? 0} Students</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Classroom Details */}
        {selectedClass ? (
          <div className="glass-card" style={{ padding: '2rem' }}>
            {/* Class Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.25rem' }}>{selectedClass.className}</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Student Join Code: <strong style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{selectedClass.classCode}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={() => setShowAnnounceModal(true)}>
                  📢 Write Announcement
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                ⌛ Loading classroom details...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                {/* Students list */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>🎓 Enrolled Students ({students.length})</h3>
                  {students.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No students have joined this class yet. Share the code <strong>{selectedClass.classCode}</strong> to invite them!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {students.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
                            {s.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{s.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>

                          {/* Remove Student Button */}
                          <button
                            onClick={() => handleRemoveStudent(s.id)}
                            style={{
                              marginLeft: 'auto',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Announcements list */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>📢 Class Announcements ({announcements.length})</h3>
                  {announcements.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No announcements posted yet. Write one to notify your students!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                      {announcements.map(ann => (
                        <div key={ann.id} style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{ann.title}</h4>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{ann.content}</p>

                          {/* Announcement Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.35rem' }}>
                            <button
                              onClick={() => handleEditClick(ann)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-blue)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>|</span>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏫</span>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Select a Classroom</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: 0 }}>
              Select a classroom from the left side to invite students, view classroom roster, and post announcements.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
