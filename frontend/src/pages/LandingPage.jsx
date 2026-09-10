import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES, SUBJECT_COLORS, SUBJECT_GRADIENTS, EXPERIMENT_ICONS } from '../utils/constants'
import { experimentService } from '../services/experimentService'
import toast from 'react-hot-toast'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [experiments, setExperiments] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')

  useEffect(() => {
    // Load experiments for showcase
    experimentService.getAll()
      .then(res => setExperiments(res.data ?? []))
      .catch(err => console.warn('Could not load experiments for showcase', err))
  }, [])

  const handleStartLab = (expId) => {
    if (isAuthenticated) {
      navigate(`${ROUTES.EXPERIMENTS}/${expId}`)
    } else {
      toast.error('Please login to access virtual laboratories.')
      navigate(ROUTES.LOGIN)
    }
  }

  const filteredExperiments = experiments.filter(e => {
    if (activeTab === 'ALL') return true
    return e.subject === activeTab
  })

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'rgba(10,14,26,0.95)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span style={{ fontSize: '1.5rem' }}>⚗️</span>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>EduSim</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>About</a>
          <a href="#catalogue" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Virtual Labs</a>
          <a href="#teacher-features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Teacher Features</a>
          <a href="#student-features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Student Features</a>
          <a href="#benefits" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Benefits</a>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={() => navigate(ROUTES.LOGIN)}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)'
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Login
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate(ROUTES.REGISTER)}
              style={{
                padding: '0.5rem 1.25rem',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <header style={{
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(15, 22, 45, 0.3)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 1rem', borderRadius: '8px',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 700,
            textTransform: 'uppercase', marginBottom: '1.5rem'
          }}>
            🏫 School Virtual Laboratory System
          </div>
          <h1 style={{
            fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2,
            marginBottom: '1.25rem', color: '#fff'
          }}>
            EduSim: School Virtual Laboratory System
          </h1>
          <p style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 2.5rem'
          }}>
            A simple, practical virtual laboratory platform for schools. Facilitating physics, chemistry, and biology experiments through classroom assignments, observations, and structured teacher grading.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#catalogue" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Browse Experiment Catalogue 🧪
            </a>
            <button className="btn-secondary" onClick={() => navigate(ROUTES.LOGIN)} style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Access Account ➔
            </button>
          </div>
        </div>
      </header>

      {/* ── About EduSim ────────────────────────────────────── */}
      <section id="about" style={{ padding: '4.5rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ABOUT EDUSIM</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Virtual Science Education</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              EduSim bridges the gap between scientific theory and practical experiments. Our platform allows students to visualize complex concepts safely and repeatedly in a virtual classroom environment.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Aligned with core high school curricula, students can run simulations, adjust laboratory parameters, record observations, and draft conclusions in a structured report.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(10,14,26,0.6)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>🎮</span>
              <div>
                <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.9rem' }}>Interactive Simulations</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Adjust pendulum length, current voltage, initial velocity, and observe real-time calculations.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
              <div>
                <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.9rem' }}>Lab Report Templates</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Draft observations, results, and conclusions directly in the platform report editor.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>🏫</span>
              <div>
                <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.9rem' }}>Classroom Organization</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Keep track of homework assignments, deadlines, announcements, and teacher scores.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Available Virtual Labs ─────────────────────────── */}
      <section id="catalogue" style={{ padding: '4.5rem 2rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>EXPERIMENT SHOWCASE</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Available Virtual Laboratories</h2>
            </div>
            {/* Subject Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(10,14,26,0.6)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              {['ALL', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveTab(sub)}
                  style={{
                    padding: '0.35rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
                    background: activeTab === sub ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: activeTab === sub ? 'var(--accent-blue)' : 'var(--text-secondary)'
                  }}
                >
                  {sub === 'ALL' ? 'All Subjects' : sub.charAt(0) + sub.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredExperiments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              🔬 Loading virtual laboratory catalogue...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredExperiments.map(exp => (
                <div
                  key={exp.id}
                  className="glass-card"
                  onClick={() => handleStartLab(exp.id)}
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderTop: `3px solid ${SUBJECT_COLORS[exp.subject] ?? '#3b82f6'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                      background: `rgba(${exp.subject === 'PHYSICS' ? '59,130,246' : exp.subject === 'CHEMISTRY' ? '245,158,11' : '16,185,129'}, 0.15)`,
                      color: SUBJECT_COLORS[exp.subject] ?? '#fff'
                    }}>
                      {EXPERIMENT_ICONS[exp.subject] ?? '🔬'} {exp.subject}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⏱️ {exp.estimatedTime} min</span>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{exp.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4, minHeight: '40px' }}>{exp.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className={`badge-${exp.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{exp.difficulty}</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLab(exp.id);
                      }}
                    >
                      Start Lab 🧪
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Teacher Features ─────────────────────────────────── */}
      <section id="teacher-features" style={{ padding: '4.5rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ROLES & WORKFLOW</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Teacher Management Features</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏫</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Create Classrooms</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Create virtual classes and generate simple codes for your student rosters to sign up.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Assign Experiments</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Assign standard simulations to entire classrooms with specified due dates.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📢</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Publish Announcements</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Share instructions, schedules, and reminders directly on your student dashboards.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Review & Grade Reports</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Assess student-submitted observations, conclusions, assign scores, and leave feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Student Features ─────────────────────────────────── */}
      <section id="student-features" style={{ padding: '4.5rem 2rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ROLES & WORKFLOW</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Student Laboratory Features</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔑</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Join Classroom Code</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Join your class using a classroom code provided by your teacher to see homework.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚛️</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Run Simulations</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Interact with Physics, Chemistry, and Biology laboratories directly in your browser.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✍️</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Write Lab Reports</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Fill out observation notes, record data points, and draft conclusions for submissions.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📜</div>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>Review Lab History</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>Look back at graded assignments, scores, and teacher remarks on past submissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits of Virtual Labs ─────────────────────────── */}
      <section id="benefits" style={{ padding: '4.5rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>PRACTICAL VALUE</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Benefits of Virtual Labs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>🛡️ 100% Safe Classroom Science</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>Conduct experiments involving chemicals, gravity adjustments, or electrical circuits in a safe virtual environment.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>🔄 Infinite Repeatability</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>Students can restart and repeat labs as many times as needed to practice procedures and verify calculations.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>💻 Flexible Lab Access</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>Access high-school lab software from any device in the classroom or at home, eliminating chemical supply costs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{
        padding: '2.5rem 2rem', background: '#070a14',
        borderTop: '1px solid var(--border-glass)', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚗️</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>EduSim</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5, maxWidth: '500px', margin: '0 auto' }}>
            EduSim: School Virtual Laboratory System. Built with React and Spring Boot.
          </p>
          <div style={{ height: '1px', background: 'var(--border-glass)', margin: '1.25rem 0' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} EduSim Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
