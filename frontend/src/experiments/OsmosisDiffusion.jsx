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
const sliderStyle = { width: '100%', accentColor: '#06b6d4', cursor: 'pointer' };

export default function OsmosisDiffusion({ onProgressUpdate, experimentData, onSimulationData }) {
  const [insideConc, setInsideConc] = useState(() => {
    const saved = sessionStorage.getItem('edusim_osmosis_inside');
    return saved !== null ? Number(saved) : 10;
  });
  const [outsideConc, setOutsideConc] = useState(() => {
    const saved = sessionStorage.getItem('edusim_osmosis_outside');
    return saved !== null ? Number(saved) : 5;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [waterRise, setWaterRise] = useState(0);
  const [trials, setTrials] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [progressSteps, setProgressSteps] = useState(new Set());

  useEffect(() => {
    sessionStorage.setItem('edusim_osmosis_inside', insideConc);
  }, [insideConc]);

  useEffect(() => {
    sessionStorage.setItem('edusim_osmosis_outside', outsideConc);
  }, [outsideConc]);

  const intervalRef = useRef(null);
  const timeRef = useRef(0);
  const riseRef = useRef(0);

  const concDiff = insideConc - outsideConc;
  const direction = concDiff > 0 ? 'Inward (→)' : concDiff < 0 ? 'Outward (←)' : 'Equilibrium';
  const osmoticPressure = parseFloat((Math.abs(concDiff) * 0.0831 * 298).toFixed(2)); // simplified atm

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  useEffect(() => {
    if (isRunning) {
      markStep(1);
      intervalRef.current = setInterval(() => {
        timeRef.current += 1;
        // Water rise model: approaches equilibrium, rate depends on concentration diff
        const maxRise = Math.abs(concDiff) * 2.5;
        const rate = concDiff >= 0 ? 1 : -1;
        riseRef.current = parseFloat(Math.min(
          Math.max(-maxRise, riseRef.current + rate * 0.08 * Math.abs(concDiff) * Math.exp(-timeRef.current / 30)),
          maxRise
        ).toFixed(3));
        setTimeElapsed(timeRef.current);
        setWaterRise(riseRef.current);
        setChartData(prev => [...prev, { time: timeRef.current, rise: parseFloat(riseRef.current.toFixed(2)) }]);
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, concDiff, markStep]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setWaterRise(0);
    timeRef.current = 0;
    riseRef.current = 0;
    setChartData([]);
  };

  const handleFullReset = () => {
    handleReset();
    setInsideConc(10);
    setOutsideConc(5);
    sessionStorage.removeItem('edusim_osmosis_inside');
    sessionStorage.removeItem('edusim_osmosis_outside');
  };

  const handleRecord = () => {
    const newTrial = {
      id: trials.length + 1,
      inside: insideConc,
      outside: outsideConc,
      diff: concDiff,
      rise: parseFloat(waterRise.toFixed(2)),
      direction,
    };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(2);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Inside Concentration': `${insideConc}%`, 'Outside Concentration': `${outsideConc}%` },
        results: { 'Liquid Rise/Fall': `${waterRise.toFixed(2)} mm`, 'Flow Direction': direction },
        trials: updatedTrials
      });
    }
  };

  // SVG dimensions
  const svgW = 400, svgH = 350;
  const tubeW = 30;
  // U-tube geometry
  const leftX = 100, rightX = 260;
  const tubeTop = 40, tubeBottom = 260;
  const baseY = 280;

  // Water levels
  const outsideLevelY = tubeBottom - 80; // base
  // Inside level rises if more concentrated
  const risePixels = Math.min(80, Math.max(-80, waterRise * 6));
  const insideLevelY = outsideLevelY - risePixels;

  // Colors based on concentration
  const insideBlue = Math.min(255, 30 + insideConc * 8);
  const outsideBlue = Math.min(255, 30 + outsideConc * 8);

  // Arrow animation
  const arrowDir = concDiff > 0 ? '→' : concDiff < 0 ? '←' : '↔';

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#06b6d4', margin: 0 }}>
          💧 Osmosis & Diffusion
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Water moves from low to high solute concentration through a semipermeable membrane
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* SVG */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🔬 U-Tube Osmometer</h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            <defs>
              <linearGradient id="outsideWater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`rgb(30,${100 + outsideConc * 6},${outsideBlue})`} stopOpacity="0.6" />
                <stop offset="100%" stopColor={`rgb(10,${60 + outsideConc * 5},${outsideBlue})`} stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="insideWater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`rgb(10,${60 + insideConc * 5},${insideBlue})`} stopOpacity="0.6" />
                <stop offset="100%" stopColor={`rgb(5,${40 + insideConc * 4},${insideBlue})`} stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Left tube (Outside) */}
            <rect x={leftX} y={tubeTop} width={tubeW} height={tubeBottom - tubeTop} rx={4}
              fill="rgba(30,41,59,0.7)" stroke="#475569" strokeWidth={1.5} />
            {/* Outside water */}
            <rect x={leftX + 1} y={outsideLevelY} width={tubeW - 2} height={tubeBottom - outsideLevelY - 1} rx={2}
              fill="url(#outsideWater)" style={{ transition: 'y 0.5s, height 0.5s' }} />
            <text x={leftX + tubeW / 2} y={tubeTop - 10} textAnchor="middle" fill="#94a3b8" fontSize={11}>Outside</text>
            <text x={leftX + tubeW / 2} y={tubeTop - 22} textAnchor="middle" fill="#38bdf8" fontSize={10}>{outsideConc}%</text>

            {/* Right tube (Inside) */}
            <rect x={rightX} y={tubeTop} width={tubeW} height={tubeBottom - tubeTop} rx={4}
              fill="rgba(30,41,59,0.7)" stroke="#475569" strokeWidth={1.5} />
            {/* Inside water (level changes) */}
            <rect x={rightX + 1} y={insideLevelY} width={tubeW - 2} height={tubeBottom - insideLevelY - 1} rx={2}
              fill="url(#insideWater)" style={{ transition: 'y 0.5s, height 0.5s' }} />
            <text x={rightX + tubeW / 2} y={tubeTop - 10} textAnchor="middle" fill="#94a3b8" fontSize={11}>Inside</text>
            <text x={rightX + tubeW / 2} y={tubeTop - 22} textAnchor="middle" fill="#818cf8" fontSize={10}>{insideConc}%</text>

            {/* U-tube bottom connection */}
            <path d={`M ${leftX} ${tubeBottom} Q ${leftX} ${tubeBottom + 30} ${leftX + tubeW / 2 + 10} ${tubeBottom + 30} Q ${rightX + tubeW / 2} ${tubeBottom + 30} ${rightX} ${tubeBottom}`}
              fill="none" stroke="#475569" strokeWidth={1.5} />
            {/* U bottom water */}
            <path d={`M ${leftX + 1} ${tubeBottom} Q ${leftX + 1} ${tubeBottom + 28} ${leftX + tubeW / 2 + 10} ${tubeBottom + 28} Q ${rightX + tubeW / 2} ${tubeBottom + 28} ${rightX + tubeW - 1} ${tubeBottom}`}
              fill="rgba(14,116,144,0.6)" stroke="none" />

            {/* Semipermeable membrane at bottom */}
            <line x1={leftX + tubeW / 2 + 10 - 25} y1={tubeBottom + 30} x2={leftX + tubeW / 2 + 10 + 25} y2={tubeBottom + 30}
              stroke="#f59e0b" strokeWidth={3} strokeDasharray="4,3" />
            <text x={leftX + tubeW / 2 + 10} y={tubeBottom + 46} textAnchor="middle" fill="#f59e0b" fontSize={9}>Semipermeable Membrane</text>

            {/* Water movement arrows */}
            {concDiff !== 0 && (
              <>
                <text x={leftX + tubeW / 2 + 10} y={outsideLevelY - 10} textAnchor="middle" fill="#fbbf24" fontSize={16}>
                  {arrowDir}
                </text>
                <text x={leftX + tubeW / 2 + 10} y={outsideLevelY - 26} textAnchor="middle" fill="#fbbf24" fontSize={9}>
                  Water flow
                </text>
              </>
            )}

            {/* Water rise indicator */}
            {Math.abs(waterRise) > 0.1 && (
              <>
                <line x1={rightX + tubeW + 5} y1={outsideLevelY} x2={rightX + tubeW + 5} y2={insideLevelY}
                  stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={rightX + tubeW + 18} y={(outsideLevelY + insideLevelY) / 2} fill="#fbbf24" fontSize={10} fontFamily="monospace">
                  {Math.abs(waterRise).toFixed(1)}cm
                </text>
              </>
            )}

            {/* Status */}
            <text x={svgW / 2} y={svgH - 14} textAnchor="middle" fill="#64748b" fontSize={11}>
              ΔC = {concDiff}% | {direction} | T = {timeElapsed}s
            </text>
            <text x={svgW / 2} y={svgH - 2} textAnchor="middle" fill={waterRise > 0 ? '#818cf8' : waterRise < 0 ? '#38bdf8' : '#4ade80'} fontSize={11} fontWeight="bold">
              Water Rise = {waterRise.toFixed(2)} cm
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>🎛️ Controls</h3>

          <DualInputControl
            label="Inside Concentration"
            value={insideConc}
            defaultValue={10}
            min={0}
            max={20}
            step={1}
            unit="%"
            color="#818cf8"
            presets={[0, 5, 10, 15, 20]}
            onChange={val => { setInsideConc(val); handleReset(); }}
          />

          <DualInputControl
            label="Outside Concentration"
            value={outsideConc}
            defaultValue={5}
            min={0}
            max={20}
            step={1}
            unit="%"
            color="#38bdf8"
            presets={[0, 5, 10, 15, 20]}
            onChange={val => { setOutsideConc(val); handleReset(); }}
          />

          <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Conc. Difference', value: `${concDiff > 0 ? '+' : ''}${concDiff}%`, color: '#fbbf24' },
              { label: 'Water Rise', value: `${waterRise.toFixed(2)} cm`, color: '#a78bfa' },
              { label: 'Osmotic Pressure', value: `${osmoticPressure} atm`, color: '#06b6d4' },
              { label: 'Direction', value: direction, color: concDiff > 0 ? '#818cf8' : concDiff < 0 ? '#38bdf8' : '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</span>
                <span style={{ color, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setIsRunning(p => !p)}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${isRunning ? '#ef4444' : '#10b981'}`, background: `rgba(${isRunning ? '239,68,68' : '16,185,129'},0.15)`, color: isRunning ? '#f87171' : '#34d399', cursor: 'pointer', fontWeight: 700, marginBottom: '8px' }}>
            {isRunning ? '⏹ Stop' : '▶ Start Osmosis'}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={handleFullReset} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71,85,105,0.15)', color: '#94a3b8', cursor: 'pointer' }}>🔄 Reset</button>
            <button onClick={handleRecord} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}>📋 Record</button>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 Water Rise vs Time
        </h3>
        {chartData.length < 2 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Start the osmosis simulation to see the graph
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Time (0.5s steps)" position="bottom" fill="#64748b" fontSize={12} />
              </XAxis>
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Water Rise (cm)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
              </YAxis>
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(v) => [`${v.toFixed(2)} cm`, 'Water Rise']} />
              <Line type="monotone" dataKey="rise" stroke="#818cf8" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#a78bfa' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Observation Table */}
      <div style={glassPanel}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.12)' }}>
                {['#', 'Inside (%)', 'Outside (%)', 'ΔC (%)', 'Water Rise (cm)', 'Direction'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#a5b4fc', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>Set concentrations, run experiment, and click Record.</td></tr>
              ) : trials.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', color: '#818cf8', fontFamily: 'monospace' }}>{t.inside}</td>
                  <td style={{ padding: '9px 14px', color: '#38bdf8', fontFamily: 'monospace' }}>{t.outside}</td>
                  <td style={{ padding: '9px 14px', color: '#fbbf24', fontFamily: 'monospace' }}>{t.diff > 0 ? '+' : ''}{t.diff}</td>
                  <td style={{ padding: '9px 14px', color: '#a78bfa', fontFamily: 'monospace' }}>{t.rise}</td>
                  <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: '0.82rem' }}>{t.direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
