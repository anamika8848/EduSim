import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

// Agglutination lookup table
const AGGLUTINATION = {
  A:  { antiA: true,  antiB: false, antiAB: true  },
  B:  { antiA: false, antiB: true,  antiAB: true  },
  AB: { antiA: true,  antiB: true,  antiAB: true  },
  O:  { antiA: false, antiB: false, antiAB: false },
};

// Reference chart data for display
const REFERENCE = [
  { group: 'A',  antiA: '+', antiB: '-', antiAB: '+' },
  { group: 'B',  antiA: '-', antiB: '+', antiAB: '+' },
  { group: 'AB', antiA: '+', antiB: '+', antiAB: '+' },
  { group: 'O',  antiA: '-', antiB: '-', antiAB: '-' },
];

const glass = {
  background: 'rgba(15,22,45,0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 20,
};

const digital = (color = '#00ffaa') => ({
  fontFamily: 'monospace', fontSize: '1.2rem', color,
  textShadow: `0 0 10px ${color}88`,
  background: 'rgba(0,0,0,0.4)', borderRadius: 8,
  padding: '5px 14px', display: 'inline-block', textAlign: 'center',
});

const btn = (active, color = '#3b82f6') => ({
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  background: active ? `${color}30` : 'rgba(255,255,255,0.05)',
  border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.1)'}`,
  color: active ? color : '#94a3b8', transition: 'all 0.2s',
});

/* Agglutination SVG circle */
function BloodWell({ label, agglutinated, applied }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{label}</div>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* well background */}
        <circle cx={50} cy={50} r={46} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        {applied ? (
          agglutinated ? (
            /* Clumped - irregular clusters */
            <>
              {[...Array(18)].map((_, i) => {
                const angle = (i / 18) * 2 * Math.PI
                const r = 12 + (i % 3) * 6
                return <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r={4 + (i % 2) * 2} fill="#8B1A1A" opacity={0.85} />
              })}
              <circle cx={50} cy={50} r={5} fill="#6B1212" />
              <circle cx={42} cy={42} r={4} fill="#7A1515" />
              <circle cx={58} cy={45} r={3} fill="#8B1A1A" />
            </>
          ) : (
            /* Smooth - no agglutination */
            <>
              <circle cx={50} cy={50} r={32} fill="#DC2626" opacity={0.85} />
              <circle cx={44} cy={44} r={8} fill="rgba(255,255,255,0.2)" />
            </>
          )
        ) : (
          /* Not yet applied */
          <circle cx={50} cy={50} r={28} fill="rgba(220,38,38,0.4)" stroke="rgba(220,38,38,0.3)" strokeWidth={1} strokeDasharray="4 3" />
        )}
      </svg>
      <div style={{ fontSize: 11, color: applied ? (agglutinated ? '#ef4444' : '#10b981') : '#64748b' }}>
        {applied ? (agglutinated ? '(+) Agglutination' : '(−) No Agglutination') : 'Not tested'}
      </div>
    </div>
  );
}

