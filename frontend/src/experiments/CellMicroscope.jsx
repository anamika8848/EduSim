import React, { useState, useCallback } from 'react';

const glassPanel = {
  background: 'rgba(15, 22, 45, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

const ZOOM_LEVELS = [
  { label: '4x', scale: 1 },
  { label: '10x', scale: 1.5 },
  { label: '40x', scale: 2.5 },
  { label: '100x', scale: 3.5 },
];

const ANIMAL_ORGANELLES = [
  { id: 'membrane', name: 'Cell Membrane', desc: 'Controls what enters/exits the cell. Selectively permeable phospholipid bilayer.', color: '#60a5fa', strokeColor: '#3b82f6' },
  { id: 'nucleus', name: 'Nucleus', desc: 'Control center of the cell. Contains DNA and controls gene expression.', color: '#a78bfa', strokeColor: '#8b5cf6' },
  { id: 'nucleolus', name: 'Nucleolus', desc: 'Synthesizes ribosomal RNA (rRNA) and assembles ribosomes.', color: '#7c3aed', strokeColor: '#6d28d9' },
  { id: 'mito1', name: 'Mitochondria', desc: 'Powerhouse of the cell. Produces ATP via cellular respiration.', color: '#f87171', strokeColor: '#ef4444' },
  { id: 'mito2', name: 'Mitochondria', desc: 'Powerhouse of the cell. Produces ATP via cellular respiration.', color: '#f87171', strokeColor: '#ef4444' },
  { id: 'er', name: 'Endoplasmic Reticulum', desc: 'Network of membranes. Rough ER has ribosomes; Smooth ER synthesizes lipids.', color: '#34d399', strokeColor: '#10b981' },
  { id: 'golgi', name: 'Golgi Apparatus', desc: 'Modifies, packages, and ships proteins to destinations inside and outside cell.', color: '#fbbf24', strokeColor: '#f59e0b' },
  { id: 'lyso', name: 'Lysosome', desc: 'Contains digestive enzymes. Breaks down waste materials and cellular debris.', color: '#fb923c', strokeColor: '#f97316' },
  { id: 'vacuole', name: 'Vacuole', desc: 'Storage organelle. Animal cells have small vacuoles; plant cells have large central vacuole.', color: '#67e8f9', strokeColor: '#06b6d4' },
  { id: 'ribo', name: 'Ribosomes', desc: 'Site of protein synthesis. Can be free in cytoplasm or bound to rough ER.', color: '#94a3b8', strokeColor: '#64748b' },
];

const PLANT_ORGANELLES = [
  { id: 'cellwall', name: 'Cell Wall', desc: 'Rigid outer layer made of cellulose. Provides structural support and protection.', color: '#92400e', strokeColor: '#78350f' },
  { id: 'membrane', name: 'Cell Membrane', desc: 'Controls what enters/exits the cell. Lies inside the cell wall.', color: '#60a5fa', strokeColor: '#3b82f6' },
  { id: 'nucleus', name: 'Nucleus', desc: 'Control center containing DNA and directing cellular activities.', color: '#a78bfa', strokeColor: '#8b5cf6' },
  { id: 'chloro1', name: 'Chloroplast', desc: 'Site of photosynthesis. Contains chlorophyll that captures light energy.', color: '#4ade80', strokeColor: '#22c55e' },
  { id: 'chloro2', name: 'Chloroplast', desc: 'Site of photosynthesis. Contains chlorophyll that captures light energy.', color: '#4ade80', strokeColor: '#22c55e' },
  { id: 'chloro3', name: 'Chloroplast', desc: 'Site of photosynthesis. Contains chlorophyll that captures light energy.', color: '#4ade80', strokeColor: '#22c55e' },
  { id: 'vacuole', name: 'Central Vacuole', desc: 'Large storage organelle in plant cells. Maintains turgor pressure.', color: '#67e8f9', strokeColor: '#06b6d4' },
  { id: 'mito', name: 'Mitochondria', desc: 'Produces ATP via cellular respiration.', color: '#f87171', strokeColor: '#ef4444' },
  { id: 'golgi', name: 'Golgi Apparatus', desc: 'Packages and secretes proteins and lipids.', color: '#fbbf24', strokeColor: '#f59e0b' },
];

function AnimalCellSVG({ zoom, onSelect, selectedId }) {
  const s = 1;
  return (
    <g transform={`scale(${zoom}) translate(${220 / zoom - 220}, ${200 / zoom - 200})`}>
      {/* Cytoplasm */}
      <ellipse cx={220} cy={200} rx={160} ry={140} fill="rgba(186,230,253,0.08)" stroke="#60a5fa"
        strokeWidth={2 / zoom} strokeDasharray={`${6 / zoom},${3 / zoom}`}
        onClick={() => onSelect('membrane')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'membrane' ? 1 : 0.7} />

      {/* Vacuole */}
      <ellipse cx={290} cy={130} rx={30} ry={22} fill="rgba(103,232,249,0.2)" stroke="#06b6d4"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('vacuole')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'vacuole' ? 1 : 0.7} />
      {zoom >= 1.5 && <text x={290} y={133} textAnchor="middle" fill="#06b6d4" fontSize={10 / zoom}>Vacuole</text>}

      {/* Nucleus */}
      <ellipse cx={210} cy={195} rx={50} ry={44} fill="rgba(167,139,250,0.2)" stroke="#8b5cf6"
        strokeWidth={2 / zoom} onClick={() => onSelect('nucleus')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'nucleus' ? 1 : 0.8} />
      {/* Nucleolus */}
      <circle cx={210} cy={195} r={16} fill="rgba(124,58,237,0.35)" stroke="#7c3aed"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('nucleolus')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'nucleolus' ? 1 : 0.8} />
      {zoom >= 1.5 && <text x={210} y={198} textAnchor="middle" fill="#c4b5fd" fontSize={9 / zoom}>Nucleolus</text>}
      {zoom >= 1 && <text x={210} y={252} textAnchor="middle" fill="#a78bfa" fontSize={10 / zoom}>Nucleus</text>}

      {/* Mitochondria */}
      <ellipse cx={130} cy={160} rx={26} ry={13} fill="rgba(248,113,113,0.25)" stroke="#ef4444"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('mito1')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'mito1' ? 1 : 0.8} />
      {zoom >= 1.5 && <path d={`M 122,160 Q 130,153 138,160 Q 130,167 122,160`} fill="none" stroke="#f87171" strokeWidth={1 / zoom} />}

      <ellipse cx={300} cy={230} rx={26} ry={13} fill="rgba(248,113,113,0.25)" stroke="#ef4444"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('mito2')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'mito2' ? 1 : 0.8} />
      {zoom >= 1.5 && <text x={300} y={235} textAnchor="middle" fill="#f87171" fontSize={8 / zoom}>Mito.</text>}

      {/* ER (wavy lines) */}
      <path d="M 145 230 Q 155 220 165 230 Q 175 240 185 230 Q 195 220 205 230"
        fill="none" stroke="#10b981" strokeWidth={2 / zoom}
        onClick={() => onSelect('er')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'er' ? 1 : 0.7} />
      {zoom >= 1 && <text x={175} y={248} textAnchor="middle" fill="#34d399" fontSize={8 / zoom}>ER</text>}

      {/* Golgi */}
      {[0, 1, 2].map(i => (
        <path key={i} d={`M ${310 - i * 2} ${170 + i * 10} Q ${330} ${175 + i * 10} ${350 + i * 2} ${170 + i * 10}`}
          fill="none" stroke="#f59e0b" strokeWidth={3 / zoom}
          onClick={() => onSelect('golgi')} style={{ cursor: 'pointer' }}
          opacity={selectedId === 'golgi' ? 1 : 0.7} />
      ))}
      {zoom >= 1 && <text x={330} y={210} textAnchor="middle" fill="#fbbf24" fontSize={8 / zoom}>Golgi</text>}

      {/* Lysosomes */}
      <circle cx={155} cy={280} r={10} fill="rgba(251,146,60,0.3)" stroke="#f97316"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('lyso')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'lyso' ? 1 : 0.7} />
      {zoom >= 2 && <text x={155} y={283} textAnchor="middle" fill="#fb923c" fontSize={7 / zoom}>Lyso</text>}

      {/* Ribosomes */}
      {[[270, 180], [260, 220], [280, 260], [170, 130]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={4 / zoom * (zoom > 2 ? 2 : 1)} fill="#94a3b8"
          onClick={() => onSelect('ribo')} style={{ cursor: 'pointer' }}
          opacity={selectedId === 'ribo' ? 1 : 0.6} />
      ))}
    </g>
  );
}

