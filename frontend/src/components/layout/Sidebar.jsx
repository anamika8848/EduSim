import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLES, ROUTES } from '../../utils/constants'

/* ── Navigation definitions ─────────────────────────────────── */
const TEACHER_NAV = [
  { to: ROUTES.TEACHER_DASHBOARD,   icon: '🏠', label: 'Dashboard'    },
  { to: ROUTES.TEACHER_CLASSROOMS,  icon: '🏫', label: 'Classrooms'   },
  { to: ROUTES.EXPERIMENTS,         icon: '⚗️', label: 'Experiments'  },
  { to: ROUTES.TEACHER_ASSIGNMENTS, icon: '📋', label: 'Assignments'  },
  { to: ROUTES.TEACHER_TESTS,       icon: '🧪', label: 'Laboratory Examination' },
  { to: ROUTES.TEACHER_STUDENTS,    icon: '👥', label: 'Students'     },
  { to: ROUTES.PROFILE,             icon: '👤', label: 'Profile'      },
]

const STUDENT_NAV = [
  { to: ROUTES.STUDENT_DASHBOARD,    icon: '🏠', label: 'Dashboard'      },
  { to: ROUTES.EXPERIMENTS,          icon: '⚗️', label: 'Experiments'    },
  { to: ROUTES.STUDENT_ASSIGNMENTS,  icon: '📋', label: 'My Assignments' },
  { to: ROUTES.STUDENT_TESTS,        icon: '🧪', label: 'Laboratory Examination' },
  { to: ROUTES.STUDENT_HISTORY,      icon: '📜', label: 'My Lab History' },
  { to: ROUTES.STUDENT_PRACTICE_NOTEBOOK, icon: '📒', label: 'Practice Notebook' },
  { to: ROUTES.PROFILE,              icon: '👤', label: 'Profile'        },
]

const ADMIN_NAV = [
  { to: ROUTES.ADMIN_DASHBOARD,     icon: '🏠', label: 'Admin Panel'   },
  { to: ROUTES.ADMIN_USERS,         icon: '👥', label: 'Manage Users'  },
  { to: ROUTES.ADMIN_CLASSES,       icon: '🏫', label: 'Manage Classes'},
  { to: ROUTES.ADMIN_ASSIGNMENTS,   icon: '📋', label: 'Assignments'   },
  { to: ROUTES.PROFILE,             icon: '👤', label: 'Profile'       },
]

/* ── Avatar helper ──────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

/* ── Role badge colours ─────────────────────────────────────── */
const ROLE_STYLE = {
  TEACHER: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: 'rgba(139,92,246,0.3)'  },
  STUDENT: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  ADMIN:   { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
}

/* ── Component ──────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === ROLES.ADMIN ? ADMIN_NAV : user?.role === ROLES.TEACHER ? TEACHER_NAV : STUDENT_NAV
  const roleStyle   = ROLE_STYLE[user?.role] ?? ROLE_STYLE.STUDENT
  const initials    = getInitials(user?.fullName)

  return (
    <aside
      style={{
        width:      collapsed ? '70px' : '260px',
        minWidth:   collapsed ? '70px' : '260px',
        maxWidth:   collapsed ? '70px' : '260px',
        position:   'fixed',
        top:        0,
        left:       0,
        height:     '100vh',
        background: 'var(--bg-secondary)',
        borderRight:'1px solid var(--border-glass)',
        display:    'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex:     50,
        overflow:   'hidden',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        style={{
          height:     '64px',
          display:    'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding:    collapsed ? '0' : '0 1rem',
          borderBottom: '1px solid var(--border-glass)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚗️</span>
            <span
              style={{
                fontWeight: 800,
                fontSize:   '1.1rem',
                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
                whiteSpace: 'nowrap',
              }}
            >
              EduSim
            </span>
          </div>
        )}
        {collapsed && (
          <span style={{ fontSize: '1.4rem' }}>⚗️</span>
        )}

        {/* Toggle button */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background:   'rgba(59,130,246,0.08)',
            border:       '1px solid rgba(59,130,246,0.2)',
            borderRadius: '8px',
            color:        'var(--text-secondary)',
            cursor:       'pointer',
            width:        '28px',
            height:       '28px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     '0.75rem',
            transition:   'all 0.2s',
            flexShrink:   0,
            ...(collapsed ? { position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)' } : {}),
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* ── Nav Items ────────────────────────────────────────── */}
      <nav
        style={{
          flex:       1,
          overflowY:  'auto',
          overflowX:  'hidden',
          padding:    '0.75rem 0.5rem',
          display:    'flex',
          flexDirection: 'column',
          gap:        '0.25rem',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              paddingLeft:    collapsed ? '0' : undefined,
              paddingRight:   collapsed ? '0' : undefined,
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info + Logout ────────────────────────────────── */}
      <div
        style={{
          borderTop:  '1px solid var(--border-glass)',
          padding:    collapsed ? '0.75rem 0' : '0.75rem',
          display:    'flex',
          flexDirection: 'column',
          gap:        '0.5rem',
          flexShrink: 0,
        }}
      >
        {/* User row */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {/* Avatar */}
          <div
            className="avatar"
            style={{
              width:    '36px',
              height:   '36px',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize:     '0.8rem',
                  fontWeight:   600,
                  color:        'var(--text-primary)',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.fullName ?? user?.email ?? 'User'}
              </div>
              <div
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  padding:      '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontSize:     '0.65rem',
                  fontWeight:   700,
                  letterSpacing:'0.04em',
                  textTransform:'uppercase',
                  marginTop:    '2px',
                  background:   roleStyle.bg,
                  color:        roleStyle.color,
                  border:       `1px solid ${roleStyle.border}`,
                }}
              >
                {user?.role ?? 'USER'}
              </div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          title="Logout"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap:            '0.5rem',
            padding:        collapsed ? '0.5rem' : '0.5rem 0.75rem',
            borderRadius:   '8px',
            border:         '1px solid rgba(239,68,68,0.2)',
            background:     'rgba(239,68,68,0.06)',
            color:          '#ef4444',
            fontSize:       '0.8rem',
            fontWeight:     600,
            cursor:         'pointer',
            transition:     'all 0.2s',
            width:          '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.14)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
