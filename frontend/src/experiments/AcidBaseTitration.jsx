import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, ReferenceLine
} from 'recharts';

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

function calcPH(volNaOH) {
  // Sigmoid titration curve: HCl 25mL 0.1M vs NaOH 0.1M
  return 7 + 3 * Math.tanh((volNaOH - 25) / 2);
}

function getFlaskColor(pH) {
  if (pH < 4) return '#ef4444';
  if (pH < 6) return '#f97316';
  if (pH < 6.8) return '#eab308';
  if (pH < 7.2) return '#22c55e';
  if (pH < 9) return '#14b8a6';
  if (pH < 11) return '#6366f1';
  return '#7c3aed';
}

function getPHLabel(pH) {
  if (pH < 4) return { text: 'Strong Acid', color: '#f87171' };
  if (pH < 7) return { text: 'Weak Acid', color: '#fb923c' };
  if (pH === 7 || (pH > 6.9 && pH < 7.1)) return { text: 'Neutral (Equivalence Point)', color: '#4ade80' };
  if (pH < 10) return { text: 'Weak Base', color: '#67e8f9' };
  return { text: 'Strong Base', color: '#a78bfa' };
}

const sliderStyle = { width: '100%', accentColor: '#10b981', cursor: 'pointer' };

export default function AcidBaseTitration({ onProgressUpdate, experimentData, onSimulationData }) {
  const [naohAdded, setNaohAdded] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [readings, setReadings] = useState([{ volume: 0, pH: parseFloat(calcPH(0).toFixed(2)) }]);
  const [trials, setTrials] = useState([]);
  const [progressSteps, setProgressSteps] = useState(new Set());

  const intervalRef = useRef(null);

  const currentPH = parseFloat(calcPH(naohAdded).toFixed(2));
  const flaskColor = getFlaskColor(currentPH);
  const phLabel = getPHLabel(currentPH);
  const equivalenceReached = naohAdded >= 24.5 && naohAdded <= 25.5;

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  const drip = useCallback(() => {
    setNaohAdded(prev => {
      if (prev >= 50) { setIsRunning(false); return prev; }
      const next = parseFloat((prev + 0.5).toFixed(1));
      const pH = parseFloat(calcPH(next).toFixed(2));
      setReadings(r => [...r, { volume: next, pH }]);
      markStep(1);
      return next;
    });
  }, [markStep]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(drip, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, drip]);

  const handleReset = () => {
    setIsRunning(false);
    setNaohAdded(0);
    setReadings([{ volume: 0, pH: parseFloat(calcPH(0).toFixed(2)) }]);
    clearInterval(intervalRef.current);
  };

  const handleRecord = () => {
    const newTrial = {
      id: trials.length + 1,
      naohVol: naohAdded,
      pH: currentPH,
      status: phLabel.text,
    };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(2);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Acid Solution': 'HCl (25 mL, 0.1 M)', 'Base Solution': 'NaOH (0.1 M)', 'Volume NaOH Added': `${naohAdded} mL` },
        results: { 'Solution pH': `${currentPH}`, 'Solution Classification': phLabel.text },
        trials: updatedTrials
      });
    }
  };

  // SVG Dimensions
  const svgW = 340, svgH = 340;
  const buretteX = 80, buretteY = 20;
  const buretteW = 30, buretteH = 180;
  const flaskCX = 160, flaskCY = 270;

  // Burette fill level (NaOH remaining)
  const fillRatio = 1 - naohAdded / 50;
  const burFillH = buretteH * fillRatio;

  // pH indicator
  const pHBarWidth = 200;
  const pHPos = (currentPH / 14) * pHBarWidth;

  // Dropper position animation
  const dropY = naohAdded > 0 ? 215 : 210;

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
          🧪 Acid-Base Titration
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          HCl (25mL, 0.1M) + NaOH (0.1M) → NaCl + H₂O
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* SVG Simulation */}
        <div style={glassPanel}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>⚗️ Titration Setup</h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            <defs>
              <linearGradient id="naohGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={flaskColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor={flaskColor} stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow2">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Burette stand */}
            <rect x={buretteX - 2} y={buretteY} width={4} height={buretteH + 60} fill="#374151" />
            <rect x={buretteX - 40} y={buretteY + buretteH + 60} width={80} height={6} rx={2} fill="#374151" />

            {/* Burette body */}
            <rect x={buretteX + 10} y={buretteY} width={buretteW} height={buretteH} rx={3}
              fill="rgba(100,116,139,0.2)" stroke="#94a3b8" strokeWidth={1.5} />
            {/* NaOH fill */}
            <rect x={buretteX + 11} y={buretteY + buretteH * fillRatio} width={buretteW - 2} height={burFillH - 1} rx={2}
              fill="url(#naohGrad)" opacity={0.85} />
            {/* Graduation marks */}
            {[0.2, 0.4, 0.6, 0.8].map(f => (
              <line key={f} x1={buretteX + 10} y1={buretteY + f * buretteH} x2={buretteX + 24} y2={buretteY + f * buretteH}
                stroke="#94a3b8" strokeWidth={1} />
            ))}
            <text x={buretteX + 8} y={buretteY - 6} fill="#8b5cf6" fontSize={11} textAnchor="middle">NaOH</text>
            <text x={buretteX + 25} y={buretteY + buretteH + 10} fill="#94a3b8" fontSize={10} textAnchor="middle">{naohAdded}mL</text>

            {/* Burette tip */}
            <line x1={buretteX + 25} y1={buretteY + buretteH} x2={buretteX + 25} y2={buretteY + buretteH + 30}
              stroke="#94a3b8" strokeWidth={2} />

            {/* Drop animation */}
            {isRunning && (
              <circle cx={buretteX + 25} cy={buretteY + buretteH + 32} r={4}
                fill="#8b5cf6" opacity={0.8}
                style={{ animation: 'drop 0.5s ease-in infinite' }} />
            )}

            {/* Conical Flask */}
            <polygon points={`${flaskCX - 25},${flaskCY - 55} ${flaskCX + 25},${flaskCY - 55} ${flaskCX + 55},${flaskCY + 30} ${flaskCX - 55},${flaskCY + 30}`}
              fill="url(#flaskGrad)" stroke="#94a3b8" strokeWidth={1.5} />
            {/* Flask neck */}
            <rect x={flaskCX - 10} y={flaskCY - 75} width={20} height={22} rx={2}
              fill={flaskColor} opacity={0.4} stroke="#94a3b8" strokeWidth={1} />

            {/* pH meter */}
            <rect x={230} y={210} width={80} height={50} rx={6} fill="rgba(15,22,45,0.95)" stroke="#06b6d4" strokeWidth={1.5} />
            <text x={270} y={228} textAnchor="middle" fill="#64748b" fontSize={9}>pH METER</text>
            <text x={270} y={250} textAnchor="middle" fill={flaskColor} fontSize={18} fontFamily="monospace" fontWeight="bold"
              filter="url(#glow2)">{currentPH.toFixed(1)}</text>

            {/* pH bar at bottom */}
            <defs>
              <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="75%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <rect x={70} y={svgH - 24} width={pHBarWidth} height={12} rx={6} fill="url(#phGrad)" />
            <circle cx={70 + pHPos} cy={svgH - 18} r={7} fill="white" stroke="#1e293b" strokeWidth={1.5} />
            <text x={70} y={svgH - 4} fill="#64748b" fontSize={9}>pH 0</text>
            <text x={70 + pHBarWidth / 2} y={svgH - 4} textAnchor="middle" fill="#64748b" fontSize={9}>7</text>
            <text x={70 + pHBarWidth} y={svgH - 4} textAnchor="end" fill="#64748b" fontSize={9}>14</text>
          </svg>
          <style>{`@keyframes drop { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(20px);opacity:0} }`}</style>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>🎛️ Controls</h3>

          {/* pH display */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '3rem', fontFamily: 'monospace', fontWeight: 700, color: flaskColor, textShadow: `0 0 20px ${flaskColor}88`, lineHeight: 1 }}>
              {currentPH.toFixed(2)}
            </div>
            <div style={{ color: phLabel.color, fontSize: '0.85rem', marginTop: '4px' }}>{phLabel.text}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>NaOH Added: <span style={{ color: '#8b5cf6', fontFamily: 'monospace' }}>{naohAdded} mL</span></div>
          </div>

          {equivalenceReached && (
            <div style={{ padding: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '14px', textAlign: 'center', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              ✅ Equivalence Point Reached! (25 mL)
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <button onClick={drip} disabled={naohAdded >= 50}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.15)', color: '#34d399', cursor: naohAdded >= 50 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              💧 Drip (+0.5mL)
            </button>
            <button onClick={() => setIsRunning(p => !p)} disabled={naohAdded >= 50}
              style={{ padding: '11px', borderRadius: '8px', border: `1px solid ${isRunning ? '#ef4444' : '#8b5cf6'}`, background: `rgba(${isRunning ? '239,68,68' : '139,92,246'},0.15)`, color: isRunning ? '#f87171' : '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>
              {isRunning ? '⏹ Stop' : '▶ Auto'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <button onClick={handleReset} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71,85,105,0.15)', color: '#94a3b8', cursor: 'pointer' }}>
              🔄 Reset
            </button>
            <button onClick={handleRecord} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}>
              📋 Record
            </button>
          </div>

          {/* Readings mini table */}
          <div style={{ maxHeight: '160px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '6px' }}>Live Readings (scroll)</div>
            {readings.slice(-8).reverse().map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                <span style={{ color: '#8b5cf6', fontFamily: 'monospace' }}>{r.volume.toFixed(1)} mL</span>
                <span style={{ color: getFlaskColor(r.pH), fontFamily: 'monospace' }}>pH {r.pH}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Titration Curve */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 Titration Curve — pH vs Volume of NaOH
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={readings} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="volume" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
              <Label value="Volume NaOH (mL)" position="bottom" fill="#64748b" fontSize={12} />
            </XAxis>
            <YAxis domain={[0, 14]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
              <Label value="pH" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
            </YAxis>
            <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
              formatter={(v) => [v.toFixed(2), 'pH']} />
            <ReferenceLine x={25} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'EP 25mL', fill: '#f87171', fontSize: 11 }} />
            <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'pH 7', fill: '#4ade80', fontSize: 11 }} />
            <Line type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2.5}
              dot={false} activeDot={{ r: 5, fill: '#a78bfa' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trials + Calculation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Recorded Readings</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(139,92,246,0.12)' }}>
                  {['#', 'NaOH (mL)', 'pH', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#c4b5fd', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trials.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#475569' }}>Click "Record" to save observations.</td></tr>
                ) : trials.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{t.id}</td>
                    <td style={{ padding: '8px 12px', color: '#8b5cf6', fontFamily: 'monospace' }}>{t.naohVol}</td>
                    <td style={{ padding: '8px 12px', color: getFlaskColor(t.pH), fontFamily: 'monospace' }}>{t.pH}</td>
                    <td style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '0.8rem' }}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={glassPanel}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🔢 Calculation</h3>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7 }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>At equivalence point:</span><br />
              M<sub>acid</sub> × V<sub>acid</sub> = M<sub>base</sub> × V<sub>base</sub>
            </div>
            <div style={{ padding: '10px', background: 'rgba(16,185,129,0.08)', borderRadius: '6px', fontFamily: 'monospace', color: '#34d399', fontSize: '0.82rem' }}>
              0.1M × 25mL = 0.1M × 25mL<br />
              ✓ Verified at pH = 7
            </div>
            {equivalenceReached && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16,185,129,0.12)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', color: '#4ade80', fontSize: '0.8rem' }}>
                🎉 Equivalence point detected at {naohAdded} mL NaOH, pH = {currentPH.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
