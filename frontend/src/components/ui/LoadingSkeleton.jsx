/**
 * LoadingSkeleton
 *
 * Flexible pulse skeleton loader.
 * Renders different skeleton layouts based on the `variant` prop.
 *
 * Props:
 *  @param {'card' | 'table' | 'list' | 'stat' | 'text'} [variant='card']
 *  @param {number} [count=3]   – Number of skeleton items to repeat
 *  @param {string} [className] – Additional CSS classes on the wrapper
 */
function LoadingSkeleton({ variant = 'card', count = 3, className = '' }) {
  const items = Array.from({ length: count })

  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {items.map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        className={className}
        style={{
          background:   'var(--bg-card)',
          borderRadius: '16px',
          border:       '1px solid var(--border-glass)',
          overflow:     'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display:    'flex',
            gap:        '1rem',
            padding:    '1rem 1.25rem',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          {[40, 25, 20, 15].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '14px', width: `${w}%`, borderRadius: '4px' }}
            />
          ))}
        </div>
        {/* Rows */}
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              display:    'flex',
              gap:        '1rem',
              padding:    '1rem 1.25rem',
              borderBottom: i < count - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              alignItems: 'center',
            }}
          >
            <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
            {[30, 20, 15, 10].map((w, j) => (
              <div
                key={j}
                className="skeleton"
                style={{ height: '13px', width: `${w}%`, borderRadius: '4px', flex: j === 0 ? 1 : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {items.map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="skeleton" style={{ height: '20px', width: '60%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%', borderRadius: '4px' }} />
      </div>
    )
  }

  // Default: card grid
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {items.map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/* ── Sub-skeletons ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      style={{
        background:   'var(--bg-card)',
        borderRadius: '16px',
        border:       '1px solid var(--border-glass)',
        padding:      '1.25rem',
        display:      'flex',
        flexDirection:'column',
        gap:          '0.75rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="skeleton" style={{ height: '14px', width: '55%', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '11px', width: '35%', borderRadius: '4px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: '12px', width: '100%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '12px', width: '75%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '34px', width: '100%', borderRadius: '8px', marginTop: '0.25rem' }} />
    </div>
  )
}

function SkeletonStatCard() {
  return (
    <div
      style={{
        background:   'var(--bg-card)',
        borderRadius: '16px',
        border:       '1px solid var(--border-glass)',
        padding:      '1.25rem',
        display:      'flex',
        flexDirection:'column',
        gap:          '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '14px' }} />
        <div className="skeleton" style={{ width: '55px', height: '24px', borderRadius: '999px' }} />
      </div>
      <div className="skeleton" style={{ height: '32px', width: '50%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '11px', width: '45%', borderRadius: '4px' }} />
    </div>
  )
}

function SkeletonListItem() {
  return (
    <div
      style={{
        background:   'var(--bg-card)',
        borderRadius: '12px',
        border:       '1px solid var(--border-glass)',
        padding:      '1rem 1.25rem',
        display:      'flex',
        alignItems:   'center',
        gap:          '1rem',
      }}
    >
      <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '11px', width: '65%', borderRadius: '4px' }} />
      </div>
      <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '999px' }} />
    </div>
  )
}

export default LoadingSkeleton
