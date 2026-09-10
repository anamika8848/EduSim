import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, Cell, ReferenceLine
} from 'recharts';

const solutions = [
  { name: 'Lemon Juice', pH: 2.0, type: 'Strong Acid', color: '#fde047' },
  { name: 'Vinegar', pH: 3.0, type: 'Weak Acid', color: '#facc15' },
  { name: 'Coffee', pH: 5.0, type: 'Weak Acid', color: '#92400e' },
  { name: 'Pure Water', pH: 7.0, type: 'Neutral', color: '#7dd3fc' },
  { name: 'Baking Soda', pH: 8.5, type: 'Weak Base', color: '#86efac' },
  { name: 'Soap Solution', pH: 10.0, type: 'Base', color: '#d8b4fe' },
  { name: 'Ammonia', pH: 11.5, type: 'Strong Base', color: '#a78bfa' },
  { name: 'Bleach', pH: 13.0, type: 'Strong Base', color: '#6366f1' },
];

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

function getPHColor(pH) {
  if (pH < 3) return '#ef4444';
  if (pH < 5) return '#f97316';
  if (pH < 7) return '#eab308';
  if (pH === 7) return '#22c55e';
  if (pH < 9) return '#14b8a6';
  if (pH < 11) return '#6366f1';
  return '#7c3aed';
}

function getPHBarColor(pH) {
  if (pH < 7) return `hsl(${pH * 14}, 80%, 60%)`;
  return `hsl(${pH * 14}, 70%, 55%)`;
}

