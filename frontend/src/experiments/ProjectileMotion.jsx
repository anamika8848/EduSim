import React, { useState, useEffect, useRef, useCallback } from 'react';
import DualInputControl from '../components/ui/DualInputControl';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label, Cell, ReferenceLine
} from 'recharts';

const G = 9.8;
const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};
const sliderStyle = { width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' };

const COLORS = ['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

function calcRange(v, theta) { return (v ** 2 * Math.sin((2 * theta * Math.PI) / 180)) / G; }
function calcMaxH(v, theta) { return (v ** 2 * Math.sin((theta * Math.PI) / 180) ** 2) / (2 * G); }
function calcTOF(v, theta) { return (2 * v * Math.sin((theta * Math.PI) / 180)) / G; }

function buildPoints(v, theta, svgW, svgH, groundY) {
  const tof = calcTOF(v, theta);
  const range = calcRange(v, theta);
  const maxH = calcMaxH(v, theta);
  const scale = Math.min((svgW - 80) / Math.max(range, 1), (svgH - groundY - 20) / Math.max(maxH, 1));
  const pts = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tof;
    const x = v * Math.cos((theta * Math.PI) / 180) * t;
    const y = v * Math.sin((theta * Math.PI) / 180) * t - 0.5 * G * t * t;
    pts.push({ sx: 40 + x * scale, sy: groundY - y * scale });
  }
  return { pts, scale, tof, range, maxH };
}

export default function ProjectileMotion({ onProgressUpdate, experimentData, onSimulationData }) {
  const [angle, setAngle] = useState(() => {
    const saved = sessionStorage.getItem('edusim_projectile_angle');
    return saved !== null ? Number(saved) : 45;
  });
  const [velocity, setVelocity] = useState(() => {
    const saved = sessionStorage.getItem('edusim_projectile_velocity');
    return saved !== null ? Number(saved) : 20;
  });
  const [trajectories, setTrajectories] = useState([]);
  const [isFiring, setIsFiring] = useState(false);
  const [ballPos, setBallPos] = useState(null);
  const [trials, setTrials] = useState([]);
  const [progressSteps, setProgressSteps] = useState(new Set());

  useEffect(() => {
    sessionStorage.setItem('edusim_projectile_angle', angle);
  }, [angle]);

  useEffect(() => {
    sessionStorage.setItem('edusim_projectile_velocity', velocity);
  }, [velocity]);

  const animRef = useRef(null);
  const fireRef = useRef(null);

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  const range = parseFloat(calcRange(velocity, angle).toFixed(2));
  const maxH = parseFloat(calcMaxH(velocity, angle).toFixed(2));
  const tof = parseFloat(calcTOF(velocity, angle).toFixed(2));

  const svgW = 500, svgH = 300, groundY = svgH - 40;

  const handleFire = useCallback(() => {
    if (isFiring) return;
    setIsFiring(true);
    markStep(1);

    const tofMs = calcTOF(velocity, angle) * 1000;
    const startTime = performance.now();
    const v = velocity, th = angle;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min((elapsed / tofMs) * calcTOF(v, th), calcTOF(v, th));
      const x = v * Math.cos((th * Math.PI) / 180) * t;
      const y = v * Math.sin((th * Math.PI) / 180) * t - 0.5 * G * t * t;
      const { scale } = buildPoints(v, th, svgW, svgH, groundY);
      setBallPos({ sx: 40 + x * scale, sy: groundY - Math.max(0, y * scale) });

      if (elapsed < tofMs) {
        fireRef.current = requestAnimationFrame(tick);
      } else {
        setBallPos(null);
        setIsFiring(false);
        const { pts } = buildPoints(v, th, svgW, svgH, groundY);
        setTrajectories(prev => [...prev.slice(-5), { angle: th, velocity: v, pts, color: COLORS[prev.length % COLORS.length] }]);
        markStep(2);
      }
    };
    fireRef.current = requestAnimationFrame(tick);
  }, [isFiring, velocity, angle, markStep, groundY]);

  useEffect(() => () => { if (fireRef.current) cancelAnimationFrame(fireRef.current); }, []);

  const handleRecord = () => {
    const newTrial = { id: trials.length + 1, angle, velocity, range, maxH, tof };
    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);
    markStep(3);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Initial Velocity (v₀)': `${velocity} m/s`, 'Launch Angle (θ)': `${angle}°` },
        results: { 'Horizontal Range (R)': `${range} m`, 'Maximum Height (H)': `${maxH} m`, 'Time of Flight (t)': `${tof} s` },
        trials: updatedTrials
      });
    }
  };

  // Bar chart data: range at different angles for current velocity
  const barData = [15, 30, 45, 60, 75].map(a => ({
    angle: `${a}°`,
    range: parseFloat(calcRange(velocity, a).toFixed(2)),
  }));

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#a78bfa', margin: 0 }}>
          🚀 Projectile Motion Experiment
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Analyze Range, Max Height, and Time of Flight under gravity (g = 9.8 m/s²)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px', marginBottom: '20px' }}>
        {/* SVG Simulation */}
        <div style={glassPanel}>
          <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🎯 Trajectory Simulator</h3>
          <svg width={svgW} height={svgH} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'block', maxWidth: '100%' }}>
            {/* Ground */}
            <line x1={30} y1={groundY} x2={svgW - 10} y2={groundY} stroke="#475569" strokeWidth={2} />
            {/* Axes */}
            <line x1={40} y1={groundY} x2={40} y2={20} stroke="#374151" strokeWidth={1} strokeDasharray="3,3" />
            <text x={42} y={18} fill="#64748b" fontSize={10}>Height</text>
            <text x={svgW - 60} y={groundY + 16} fill="#64748b" fontSize={10}>Range →</text>

            {/* Launch point */}
            <circle cx={40} cy={groundY} r={5} fill="#10b981" />

            {/* Angle indicator */}
            <line
              x1={40} y1={groundY}
              x2={40 + 40 * Math.cos((angle * Math.PI) / 180)}
              y2={groundY - 40 * Math.sin((angle * Math.PI) / 180)}
              stroke="#fbbf24" strokeWidth={2}
            />
            <text x={55} y={groundY - 10} fill="#fbbf24" fontSize={11}>{angle}°</text>

            {/* Trajectories */}
            {trajectories.map((tr, idx) => (
              <polyline
                key={idx}
                points={tr.pts.map(p => `${p.sx},${p.sy}`).join(' ')}
                fill="none"
                stroke={tr.color}
                strokeWidth={2}
                opacity={0.7}
              />
            ))}

            {/* Animated ball */}
            {ballPos && (
              <circle cx={ballPos.sx} cy={ballPos.sy} r={7} fill="#fbbf24"
                style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
            )}

            {/* Stats overlay */}
            <text x={svgW - 8} y={30} textAnchor="end" fill="#8b5cf6" fontSize={12} fontFamily="monospace">Range: {range}m</text>
            <text x={svgW - 8} y={46} textAnchor="end" fill="#06b6d4" fontSize={12} fontFamily="monospace">H max: {maxH}m</text>
            <text x={svgW - 8} y={62} textAnchor="end" fill="#10b981" fontSize={12} fontFamily="monospace">ToF: {tof}s</text>

            {/* Grid lines */}
            {[50, 100, 150, 200].map(y => (
              <line key={y} x1={40} y1={groundY - y * 0.5} x2={svgW - 10} y2={groundY - y * 0.5}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
          </svg>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            Up to 6 trajectories shown simultaneously. Old trajectories cycle out.
          </div>
        </div>

        {/* Controls */}
        <div style={glassPanel}>
          <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '16px', fontSize: '1rem' }}>🎛️ Controls</h3>

          <DualInputControl
            label="Angle"
            symbol="θ"
            value={angle}
            defaultValue={45}
            min={1}
            max={89}
            step={1}
            unit="°"
            color="#fbbf24"
            presets={[15, 30, 45, 60, 75]}
            onChange={val => setAngle(val)}
          />

          <DualInputControl
            label="Velocity"
            symbol="v₀"
            value={velocity}
            defaultValue={20}
            min={5}
            max={50}
            step={1}
            unit="m/s"
            color="#8b5cf6"
            presets={[10, 20, 30, 40, 50]}
            onChange={val => setVelocity(val)}
          />

          <div style={{ display: 'grid', gap: '8px', marginBottom: '14px' }}>
            {[{ label: 'Range', value: `${range} m`, color: '#8b5cf6' },
              { label: 'Max Height', value: `${maxH} m`, color: '#06b6d4' },
              { label: 'Time of Flight', value: `${tof} s`, color: '#10b981' }].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</span>
                <span style={{ color, fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleFire}
            disabled={isFiring}
            style={{
              width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #8b5cf6',
              background: isFiring ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.2)',
              color: isFiring ? '#6d28d9' : '#a78bfa',
              cursor: isFiring ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem',
              marginBottom: '8px', transition: 'all 0.2s',
            }}
          >
            {isFiring ? '🚀 Firing...' : '🚀 Fire!'}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => setTrajectories([])} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #475569', background: 'rgba(71,85,105,0.15)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}>
              🗑️ Clear
            </button>
            <button onClick={handleRecord} style={{ padding: '9px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontSize: '0.82rem' }}>
              📋 Record
            </button>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(139,92,246,0.12)' }}>
                {['Trial #', 'Angle (°)', 'Velocity (m/s)', 'Range (m)', 'Max Height (m)', 'Time (s)'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#c4b5fd', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>No trials recorded yet. Fire projectiles and click Record.</td></tr>
              ) : trials.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', color: '#fbbf24', fontFamily: 'monospace' }}>{t.angle}</td>
                  <td style={{ padding: '9px 14px', color: '#8b5cf6', fontFamily: 'monospace' }}>{t.velocity}</td>
                  <td style={{ padding: '9px 14px', color: '#10b981', fontFamily: 'monospace' }}>{t.range}</td>
                  <td style={{ padding: '9px 14px', color: '#06b6d4', fontFamily: 'monospace' }}>{t.maxH}</td>
                  <td style={{ padding: '9px 14px', color: '#60a5fa', fontFamily: 'monospace' }}>{t.tof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graph */}
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <h3 style={{ color: '#fbbf24', marginTop: 0, marginBottom: '8px', fontSize: '1rem' }}>
          📈 Range vs Angle Chart (v₀ = {velocity} m/s)
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 0, marginBottom: '14px' }}>
          Maximum range occurs at 45° — confirmed by the peak bar
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="angle" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
              <Label value="Launch Angle" position="bottom" fill="#64748b" fontSize={12} />
            </XAxis>
            <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }}>
              <Label value="Range (m)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
            </YAxis>
            <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
              formatter={(v) => [`${v} m`, 'Range']} />
            <Bar dataKey="range" radius={[4, 4, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.angle === '45°' ? '#fbbf24' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conclusion */}
      <div style={glassPanel}>
        <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>🧪 Conclusion</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Range Formula', value: 'R = v²sin(2θ)/g', color: '#10b981' },
            { label: 'Max Height Formula', value: 'H = v²sin²(θ)/2g', color: '#06b6d4' },
            { label: 'Key Finding', value: 'Max range at θ = 45°', color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '6px' }}>{label}</div>
              <div style={{ color, fontFamily: 'monospace', fontSize: '0.95rem' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
