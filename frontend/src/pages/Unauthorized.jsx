import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Unauthorized() {
  const { isTeacher } = useAuth()
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
        background: 'var(--bg-primary)', textAlign: 'center', padding: '2rem',
      }}
    >
      <div className="animate-float" style={{ fontSize: '4rem' }}>🚫</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.6 }}>
        You don't have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <button onClick={() => navigate(-1)} className="btn-secondary">← Go Back</button>
    </div>
  )
}

export default Unauthorized