export default function PHMeasurement({ onProgressUpdate, experimentData, onSimulationData }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [measurements, setMeasurements] = useState([]);
  const [pHMeterInserted, setPHMeterInserted] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [progressSteps, setProgressSteps] = useState(new Set());

  const sol = solutions[selectedIdx];
  const phColor = getPHColor(sol.pH);
  const hConc = parseFloat(Math.pow(10, -sol.pH).toExponential(3));

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  const handleMeasure = () => {
    setPHMeterInserted(true);
    setMeasured(true);
    markStep(1);
    setTimeout(() => setPHMeterInserted(false), 1800);
  };

  const handleRecord = () => {
    if (!measured) return;
    const already = measurements.find(m => m.name === sol.name);
    if (already) return;
    const newMeasurement = {
      name: sol.name,
      pH: sol.pH,
      type: sol.type,
      hConc: Math.pow(10, -sol.pH),
    };
    const updatedMeasurements = [...measurements, newMeasurement];
    setMeasurements(updatedMeasurements);
    markStep(2);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Active Solution': sol.name },
        results: { 'Measured pH': `${sol.pH}`, 'Classification': sol.type },
        trials: updatedMeasurements.map((m, idx) => ({
          'Index': idx + 1,
          'Solution': m.name,
          'pH Value': m.pH,
          'Classification': m.type
        }))
      });
    }
  };

  const handleSelectSolution = (idx) => {
    setSelectedIdx(idx);
    setMeasured(false);
  };

  const chartData = measurements.map(m => ({
    name: m.name.replace(' ', '\n'),
    pH: m.pH,
    fill: getPHColor(m.pH),
  }));

  // pH scale strip colors
  const phScaleColors = Array.from({ length: 15 }, (_, i) => getPHBarColor(i));

  const svgW = 300, svgH = 300;
  const beakerY = 80, beakerH = 140, beakerW = 140;
  const probeY = pHMeterInserted ? 130 : 60;

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
          🧪 pH Measurement
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Measure and compare pH of common solutions using a digital pH meter
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Simulation SVG */}
        <div style={glassPanel}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>⚗️ pH Meter Setup</h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            <defs>
              <linearGradient id="solGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={sol.color} stopOpacity="0.5" />
                <stop offset="100%" stopColor={sol.color} stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="phGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                {phScaleColors.map((c, i) => (
                  <stop key={i} offset={`${(i / 14) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>

            {/* Beaker */}
            <rect x={80} y={beakerY} width={beakerW} height={beakerH} rx={6}
              fill="url(#solGrad)" stroke="#94a3b8" strokeWidth={2} />
            {/* Beaker rim */}
            <rect x={76} y={beakerY - 8} width={beakerW + 8} height={10} rx={3}
              fill="rgba(148,163,184,0.3)" stroke="#94a3b8" strokeWidth={1} />
            {/* Solution label */}
            <text x={80 + beakerW / 2} y={beakerY + beakerH / 2} textAnchor="middle" fill="rgba(255,255,255,0.8)"
              fontSize={13} fontWeight="bold">{sol.name}</text>

            {/* pH Meter body */}
            <rect x={195} y={20} width={50} height={90} rx={6}
              fill="rgba(15,22,45,0.95)" stroke="#06b6d4" strokeWidth={1.5}
              style={{ transition: 'all 0.3s' }} />
            <text x={220} y={45} textAnchor="middle" fill="#64748b" fontSize={8}>pH METER</text>
            {measured ? (
              <text x={220} y={78} textAnchor="middle" fill={phColor} fontSize={22} fontFamily="monospace" fontWeight="bold"
                style={{ filter: `drop-shadow(0 0 6px ${phColor})`, transition: 'all 0.3s' }}>
                {sol.pH.toFixed(1)}
              </text>
            ) : (
              <text x={220} y={78} textAnchor="middle" fill="#475569" fontSize={22} fontFamily="monospace">--.-</text>
            )}

            {/* Probe (vertical line, animates down) */}
            <rect x={218} y={110} width={4} height={probeY - 110} rx={2}
              fill="#06b6d4" style={{ transition: 'height 0.5s ease' }} />
            <circle cx={220} cy={probeY} r={5} fill="#06b6d4"
              style={{ transition: 'cy 0.5s ease', filter: pHMeterInserted ? 'drop-shadow(0 0 5px #06b6d4)' : 'none' }} />

            {/* pH Scale Strip */}
            <rect x={20} y={250} width={260} height={18} rx={9} fill="url(#phGrad2)" />
            {/* Indicator */}
            <polygon points={`${20 + (sol.pH / 14) * 260},${248} ${20 + (sol.pH / 14) * 260 - 6},${240} ${20 + (sol.pH / 14) * 260 + 6},${240}`}
              fill="white" opacity={measured ? 1 : 0} style={{ transition: 'opacity 0.5s' }} />
            <text x={20} y={284} fill="#64748b" fontSize={9}>0 (Acid)</text>
            <text x={150} y={284} textAnchor="middle" fill="#64748b" fontSize={9}>7 (Neutral)</text>
            <text x={280} y={284} textAnchor="end" fill="#64748b" fontSize={9}>14 (Base)</text>

            {/* pH value indicator on scale */}
            {measured && (
              <circle cx={20 + (sol.pH / 14) * 260} cy={259} r={8}
                fill="white" stroke="#1e293b" strokeWidth={1.5} />
            )}
          </svg>

          {/* pH display */}
          {measured && (
            <div style={{ textAlign: 'center', marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 700, color: phColor, textShadow: `0 0 15px ${phColor}88` }}>
                pH = {sol.pH.toFixed(1)}
              </div>
              <div style={{ color: phColor, fontSize: '0.85rem', marginTop: '4px' }}>{sol.type}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>
                [H⁺] = {Math.pow(10, -sol.pH).toExponential(2)} mol/L
              </div>
            </div>
          )}
        </div>

        {/* Solution Selector + Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>🧫 Select Solution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {solutions.map((s, i) => (
              <button key={i} onClick={() => handleSelectSolution(i)}
                style={{
                  padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                  border: `1px solid ${selectedIdx === i ? s.color : 'rgba(255,255,255,0.08)'}`,
                  background: selectedIdx === i ? `rgba(${parseInt(s.color.slice(1,3),16)},${parseInt(s.color.slice(3,5),16)},${parseInt(s.color.slice(5,7),16)},0.15)` : 'rgba(255,255,255,0.03)',
                  color: selectedIdx === i ? s.color : '#94a3b8',
                  fontWeight: selectedIdx === i ? 600 : 400,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}>
                <div>{s.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>pH {s.pH}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <button onClick={handleMeasure}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.15)', color: '#34d399', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
              🔬 Measure pH
            </button>
            <button onClick={handleRecord} disabled={!measured}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: measured ? '#60a5fa' : '#374151', cursor: measured ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.95rem' }}>
              📋 Record
            </button>
            <button onClick={() => setMeasurements([])}
              style={{ padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71,85,105,0.15)', color: '#94a3b8', cursor: 'pointer' }}>
              🗑️ Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 pH Comparison Chart
        </h3>
        {chartData.length === 0 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Measure and record solutions to see comparison chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, bottom: 50, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
              <YAxis domain={[0, 14]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="pH" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
              </YAxis>
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(v) => [`pH ${v}`, 'pH Value']} />
              <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Neutral (7)', fill: '#4ade80', fontSize: 11 }} />
              <Bar dataKey="pH" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Observation Table */}
      <div style={glassPanel}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(16,185,129,0.1)' }}>
                {['Solution', 'pH', 'Classification', '[H⁺] (mol/L)'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6ee7b7', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measurements.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>No measurements recorded. Select a solution, measure, and record.</td></tr>
              ) : measurements.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                  <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{m.name}</td>
                  <td style={{ padding: '9px 14px', color: getPHColor(m.pH), fontFamily: 'monospace', fontWeight: 600 }}>{m.pH.toFixed(1)}</td>
                  <td style={{ padding: '9px 14px', color: '#94a3b8' }}>{m.type}</td>
                  <td style={{ padding: '9px 14px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.82rem' }}>{m.hConc.toExponential(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
