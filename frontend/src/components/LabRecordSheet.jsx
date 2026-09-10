import React from 'react';

// pre-filled metadata for the 9 experiments
const LAB_METADATA = {
  'simple pendulum': {
    objective: 'To determine the acceleration due to gravity (g) using a simple pendulum and verify the relation between the length of the pendulum and its time period of oscillation.',
    theory: 'For small angular displacements, a simple pendulum executes simple harmonic motion. The time period is given by T = 2π√(L/g). Plotting T² against L yields a straight line with slope 4π²/g, from which g can be verified.',
    apparatus: 'Heavy metal spherical bob, inextensible string, rigid support stand, length adjustment slider, angular displacement control, digital stopwatch, oscillation counter.',
    procedure: '1. Select a pendulum string length (L) and set the initial displacement angle (< 15°).\n2. Release the bob to start oscillations.\n3. Record the time elapsed for a fixed number of oscillations.\n4. Calculate the time period (T) and repeat for different string lengths.',
    calcTheoretical: (params) => {
      const length = parseFloat(params['Length'] || params['length'] || 50);
      const g = 9.8;
      const tTheory = 2 * Math.PI * Math.sqrt(length / 100 / g);
      return {
        'Theoretical Time Period': `${tTheory.toFixed(3)} s`,
        formula: 'T = 2π√(L/g)'
      };
    }
  },
  "ohm's law": {
    objective: "To verify Ohm's Law by studying the relationship between potential difference (voltage) across a resistor and the current flowing through it, and to determine the resistance.",
    theory: "Ohm's Law states that the current (I) flowing through a conductor is directly proportional to the potential difference (V) across its ends, provided temperature and physical conditions remain constant: V = IR. The ratio V/I represents the resistance (R).",
    apparatus: 'DC variable power supply, standard resistor, digital ammeter, digital voltmeter, connecting wires, single-pole switch.',
    procedure: '1. Construct the circuit with the variable resistor and DC power source.\n2. Adjust the voltage slider and observe the current in the ammeter.\n3. Record the voltage and current values for multiple trials.\n4. Verify that V/I ratio remains constant, indicating resistance.',
    calcTheoretical: (params) => {
      const v = parseFloat(params['Voltage (V)'] || params['voltage'] || 6);
      const r = parseFloat(params['Resistance (R)'] || params['resistance'] || 30);
      const iTheory = v / r;
      return {
        'Expected Current (I)': `${iTheory.toFixed(3)} A`,
        formula: 'I = V/R'
      };
    }
  },
  'projectile motion': {
    objective: 'To study the motion of a projectile launched under gravity and analyze the relationship between launch angle, initial velocity, range, maximum height, and time of flight.',
    theory: 'A projectile is an object thrown into the air, subject only to the acceleration of gravity (g = 9.8 m/s²). Its path is a parabola. The horizontal motion has constant velocity, while the vertical motion is under constant acceleration.',
    apparatus: 'Projectile launcher, gravity environment simulator, launch angle control slider, velocity calibration unit, trajectory tracker, horizontal range grid.',
    procedure: '1. Calibrate the launcher to the default velocity (20 m/s) and angle (45°).\n2. Click "Fire" to launch the projectile.\n3. Review the trajectory trace and read simulated range, height, and flight time.\n4. Change parameters and record multiple trials in the observation table.',
    calcTheoretical: (params) => {
      const v = parseFloat(params['Initial Velocity (v₀)'] || params['velocity'] || 20);
      const theta = parseFloat(params['Launch Angle (θ)'] || params['angle'] || 45);
      const g = 9.8;
      const rad = (theta * Math.PI) / 180;
      const range = (v ** 2 * Math.sin(2 * rad)) / g;
      const maxH = (v ** 2 * Math.sin(rad) ** 2) / (2 * g);
      const tof = (2 * v * Math.sin(rad)) / g;
      return {
        'Theoretical Range': `${range.toFixed(2)} m`,
        'Theoretical Max Height': `${maxH.toFixed(2)} m`,
        'Theoretical Time of Flight': `${tof.toFixed(2)} s`,
        formula: 'R = v²sin(2θ)/g, H = v²sin²(θ)/2g'
      };
    }
  },
  'acid-base titration': {
    objective: 'To determine the concentration of an acid (HCl) by titrating it against a standard solution of a base (NaOH) using a pH indicator, and to plot the titration curve.',
    theory: 'Neutralization reaction occurs when an acid reacts with a base to form salt and water: HCl + NaOH → NaCl + H₂O. At the equivalence point, the moles of acid equal the moles of base. A pH indicator (Phenolphthalein) changes color at the endpoint due to pH transition.',
    apparatus: 'Volumetric burette (50 mL), Conical flask (100 mL), pH meter, standard NaOH base solution, unknown HCl acid solution, phenolphthalein indicator.',
    procedure: '1. Fill the burette with NaOH solution and place HCl with indicator in the conical flask.\n2. Slowly add NaOH from the burette in steps.\n3. Record the pH value at each volume addition step.\n4. Note the volume where neutralization occurs and the solution changes color.',
    calcTheoretical: (params) => {
      const naoh = parseFloat(params['Volume NaOH Added'] || params['naohAdded'] || 0);
      // Titration curve calculation
      const phTheory = 7 + 3 * Math.tanh((naoh - 25) / 2);
      return {
        'Expected Solution pH': `${phTheory.toFixed(2)}`,
        formula: 'pH = f(Vol NaOH)'
      };
    }
  },
  'electrolysis of water': {
    objective: 'To study the decomposition of water into hydrogen and oxygen gases by passing an electric current, and to verify Avogadro\'s law regarding gas volumes.',
    theory: 'Electrolysis of water is the decomposition of water (H₂O) into oxygen (O₂) and hydrogen (H₂) gas due to an electric current. The overall reaction is 2H₂O(l) → 2H₂(g) + O₂(g). The volume of hydrogen gas produced is double that of oxygen.',
    apparatus: 'Hofmann voltameter, platinum electrodes, DC power source, acidified water electrolyte, gas collection tubes, current adjustment dial.',
    procedure: '1. Fill the voltameter with acidified water to improve conductivity.\n2. Turn on the DC power source and set current.\n3. Observe gas bubbles forming at the anode (oxygen) and cathode (hydrogen).\n4. Record the volumes of gas collected in the tubes over time.',
    calcTheoretical: (params) => {
      const current = parseFloat(params['Electric Current'] || params['current'] || 2);
      const time = parseFloat(params['Time Elapsed'] || params['timeElapsed'] || 0);
      const h2Theory = 0.01 * current * time;
      const o2Theory = 0.005 * current * time;
      return {
        'Theoretical H₂ Volume': `${h2Theory.toFixed(3)} mL`,
        'Theoretical O₂ Volume': `${o2Theory.toFixed(3)} mL`,
        formula: '2H₂O → 2H₂ + O₂ (Ratio 2:1)'
      };
    }
  },
  'ph measurement': {
    objective: 'To measure the pH values of various household solutions using a pH meter and to classify them as acidic, basic, or neutral.',
    theory: 'pH is a measure of the hydrogen ion concentration in a solution, defined as pH = -log[H⁺]. Solutions with pH < 7 are acidic, pH = 7 is neutral, and pH > 7 are basic.',
    apparatus: 'Digital pH meter, calibration buffer solutions, household solution samples (lemon juice, soap, vinegar, pure water), beakers.',
    procedure: '1. Calibrate the pH meter using buffer solutions.\n2. Insert the pH probe into the solution sample beaker.\n3. Wait for the pH reading to stabilize and record the value.\n4. Rinse the probe and repeat for other samples.',
    calcTheoretical: (params) => {
      const activeSol = params['Active Solution'] || params['selectedSolution'] || 'Pure Water';
      const map = {
        'Lemon Juice': 2.0,
        'Vinegar': 3.0,
        'Coffee': 5.0,
        'Pure Water': 7.0,
        'Baking Soda': 8.5,
        'Soap Solution': 10.0,
        'Ammonia': 11.5,
        'Bleach': 13.0
      };
      const ph = map[activeSol] ?? 7.0;
      return {
        'Theoretical pH Value': `${ph.toFixed(2)}`,
        formula: 'pH = -log[H⁺]'
      };
    }
  },
  'osmosis & diffusion': {
    objective: 'To study the process of osmosis through a semipermeable membrane and analyze the effect of concentration gradient on the rate of water movement.',
    theory: 'Osmosis is the passive movement of water molecules from a region of lower solute concentration (higher water potential) to a region of higher solute concentration (lower water potential) across a semipermeable membrane.',
    apparatus: 'Dialysis tubing membrane bag, thistle tube, beaker, concentration solution samples (sugar/salt), water bath temperature controls.',
    procedure: '1. Fill the dialysis bag with high concentration solution and place in a beaker of pure water.\n2. Set the initial liquid level in the thistle tube.\n3. Monitor the water level rise in the tube over time.\n4. Repeat the experiment with different concentration gradients.',
    calcTheoretical: (params) => {
      const inside = parseFloat(params['Inside Concentration'] || params['insideConc'] || 10);
      const outside = parseFloat(params['Outside Concentration'] || params['outsideConc'] || 5);
      const maxRise = Math.abs(inside - outside) * 2.5;
      return {
        'Expected Max Liquid Rise': `${maxRise.toFixed(2)} mm`,
        formula: 'Rise ∝ ΔC (C_in - C_out)'
      };
    }
  },
  'cell under microscope': {
    objective: 'To prepare and observe animal and plant cell specimens under a compound microscope, identifying their major organelles and structural differences.',
    theory: 'Cells are the basic structural and functional units of life. Plant cells have a rigid outer cell wall, chloroplasts for photosynthesis, and a large central vacuole. Animal cells lack a cell wall and chloroplasts, having smaller vacuoles.',
    apparatus: 'Compound light microscope, animal cell specimen slide (cheek cells), plant cell specimen slide (onion peel), magnification lens control, focus dials.',
    procedure: '1. Place the cell specimen slide on the microscope stage.\n2. Start observation under low magnification (4x/10x).\n3. Switch to high magnification (40x/100x) and adjust fine focus.\n4. Identify organelles like cell wall, nucleus, and chloroplasts.',
    calcTheoretical: (params) => {
      const type = params['Specimen Type'] || params['cellType'] || 'ANIMAL';
      const cell = type.toLowerCase().includes('animal') ? 'Animal Cell' : 'Plant Cell';
      return {
        'Cell System Expected': `${cell} Specimen`,
        formula: 'Organelle Identification Structure'
      };
    }
  },
  'blood grouping test': {
    objective: 'To determine the ABO blood group and Rh factor of a blood sample by observing agglutination reactions with specific antibodies (Anti-A, Anti-B, and Anti-D).',
    theory: 'Blood grouping is based on the presence or absence of specific antigens on red blood cells. Agglutination (clumping) occurs when red blood cells containing a specific antigen react with corresponding antibodies (antisera).',
    apparatus: 'Blood grouping slide tiles, unknown blood sample, Anti-A, Anti-B, and Anti-D (Rh) antisera reagent bottles, mixing sticks.',
    procedure: '1. Dispense blood drops onto the three wells of a slide.\n2. Add Anti-A, Anti-B, and Anti-D sera to the respective wells.\n3. Mix gently and observe for agglutination (clumping) reactions.\n4. Determine blood type based on clumping pattern.',
    calcTheoretical: (params) => {
      const sample = params['Sample Name'] || params['sampleName'] || 'Sample A';
      const bloodGroup = sample.replace('Sample ', '');
      return {
        'Anticipated Blood Type': bloodGroup,
        formula: 'Agglutination Co-matching'
      };
    }
  }
};

