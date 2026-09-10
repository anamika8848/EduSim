import { useEffect, useRef } from 'react'

/**
 * Modal
 *
 * Reusable dark glassmorphism modal dialog.
 *
 * Props:
 *  @param {boolean}  isOpen   – Controls visibility
 *  @param {Function} onClose  – Called when backdrop or X is clicked
 *  @param {string}   [title]  – Modal heading
 *  @param {React.ReactNode} children – Modal body content
 *  @param {'sm'|'md'|'lg'|'xl'} [size='md'] – Width preset
 *  @param {boolean} [closable=true] – Whether clicking backdrop closes the modal
 */
function Modal({ isOpen, onClose, title, children, size = 'md', closable = true }) {
  /* ── Trap focus & prevent body scroll ───────────────────────── */
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  /* ── Escape key to close ─────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen || !closable) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closable, onClose])

  /* ── Width map ───────────────────────────────────────────────── */
  const widthMap = { sm: '380px', md: '520px', lg: '680px', xl: '840px' }

  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      onClick={closable ? onClose : undefined}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         200,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '1rem',
        background:     'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation:      'fade-in 0.2s ease-out both',
      }}
    >
      {/* Panel */}
      <div
        role="document"
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        '100%',
          maxWidth:     widthMap[size] ?? widthMap.md,
          maxHeight:    '90vh',
          display:      'flex',
          flexDirection:'column',
          background:   'rgba(15, 22, 45, 0.92)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          border:       '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '20px',
          boxShadow:
            '0 0 60px rgba(59,130,246,0.15), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation:    'slide-in-up 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          overflow:     'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        {(title || closable) && (
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              justifyContent:'space-between',
              padding:      '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-glass)',
              flexShrink:   0,
            }}
          >
            {title ? (
              <h2
                style={{
                  margin:     0,
                  fontSize:   '1.05rem',
                  fontWeight: 700,
                  color:      'var(--text-primary)',
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor:  'transparent',
                  backgroundClip:       'text',
                }}
              >
                {title}
              </h2>
            ) : (
              <span />
            )}

            {closable && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  width:         '30px',
                  height:        '30px',
                  borderRadius:  '8px',
                  border:        '1px solid var(--border-glass)',
                  background:    'rgba(255,255,255,0.04)',
                  color:         'var(--text-muted)',
                  cursor:        'pointer',
                  fontSize:      '1rem',
                  lineHeight:    1,
                  transition:    'all 0.2s',
                  flexShrink:    0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
                  e.currentTarget.style.color = '#ef4444'
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.borderColor = 'var(--border-glass)'
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────── */}
        <div
          style={{
            flex:       1,
            overflowY:  'auto',
            padding:    '1.5rem',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
