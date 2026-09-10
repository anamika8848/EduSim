import React, { useState, useEffect, useRef, useCallback } from 'react';
import DualInputControl from '../components/ui/DualInputControl';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, Legend
} from 'recharts';

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

function Bubble({ x, y, size, color, opacity }) {
  return <circle cx={x} cy={y} r={size} fill={color} opacity={opacity} />;
}

export default function ElectrolysisOfWater({ onProgressUpdate, experimentData, onSimulationData }) {
  const [current, setCurrent] = useState(() => {
    const saved = sessionStorage.getItem('edusim_electrolysis_current');
    return saved !== null ? Number(saved) : 2;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [h2Volume, setH2Volume] = useState(0);
  const [o2Volume, setO2Volume] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [trials, setTrials] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [progressSteps, setProgressSteps] = useState(new Set());

  useEffect(() => {
    sessionStorage.setItem('edusim_electrolysis_current', current);
  }, [current]);

  const intervalRef = useRef(null);
  const bubbleIntervalRef = useRef(null);
  const h2Ref = useRef(0);
  const o2Ref = useRef(0);
  const timeRef = useRef(0);

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
        const h2Rate = 0.01 * current;
        const o2Rate = 0.005 * current;
        h2Ref.current = parseFloat((h2Ref.current + h2Rate).toFixed(4));
        o2Ref.current = parseFloat((o2Ref.current + o2Rate).toFixed(4));
        timeRef.current += 1;
        setH2Volume(h2Ref.current);
        setO2Volume(o2Ref.current);
        setTimeElapsed(timeRef.current);
        setChartData(prev => [...prev, {
          time: timeRef.current,
          H2: parseFloat(h2Ref.current.toFixed(3)),
          O2: parseFloat(o2Ref.current.toFixed(3)),
        }]);
      }, 1000);

      // Bubble animation
      bubbleIntervalRef.current = setInterval(() => {
        const now = Date.now();
        // Generate bubbles near electrodes
        const newBubbles = [];
        const count = Math.ceil(current * 1.5);
        for (let i = 0; i < count; i++) {
          newBubbles.push({
            id: now + i,
            side: 'h2',
            x: 155 + (Math.random() - 0.5) * 14,
            y: 200 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            opacity: 0.7 + Math.random() * 0.3,
            vy: -(1.5 + Math.random() * 1.5),
          });
        }
        for (let i = 0; i < Math.ceil(count / 2); i++) {
          newBubbles.push({
            id: now + count + i,
            side: 'o2',
            x: 295 + (Math.random() - 0.5) * 14,
            y: 200 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            opacity: 0.6 + Math.random() * 0.3,
            vy: -(1.2 + Math.random() * 1.2),
          });
        }
        setBubbles(prev => [...prev.slice(-40), ...newBubbles]);
      }, 200);
    } else {
      clearInterval(intervalRef.current);
      clearInterval(bubbleIntervalRef.current);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(bubbleIntervalRef.current);
    };
  }, [isRunning, current, markStep]);

  // Animate bubbles rising
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      setBubbles(prev => prev
        .map(b => ({ ...b, y: b.y + b.vy }))
        .filter(b => b.y > 40)
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setH2Volume(0); setO2Volume(0); setTimeElapsed(0);
    h2Ref.current = 0; o2Ref.current = 0; timeRef.current = 0;
    setBubbles([]); setChartData([]);
  };

  const handleFullReset = () => {
    handleReset();
    setCurrent(2);
    sessionStorage.removeItem('edusim_electrolysis_current');
  };

  const handleRecord = () => {
    const newTrial = {
      id: trials.length + 1,
      current,
      time: timeElapsed,
      h2: parseFloat(h2Volume.toFixed(3)),
      o2: parseFloat(o2Volume.toFixed(3)),
      ratio: '2:1',
    };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(2);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Applied Electric Current': `${current} A`, 'Time Elapsed': `${timeElapsed} s` },
        results: { 'Hydrogen Gas (H₂)': `${h2Volume.toFixed(3)} mL`, 'Oxygen Gas (O₂)': `${o2Volume.toFixed(3)} mL` },
        trials: updatedTrials
      });
    }
  };

  const svgW = 460, svgH = 320;
  // Cell: 100-360 x, water level: 230
  const waterH = 100;
  const h2TubeH = 140;
  const o2TubeH = 140;
  const h2Fill = Math.min(h2TubeH - 10, h2Volume * 18);
  const o2Fill = Math.min(o2TubeH - 10, o2Volume * 36);

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#06b6d4', margin: 0 }}>
          ⚡ Electrolysis of Water
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          2H₂O → 2H₂ + O₂ | Cathode (−): H₂ | Anode (+): O₂ | Ratio = 2:1
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
        {/* SVG */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>⚗️ Electrolytic Cell</h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="h2Grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="o2Grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fecaca" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Electrolytic cell container */}
            <rect x={100} y={130} width={260} height={waterH} rx={4}
              fill="url(#waterGrad)" stroke="#38bdf8" strokeWidth={1.5} />

            {/* Cathode (-) electrode */}
            <rect x={148} y={120} width={14} height={waterH + 10} rx={2} fill="#94a3b8" />
            <text x={155} y={110} textAnchor="middle" fill="#60a5fa" fontSize={12} fontWeight="bold">−</text>
            <text x={155} y={100} textAnchor="middle" fill="#94a3b8" fontSize={10}>Cathode</text>

            {/* Anode (+) electrode */}
            <rect x={298} y={120} width={14} height={waterH + 10} rx={2} fill="#94a3b8" />
            <text x={305} y={110} textAnchor="middle" fill="#f87171" fontSize={12} fontWeight="bold">+</text>
            <text x={305} y={100} textAnchor="middle" fill="#94a3b8" fontSize={10}>Anode</text>

            {/* H₂ collection tube (inverted) - left */}
            <rect x={132} y={30} width={46} height={h2TubeH} rx={4}
              fill="rgba(30,41,59,0.8)" stroke="#60a5fa" strokeWidth={1.5} />
            {/* H₂ gas fill from top */}
            <rect x={133} y={30} width={44} height={h2Fill} rx={3} fill="url(#h2Grad)" />
            <text x={155} y={24} textAnchor="middle" fill="#60a5fa" fontSize={12} fontWeight="bold">H₂</text>
            <text x={155} y={svgH - 6} textAnchor="middle" fill="#60a5fa" fontSize={10} fontFamily="monospace">{h2Volume.toFixed(3)} mL</text>

            {/* O₂ collection tube (inverted) - right */}
            <rect x={282} y={30} width={46} height={o2TubeH} rx={4}
              fill="rgba(30,41,59,0.8)" stroke="#f87171" strokeWidth={1.5} />
            {/* O₂ gas fill from top */}
            <rect x={283} y={30} width={44} height={o2Fill} rx={3} fill="url(#o2Grad)" />
            <text x={305} y={24} textAnchor="middle" fill="#f87171" fontSize={12} fontWeight="bold">O₂</text>
            <text x={305} y={svgH - 6} textAnchor="middle" fill="#f87171" fontSize={10} fontFamily="monospace">{o2Volume.toFixed(3)} mL</text>

            {/* Bubbles */}
            {bubbles.map(b => (
              <circle key={b.id} cx={b.x} cy={b.y} r={b.size}
                fill={b.side === 'h2' ? '#93c5fd' : '#fca5a5'}
                opacity={b.opacity} />
            ))}

            {/* Power source */}
            <rect x={195} y={60} width={70} height={35} rx={6}
              fill="rgba(15,22,45,0.95)" stroke="#fbbf24" strokeWidth={1.5} />
            <text x={230} y={80} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily="monospace">{current}A</text>
            <line x1={155} y1={77} x2={195} y2={77} stroke="#475569" strokeWidth={2} strokeDasharray="4,3" />
            <line x1={265} y1={77} x2={305} y2={77} stroke="#475569" strokeWidth={2} strokeDasharray="4,3" />

            {/* Ratio label */}
            <text x={svgW / 2} y={svgH - 15} textAnchor="middle" fill="#64748b" fontSize={11}>
              H₂:O₂ = 2:1 by volume
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>🎛️ Controls</h3>

          <DualInputControl
            label="Current"
            symbol="I"
            value={current}
            defaultValue={2}
            min={0.5}
            max={5}
            step={0.5}
            unit="A"
            color="#fbbf24"
            presets={[0.5, 1, 2, 3, 5]}
            onChange={val => { setCurrent(val); handleReset(); }}
          />

          <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'H₂ Volume', value: `${h2Volume.toFixed(3)} mL`, color: '#60a5fa' },
              { label: 'O₂ Volume', value: `${o2Volume.toFixed(3)} mL`, color: '#f87171' },
              { label: 'Time Elapsed', value: `${timeElapsed} s`, color: '#fbbf24' },
              { label: 'H₂ : O₂ Ratio', value: '2 : 1', color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</span>
                <span style={{ color, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setIsRunning(p => !p)}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${isRunning ? '#ef4444' : '#10b981'}`, background: `rgba(${isRunning ? '239,68,68' : '16,185,129'},0.15)`, color: isRunning ? '#f87171' : '#34d399', cursor: 'pointer', fontWeight: 700, marginBottom: '8px' }}>
            {isRunning ? '⏹ Power Off' : '⚡ Power On'}
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
          📈 Gas Volume vs Time (H₂ in Blue, O₂ in Red)
        </h3>
        {chartData.length < 2 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            Power on to begin collecting data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
              <defs>
                <linearGradient id="h2GradChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="o2GradChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Time (s)" position="bottom" fill="#64748b" fontSize={12} />
              </XAxis>
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Volume (mL)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
              </YAxis>
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(v, n) => [v.toFixed(4) + ' mL', n]} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
              <Area type="monotone" dataKey="H2" name="H₂" stroke="#3b82f6" fill="url(#h2GradChart)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="O2" name="O₂" stroke="#ef4444" fill="url(#o2GradChart)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Observation Table */}
      <div style={glassPanel}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(6,182,212,0.1)' }}>
                {['Trial #', 'Current (A)', 'Time (s)', 'H₂ Vol (mL)', 'O₂ Vol (mL)', 'Ratio'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#67e8f9', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>Run electrolysis and click Record to save observations.</td></tr>
              ) : trials.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', color: '#fbbf24', fontFamily: 'monospace' }}>{t.current}</td>
                  <td style={{ padding: '9px 14px', color: '#e2e8f0', fontFamily: 'monospace' }}>{t.time}</td>
                  <td style={{ padding: '9px 14px', color: '#60a5fa', fontFamily: 'monospace' }}>{t.h2}</td>
                  <td style={{ padding: '9px 14px', color: '#f87171', fontFamily: 'monospace' }}>{t.o2}</td>
                  <td style={{ padding: '9px 14px', color: '#10b981', fontFamily: 'monospace' }}>{t.ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