function PlantCellSVG({ zoom, onSelect, selectedId }) {
  return (
    <g transform={`scale(${zoom}) translate(${220 / zoom - 220}, ${200 / zoom - 200})`}>
      {/* Cell Wall */}
      <rect x={60} y={60} width={320} height={280} rx={18} fill="rgba(146,64,14,0.15)" stroke="#92400e"
        strokeWidth={8 / zoom} onClick={() => onSelect('cellwall')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'cellwall' ? 1 : 0.8} />
      {/* Cell Membrane */}
      <rect x={68} y={68} width={304} height={264} rx={14} fill="rgba(96,165,250,0.06)" stroke="#3b82f6"
        strokeWidth={2 / zoom} strokeDasharray={`${6 / zoom},${3 / zoom}`}
        onClick={() => onSelect('membrane')} style={{ cursor: 'pointer' }} />

      {/* Central Vacuole */}
      <ellipse cx={220} cy={200} rx={90} ry={80} fill="rgba(103,232,249,0.15)" stroke="#06b6d4"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('vacuole')} style={{ cursor: 'pointer' }}
        opacity={selectedId === 'vacuole' ? 1 : 0.7} />
      {zoom >= 1 && <text x={220} y={203} textAnchor="middle" fill="#06b6d4" fontSize={10 / zoom}>Central Vacuole</text>}

      {/* Nucleus */}
      <ellipse cx={280} cy={130} rx={42} ry={36} fill="rgba(167,139,250,0.2)" stroke="#8b5cf6"
        strokeWidth={2 / zoom} onClick={() => onSelect('nucleus')} style={{ cursor: 'pointer' }} />
      <circle cx={280} cy={130} r={12} fill="rgba(124,58,237,0.35)" stroke="#7c3aed" strokeWidth={1.5 / zoom} />
      {zoom >= 1 && <text x={280} y={172} textAnchor="middle" fill="#a78bfa" fontSize={9 / zoom}>Nucleus</text>}

      {/* Chloroplasts */}
      {[[110, 120], [100, 270], [340, 250]].map(([cx, cy], i) => (
        <g key={i} onClick={() => onSelect(`chloro${i + 1}`)} style={{ cursor: 'pointer' }}>
          <ellipse cx={cx} cy={cy} rx={28} ry={14} fill="rgba(74,222,128,0.3)" stroke="#22c55e"
            strokeWidth={1.5 / zoom} opacity={selectedId === `chloro${i + 1}` ? 1 : 0.8} />
          {zoom >= 2 && <line x1={cx - 18} y1={cy} x2={cx + 18} y2={cy} stroke="#4ade80" strokeWidth={1 / zoom} />}
        </g>
      ))}
      {zoom >= 1 && <text x={110} y={142} textAnchor="middle" fill="#4ade80" fontSize={8 / zoom}>Chloro.</text>}

      {/* Mitochondria */}
      <ellipse cx={340} cy={150} rx={22} ry={11} fill="rgba(248,113,113,0.25)" stroke="#ef4444"
        strokeWidth={1.5 / zoom} onClick={() => onSelect('mito')} style={{ cursor: 'pointer' }} />

      {/* Golgi */}
      {[0, 1, 2].map(i => (
        <path key={i} d={`M ${145} ${270 + i * 9} Q ${165} ${273 + i * 9} ${185} ${270 + i * 9}`}
          fill="none" stroke="#f59e0b" strokeWidth={3 / zoom}
          onClick={() => onSelect('golgi')} style={{ cursor: 'pointer' }} />
      ))}
    </g>
  );
}

