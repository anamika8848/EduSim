import React, { useState, useEffect, useRef, useCallback } from 'react';
import DualInputControl from '../components/ui/DualInputControl';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, ReferenceLine
} from 'recharts';

const G = 9.8;

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

const digitalDisplay = {
  fontFamily: 'monospace',
  fontSize: '1.4rem',
  color: '#00ffaa',
  textShadow: '0 0 10px #00ffaa88',
  background: 'rgba(0,0,0,0.4)',
  borderRadius: '8px',
  padding: '6px 14px',
  display: 'inline-block',
  minWidth: '90px',
  textAlign: 'center',
};

const sliderStyle = {
  width: '100%',
  accentColor: '#3b82f6',
  cursor: 'pointer',
};

export default function SimplePendulum({ onProgressUpdate, experimentData, onSimulationData }) {
  const [length, setLength] = useState(() => {
    const saved = sessionStorage.getItem('edusim_pendulum_length');
    return saved !== null ? Number(saved) : 50;
  });
  const [angle, setAngle] = useState(() => {
    const saved = sessionStorage.getItem('edusim_pendulum_angle');
    return saved !== null ? Number(saved) : 15;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [oscillations, setOscillations] = useState(0);
  const [trials, setTrials] = useState([]);
  const [currentAngleRad, setCurrentAngleRad] = useState(0);
  const [progressSteps, setProgressSteps] = useState(new Set());

  useEffect(() => {
    sessionStorage.setItem('edusim_pendulum_length', length);
  }, [length]);

  useEffect(() => {
    sessionStorage.setItem('edusim_pendulum_angle', angle);
  }, [angle]);

  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastSignRef = useRef(1);
  const oscCountRef = useRef(0);
  const timeRef = useRef(0);

  const calcT = useCallback((l) => 2 * Math.PI * Math.sqrt(l / 100 / G), []);

  const T = calcT(length);

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  const animate = useCallback(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const period = calcT(length);
    const rad = (angle * Math.PI / 180) * Math.cos(2 * Math.PI * elapsed / period);
    setCurrentAngleRad(rad);
    timeRef.current = elapsed;
    setTime(parseFloat(elapsed.toFixed(2)));

    const currentSign = Math.sign(rad);
    if (currentSign !== 0 && lastSignRef.current !== 0 && currentSign !== lastSignRef.current) {
      oscCountRef.current += 0.5;
      setOscillations(parseFloat(oscCountRef.current.toFixed(1)));
    }
    if (currentSign !== 0) lastSignRef.current = currentSign;

    animRef.current = requestAnimationFrame(animate);
  }, [angle, length, calcT]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
      markStep(1);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isRunning, animate, markStep]);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setOscillations(0);
    setCurrentAngleRad(0);
    oscCountRef.current = 0;
    timeRef.current = 0;
    startTimeRef.current = null;
  };

  const handleFullReset = () => {
    handleReset();
    setLength(50);
    setAngle(15);
    sessionStorage.removeItem('edusim_pendulum_length');
    sessionStorage.removeItem('edusim_pendulum_angle');
  };

  const handleRecord = () => {
    const t = calcT(length);
    const newTrial = {
      id: trials.length + 1,
      length,
      angle,
      T: parseFloat(t.toFixed(4)),
      T2: parseFloat((t * t).toFixed(4)),
    };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(2);
    if (trials.length >= 2) markStep(3);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Length': `${length} cm`, 'Angle (θ)': `${angle}°`, 'Gravity (g)': '9.8 m/s²' },
        results: { 'Theoretical Period (T)': `${t.toFixed(3)} s` },
        trials: updatedTrials
      });
    }
  };

  // SVG pendulum geometry
  const svgW = 400, svgH = 300;
  const pivotX = svgW / 2, pivotY = 40;
  const displayLen = Math.min(160, 60 + length * 0.7);
  const bobX = pivotX + displayLen * Math.sin(currentAngleRad);
  const bobY = pivotY + displayLen * Math.cos(currentAngleRad);

  const chartData = trials.map(t => ({ x: t.length, y: t.T2 }));

  // Calculate g from slope if 3+ trials
  let calculatedG = null;
  if (trials.length >= 3) {
    const n = trials.length;
    const sumX = trials.reduce((a, t) => a + t.length / 100, 0);
    const sumY = trials.reduce((a, t) => a + t.T2, 0);
    const sumXY = trials.reduce((a, t) => a + (t.length / 100) * t.T2, 0);
    const sumX2 = trials.reduce((a, t) => a + (t.length / 100) ** 2, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    if (slope > 0) calculatedG = parseFloat((4 * Math.PI ** 2 / slope).toFixed(3));
  }

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', margin: 0 }}>
          🔬 Simple Pendulum Experiment
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Verify T = 2π√(L/g) — Period of a simple pendulum
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Simulation SVG */}
        <div style={glassPanel}>
          <h3 style={{ color: '#8b5cf6', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>
            ⚙️ Simulation
          </h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            {/* Support beam */}
            <rect x={pivotX - 60} y={20} width={120} height={12} rx={4} fill="#475569" />
            {/* String */}
            <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY}
              stroke="#94a3b8" strokeWidth={2} />
            {/* Bob */}
            <circle cx={bobX} cy={bobY} r={16}
              fill="url(#bobGrad)" stroke="#60a5fa" strokeWidth={2} />
            {/* Pivot */}
            <circle cx={pivotX} cy={pivotY} r={6} fill="#60a5fa" />
            {/* Defs */}
            <defs>
              <radialGradient id="bobGrad" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </radialGradient>
            </defs>
            {/* Overlays */}
            <text x={12} y={30} fill="#60a5fa" fontSize={13} fontFamily="monospace">
              T = {T.toFixed(3)} s
            </text>
            <text x={12} y={50} fill="#a78bfa" fontSize={13} fontFamily="monospace">
              L = {length} cm
            </text>
            <text x={12} y={70} fill="#34d399" fontSize={13} fontFamily="monospace">
              θ = {angle}°
            </text>
            <text x={12} y={svgH - 10} fill="#64748b" fontSize={11} fontFamily="monospace">
              g = 9.8 m/s²
            </text>
            {/* Equilibrium dashed line */}
            <line x1={pivotX} y1={pivotY} x2={pivotX} y2={pivotY + displayLen + 20}
              stroke="#475569" strokeWidth={1} strokeDasharray="4,4" />
          </svg>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#8b5cf6', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>
            🎛️ Controls
          </h3>

          <DualInputControl
            label="Length"
            symbol="L"
            value={length}
            defaultValue={50}
            min={20}
            max={200}
            step={1}
            unit="cm"
            color="#60a5fa"
            presets={[20, 50, 100, 150, 200]}
            onChange={val => { setLength(val); handleReset(); }}
          />

          <DualInputControl
            label="Angle"
            symbol="θ"
            value={angle}
            defaultValue={15}
            min={5}
            max={45}
            step={1}
            unit="°"
            color="#a78bfa"
            presets={[5, 15, 30, 45]}
            onChange={val => { setAngle(val); handleReset(); }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>TIME (s)</div>
              <div style={digitalDisplay}>{time.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>OSCILLATIONS</div>
              <div style={{ ...digitalDisplay, color: '#a78bfa', textShadow: '0 0 10px #a78bfa88' }}>{oscillations}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={() => setIsRunning(p => !p)}
              style={{
                padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                background: isRunning ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                color: isRunning ? '#f87171' : '#34d399',
                border: `1px solid ${isRunning ? '#ef4444' : '#10b981'}`,
                transition: 'all 0.2s',
              }}
            >
              {isRunning ? '⏹ Stop' : '▶ Start'}
            </button>
            <button onClick={handleFullReset} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71,85,105,0.2)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
              🔄 Reset
            </button>
          </div>
          <button
            onClick={handleRecord}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            📋 Record Observation
          </button>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>Calculated Period</div>
            <div style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '1.1rem' }}>T = {T.toFixed(4)} s</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>T² = {(T * T).toFixed(4)} s²</div>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>
          📊 Observation Table
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(59,130,246,0.15)' }}>
                {['Trial #', 'Length (cm)', 'Angle (°)', 'Period T (s)', 'T² (s²)'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#93c5fd', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>No observations recorded yet. Adjust parameters and click "Record Observation".</td></tr>
              ) : trials.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{t.length}</td>
                  <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{t.angle}</td>
                  <td style={{ padding: '9px 14px', color: '#34d399', fontFamily: 'monospace' }}>{t.T}</td>
                  <td style={{ padding: '9px 14px', color: '#60a5fa', fontFamily: 'monospace' }}>{t.T2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graph */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 L vs T² Graph — Verifying Pendulum Relationship
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '14px' }}>
          Slope = 4π²/g ≈ {(4 * Math.PI ** 2 / G).toFixed(3)} s²/m
        </p>
        {chartData.length === 0 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Record at least 1 trial to see the graph
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="x" type="number" name="Length" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']}>
                <Label value="Length (cm)" position="bottom" fill="#64748b" fontSize={12} />
              </XAxis>
              <YAxis dataKey="y" type="number" name="T²" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="T² (s²)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(v, n) => [v.toFixed(4), n === 'x' ? 'Length (cm)' : 'T² (s²)']} />
              <Scatter data={chartData} fill="#3b82f6" r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Conclusion */}
      <div style={glassPanel}>
        <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🧪 Conclusion</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>Pendulum Formula</div>
            <div style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '1.1rem' }}>T = 2π√(L/g)</div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '6px' }}>where g = 9.8 m/s²</div>
          </div>
          <div style={{ padding: '14px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
              {calculatedG ? 'Calculated g (from graph slope)' : `Record ${Math.max(0, 3 - trials.length)} more trial(s) to calculate g`}
            </div>
            {calculatedG ? (
              <>
                <div style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1.1rem' }}>g = {calculatedG} m/s²</div>
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '6px' }}>
                  Error: {Math.abs(((calculatedG - G) / G) * 100).toFixed(2)}%
                </div>
              </>
            ) : (
              <div style={{ color: '#475569', fontSize: '0.85rem' }}>Awaiting more data points...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
