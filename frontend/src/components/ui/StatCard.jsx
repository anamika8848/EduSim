import { useEffect, useRef, useState } from 'react'

/**
 * StatCard
 *
 * A glassmorphism stat card with an animated gradient icon, optional trend indicator,
 * and a counter animation for the displayed value.
 *
 * Props:
 *  @param {string}   title    – Card label (e.g. "Total Students")
 *  @param {number|string} value – Main metric to display
 *  @param {string}   [subtitle] – Small text below the value
 *  @param {string}   icon     – Emoji or short text icon
 *  @param {[string, string]} gradient – Two CSS colour strings for the icon bg
 *  @param {number}   [trend]  – Percentage change (positive = green, negative = red)
 */
function StatCard({ title, value, subtitle, icon, gradient = ['#3b82f6', '#8b5cf6'], trend }) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const isNumeric    = !isNaN(numericValue)

  /* ── Counter animation ─────────────────────────────────────── */
  const rafRef = useRef(null)
  useEffect(() => {
    if (!isNumeric) return
    const duration = 800
    const start    = performance.now()
    const from     = 0

    const tick = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(from + (numericValue - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [numericValue, isNumeric])

  const shownValue = isNumeric ? displayValue : value

  /* ── Trend indicator ───────────────────────────────────────── */
  const trendPositive = trend > 0
  const trendColor    = trend === 0 ? 'var(--text-muted)' : trendPositive ? '#10b981' : '#ef4444'
  const trendArrow    = trend === 0 ? '→' : trendPositive ? '↑' : '↓'

  return (
    <div
      className="stat-card"
      style={{ userSelect: 'none' }}
    >
      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        {/* Icon */}
        <div
          style={{
            width:        '48px',
            height:       '48px',
            borderRadius: '14px',
            background:   `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            fontSize:     '1.4rem',
            boxShadow:    `0 4px 16px ${gradient[0]}40`,
            flexShrink:   0,
          }}
        >
          {icon}
        </div>

        {/* Trend badge */}
        {trend !== undefined && trend !== null && (
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '2px',
              padding:      '0.2rem 0.5rem',
              borderRadius: '999px',
              background:   trendPositive ? 'rgba(16,185,129,0.12)' : trend === 0 ? 'rgba(100,116,139,0.12)' : 'rgba(239,68,68,0.12)',
              color:        trendColor,
              border:       `1px solid ${trendPositive ? 'rgba(16,185,129,0.25)' : trend === 0 ? 'rgba(100,116,139,0.25)' : 'rgba(239,68,68,0.25)'}`,
              fontSize:     '0.72rem',
              fontWeight:   700,
            }}
          >
            <span>{trendArrow}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize:   '2rem',
          fontWeight: 800,
          color:      'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: '0.25rem',
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
        }}
      >
        {shownValue}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize:   '0.875rem',
          fontWeight: 600,
          color:      'var(--text-primary)',
          marginBottom: subtitle ? '0.2rem' : 0,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: '0.75rem',
            color:    'var(--text-muted)',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}

export default StatCard
