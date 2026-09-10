import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../utils/constants'

/* ── Animated particle background ───────────────────────────── */
function ParticleBackground() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.1,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        animation: 'spin-slow 25s linear infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        animation: 'spin-slow 35s linear infinite reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '20%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
      }} />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0
              ? 'rgba(59,130,246,0.7)'
              : p.id % 3 === 1
                ? 'rgba(139,92,246,0.7)'
                : 'rgba(6,182,212,0.7)',
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />
    </div>
  )
}

/* ── Register Modal ──────────────────────────────────────────── */
function RegisterModal({ isOpen, onClose, onSuccess }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const result = await register(form.fullName, form.email, form.password, form.role)
    setLoading(false)
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Registration failed.')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        animation: 'fade-in 0.2s ease-out both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'rgba(15,22,45,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slide-in-up 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{
              margin: 0, fontSize: '1.3rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Create Account</h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Join EduSim Virtual Laboratory
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '0.85rem',
          }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>👤</span>
              <input
                type="text"
                className="input-field"
                placeholder="Your full name"
                style={{ paddingLeft: '2.5rem' }}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>✉️</span>
              <input
                type="email"
                className="input-field"
                placeholder="your@email.com"
                style={{ paddingLeft: '2.5rem' }}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Min. 6 characters"
                style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                  color: 'var(--text-muted)',
                }}
              >{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              I am a...
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['STUDENT', 'TEACHER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: form.role === role ? '1px solid rgba(59,130,246,0.5)' : '1px solid var(--border-glass)',
                    background: form.role === role ? 'rgba(59,130,246,0.12)' : 'rgba(15,22,45,0.6)',
                    color: form.role === role ? '#3b82f6' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {role === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Teacher'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite',
                }} />
                Creating Account...
              </span>
            ) : '🚀 Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Main LoginPage ───────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, isAuthenticated, isTeacher, isStudent, loading, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if the current URL is /register to show register modal immediately
    if (window.location.pathname === '/register') {
      setShowRegister(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.success) {
      const user = result.user
      switch (user.role) {
        case 'ADMIN':
          navigate(ROUTES.ADMIN_DASHBOARD)
          break

        case 'TEACHER':
          navigate(ROUTES.TEACHER_DASHBOARD)
          break

        case 'STUDENT':
          navigate(ROUTES.STUDENT_DASHBOARD)
          break

        default:
          navigate(ROUTES.LOGIN)
      }
    } else {
      setError(result.error || 'Invalid credentials. Please try again.')
    }
  }

  const handleRegisterSuccess = () => {
    setShowRegister(false)
    toast.success('Registration successful! Please sign in.')
  }

  if (loading && localStorage.getItem('edusim_token')) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: 'var(--accent-blue)',
            borderRightColor: 'var(--accent-purple)',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
    }}>
      <ParticleBackground />

      {/* Back to Home Link */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault()
          navigate('/')
        }}
        style={{
          position: 'fixed',
          top: '32px',
          left: '32px',
          zIndex: 100,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#3b82f6'
          e.currentTarget.style.transform = 'translateX(-4px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        ← Back to Home
      </a>

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => {
          setShowRegister(false)
          if (window.location.pathname === '/register') {
            navigate('/login')
          }
        }}
        onSuccess={handleRegisterSuccess}
      />

      {/* Main Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '2.5rem', marginBottom: '0.5rem',
            filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))',
          }}>⚗️</div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, margin: 0,
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>EduSim</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            VIRTUAL LABORATORY SIMULATOR
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(15,22,45,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 0 60px rgba(59,130,246,0.1), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Card Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{
              fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem',
              background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Welcome Back</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your credentials to access EduSim
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              animation: 'slide-in-up 0.3s ease',
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block', marginBottom: '0.45rem',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '1rem', userSelect: 'none',
                }}>✉️</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  style={{ paddingLeft: '2.6rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{
                display: 'block', marginBottom: '0.45rem',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '1rem', userSelect: 'none',
                }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Your password"
                  style={{ paddingLeft: '2.6rem', paddingRight: '3rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
                    color: 'var(--text-muted)', padding: '0',
                    display: 'flex', alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                onClick={() => setRememberMe(!rememberMe)}
                style={{
                  width: '18px', height: '18px', borderRadius: '5px', cursor: 'pointer',
                  border: rememberMe ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                  background: rememberMe ? 'rgba(59,130,246,0.2)' : 'rgba(15,22,45,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: '#3b82f6', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {rememberMe && '✓'}
              </div>
              <label
                onClick={() => setRememberMe(!rememberMe)}
                style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || loading}
              style={{
                marginTop: '0.25rem',
                padding: '0.875rem 1.5rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin-slow 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing In...
                </span>
              ) : '🔑 Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '1.5rem 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>New to EduSim? </span>
            <button
              onClick={() => setShowRegister(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                textDecoration: 'underline',
              }}
            >
              Register Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
