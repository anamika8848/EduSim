import React, { useState, useEffect, useRef, useCallback } from 'react';
import DualInputControl from '../components/ui/DualInputControl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, Legend
} from 'recharts';

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

const digitalDisplay = (color = '#00ffcc') => ({
  fontFamily: 'monospace',
  fontSize: '1.5rem',
  color,
  textShadow: `0 0 10px ${color}88`,
  background: 'rgba(0,0,0,0.4)',
  borderRadius: '8px',
  padding: '8px 16px',
  display: 'inline-block',
  minWidth: '100px',
  textAlign: 'center',
  letterSpacing: '0.05em',
});

const sliderStyle = { width: '100%', accentColor: '#3b82f6', cursor: 'pointer' };

export default function OhmsLaw({ onProgressUpdate, experimentData, onSimulationData }) {
  const [voltage, setVoltage] = useState(() => {
    const saved = sessionStorage.getItem('edusim_ohms_voltage');
    return saved !== null ? Number(saved) : 6;
  });
  const [resistance, setResistance] = useState(() => {
    const saved = sessionStorage.getItem('edusim_ohms_resistance');
    return saved !== null ? Number(saved) : 30;
  });
  const [trials, setTrials] = useState([]);
  const [dashOffset, setDashOffset] = useState(0);
  const [progressSteps, setProgressSteps] = useState(new Set());

  useEffect(() => {
    sessionStorage.setItem('edusim_ohms_voltage', voltage);
  }, [voltage]);

  useEffect(() => {
    sessionStorage.setItem('edusim_ohms_resistance', resistance);
  }, [resistance]);

  const animRef = useRef(null);

  const current = parseFloat((voltage / resistance).toFixed(4));
  const power = parseFloat((voltage * current).toFixed(4));

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  // Animate current flow
  useEffect(() => {
    let offset = 0;
    const speed = Math.max(0.5, current * 4);
    const tick = () => {
      offset = (offset - speed + 400) % 400;
      setDashOffset(offset);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [current]);

  const handleRecord = () => {
    const newTrial = { id: trials.length + 1, voltage, resistance, current, power };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(1);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Voltage (V)': `${voltage} V`, 'Resistance (R)': `${resistance} Ω` },
        results: { 'Electric Current (I)': `${current} A`, 'Power Dissipated (P)': `${power} W` },
        trials: updatedTrials
      });
    }
  };

  // SVG Circuit
  const W = 440, H = 200;
  // Circuit path: left battery -> top wire -> resistor -> top wire -> right -> bottom wire -> back
  // Rectangle circuit: corners at (60,40) (380,40) (380,160) (60,160)
  const circuitColor = '#06b6d4';
  const wireOpacity = Math.min(1, 0.3 + current * 0.15);
  const dashLen = 12;
  const gapLen = Math.max(4, 20 - current * 2);

  // Calculate R from trials using linear regression
  let calculatedR = null;
  if (trials.length >= 2) {
    const n = trials.length;
    const sumV = trials.reduce((a, t) => a + t.voltage, 0);
    const sumI = trials.reduce((a, t) => a + t.current, 0);
    const sumVI = trials.reduce((a, t) => a + t.voltage * t.current, 0);
    const sumI2 = trials.reduce((a, t) => a + t.current ** 2, 0);
    const slope = (n * sumVI - sumI * sumV) / (n * sumI2 - sumI * sumI);
    calculatedR = slope > 0 ? parseFloat(slope.toFixed(2)) : null;
  }

  const chartData = trials.map(t => ({ V: t.voltage, I: parseFloat(t.current.toFixed(4)) }));

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#06b6d4', margin: 0 }}>
          ⚡ Ohm's Law Experiment
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Verify V = IR — Relationship between Voltage, Current, and Resistance
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
        {/* Circuit SVG */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🔌 Circuit Diagram</h3>
          <svg width={W} height={H} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Wire path as animated dashes */}
            {/* Top wire left */}
            <line x1={80} y1={50} x2={160} y2={50} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />
            {/* Top wire right */}
            <line x1={280} y1={50} x2={370} y2={50} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />
            {/* Right wire */}
            <line x1={370} y1={50} x2={370} y2={150} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />
            {/* Bottom wire right */}
            <line x1={370} y1={150} x2={200} y2={150} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />
            {/* Bottom wire left */}
            <line x1={120} y1={150} x2={80} y2={150} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />
            {/* Left wire */}
            <line x1={80} y1={50} x2={80} y2={150} stroke={circuitColor} strokeWidth={3} strokeOpacity={wireOpacity}
              strokeDasharray={`${dashLen},${gapLen}`} strokeDashoffset={dashOffset} filter="url(#glow)" />

            {/* Battery (left vertical) */}
            <rect x={60} y={80} width={40} height={40} rx={5} fill="rgba(15,22,45,0.95)" stroke="#475569" strokeWidth={1.5} />
            <line x1={74} y1={88} x2={74} y2={112} stroke="#ef4444" strokeWidth={4} />
            <line x1={86} y1={93} x2={86} y2={107} stroke="#22c55e" strokeWidth={4} />
            <text x={80} y={136} textAnchor="middle" fill="#94a3b8" fontSize={10}>{voltage}V</text>
            <text x={80} y={146} textAnchor="middle" fill="#64748b" fontSize={9}>Battery</text>

            {/* Resistor (top middle) */}
            <rect x={160} y={36} width={120} height={28} rx={4} fill="rgba(15,22,45,0.95)" stroke="#f59e0b" strokeWidth={1.5} />
            {[0,1,2,3,4].map(i => (
              <line key={i} x1={168 + i * 22} y1={64} x2={168 + i * 22 + 11} y2={36} stroke="#f59e0b" strokeWidth={1.5} />
            ))}
            <text x={220} y={32} textAnchor="middle" fill="#f59e0b" fontSize={10}>{resistance}Ω</text>
            <text x={220} y={22} textAnchor="middle" fill="#64748b" fontSize={9}>Resistor</text>

            {/* Ammeter (right side) */}
            <circle cx={370} cy={100} r={18} fill="rgba(15,22,45,0.95)" stroke="#10b981" strokeWidth={1.5} />
            <text x={370} y={97} textAnchor="middle" fill="#10b981" fontSize={9} fontWeight="bold">A</text>
            <text x={370} y={107} textAnchor="middle" fill="#34d399" fontSize={8} fontFamily="monospace">{current.toFixed(3)}</text>

            {/* Voltmeter (bottom middle) */}
            <circle cx={245} cy={150} r={18} fill="rgba(15,22,45,0.95)" stroke="#8b5cf6" strokeWidth={1.5} />
            <text x={245} y={147} textAnchor="middle" fill="#8b5cf6" fontSize={9} fontWeight="bold">V</text>
            <text x={245} y={157} textAnchor="middle" fill="#a78bfa" fontSize={8} fontFamily="monospace">{voltage}</text>

            {/* Labels */}
            <text x={W / 2} y={H - 4} textAnchor="middle" fill="#475569" fontSize={10}>
              Current = {current.toFixed(4)} A | Power = {power.toFixed(4)} W
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>🎛️ Controls</h3>

          <DualInputControl
            label="Voltage"
            symbol="V"
            value={voltage}
            defaultValue={6}
            min={0}
            max={20}
            step={0.5}
            unit="V"
            color="#ef4444"
            presets={[2, 4, 6, 12, 20]}
            onChange={val => setVoltage(val)}
          />

          <DualInputControl
            label="Resistance"
            symbol="R"
            value={resistance}
            defaultValue={30}
            min={1}
            max={100}
            step={1}
            unit="Ω"
            color="#f59e0b"
            presets={[10, 20, 50, 100]}
            onChange={val => setResistance(val)}
          />

          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '6px' }}>CURRENT (A)</div>
            <div style={digitalDisplay('#06b6d4')}>{current.toFixed(4)}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '6px' }}>POWER (W)</div>
            <div style={digitalDisplay('#fbbf24')}>{power.toFixed(4)}</div>
          </div>

          <button onClick={handleRecord} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            📋 Record Reading
          </button>

          <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(6,182,212,0.08)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)', fontSize: '0.82rem' }}>
            <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Ohm's Law: V = IR</div>
            <div style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{voltage} = {current.toFixed(3)} × {resistance}</div>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(6,182,212,0.12)' }}>
                {['Trial #', 'Voltage (V)', 'Resistance (Ω)', 'Current (A)', 'Power (W)'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#67e8f9', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>No readings recorded. Adjust sliders and click "Record Reading".</td></tr>
              ) : trials.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', color: '#f87171', fontFamily: 'monospace' }}>{t.voltage}</td>
                  <td style={{ padding: '9px 14px', color: '#fbbf24', fontFamily: 'monospace' }}>{t.resistance}</td>
                  <td style={{ padding: '9px 14px', color: '#06b6d4', fontFamily: 'monospace' }}>{t.current}</td>
                  <td style={{ padding: '9px 14px', color: '#a78bfa', fontFamily: 'monospace' }}>{t.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graph */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 V vs I Graph — Verifying Ohm's Law
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '14px' }}>
          Slope of V-I graph = Resistance (R). Expected R = {resistance} Ω
        </p>
        {chartData.length < 2 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Record at least 2 readings to see the V-I graph
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[...chartData].sort((a, b) => a.V - b.V)} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="V" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="Voltage (V)" position="bottom" fill="#64748b" fontSize={12} />
              </XAxis>
              <YAxis dataKey="I" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="Current (A)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
              </YAxis>
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(v) => [v.toFixed(4) + ' A', 'Current']} />
              <Line type="monotone" dataKey="I" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Calculation */}
      <div style={glassPanel}>
        <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🔢 Calculations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          {[
            { label: 'Set Resistance', value: `${resistance} Ω`, color: '#f59e0b' },
            { label: 'Calculated R (ΔV/ΔI)', value: calculatedR ? `${calculatedR} Ω` : 'Need ≥2 trials', color: '#10b981' },
            { label: 'Error', value: calculatedR ? `${Math.abs(((calculatedR - resistance) / resistance) * 100).toFixed(2)}%` : '—', color: '#60a5fa' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '6px' }}>{label}</div>
              <div style={{ color, fontFamily: 'monospace', fontSize: '1.1rem' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
