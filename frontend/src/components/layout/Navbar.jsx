import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../utils/constants'

/* ── Route → Page Title mapping ─────────────────────────────── */
const ROUTE_TITLES = {
  [ROUTES.TEACHER_DASHBOARD]:   { title: 'Teacher Dashboard',  icon: '🏠' },
  [ROUTES.TEACHER_ASSIGNMENTS]: { title: 'Manage Assignments', icon: '📋' },
  [ROUTES.TEACHER_STUDENTS]:    { title: 'Students',           icon: '👥' },
  [ROUTES.STUDENT_DASHBOARD]:   { title: 'My Dashboard',       icon: '🏠' },
  [ROUTES.STUDENT_ASSIGNMENTS]: { title: 'My Assignments',     icon: '📋' },
  [ROUTES.EXPERIMENTS]:         { title: 'Experiments',        icon: '⚗️'  },
  [ROUTES.PROFILE]:             { title: 'Profile',            icon: '👤' },
  [ROUTES.ADMIN_ASSIGNMENTS]:   { title: 'Manage Assignments', icon: '📋' },
}

/* ── Role badge colours (duplicated from Sidebar for isolation) */
const ROLE_STYLE = {
  TEACHER: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: 'rgba(139,92,246,0.3)'  },
  STUDENT: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  ADMIN:   { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
}

function Navbar({ onMenuToggle, sidebarCollapsed }) {
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()

  // Resolve page info – handle dynamic routes like /experiments/:id
  const pathKey = Object.keys(ROUTE_TITLES).find((key) =>
    location.pathname === key || location.pathname.startsWith(key + '/')
  )
  const pageInfo = ROUTE_TITLES[pathKey] ?? { title: 'EduSim', icon: '⚗️' }
  const roleStyle = ROLE_STYLE[user?.role] ?? ROLE_STYLE.STUDENT

  return (
    <header
      style={{
        position:   'fixed',
        top:        0,
        right:      0,
        left:       isAuthenticated ? (sidebarCollapsed ? '70px' : '260px') : '0px',
        height:     '64px',
        background: 'rgba(10, 14, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:    '0 1.5rem',
        zIndex:     40,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:  '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Left: Page title ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Hamburger (visible at all times if authenticated to allow toggling) */}
        {isAuthenticated && (
          <button
            onClick={onMenuToggle}
            title="Toggle sidebar"
            style={{
              background:   'rgba(59,130,246,0.08)',
              border:       '1px solid rgba(59,130,246,0.2)',
              borderRadius: '8px',
              color:        'var(--text-secondary)',
              cursor:       'pointer',
              width:        '34px',
              height:       '34px',
              display:      'flex',
              flexDirection:'column',
              alignItems:   'center',
              justifyContent:'center',
              gap:          '4px',
              transition:   'all 0.2s',
            }}
          >
            <span style={{ display:'block', width:'14px', height:'1.5px', background:'currentColor', borderRadius:'1px' }} />
            <span style={{ display:'block', width:'14px', height:'1.5px', background:'currentColor', borderRadius:'1px' }} />
            <span style={{ display:'block', width:'14px', height:'1.5px', background:'currentColor', borderRadius:'1px' }} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{pageInfo.icon}</span>
          <h1
            style={{
              fontSize:   '1rem',
              fontWeight: 700,
              color:      'var(--text-primary)',
              margin:     0,
            }}
          >
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* ── Right: Actions + User info ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {isAuthenticated ? (
          <>
            {/* Notifications bell */}
            <button
              title="Notifications"
              style={{
                background:   'rgba(255,255,255,0.04)',
                border:       '1px solid var(--border-glass)',
                borderRadius: '8px',
                color:        'var(--text-secondary)',
                cursor:       'pointer',
                width:        '36px',
                height:       '36px',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                fontSize:     '1rem',
                transition:   'all 0.2s',
                position:     'relative',
              }}
            >
              🔔
              {/* Notification dot */}
              <span
                style={{
                  position:     'absolute',
                  top:          '6px',
                  right:        '6px',
                  width:        '7px',
                  height:       '7px',
                  borderRadius: '50%',
                  background:   'var(--accent-blue)',
                  border:       '1.5px solid var(--bg-primary)',
                }}
              />
            </button>

            {/* Divider */}
            <div
              style={{
                width:      '1px',
                height:     '28px',
                background: 'var(--border-glass)',
              }}
            />

            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {/* Avatar circle */}
              <div
                className="avatar"
                style={{ width: '34px', height: '34px', fontSize: '0.7rem' }}
              >
                {getInitials(user?.fullName)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize:   '0.8rem',
                    fontWeight: 600,
                    color:      'var(--text-primary)',
                    lineHeight: 1.1,
                  }}
                >
                  {user?.fullName ?? user?.email ?? 'User'}
                </span>
                <span
                  style={{
                    display:      'inline-block',
                    padding:      '0.1rem 0.45rem',
                    borderRadius: '999px',
                    fontSize:     '0.6rem',
                    fontWeight:   700,
                    letterSpacing:'0.05em',
                    textTransform:'uppercase',
                    background:   roleStyle.bg,
                    color:        roleStyle.color,
                    border:       `1px solid ${roleStyle.border}`,
                    lineHeight:   1.4,
                  }}
                >
                  {user?.role ?? 'USER'}
                </span>
              </div>
            </div>

            {/* Logout icon button */}
            <button
              onClick={logout}
              title="Logout"
              style={{
                background:   'rgba(239,68,68,0.07)',
                border:       '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px',
                color:        '#ef4444',
                cursor:       'pointer',
                width:        '36px',
                height:       '36px',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                fontSize:     '1rem',
                transition:   'all 0.2s',
              }}
            >
              🚪
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="btn-primary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem',
              borderRadius: '8px',
            }}
          >
            🔑 Sign In
          </a>
        )}
      </div>
    </header>
  )
}

/* Helper: initials from full name */
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export default Navbar