export default function BloodGrouping({ onProgressUpdate, experimentData, onSimulationData }) {
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [antiAApplied, setAntiAApplied]   = useState(false);
  const [antiBApplied, setAntiBApplied]   = useState(false);
  const [antiABApplied, setAntiABApplied] = useState(false);
  const [determinedGroup, setDeterminedGroup] = useState(null);
  const [trials, setTrials]               = useState([]);
  const [revealSample, setRevealSample]   = useState(false);
  const [progressSteps, setProgressSteps] = useState(new Set());

  const updateProgress = (step) => {
    setProgressSteps(prev => {
      const next = new Set(prev).add(step);
      const pct = Math.round((next.size / 6) * 100);
      onProgressUpdate?.(Math.min(5, step));
      return next;
    });
  };

  const results = AGGLUTINATION[selectedGroup];

  const handleApplyA = () => {
    setAntiAApplied(true);
    updateProgress(1);
  };
  const handleApplyB = () => {
    setAntiBApplied(true);
    updateProgress(2);
  };
  const handleApplyAB = () => {
    setAntiABApplied(true);
    updateProgress(3);
  };

  const handleDetermine = () => {
    if (!antiAApplied || !antiBApplied || !antiABApplied) {
      alert('Apply all three sera first!');
      return;
    }
    const a = results.antiA, b = results.antiB, ab = results.antiAB;
    let group = 'O';
    if (a && b && ab)      group = 'AB';
    else if (a && !b && ab) group = 'A';
    else if (!a && b && ab) group = 'B';
    setDeterminedGroup(group);
    setRevealSample(true);
    updateProgress(4);
  };

  const handleRecord = () => {
    if (!determinedGroup) return;
    const trial = {
      no: trials.length + 1,
      sample: selectedGroup,
      antiA: results.antiA ? '+' : '−',
      antiB: results.antiB ? '+' : '−',
      antiAB: results.antiAB ? '+' : '−',
      determined: determinedGroup,
    };
    const updatedTrials = [...trials, trial];
    setTrials(updatedTrials);
    updateProgress(5);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Sample Name': `Sample ${selectedGroup}`, 'Anti-A Applied': antiAApplied ? 'Yes' : 'No', 'Anti-B Applied': antiBApplied ? 'Yes' : 'No', 'Anti-AB Applied': antiABApplied ? 'Yes' : 'No' },
        results: { 'Determined Blood Group': determinedGroup, 'Reaction Anti-A': results.antiA ? 'Agglutination (+)' : 'No Agglutination (-)', 'Reaction Anti-B': results.antiB ? 'Agglutination (+)' : 'No Agglutination (-)' },
        trials: updatedTrials.map(t => ({
          'Trial #': t.no,
          'Sample ID': t.sample,
          'Anti-A reaction': t.antiA,
          'Anti-B reaction': t.antiB,
          'Anti-AB reaction': t.antiAB,
          'Resulting Blood Type': t.determined
        }))
      });
    }
  };

  const handleReset = () => {
    setAntiAApplied(false); setAntiBApplied(false); setAntiABApplied(false);
    setDeterminedGroup(null); setRevealSample(false);
  };

  const barData = REFERENCE.map(r => ({
    group: r.group,
    antiA: r.antiA === '+' ? 1 : 0,
    antiB: r.antiB === '+' ? 1 : 0,
    antiAB: r.antiAB === '+' ? 1 : 0,
  }));

  return (
    <div style={{ padding: 20, background: '#0a0e1a', minHeight: '100%', fontFamily: 'Inter,sans-serif', color: '#e2e8f0' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🩸 Blood Grouping Test
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>Apply sera to determine blood group from agglutination patterns</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Sample selector */}
          <div style={glass}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔬 Blood Sample Selection
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              {revealSample ? `Sample revealed: Blood Group ${selectedGroup}` : 'Select unknown blood sample (simulate real lab)'}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['A', 'B', 'AB', 'O'].map(g => (
                <button key={g} onClick={() => { setSelectedGroup(g); handleReset(); }}
                  style={{ ...btn(selectedGroup === g, '#3b82f6'), minWidth: 44, fontSize: 14, fontWeight: 700 }}>
                  {g}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
              💡 In a real lab, the blood type would be unknown. Add all three sera to determine the group.
            </div>
          </div>

          {/* Serum application */}
          <div style={glass}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🧪 Apply Antisera
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleApplyA} disabled={antiAApplied} style={{ padding: '10px 16px', borderRadius: 8, cursor: antiAApplied ? 'default' : 'pointer', background: antiAApplied ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${antiAApplied ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, color: antiAApplied ? '#f87171' : '#e2e8f0', fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'all 0.2s' }}>
                {antiAApplied ? '✓' : '💉'} Add Anti-A Serum {antiAApplied ? '(Applied)' : ''}
              </button>
              <button onClick={handleApplyB} disabled={antiBApplied} style={{ padding: '10px 16px', borderRadius: 8, cursor: antiBApplied ? 'default' : 'pointer', background: antiBApplied ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${antiBApplied ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`, color: antiBApplied ? '#93c5fd' : '#e2e8f0', fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'all 0.2s' }}>
                {antiBApplied ? '✓' : '💉'} Add Anti-B Serum {antiBApplied ? '(Applied)' : ''}
              </button>
              <button onClick={handleApplyAB} disabled={antiABApplied} style={{ padding: '10px 16px', borderRadius: 8, cursor: antiABApplied ? 'default' : 'pointer', background: antiABApplied ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${antiABApplied ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, color: antiABApplied ? '#c4b5fd' : '#e2e8f0', fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'all 0.2s' }}>
                {antiABApplied ? '✓' : '💉'} Add Anti-AB Serum {antiABApplied ? '(Applied)' : ''}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={handleDetermine} style={{ flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                🔍 Determine Blood Group
              </button>
              <button onClick={handleReset} style={{ padding: '10px 16px', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Result */}
          {determinedGroup && (
            <div style={{ ...glass, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>✅ Blood Group Determined</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {determinedGroup}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Blood Group: <strong style={{ color: '#e2e8f0' }}>{determinedGroup}</strong></div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {determinedGroup === 'O' ? 'Universal Donor 🎖️' : determinedGroup === 'AB' ? 'Universal Recipient 🎗️' : `Can donate to: ${determinedGroup === 'A' ? 'A, AB' : 'B, AB'}`}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[['Anti-A', results.antiA, '#ef4444'], ['Anti-B', results.antiB, '#3b82f6'], ['Anti-AB', results.antiAB, '#8b5cf6']].map(([label, agg, color]) => (
                    <div key={label} style={{ padding: '8px', borderRadius: 8, background: agg ? `${color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${agg ? color + '40' : 'rgba(255,255,255,0.08)'}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: agg ? color : '#64748b', marginTop: 2 }}>{agg ? '+' : '−'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleRecord} style={{ marginTop: 12, width: '100%', padding: '8px 0', borderRadius: 8, cursor: 'pointer', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                + Record Trial
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Glass slide visualization */}
          <div style={glass}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔬 Glass Slide — Agglutination Results
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
              <BloodWell label="Anti-A Serum" applied={antiAApplied} agglutinated={results.antiA} />
              <BloodWell label="Anti-B Serum" applied={antiBApplied} agglutinated={results.antiB} />
              <BloodWell label="Anti-AB Serum" applied={antiABApplied} agglutinated={results.antiAB} />
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#8B1A1A' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Agglutination (+)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#DC2626' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>No Agglutination (−)</span>
              </div>
            </div>
          </div>

          {/* Reference chart */}
          <div style={glass}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📋 Blood Group Reference Chart
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Blood Group', 'Anti-A', 'Anti-B', 'Anti-AB'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REFERENCE.map(row => (
                  <tr key={row.group} style={{ background: row.group === selectedGroup ? 'rgba(59,130,246,0.1)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#e2e8f0' }}>{row.group}</td>
                    {[row.antiA, row.antiB, row.antiAB].map((val, i) => (
                      <td key={i} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: val === '+' ? '#ef4444' : '#10b981', fontSize: 16 }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Observation table */}
      {trials.length > 0 && (
        <div style={{ ...glass, marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📊 Observation Table
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Trial #', 'Sample ID', 'Anti-A', 'Anti-B', 'Anti-AB', 'Blood Group'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => (
                <tr key={t.no} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{t.no}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8' }}>Sample {t.no}</td>
                  {[t.antiA, t.antiB, t.antiAB].map((v, i) => (
                    <td key={i} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: v === '+' ? '#ef4444' : '#10b981' }}>{v}</td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: 15, color: '#e2e8f0' }}>{t.determined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conclusion */}
      <div style={{ ...glass, marginTop: 20, borderColor: 'rgba(139,92,246,0.2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Scientific Conclusion</div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px' }}>Blood group typing relies on the <strong style={{ color: '#c4b5fd' }}>ABO antigen-antibody system</strong> discovered by Karl Landsteiner. When an antiserum contains antibodies matching the antigens on red blood cells, <strong style={{ color: '#ef4444' }}>agglutination (clumping)</strong> occurs.</p>
          <p style={{ margin: 0 }}>A three-serum test (Anti-A, Anti-B, Anti-AB) produces a binary pattern identifying all four blood groups: <strong style={{ color: '#3b82f6' }}>A (+−+)</strong>, <strong style={{ color: '#8b5cf6' }}>B (−++)</strong>, <strong style={{ color: '#10b981' }}>AB (+++)</strong>, <strong style={{ color: '#f59e0b' }}>O (−−−)</strong>.</p>
        </div>
      </div>
    </div>
  );
}