export default function LabRecordSheet({ report }) {
  if (!report) return null;

  const expName = report.experiment || 'Experiment';
  const meta = LAB_METADATA[expName.toLowerCase()] || {
    objective: 'To study the properties and outcomes of the virtual experiment.',
    theory: 'Theoretical formulas are determined based on the physical parameters chosen during the simulation.',
    apparatus: 'Virtual laboratory apparatus, simulation controllers, digital sensor overlays.',
    procedure: '1. Launch the laboratory simulation workspace.\n2. Adjust variables on the control dashboard.\n3. Execute the simulation and record trials.\n4. Log and analyze results.',
    calcTheoretical: () => null
  };

  let status = "Draft";
  if (report.isDraft === false) {
    status = report.evaluation ? "Graded" : "Submitted";
  }

  const parameters = report.parameters || {};
  const results = report.results || {};
  const trials = report.trials || [];

  // Theoretical Analysis computation
  let theoryAnalysis = null;
  if (meta.calcTheoretical) {
    const tData = meta.calcTheoretical(parameters);
    if (tData) {
      const key = Object.keys(tData)[0];
      const theoryVal = tData[key];
      const formula = tData.formula;

      // Extract observed value matching this key
      let observedVal = 'N/A';
      let pctError = null;

      if (expName.toLowerCase() === 'simple pendulum') {
        observedVal = results['Theoretical Period (T)'] || results['period'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(theoryVal);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === "ohm's law") {
        observedVal = results['Electric Current (I)'] || results['current'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(theoryVal);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'projectile motion') {
        observedVal = results['Horizontal Range (R)'] || results['range'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(tData['Theoretical Range']);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'acid-base titration') {
        observedVal = results['Solution pH'] || results['pH'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(theoryVal);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'electrolysis of water') {
        observedVal = results['Hydrogen Gas (H₂)'] || results['h2Volume'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(tData['Theoretical H₂ Volume']);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'ph measurement') {
        observedVal = results['Measured pH'] || results['pH'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(theoryVal);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'osmosis & diffusion') {
        observedVal = results['Liquid Rise/Fall'] || results['waterRise'] || 'N/A';
        const obsNum = parseFloat(observedVal);
        const theoryNum = parseFloat(theoryVal);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'cell under microscope') {
        observedVal = results['Observations Count'] || 'N/A';
        pctError = 0.00;
      } else if (expName.toLowerCase() === 'blood grouping test') {
        observedVal = results['Determined Blood Group'] || 'N/A';
        pctError = observedVal === tData['Anticipated Blood Type'] ? 0.00 : 100;
      }

      theoryAnalysis = {
        name: key.replace('Theoretical ', ''),
        theoryVal,
        observedVal: typeof observedVal === 'number' ? observedVal.toFixed(3) : observedVal,
        formula,
        pctError: pctError !== null ? `${pctError.toFixed(2)}%` : '0.00%'
      };
    }
  }

  const metadata = report.metadata || {};
  const isDraft = report.isDraft === true;

  // Lined notebook styling
  const notebookStyle = {
    background: '#151c2c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '2.5rem',
    fontFamily: "'Courier New', Courier, monospace",
    lineHeight: '1.6',
    color: '#cbd5e1',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    maxWidth: '850px',
    margin: '0 auto',
    position: 'relative'
  };

  const lineStyle = {
    borderBottom: '1px dashed rgba(255,255,255,0.07)',
    minHeight: '2.2rem',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0.5rem'
  };

  const headerStyle = {
    textAlign: 'center',
    borderBottom: '3px double rgba(59,130,246,0.3)',
    paddingBottom: '1.5rem',
    marginBottom: '2rem'
  };

  const sectionHeaderStyle = {
    color: '#3b82f6',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '1.8rem',
    marginBottom: '0.8rem',
    borderBottom: '1px solid rgba(59,130,246,0.2)',
    paddingBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const tableHeaderCell = {
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px 12px',
    textAlign: 'left',
    background: 'rgba(59,130,246,0.08)',
    color: '#3b82f6',
    fontSize: '0.85rem'
  };

  const tableBodyCell = {
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px 12px',
    fontSize: '0.85rem',
    color: '#94a3b8'
  };

  return (
    <div style={notebookStyle} className="notebook-record">
      {/* Draft Badge */}
      {isDraft && (
        <div style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b',
          padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px'
        }}>
          REPORT DRAFT
        </div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>EDUSIM</h1>
        <p style={{ margin: '4px 0 10px', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Virtual Laboratory Simulator
        </p>
        <div style={{
          display: 'inline-block', border: '1px solid rgba(59,130,246,0.3)',
          padding: '4px 14px', borderRadius: '4px', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold'
        }}>
          LABORATORY REPORT RECORD
        </div>
      </div>

      {/* Meta Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem'
      }}>
        <div><strong>Report ID:</strong> {report.reportId || 'EDUSIM-LAB-2026-XXXXXX'}</div>
        <div><strong>Date:</strong> {report.date || new Date().toLocaleDateString('en-IN')}</div>
        <div><strong>Experiment:</strong> {expName}</div>
        <div><strong>Subject:</strong> {report.subject || 'N/A'}</div>
        <div><strong>Student Name:</strong> {metadata.generatedBy || report.studentName || 'N/A'}</div>
        <div><strong>Roll Number:</strong> {report.rollNumber || 'N/A'}</div>
        <div><strong>Classroom:</strong> {report.className || 'N/A'}</div>
        <div><strong>Evaluated By:</strong> {report.teacherName || 'N/A'}</div>
        <div>
          <strong>Report Status:</strong>{' '}
          <span style={{
            color: status === 'Graded' ? '#10b981' : status === 'Submitted' ? '#3b82f6' : '#f59e0b',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {status}
          </span>
        </div>
      </div>

      {/* Objective */}
      <div style={sectionHeaderStyle}>I. Objective</div>
      <div style={{ ...lineStyle, height: 'auto', minHeight: '3rem', fontSize: '0.88rem', color: '#94a3b8' }}>
        {meta.objective}
      </div>

      {/* Theory */}
      <div style={sectionHeaderStyle}>II. Physical Theory & Principle</div>
      <div style={{ ...lineStyle, height: 'auto', minHeight: '4.5rem', fontSize: '0.88rem', color: '#94a3b8' }}>
        {meta.theory}
      </div>

      {/* Apparatus */}
      <div style={sectionHeaderStyle}>III. Apparatus & Materials Required</div>
      <div style={{ ...lineStyle, height: 'auto', minHeight: '3rem', fontSize: '0.88rem', color: '#94a3b8' }}>
        {meta.apparatus}
      </div>

      {/* Procedure */}
      <div style={sectionHeaderStyle}>IV. Experimental Procedure</div>
      <div style={{
        background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)',
        whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace'
      }}>
        {meta.procedure}
      </div>

      {/* Parameters */}
      <div style={sectionHeaderStyle}>V. Active Parameters Settings</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', marginBottom: '1rem' }}>
        {Object.entries(parameters).map(([key, val]) => (
          <div key={key} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>{key}: </span>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{String(val)}</span>
          </div>
        ))}
      </div>

      {/* Observed Values */}
      <div style={sectionHeaderStyle}>VI. Experimental Result Values</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', marginBottom: '1.5rem' }}>
        {Object.entries(results).map(([key, val]) => (
          <div key={key} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>{key}: </span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{String(val)}</span>
          </div>
        ))}
      </div>

      {/* Theoretical Comparison */}
      {theoryAnalysis && (
        <>
          <div style={sectionHeaderStyle}>VII. Theoretical vs. Observed Analysis</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th style={tableHeaderCell}>Metric</th>
                <th style={tableHeaderCell}>Theoretical (Formula)</th>
                <th style={tableHeaderCell}>Observed (Simulation)</th>
                <th style={tableHeaderCell}>Deviation / Error</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tableBodyCell}><strong>{theoryAnalysis.name}</strong></td>
                <td style={tableBodyCell}><span style={{ fontFamily: 'monospace' }}>{theoryAnalysis.theoryVal}</span></td>
                <td style={tableBodyCell}><span style={{ fontFamily: 'monospace', color: '#10b981' }}>{theoryAnalysis.observedVal}</span></td>
                <td style={tableBodyCell}><span style={{ fontWeight: 'bold', color: theoryAnalysis.pctError === '0.00%' ? '#10b981' : '#f59e0b' }}>{theoryAnalysis.pctError}</span></td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '-0.8rem', marginBottom: '1.5rem' }}>
            *Calculated dynamically via relation: {theoryAnalysis.formula}
          </div>
        </>
      )}

      {/* Trials Table */}
      {trials.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>VIII. Recorded Observation Table (Trials)</div>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(trials[0]).map(k => (
                    <th key={k} style={tableHeaderCell}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trials.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    {Object.values(row).map((val, vIdx) => (
                      <td key={vIdx} style={tableBodyCell}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Lined Observations */}
      <div style={sectionHeaderStyle}>IX. Experimental Observations</div>
      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem 0.5rem 1rem' }}>
        <div style={lineStyle}>
          {report.observation || <span style={{ color: '#475569', fontStyle: 'italic' }}>No observations recorded.</span>}
        </div>
      </div>

      {/* Lined Conclusion */}
      <div style={sectionHeaderStyle}>X. Conclusion</div>
      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem 0.5rem 1rem' }}>
        <div style={lineStyle}>
          {report.conclusion || <span style={{ color: '#475569', fontStyle: 'italic' }}>No conclusion recorded.</span>}
        </div>
      </div>

      {/* Remarks */}
      {report.notes && (
        <>
          <div style={sectionHeaderStyle}>XI. Additional Remarks</div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem 0.5rem 1rem' }}>
            <div style={lineStyle}>{report.notes}</div>
          </div>
        </>
      )}

      {/* Timestamps */}
      <div style={{
        marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '4px',
        fontSize: '0.72rem', color: '#64748b', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '1rem'
      }}>
        {metadata.generatedOn && <div>Generated On: {metadata.generatedOn}</div>}
        {metadata.submittedOn && <div>Submitted On: {metadata.submittedOn}</div>}
      </div>

      {/* Evaluation Block */}
      {report.evaluation && (
        <div style={{
          marginTop: '2rem', padding: '1.25rem', borderRadius: '10px',
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <h3 style={{ margin: '0 0 10px', color: '#10b981', fontSize: '0.95rem', borderBottom: '1px solid rgba(16,185,129,0.15)', paddingBottom: '0.4rem' }}>
            🎓 TEACHER EVALUATION
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <span><strong>Grade Awarded:</strong></span>
            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem' }}>
              {report.evaluation.score} / 100
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            <strong>Remarks & Feedback:</strong>
            <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: '#94a3b8', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '6px' }}>
              "{report.evaluation.remarks || 'No feedback provided.'}"
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Date Evaluated: {report.evaluation.dateReviewed || 'N/A'}</span>
            <span>Evaluator: {report.teacherName || 'Teacher'}</span>
          </div>
        </div>
      )}

      {/* Student Declaration */}
      <div style={{
        marginTop: '3rem', padding: '1rem', borderRadius: '8px',
        background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5'
      }}>
        <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Student Declaration</strong>
        I hereby declare that this experiment was performed by me using the EduSim Virtual Laboratory System and that the observations and conclusions recorded above are based on my experiment.
      </div>

      {/* Signatures */}
      <div style={{
        marginTop: '4rem', display: 'flex', justifyContent: 'space-between',
        fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap', gap: '2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '200px', borderBottom: '1px solid rgba(255,255,255,0.2)', minHeight: '30px', textAlign: 'center', fontFamily: 'Courier, monospace', color: '#cbd5e1', fontSize: '0.9rem' }}>
            {metadata.generatedBy || 'Student'}
          </div>
          <div style={{ marginTop: '5px', fontSize: '0.7rem', textTransform: 'uppercase' }}>Student Signature</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '200px', borderBottom: '1px solid rgba(255,255,255,0.2)', minHeight: '30px', textAlign: 'center', fontFamily: 'Courier, monospace', color: '#10b981', fontSize: '0.9rem' }}>
            {report.evaluation ? (report.teacherName || 'Teacher') : ''}
          </div>
          <div style={{ marginTop: '5px', fontSize: '0.7rem', textTransform: 'uppercase' }}>Teacher Signature</div>
        </div>
      </div>
    </div>
  );
}
