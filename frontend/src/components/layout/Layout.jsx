import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useAuth } from '../../hooks/useAuth'

/**
 * Main application layout.
 * ┌─────────────────────────────────────────────┐
 * │  Sidebar (collapsible)  │  Navbar (top)      │
 * │                         ├───────────────────┤
 * │                         │  <Outlet /> (main)│
 * └─────────────────────────────────────────────┘
 */
function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isAuthenticated } = useAuth()

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  const sidebarWidth    = sidebarCollapsed ? 70  : 260
  const sidebarWidthPx  = `${sidebarWidth}px`

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Sidebar ──────────────────────────────────────────── */}
      {isAuthenticated && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      )}

      {/* ── Right-hand column (navbar + page content) ─────────── */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{
          marginLeft: isAuthenticated ? sidebarWidthPx : '0px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Top Navbar ─────────────────────────────────────── */}
        <Navbar onMenuToggle={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

        {/* ── Page Content ───────────────────────────────────── */}
        <main
          className="flex-1 overflow-auto"
          style={{
            paddingTop: '64px', // height of Navbar
            minHeight: '100vh',
            background:
              'radial-gradient(ellipse at top left, rgba(59,130,246,0.04) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at bottom right, rgba(139,92,246,0.04) 0%, transparent 50%), ' +
              'var(--bg-primary)',
          }}
        >
          <div className="p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
