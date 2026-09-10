import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
        background: 'var(--bg-primary)', textAlign: 'center', padding: '2rem',
      }}
    >
      <div className="animate-float" style={{ fontSize: '5rem' }}>🔭</div>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, margin: 0,
        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.6 }}>
        The page you're looking for has drifted into deep space. Let's get you back on track.
      </p>
      <Link to={ROUTES.LOGIN} className="btn-primary">🏠 Go Home</Link>
    </div>
  )
}

export default NotFound
