import React, { useState, useEffect, useRef } from 'react';

export default function DualInputControl({
  label,
  symbol,
  value,
  defaultValue,
  min,
  max,
  step,
  unit,
  onChange,
  color = '#10b981',
  presets = []
}) {
  const decimals = step.toString().split('.')[1]?.length || 0;
  const [typedValue, setTypedValue] = useState(value.toFixed(decimals));
  const [isLocked, setIsLocked] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [highlightActive, setHighlightActive] = useState(false);
  const validationTimeoutRef = useRef(null);

  // Sync typed value with external updates
  useEffect(() => {
    setTypedValue(value.toFixed(decimals));
    
    // Trigger brief visual highlight on change
    setHighlightActive(true);
    const t = setTimeout(() => setHighlightActive(false), 250);
    return () => clearTimeout(t);
  }, [value, decimals]);

  // Helper for displaying temporary validation warnings
  const triggerValidation = () => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    setValidationMessage('Value adjusted to nearest valid value.');
    validationTimeoutRef.current = setTimeout(() => {
      setValidationMessage('');
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleSliderChange = (e) => {
    if (isLocked) return;
    const val = Number(e.target.value);
    onChange(val);
    setTypedValue(val.toFixed(decimals));
    setValidationMessage('');
  };

  const handleTextChange = (e) => {
    if (isLocked) return;
    let inputStr = e.target.value;

    // Allow empty or negative sign (for typing support)
    if (inputStr === '' || (min < 0 && inputStr === '-')) {
      setTypedValue(inputStr);
      return;
    }

    // Filter invalid characters
    if (min >= 0) {
      inputStr = inputStr.replace(/[^0-9.]/g, '');
    } else {
      inputStr = inputStr.replace(/[^0-9.-]/g, '');
    }

    // Block multiple decimal points
    const dotIndex = inputStr.indexOf('.');
    if (dotIndex !== -1) {
      inputStr = inputStr.slice(0, dotIndex + 1) + inputStr.slice(dotIndex + 1).replace(/\./g, '');
    }

    setTypedValue(inputStr);

    const val = parseFloat(inputStr);
    if (!isNaN(val)) {
      if (val > max) {
        const clamped = max;
        setTypedValue(clamped.toFixed(decimals));
        onChange(clamped);
        triggerValidation();
      } else if (val >= min) {
        // Propagate exact typed value to update simulation immediately
        onChange(val);
      }
    }
  };

  const commitValue = () => {
    if (isLocked) return;
    let val = parseFloat(typedValue);
    let adjusted = false;

    if (isNaN(val)) {
      val = defaultValue;
      adjusted = true;
    }

    let clamped = val;
    if (val > max) {
      clamped = max;
      adjusted = true;
    } else if (val < min) {
      clamped = min;
      adjusted = true;
    }

    // Align to step multiple
    const stepCount = Math.round((clamped - min) / step);
    let stepped = min + stepCount * step;
    stepped = Number(stepped.toFixed(decimals));

    if (stepped > max) stepped = max;
    if (stepped < min) stepped = min;

    if (stepped !== val) {
      adjusted = true;
    }

    setTypedValue(stepped.toFixed(decimals));
    onChange(stepped);

    if (adjusted) {
      triggerValidation();
    }
  };

  const handleBlur = () => {
    commitValue();
  };

  const handleKeyDown = (e) => {
    if (isLocked) return;
    if (e.key === 'Enter') {
      commitValue();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const adjustStep = e.shiftKey ? step * 10 : step;
      let newVal = value + adjustStep;
      if (newVal > max) newVal = max;
      const stepped = Number((Math.round((newVal - min) / step) * step + min).toFixed(decimals));
      const finalVal = Math.min(stepped, max);
      onChange(finalVal);
      setTypedValue(finalVal.toFixed(decimals));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const adjustStep = e.shiftKey ? step * 10 : step;
      let newVal = value - adjustStep;
      if (newVal < min) newVal = min;
      const stepped = Number((Math.round((newVal - min) / step) * step + min).toFixed(decimals));
      const finalVal = Math.max(stepped, min);
      onChange(finalVal);
      setTypedValue(finalVal.toFixed(decimals));
    }
  };

  const handleWheel = (e) => {
    if (isLocked || document.activeElement !== e.target) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const adjustStep = e.shiftKey ? step * 10 : step;
    let newVal = value + direction * adjustStep;

    if (newVal > max) newVal = max;
    if (newVal < min) newVal = min;

    const stepped = Number((Math.round((newVal - min) / step) * step + min).toFixed(decimals));
    const finalVal = Math.min(Math.max(stepped, min), max);
    onChange(finalVal);
    setTypedValue(finalVal.toFixed(decimals));
  };

  const handleReset = () => {
    if (isLocked) return;
    onChange(defaultValue);
    setTypedValue(defaultValue.toFixed(decimals));
    setValidationMessage('');
  };

  const toggleLock = () => {
    setIsLocked(prev => !prev);
  };

  const handlePresetClick = (presetVal) => {
    if (isLocked) return;
    onChange(presetVal);
    setTypedValue(presetVal.toFixed(decimals));
    setValidationMessage('');
  };

  // Tooltip Styles
  const tooltipTriggerStyle = {
    position: 'relative',
    cursor: 'help',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    fontSize: '0.7rem',
    marginLeft: '6px',
    verticalAlign: 'middle',
    color: '#94a3b8',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      {/* Label and Badge Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0' }}>
            {label} {symbol ? `(${symbol})` : ''}
          </span>
          <span className="info-tooltip-container" style={tooltipTriggerStyle}>
            ⓘ
            <span className="info-tooltip-content" style={{
              visibility: 'hidden',
              opacity: 0,
              position: 'absolute',
              bottom: '135%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#f8fafc',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              transition: 'opacity 0.2s, visibility 0.2s',
              textAlign: 'left',
              lineHeight: 1.4,
              fontWeight: 'normal',
            }}>
              <div><strong>Min:</strong> {min} {unit}</div>
              <div><strong>Max:</strong> {max} {unit}</div>
              <div><strong>Step:</strong> {step} {unit}</div>
              <div><strong>Default:</strong> {defaultValue} {unit}</div>
            </span>
          </span>
          
          {/* Injecting Hover CSS */}
          <style>{`
            .info-tooltip-container:hover .info-tooltip-content {
              visibility: visible !important;
              opacity: 1 !important;
            }
          `}</style>
        </div>

        {/* Current Value Badge */}
        <span style={{
          background: `${color}15`,
          border: `1px solid ${color}33`,
          color: color,
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600,
          fontFamily: 'monospace'
        }}>
          {value.toFixed(decimals)} {unit}
        </span>
      </div>

      {/* Slider and Input Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={isNaN(parseFloat(typedValue)) ? value : parseFloat(typedValue)}
          onChange={handleSliderChange}
          disabled={isLocked}
          style={{
            flexGrow: 1,
            minWidth: 0,
            accentColor: color,
            cursor: isLocked ? 'not-allowed' : 'pointer',
            opacity: isLocked ? 0.4 : 1,
          }}
        />

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Numeric Input */}
          <input
            type="text"
            value={typedValue}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            readOnly={isLocked}
            style={{
              width: '72px',
              padding: '6px 4px',
              borderRadius: '6px',
              border: highlightActive ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              textAlign: 'center',
              outline: 'none',
              boxShadow: highlightActive ? `0 0 8px ${color}66` : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              opacity: isLocked ? 0.6 : 1,
              cursor: isLocked ? 'not-allowed' : 'text',
            }}
          />

          {/* Unit Label */}
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', width: '24px' }}>{unit}</span>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={isLocked}
            title="Reset to Default"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              color: isLocked ? '#475569' : '#e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!isLocked) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { if (!isLocked) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            ↺
          </button>

          {/* Lock Button */}
          <button
            onClick={toggleLock}
            title={isLocked ? 'Unlock Parameter' : 'Lock Parameter'}
            style={{
              background: isLocked ? `${color}22` : 'rgba(255,255,255,0.05)',
              border: isLocked ? `1px solid ${color}44` : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isLocked ? color : '#e2e8f0',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isLocked ? `${color}33` : 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isLocked ? `${color}22` : 'rgba(255,255,255,0.05)'; }}
          >
            {isLocked ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      {/* Validation Message / Info text */}
      <div style={{ height: '14px', fontSize: '0.74rem', lineHeight: '14px' }}>
        {validationMessage ? (
          <span style={{ color: '#f87171', fontWeight: 500 }}>⚠️ {validationMessage}</span>
        ) : (
          <span style={{ color: '#64748b' }}>
            Range: {min} – {max} {unit} | Step: {step} {unit}
          </span>
        )}
      </div>

      {/* Presets chips */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
          {presets.map((presetVal) => {
            const isActive = Number(value.toFixed(decimals)) === Number(presetVal.toFixed(decimals));
            return (
              <button
                key={presetVal}
                disabled={isLocked || isActive}
                onClick={() => handlePresetClick(presetVal)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: isLocked || isActive ? 'not-allowed' : 'pointer',
                  border: isActive ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? `${color}25` : 'rgba(255,255,255,0.03)',
                  color: isActive ? color : isLocked ? '#475569' : '#94a3b8',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isLocked && !isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={e => {
                  if (!isLocked && !isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {presetVal}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