export default function CellMicroscope({ onProgressUpdate, experimentData, onSimulationData }) {
  const [zoomIdx, setZoomIdx] = useState(0);
  const [cellType, setCellType] = useState('animal');
  const [selectedOrganelle, setSelectedOrganelle] = useState(null);
  const [observations, setObservations] = useState([]);
  const [diagramNote, setDiagramNote] = useState('');
  const [progressSteps, setProgressSteps] = useState(new Set());

  const zoom = ZOOM_LEVELS[zoomIdx].scale;
  const organelles = cellType === 'animal' ? ANIMAL_ORGANELLES : PLANT_ORGANELLES;
  const selected = organelles.find(o => o.id === selectedOrganelle);

  const markStep = useCallback((step) => {
    if (!progressSteps.has(step)) {
      setProgressSteps(prev => new Set([...prev, step]));
      if (onProgressUpdate) onProgressUpdate(step);
    }
  }, [progressSteps, onProgressUpdate]);

  const handleSelectOrganelle = (id) => {
    setSelectedOrganelle(id);
    markStep(1);
  };

  const handleRecord = () => {
    if (!selectedOrganelle) return;
    const newObservation = {
      id: observations.length + 1,
      zoom: ZOOM_LEVELS[zoomIdx].label,
      organelle: selected?.name || selectedOrganelle,
      desc: selected?.desc || '',
      note: diagramNote || 'Not noted',
    };
    const updatedObservations = [...observations, newObservation];
    setObservations(updatedObservations);
    setDiagramNote('');
    markStep(2);
    if (onSimulationData) {
      onSimulationData({
        parameters: { 'Specimen Type': cellType.toUpperCase() + ' CELL', 'Lens Magnification': ZOOM_LEVELS[zoomIdx].label },
        results: { 'Observations Count': `${updatedObservations.length}` },
        trials: updatedObservations.map((o, idx) => ({
          '#': idx + 1,
          'Structure Identified': o.organelle,
          'Description/Function': o.desc,
          'User Annotation Note': o.note
        }))
      });
    }
  };

  const svgSize = 440;
  const clipR = svgSize / 2 - 10;

  return (
    <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#a78bfa', margin: 0 }}>
          🔬 Cell Microscope Lab
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.9rem' }}>
          Study animal and plant cell organelles at different magnifications
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginBottom: '20px' }}>
        {/* Microscope view */}
        <div style={glassPanel}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {/* Cell type toggle */}
            <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              {['animal', 'plant'].map(t => (
                <button key={t} onClick={() => { setCellType(t); setSelectedOrganelle(null); }}
                  style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                    background: cellType === t ? 'rgba(139,92,246,0.3)' : 'transparent',
                    color: cellType === t ? '#a78bfa' : '#94a3b8' }}>
                  {t === 'animal' ? '🐾 Animal' : '🌿 Plant'}
                </button>
              ))}
            </div>
            {/* Zoom buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {ZOOM_LEVELS.map((z, i) => (
                <button key={i} onClick={() => setZoomIdx(i)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: `1px solid ${zoomIdx === i ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontSize: '0.82rem',
                    background: zoomIdx === i ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)',
                    color: zoomIdx === i ? '#a78bfa' : '#64748b', fontWeight: zoomIdx === i ? 700 : 400 }}>
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Microscope eyepiece */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: svgSize, height: svgSize, maxWidth: '100%' }}>
              {/* Outer ring shadow */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                boxShadow: '0 0 0 8px rgba(0,0,0,0.6), 0 0 0 12px #1e293b, inset 0 0 30px rgba(0,0,0,0.8)',
                pointerEvents: 'none', zIndex: 2,
              }} />
              <svg width={svgSize} height={svgSize} style={{ borderRadius: '50%', background: 'rgba(15,22,45,0.95)', border: '6px solid #1e293b' }}>
                <defs>
                  <clipPath id="scope">
                    <circle cx={svgSize / 2} cy={svgSize / 2} r={clipR} />
                  </clipPath>
                  <radialGradient id="scopeVig" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
                  </radialGradient>
                </defs>

                {/* Cell content */}
                <g clipPath="url(#scope)">
                  {/* Background slide color */}
                  <rect x={0} y={0} width={svgSize} height={svgSize} fill={cellType === 'plant' ? 'rgba(20,83,45,0.08)' : 'rgba(30,58,138,0.06)'} />

                  {/* Cell */}
                  <g transform={`translate(${svgSize / 2 - 220}, ${svgSize / 2 - 200})`}>
                    {cellType === 'animal' ? (
                      <AnimalCellSVG zoom={zoom} onSelect={handleSelectOrganelle} selectedId={selectedOrganelle} />
                    ) : (
                      <PlantCellSVG zoom={zoom} onSelect={handleSelectOrganelle} selectedId={selectedOrganelle} />
                    )}
                  </g>
                </g>

                {/* Vignette */}
                <circle cx={svgSize / 2} cy={svgSize / 2} r={clipR} fill="url(#scopeVig)" />

                {/* Crosshairs */}
                <line x1={svgSize / 2} y1={10} x2={svgSize / 2} y2={svgSize - 10} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <line x1={10} y1={svgSize / 2} x2={svgSize - 10} y2={svgSize / 2} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

                {/* Zoom label */}
                <text x={svgSize - 16} y={svgSize - 16} textAnchor="end" fill="#475569" fontSize={12} fontFamily="monospace">
                  {ZOOM_LEVELS[zoomIdx].label}
                </text>
              </svg>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.78rem', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
            Click on organelles to learn about them. Use zoom buttons to magnify.
          </p>
        </div>

        {/* Info Panel + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Organelle Info */}
          <div style={{ ...glassPanel, flex: 1 }}>
            <h3 style={{ color: '#a78bfa', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>
              🧬 Organelle Information
            </h3>
            {selected ? (
              <div>
                <div style={{ padding: '14px', background: `rgba(${parseInt(selected.color.slice(1,3),16)||100},${parseInt(selected.color.slice(3,5),16)||100},${parseInt(selected.color.slice(5,7),16)||200},0.1)`, borderRadius: '8px', border: `1px solid ${selected.strokeColor}`, marginBottom: '12px' }}>
                  <div style={{ color: selected.color, fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{selected.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{selected.desc}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <span style={{ color: '#a78bfa' }}>Cell type:</span> {cellType === 'animal' ? '🐾 Animal' : '🌿 Plant'} |{' '}
                  <span style={{ color: '#a78bfa' }}>Zoom:</span> {ZOOM_LEVELS[zoomIdx].label}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#475569', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👆</div>
                Click on any organelle in the microscope view to see information here
              </div>
            )}
          </div>

          {/* Record controls */}
          <div style={glassPanel}>
            <h3 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>📝 Record Observation</h3>
            <input
              type="text"
              placeholder="Diagram notes (e.g. oval shaped, double membrane...)"
              value={diagramNote}
              onChange={e => setDiagramNote(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <button onClick={handleRecord} disabled={!selectedOrganelle}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.15)', color: selectedOrganelle ? '#34d399' : '#374151', cursor: selectedOrganelle ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
              📋 Record Observation
            </button>
          </div>

          {/* Organelle list */}
          <div style={{ ...glassPanel, maxHeight: '200px', overflowY: 'auto' }}>
            <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '10px', fontSize: '0.9rem' }}>
              Cell Components ({cellType})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {organelles.filter((o, i, arr) => arr.findIndex(x => x.name === o.name) === i).map(o => (
                <button key={o.id} onClick={() => handleSelectOrganelle(o.id)}
                  style={{ padding: '4px 10px', borderRadius: '20px', border: `1px solid ${selectedOrganelle === o.id ? o.strokeColor : 'rgba(255,255,255,0.1)'}`, background: selectedOrganelle === o.id ? `rgba(${parseInt(o.color.slice(1,3),16)||100},${parseInt(o.color.slice(3,5),16)||100},${parseInt(o.color.slice(5,7),16)||200},0.2)` : 'rgba(255,255,255,0.03)', color: selectedOrganelle === o.id ? o.color : '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}>
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Table */}
      <div style={glassPanel}>
        <h3 style={{ color: '#06b6d4', marginTop: 0, marginBottom: '14px', fontSize: '1rem' }}>📊 Observation Worksheet</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(139,92,246,0.12)' }}>
                {['#', 'Zoom', 'Organelle', 'Function (Summary)', 'Diagram Notes'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#c4b5fd', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {observations.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>Click organelles and record your observations above.</td></tr>
              ) : observations.map((o, i) => (
                <tr key={o.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '8px 14px', color: '#64748b' }}>{o.id}</td>
                  <td style={{ padding: '8px 14px', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 600 }}>{o.zoom}</td>
                  <td style={{ padding: '8px 14px', color: '#a78bfa', fontWeight: 600 }}>{o.organelle}</td>
                  <td style={{ padding: '8px 14px', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '200px' }}>{o.desc.substring(0, 60)}{o.desc.length > 60 ? '...' : ''}</td>
                  <td style={{ padding: '8px 14px', color: '#60a5fa', fontSize: '0.8rem' }}>{o.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
