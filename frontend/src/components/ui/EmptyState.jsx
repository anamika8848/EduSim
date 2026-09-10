/**
 * EmptyState
 *
 * Centred empty-state illustration card.
 *
 * Props:
 *  @param {string}   [icon='📭']     – Large emoji or SVG icon
 *  @param {string}   title           – Primary message
 *  @param {string}   [description]   – Secondary supporting text
 *  @param {{label: string, onClick: Function, variant?: 'primary'|'secondary'}} [action]
 */
function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '4rem 2rem',
        gap:            '1rem',
      }}
    >
      {/* Icon / illustration */}
      <div
        className="animate-float"
        style={{
          width:        '80px',
          height:       '80px',
          borderRadius: '50%',
          background:   'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
          border:       '1px solid rgba(59,130,246,0.2)',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'center',
          fontSize:     '2.2rem',
          marginBottom: '0.5rem',
          boxShadow:    '0 0 30px rgba(59,130,246,0.1)',
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize:   '1.125rem',
          fontWeight: 700,
          color:      'var(--text-primary)',
          margin:     0,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize:  '0.875rem',
            color:     'var(--text-muted)',
            maxWidth:  '360px',
            lineHeight: 1.6,
            margin:    0,
          }}
        >
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className={action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}
          style={{ marginTop: '0.5rem' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
