import { jsPDF } from 'jspdf';

// Pre-filled metadata for the 9 experiments
const LAB_METADATA = {
  'simple pendulum': {
    objective: 'To determine the acceleration due to gravity (g) using a simple pendulum and verify the relation between the length of the pendulum and its time period of oscillation.',
    theory: 'For small angular displacements, a simple pendulum executes simple harmonic motion. The time period is given by T = 2π√(L/g). Plotting T² against L yields a straight line with slope 4π²/g, from which g can be verified.',
    apparatus: 'Heavy metal spherical bob, inextensible string, rigid support stand, length adjustment slider, angular displacement control, digital stopwatch, oscillation counter.',
    procedure: '1. Select a pendulum string length (L) and set the initial displacement angle (< 15°).\n2. Release the bob to start oscillations.\n3. Record the time elapsed for a fixed number of oscillations.\n4. Calculate the time period (T) and repeat for different string lengths.',
    calcTheoretical: (params) => {
      const length = parseFloat(params['Length'] || params['length'] || 50);
      return 2 * Math.PI * Math.sqrt(length / 100 / 9.8);
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
      return v / r;
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
      const rad = (theta * Math.PI) / 180;
      return (v ** 2 * Math.sin(2 * rad)) / 9.8;
    }
  },
  'acid-base titration': {
    objective: 'To determine the concentration of an acid (HCl) by titrating it against a standard solution of a base (NaOH) using a pH indicator, and to plot the titration curve.',
    theory: 'Neutralization reaction occurs when an acid reacts with a base to form salt and water: HCl + NaOH → NaCl + H₂O. At the equivalence point, the moles of acid equal the moles of base. A pH indicator (Phenolphthalein) changes color at the endpoint due to pH transition.',
    apparatus: 'Volumetric burette (50 mL), Conical flask (100 mL), pH meter, standard NaOH base solution, unknown HCl acid solution, phenolphthalein indicator.',
    procedure: '1. Fill the burette with NaOH solution and place HCl with indicator in the conical flask.\n2. Slowly add NaOH from the burette in steps.\n3. Record the pH value at each volume addition step.\n4. Note the volume where neutralization occurs and the solution changes color.',
    calcTheoretical: (params) => {
      const naoh = parseFloat(params['Volume NaOH Added'] || params['naohAdded'] || 0);
      return 7 + 3 * Math.tanh((naoh - 25) / 2);
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
      return 0.01 * current * time;
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
      return map[activeSol] ?? 7.0;
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
      return Math.abs(inside - outside) * 2.5;
    }
  },
  'cell under microscope': {
    objective: 'To prepare and observe animal and plant cell specimens under a compound microscope, identifying their major organelles and structural differences.',
    theory: 'Cells are the basic structural and functional units of life. Plant cells have a rigid outer cell wall, chloroplasts for photosynthesis, and a large central vacuole. Animal cells lack a cell wall and chloroplasts, having smaller vacuoles.',
    apparatus: 'Compound light microscope, animal cell specimen slide (cheek cells), plant cell specimen slide (onion peel), magnification lens control, focus dials.',
    procedure: '1. Place the cell specimen slide on the microscope stage.\n2. Start observation under low magnification (4x/10x).\n3. Switch to high magnification (40x/100x) and adjust fine focus.\n4. Identify organelles like cell wall, nucleus, and chloroplasts.',
    calcTheoretical: () => null
  },
  'blood grouping test': {
    objective: 'To determine the ABO blood group and Rh factor of a blood sample by observing agglutination reactions with specific antibodies (Anti-A, Anti-B, and Anti-D).',
    theory: 'Blood grouping is based on the presence or absence of specific antigens on red blood cells. Agglutination (clumping) occurs when red blood cells containing a specific antigen react with corresponding antibodies (antisera).',
    apparatus: 'Blood grouping slide tiles, unknown blood sample, Anti-A, Anti-B, and Anti-D (Rh) antisera reagent bottles, mixing sticks.',
    procedure: '1. Dispense blood drops onto the three wells of a slide.\n2. Add Anti-A, Anti-B, and Anti-D sera to the respective wells.\n3. Mix gently and observe for agglutination (clumping) reactions.\n4. Determine blood type based on clumping pattern.',
    calcTheoretical: () => null
  }
};

// Date formatter helper
function formatTimestamp(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  
  const day = d.getDate();
  const actualMonth = d.toLocaleString('en-IN', { month: 'long' });
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  return `${day} ${actualMonth} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Text block drawing utility with page-break awareness
function drawTextSection(doc, title, content, startY) {
  let y = startY;
  if (y + 15 > 270) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, 20, y);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(20, y + 2, 190, y + 2);
  y += 7;
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700
  
  const lines = doc.splitTextToSize(content || 'No text entry provided.', 170);
  lines.forEach((line) => {
    if (y + 6 > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 5.5;
  });
  
  return y + 3;
}

// Table drawing utility with page-break awareness
function drawTable(doc, headers, rows, startY, colWidths) {
  let y = startY;
  const rowHeight = 7.5;
  const colCount = headers.length;
  
  if (y + rowHeight * 2 > 270) {
    doc.addPage();
    y = 20;
  }
  
  // Header Row
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(20, y, 170, rowHeight, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.2);
  doc.rect(20, y, 170, rowHeight, 'S');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  
  let currentX = 20;
  headers.forEach((h, index) => {
    const w = colWidths[index] || (170 / colCount);
    doc.text(String(h), currentX + 2.5, y + 5);
    currentX += w;
  });
  
  y += rowHeight;
  
  // Body Rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  rows.forEach((row) => {
    if (y + rowHeight > 270) {
      doc.addPage();
      y = 20;
      
      // Redraw Header on page break
      doc.setFillColor(241, 245, 249);
      doc.rect(20, y, 170, rowHeight, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, y, 170, rowHeight, 'S');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      
      currentX = 20;
      headers.forEach((h, index) => {
        const w = colWidths[index] || (170 / colCount);
        doc.text(String(h), currentX + 2.5, y + 5);
        currentX += w;
      });
      
      y += rowHeight;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
    }
    
    // Draw cells
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, y, 170, rowHeight, 'S');
    
    currentX = 20;
    row.forEach((cell, index) => {
      const w = colWidths[index] || (170 / colCount);
      let cellText = String(cell);
      const textWidth = doc.getTextWidth(cellText);
      if (textWidth > w - 5) {
        while (cellText.length > 3 && doc.getTextWidth(cellText + '...') > w - 5) {
          cellText = cellText.slice(0, -1);
        }
        cellText = cellText + '...';
      }
      doc.text(cellText, currentX + 2.5, y + 5);
      currentX += w;
    });
    
    y += rowHeight;
  });
  
  return y;
}

/** Generates and downloads the PDF directly on the client side */
export function exportReportPDF(report) {
  if (!report) return;

  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const expName = report.experiment || 'Experiment';
  const meta = LAB_METADATA[expName.toLowerCase()] || {
    objective: 'To study the properties and outcomes of the virtual experiment.',
    theory: 'Theoretical formulas are determined based on the physical parameters chosen during the simulation.',
    apparatus: 'Virtual laboratory apparatus, simulation controllers, digital sensor overlays.',
    procedure: '1. Launch the laboratory simulation workspace.\n2. Adjust variables on the control dashboard.\n3. Execute the simulation and record trials.\n4. Log and analyze results.',
    calcTheoretical: () => null
  };

  const parameters = report.parameters || {};
  const results = report.results || {};
  const trials = report.trials || [];
  const metadata = report.metadata || {};

  // Status mapping
  let status = "Draft";
  if (report.isDraft === false) {
    status = report.evaluation ? "Graded" : "Submitted";
  }

  let y = 20;

  // 1. Branding Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("EDUSIM", 105, y, { align: 'center' });
  y += 5.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("School Virtual Laboratory System", 105, y, { align: 'center' });
  y += 5.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("Laboratory Record Sheet", 105, y, { align: 'center' });
  y += 4.5;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.4);
  doc.line(20, y, 190, y);
  doc.line(20, y + 0.8, 190, y + 0.8);
  y += 6;

  // 2. Metadata Grid Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.rect(20, y, 170, 39, 'DF');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Column
  doc.setFont('Helvetica', 'bold'); doc.text("Report ID:", 24, y + 6);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.reportId || 'N/A'), 48, y + 6);

  doc.setFont('Helvetica', 'bold'); doc.text("Experiment:", 24, y + 13);
  doc.setFont('Helvetica', 'normal'); doc.text(String(expName), 48, y + 13);

  doc.setFont('Helvetica', 'bold'); doc.text("Student Name:", 24, y + 20);
  doc.setFont('Helvetica', 'normal'); doc.text(String(metadata.generatedBy || report.studentName || 'N/A'), 48, y + 20);

  doc.setFont('Helvetica', 'bold'); doc.text("Classroom:", 24, y + 27);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.className || 'N/A'), 48, y + 27);

  doc.setFont('Helvetica', 'bold'); doc.text("Report Status:", 24, y + 34);
  let statusColor = [245, 158, 11]; // Draft (Orange)
  if (status === 'Graded') statusColor = [16, 185, 129]; // Graded (Green)
  if (status === 'Submitted') statusColor = [37, 99, 235]; // Submitted (Blue)
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(status.toUpperCase(), 48, y + 34);

  // Right Column
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold'); doc.text("Date:", 115, y + 6);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.date || new Date().toLocaleDateString('en-IN')), 136, y + 6);

  doc.setFont('Helvetica', 'bold'); doc.text("Subject:", 115, y + 13);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.subject || 'N/A'), 136, y + 13);

  doc.setFont('Helvetica', 'bold'); doc.text("Roll Number:", 115, y + 20);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.rollNumber || 'N/A'), 136, y + 20);

  doc.setFont('Helvetica', 'bold'); doc.text("Evaluated By:", 115, y + 27);
  doc.setFont('Helvetica', 'normal'); doc.text(String(report.teacherName || 'N/A'), 136, y + 27);

  y += 45;

  // 3. Pre-filled Academic Content
  y = drawTextSection(doc, "I. Objective", meta.objective, y);
  y = drawTextSection(doc, "II. Physical Theory & Principle", meta.theory, y);
  y = drawTextSection(doc, "III. Apparatus & Materials Required", meta.apparatus, y);
  y = drawTextSection(doc, "IV. Experimental Procedure", meta.procedure, y);

  // 4. Parameter settings
  if (Object.keys(parameters).length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("V. Active Parameters Settings", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
    Object.entries(parameters).forEach(([key, val]) => {
      if (y + 6 > 270) { doc.addPage(); y = 20; }
      doc.setFont('Helvetica', 'bold');
      doc.text(String(key) + ": ", 24, y);
      const offset = doc.getTextWidth(String(key) + ": ");
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(37, 99, 235); // Blue
      doc.text(String(val), 24 + offset, y);
      doc.setTextColor(51, 65, 85);
      y += 5.5;
    });
    y += 3;
  }

  // 5. Result Values
  if (Object.keys(results).length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VI. Experimental Result Values", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
    Object.entries(results).forEach(([key, val]) => {
      if (y + 6 > 270) { doc.addPage(); y = 20; }
      doc.setFont('Helvetica', 'bold');
      doc.text(String(key) + ": ", 24, y);
      const offset = doc.getTextWidth(String(key) + ": ");
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(16, 185, 129); // Green
      doc.text(String(val), 24 + offset, y);
      doc.setTextColor(51, 65, 85);
      y += 5.5;
    });
    y += 3;
  }

  // 6. Theoretical comparison Analysis
  let theoryAnalysis = null;
  if (meta.calcTheoretical) {
    const tVal = meta.calcTheoretical(parameters);
    if (tVal !== null && tVal !== undefined) {
      let key = 'Range';
      let formula = '';
      let observed = 'N/A';
      let theoryValStr = '';
      let pctError = null;

      if (expName.toLowerCase() === 'simple pendulum') {
        key = 'Time Period (T)';
        formula = 'T = 2π√(L/g)';
        observed = results['Theoretical Period (T)'] || results['period'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} s`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === "ohm's law") {
        key = 'Current (I)';
        formula = 'I = V/R';
        observed = results['Electric Current (I)'] || results['current'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} A`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'projectile motion') {
        key = 'Horizontal Range (R)';
        formula = 'R = v₀²sin(2θ)/g';
        observed = results['Horizontal Range (R)'] || results['range'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)} m`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'acid-base titration') {
        key = 'Solution pH';
        formula = 'pH Curve';
        observed = results['Solution pH'] || results['pH'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)}`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'electrolysis of water') {
        key = 'Hydrogen Gas Volume';
        formula = 'Stoichiometric ratio';
        observed = results['Hydrogen Gas (H₂)'] || results['h2Volume'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} mL`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'ph measurement') {
        key = 'Solution pH';
        formula = 'pH = -log[H⁺]';
        observed = results['Measured pH'] || results['pH'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)}`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'osmosis & diffusion') {
        key = 'Liquid Rise (mm)';
        formula = 'Rise ∝ ΔC';
        observed = results['Liquid Rise/Fall'] || results['waterRise'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)} mm`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      }

      theoryAnalysis = {
        key,
        formula,
        observed: typeof observed === 'number' ? observed.toFixed(3) : observed,
        theoryValStr,
        pctError: pctError !== null ? `${pctError.toFixed(2)}%` : '0.00%'
      };
    }
  }

  if (theoryAnalysis) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VII. Theoretical vs. Observed Analysis", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    const headers = ["Metric Analyzed", "Theoretical Value (Formula)", "Observed Value (Simulation)", "Percentage Deviation"];
    const row = [
      theoryAnalysis.key,
      theoryAnalysis.theoryValStr,
      theoryAnalysis.observed,
      theoryAnalysis.pctError
    ];
    y = drawTable(doc, headers, [row], y, [45, 45, 45, 35]);

    if (y + 6 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'oblique'); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
    doc.text(`*Based on physical relation formula: ${theoryAnalysis.formula}`, 20, y);
    y += 8;
  }

  // 7. Recorded Trials Table
  if (trials.length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VIII. Recorded Observation Table (Trials)", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    const headers = Object.keys(trials[0]);
    const rows = trials.map(t => Object.values(t).map(v => String(v)));
    const colWidth = 170 / headers.length;
    const colWidths = headers.map(() => colWidth);

    y = drawTable(doc, headers, rows, y, colWidths);
    y += 4;
  }

  // 8. Lined Student Content
  y = drawTextSection(doc, "IX. Experimental Observations", report.observation, y);
  y = drawTextSection(doc, "X. Conclusion", report.conclusion, y);
  if (report.notes) {
    y = drawTextSection(doc, "XI. Additional Remarks", report.notes, y);
  }

  // 9. Teacher Evaluation section (if graded)
  if (report.evaluation) {
    if (y + 50 > 270) { doc.addPage(); y = 20; }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800

    // Draw top separator dashed line
    doc.text("----------------------------------------", 20, y);
    y += 5.5;

    doc.setFont('Helvetica', 'bold');
    doc.text("Teacher Evaluation", 20, y);
    y += 7.5;

    doc.setFont('Helvetica', 'normal');
    doc.text("Score : ", 20, y);
    const scoreVal = `${report.evaluation.score} / 100`;
    doc.setFont('Helvetica', 'bold');
    doc.text(scoreVal, 20 + doc.getTextWidth("Score : "), y);
    y += 7.5;

    doc.setFont('Helvetica', 'normal');
    doc.text("Feedback :", 20, y);
    y += 5.5;
    
    doc.setFont('Helvetica', 'oblique');
    const feedbackText = report.evaluation.remarks || report.evaluation.feedback || "No feedback provided.";
    const feedbackLines = doc.splitTextToSize(feedbackText, 170);
    feedbackLines.forEach(line => {
      if (y + 6 > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 5.5;
    });
    y += 2;

    if (y + 15 > 270) { doc.addPage(); y = 20; }

    doc.setFont('Helvetica', 'normal');
    doc.text("Evaluated By :", 20, y);
    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text(report.evaluation.evaluatedBy || report.teacherName || 'Teacher', 20, y);
    y += 7.5;

    doc.setFont('Helvetica', 'normal');
    doc.text("Evaluation Date :", 20, y);
    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    const dateStr = formatTimestamp(report.evaluation.dateReviewed);
    doc.text(dateStr, 20, y);
    y += 7.5;

    if (y + 6 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'normal');
    doc.text("----------------------------------------", 20, y);
    y += 7.5;
  }

  // 10. Student Declaration
  if (y + 42 > 270) { doc.addPage(); y = 20; }
  y += 4;
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
  doc.text("Student Declaration", 20, y);
  y += 4.5;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
  const decText = "I hereby declare that this experiment was performed by me using the EduSim Virtual Laboratory System and that the observations and conclusions recorded above are based on my experiment.";
  const decLines = doc.splitTextToSize(decText, 170);
  decLines.forEach(line => {
    doc.text(line, 20, y);
    y += 4;
  });

  y += 12;

  // 11. Signatures
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
  doc.setLineWidth(0.2);
  doc.line(20, y, 75, y); 
  doc.line(135, y, 190, y); 

  doc.text(String(metadata.generatedBy || report.studentName || 'Student'), 20, y + 4.5);
  doc.text("Student Signature", 20, y + 8.5);

  doc.text(report.evaluation ? String(report.teacherName || 'Teacher') : '', 135, y + 4.5);
  doc.text("Teacher Signature", 135, y + 8.5);

  y += 16;

  // 12. Electronic Log Timestamps
  if (y + 16 > 270) { doc.addPage(); y = 20; }
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
  if (metadata.generatedOn) {
    doc.text(`Report Generated: ${formatTimestamp(metadata.generatedOn)}`, 20, y);
    y += 3.8;
  }
  if (metadata.submittedOn) {
    doc.text(`Report Submitted: ${formatTimestamp(metadata.submittedOn)}`, 20, y);
    y += 3.8;
  }
  if (report.evaluation && report.evaluation.dateReviewed) {
    doc.text(`Report Graded: ${formatTimestamp(report.evaluation.dateReviewed)}`, 20, y);
    y += 3.8;
  }

  // 13. Dynamic Page Footers (Second Pass)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(20, 280, 190, 280);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by EduSim | School Virtual Laboratory System", 20, 284);
    doc.text("This report was generated electronically.", 20, 287);
    
    const pageText = `Page ${i} of ${pageCount}`;
    doc.text(pageText, 190 - doc.getTextWidth(pageText), 284);
  }

  // Save/Download Action
  const cleanStr = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '');
  const expClean = cleanStr(expName);
  const studentClean = cleanStr(metadata.generatedBy || report.studentName || 'Student');
  const dateClean = new Date().toISOString().split('T')[0];
  const filename = `EDUSIM_${expClean}_${studentClean}_dateClean.pdf`;
  
  // Clean format for dateClean filename
  const actualDateClean = String(report.date || dateClean).replace(/\//g, '-').replace(/\s/g, '');
  const safeFilename = `EDUSIM_${expClean}_${studentClean}_${actualDateClean}.pdf`;
  
  doc.save(safeFilename);
}

/** Opens browser print preview dialog inside a new window */
export function printReport(report) {
  if (!report) return;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert("Please allow pop-ups to print or download the report.");
    return;
  }

  const expName = report.experiment || 'Experiment';
  const meta = LAB_METADATA[expName.toLowerCase()] || {
    objective: 'To study the properties and outcomes of the virtual experiment.',
    theory: 'Theoretical formulas are determined based on the physical parameters chosen during the simulation.',
    apparatus: 'Virtual laboratory apparatus, simulation controllers, digital sensor overlays.',
    procedure: '1. Launch the laboratory simulation workspace.\n2. Adjust variables on the control dashboard.\n3. Execute the simulation and record trials.\n4. Log and analyze results.',
    calcTheoretical: () => null
  };

  const parameters = report.parameters || {};
  const results = report.results || {};
  const trials = report.trials || [];
  const metadata = report.metadata || {};

  // Theoretical comparison block
  let comparisonHtml = '';
  if (meta.calcTheoretical) {
    const tVal = meta.calcTheoretical(parameters);
    if (tVal !== null && tVal !== undefined) {
      let key = 'Range';
      let formula = '';
      let observed = 'N/A';
      let theoryValStr = '';
      let pctError = null;

      if (expName.toLowerCase() === 'simple pendulum') {
        key = 'Time Period (T)';
        formula = 'T = 2π√(L/g)';
        observed = results['Theoretical Period (T)'] || results['period'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} s`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === "ohm's law") {
        key = 'Current (I)';
        formula = 'I = V/R';
        observed = results['Electric Current (I)'] || results['current'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} A`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'projectile motion') {
        key = 'Horizontal Range (R)';
        formula = 'R = v₀²sin(2θ)/g';
        observed = results['Horizontal Range (R)'] || results['range'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)} m`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'acid-base titration') {
        key = 'Solution pH';
        formula = 'pH Curve';
        observed = results['Solution pH'] || results['pH'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)}`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'electrolysis of water') {
        key = 'Hydrogen Gas Volume';
        formula = 'Stoichiometric ratio';
        observed = results['Hydrogen Gas (H₂)'] || results['h2Volume'] || 'N/A';
        theoryValStr = `${tVal.toFixed(3)} mL`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'ph measurement') {
        key = 'Solution pH';
        formula = 'pH = -log[H⁺]';
        observed = results['Measured pH'] || results['pH'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)}`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      } else if (expName.toLowerCase() === 'osmosis & diffusion') {
        key = 'Liquid Rise (mm)';
        formula = 'Rise ∝ ΔC';
        observed = results['Liquid Rise/Fall'] || results['waterRise'] || 'N/A';
        theoryValStr = `${tVal.toFixed(2)} mm`;
        const obsNum = parseFloat(observed);
        if (!isNaN(obsNum) && tVal > 0) {
          pctError = Math.abs((obsNum - tVal) / tVal) * 100;
        }
      }

      comparisonHtml = `
        <h3>VII. Theoretical vs. Observed Analysis</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Metric Analyzed</th>
              <th>Theoretical Value (Formula)</th>
              <th>Observed Value (Simulation)</th>
              <th>Percentage Deviation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${key}</strong></td>
              <td>${theoryValStr}</td>
              <td style="color:#10b981;font-weight:bold;">${typeof observed === 'number' ? observed.toFixed(3) : observed}</td>
              <td style="font-weight:bold;color:${pctError === 0 ? '#10b981' : '#d97706'}">${pctError !== null ? pctError.toFixed(2) + '%' : '0.00%'}</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:11px;color:#64748b;font-style:italic;margin-top:-10px;">*Based on relation: ${formula}</p>
      `;
    }
  }

  // Parameters list
  let paramsHtml = '';
  Object.entries(parameters).forEach(([k, v]) => {
    paramsHtml += `<div class="param-box"><strong>${k}:</strong> <span style="color:#2563eb;">${v}</span></div>`;
  });

  // Results list
  let resultsHtml = '';
  Object.entries(results).forEach(([k, v]) => {
    resultsHtml += `<div class="param-box"><strong>${k}:</strong> <span style="color:#059669;">${v}</span></div>`;
  });

  // Trials Table
  let trialsHtml = '';
  if (trials.length > 0) {
    const keys = Object.keys(trials[0]);
    trialsHtml += `
      <h3>VIII. Recorded Observation Table (Trials)</h3>
      <table class="report-table">
        <thead>
          <tr>
            ${keys.map(k => `<th>${k}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${trials.map(row => `
            <tr>
              ${keys.map(k => `<td>${row[k]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Evaluation Box
  let evaluationHtml = '';
  if (report.evaluation) {
    evaluationHtml = `
      <div style="margin-top: 25px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #1e293b;">
        <div style="font-family: monospace; color: #94a3b8; margin-bottom: 5px;">----------------------------------------</div>
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">Teacher Evaluation</div>
        
        <div style="margin-bottom: 10px;"><strong>Score :</strong> ${report.evaluation.score} / 100</div>
        
        <div style="margin-bottom: 10px;">
          <strong>Feedback :</strong><br/>
          <div style="font-style: italic; color: #475569; margin-top: 3px; padding-left: 10px; border-left: 2px solid #cbd5e1;">
            ${report.evaluation.remarks || report.evaluation.feedback || 'No feedback provided.'}
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <strong>Evaluated By :</strong><br/>
          <span>${report.evaluation.evaluatedBy || report.teacherName || 'Teacher'}</span>
        </div>
        
        <div style="margin-bottom: 10px;">
          <strong>Evaluation Date :</strong><br/>
          <span>${formatTimestamp(report.evaluation.dateReviewed)}</span>
        </div>
        <div style="font-family: monospace; color: #94a3b8; margin-top: 5px;">----------------------------------------</div>
      </div>
    `;
  }

  // Status mapping
  let status = "Draft";
  if (report.isDraft === false) {
    status = report.evaluation ? "Graded" : "Submitted";
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Lab Report - ${report.reportId || 'EDU-LAB'}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .notebook-page {
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 25px;
          }
          .header-box h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 2px;
            color: #0f172a;
          }
          .header-box p {
            margin: 5px 0 10px;
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .title-tag {
            display: inline-block;
            border: 1px solid #0f172a;
            padding: 4px 15px;
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 13px;
          }
          .meta-grid div {
            padding: 2px 0;
          }
          h2 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 10px;
          }
          h3 {
            font-size: 13px;
            color: #1e293b;
            margin-top: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .text-content {
            background: #fafafb;
            border: 1px dashed #cbd5e1;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            white-space: pre-wrap;
            margin-bottom: 20px;
            color: #334155;
            min-height: 40px;
          }
          .grid-params {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
          }
          .param-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .report-table th, .report-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            font-size: 12px;
            text-align: left;
          }
          .report-table th {
            background: #f1f5f9;
            font-weight: 600;
          }
          .evaluation-box {
            margin-top: 35px;
            padding: 20px;
            background: #f0fdf4;
            border: 2px solid #16a34a;
            border-radius: 6px;
          }
          .evaluation-box h2 {
            border-bottom: 1px solid #bbf7d0;
            margin-top: 0;
            color: #15803d;
            font-size: 14px;
          }
          .sig-row {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 220px;
          }
          .sig-line {
            border-bottom: 1px solid #475569;
            height: 35px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
          }
          .sig-label {
            margin-top: 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #475569;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="notebook-page">
          <div class="header-box">
            <h1>EDUSIM</h1>
            <p>Virtual Laboratory Simulator</p>
            <div class="title-tag">LABORATORY EXPERIMENT RECORD</div>
          </div>

          <div class="meta-grid">
            <div><strong>Report ID:</strong> ${report.reportId || 'EDU-LAB-2026-XXXXX'}</div>
            <div><strong>Date:</strong> ${report.date || new Date().toLocaleDateString('en-IN')}</div>
            <div><strong>Experiment:</strong> ${expName}</div>
            <div><strong>Subject:</strong> ${report.subject || 'N/A'}</div>
            <div><strong>Student Name:</strong> ${metadata.generatedBy || report.studentName || 'N/A'}</div>
            <div><strong>Roll Number:</strong> ${report.rollNumber || 'N/A'}</div>
            <div><strong>Classroom:</strong> ${report.className || 'N/A'}</div>
            <div><strong>Evaluated By:</strong> ${report.teacherName || 'N/A'}</div>
            <div><strong>Report Status:</strong> <strong style="color: ${status === 'Graded' ? '#10b981' : status === 'Submitted' ? '#2563eb' : '#d97706'}">${status.toUpperCase()}</strong></div>
          </div>

          <h2>I. Objective</h2>
          <div class="text-content">${meta.objective}</div>

          <h2>II. Physical Theory & Principle</h2>
          <div class="text-content">${meta.theory}</div>

          <h2>III. Apparatus & Materials Required</h2>
          <div class="text-content">${meta.apparatus}</div>

          <h2>IV. Experimental Procedure</h2>
          <div class="text-content">${meta.procedure}</div>

          <h2>V. Active Parameters Settings</h2>
          <div class="grid-params">
            ${paramsHtml}
          </div>

          <h2>VI. Experimental Result Values</h2>
          <div class="grid-params">
            ${resultsHtml}
          </div>

          ${comparisonHtml}
          ${trialsHtml}

          <h2>IX. Experimental Observations</h2>
          <div class="text-content">${report.observation || 'No observations recorded.'}</div>

          <h2>X. Conclusion</h2>
          <div class="text-content">${report.conclusion || 'No conclusion recorded.'}</div>

          ${report.notes ? `
            <h2>XI. Additional Remarks</h2>
            <div class="text-content">${report.notes}</div>
          ` : ''}

          ${metadata.generatedOn ? `
            <div style="font-size:10px;color:#64748b;margin-top:20px;">
              Generated On: ${formatTimestamp(metadata.generatedOn)} ${metadata.submittedOn ? `| Submitted On: ${formatTimestamp(metadata.submittedOn)}` : ''}
            </div>
          ` : ''}

          ${evaluationHtml}

          <div style="margin-top: 30px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 10px;">
            <strong>Student Declaration</strong><br/>
            I hereby declare that this experiment was performed by me using the EduSim Virtual Laboratory System and that the observations and conclusions recorded above are based on my experiment.
          </div>

          <div class="sig-row">
            <div class="sig-box">
              <div class="sig-line">${metadata.generatedBy || 'Student'}</div>
              <div class="sig-label">Student Signature</div>
            </div>
            <div class="sig-box">
              <div class="sig-line">${report.evaluation ? (report.teacherName || 'Teacher') : ''}</div>
              <div class="sig-label">Teacher Signature</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/** Legacy alias/compatibility wrapper */
export function downloadReportPDF(report) {
  exportReportPDF(report);
}

export function exportPracticePDF(obs) {
  if (!obs) return;

  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const expName = obs.experimentName || 'Experiment';
  const meta = LAB_METADATA[expName.toLowerCase()] || {
    objective: 'To study the properties and outcomes of the virtual experiment.',
    theory: 'Theoretical formulas are determined based on the physical parameters chosen during the simulation.',
    apparatus: 'Virtual laboratory apparatus, simulation controllers, digital sensor overlays.',
    procedure: '1. Launch the laboratory simulation workspace.\n2. Adjust variables on the control dashboard.\n3. Execute the simulation and record trials.\n4. Log and analyze results.',
    calcTheoretical: () => null
  };

  let parameters = {};
  let results = {};
  let trials = [];
  try {
    parameters = JSON.parse(obs.simulationParameters || '{}');
  } catch(e){}
  try {
    const readings = JSON.parse(obs.simulationReadings || '{}');
    results = readings.results || {};
    trials = readings.trials || [];
  } catch(e){}

  let y = 20;

  // 1. Branding Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("EDUSIM", 105, y, { align: 'center' });
  y += 5.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("School Virtual Laboratory System", 105, y, { align: 'center' });
  y += 6.5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11); // Orange/Amber
  doc.text("PRACTICE OBSERVATION RECORD", 105, y, { align: 'center' });
  y += 5.5;

  // Warning text
  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(8.5);
  doc.setTextColor(239, 68, 68); // Red
  doc.text("This document is for personal learning only. It has not been submitted or graded.", 105, y, { align: 'center' });
  y += 4.5;

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.line(20, y, 190, y);
  doc.line(20, y + 0.8, 190, y + 0.8);
  y += 6;

  // 2. Metadata Grid Card
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.25);
  doc.rect(20, y, 170, 32, 'DF');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Column
  doc.setFont('Helvetica', 'bold'); doc.text("Practice ID:", 24, y + 6);
  doc.setFont('Helvetica', 'normal'); doc.text(String(obs.practiceObservationId || 'N/A'), 48, y + 6);

  doc.setFont('Helvetica', 'bold'); doc.text("Experiment:", 24, y + 13);
  doc.setFont('Helvetica', 'normal'); doc.text(String(expName), 48, y + 13);

  doc.setFont('Helvetica', 'bold'); doc.text("Subject:", 24, y + 20);
  doc.setFont('Helvetica', 'normal'); doc.text(String(obs.subject || 'N/A'), 48, y + 20);

  // Right Column
  doc.setFont('Helvetica', 'bold'); doc.text("Recorded Date:", 115, y + 6);
  doc.setFont('Helvetica', 'normal'); doc.text(formatTimestamp(obs.createdAt), 138, y + 6);

  doc.setFont('Helvetica', 'bold'); doc.text("Last Updated:", 115, y + 13);
  doc.setFont('Helvetica', 'normal'); doc.text(formatTimestamp(obs.updatedAt), 138, y + 13);

  y += 38;

  // 3. Pre-filled Academic Content
  y = drawTextSection(doc, "I. Objective", meta.objective, y);
  y = drawTextSection(doc, "II. Physical Theory & Principle", meta.theory, y);
  y = drawTextSection(doc, "III. Apparatus & Materials Required", meta.apparatus, y);
  y = drawTextSection(doc, "IV. Experimental Procedure", meta.procedure, y);

  // 4. Parameter settings
  if (Object.keys(parameters).length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("V. Active Parameters Settings", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
    Object.entries(parameters).forEach(([key, val]) => {
      if (y + 6 > 270) { doc.addPage(); y = 20; }
      doc.setFont('Helvetica', 'bold');
      doc.text(String(key) + ": ", 24, y);
      const offset = doc.getTextWidth(String(key) + ": ");
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(37, 99, 235); // Blue
      doc.text(String(val), 24 + offset, y);
      doc.setTextColor(51, 65, 85);
      y += 5.5;
    });
    y += 3;
  }

  // 5. Result Values
  if (Object.keys(results).length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VI. Experimental Result Values", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 85);
    Object.entries(results).forEach(([key, val]) => {
      if (y + 6 > 270) { doc.addPage(); y = 20; }
      doc.setFont('Helvetica', 'bold');
      doc.text(String(key) + ": ", 24, y);
      const offset = doc.getTextWidth(String(key) + ": ");
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(16, 185, 129); // Green
      doc.text(String(val), 24 + offset, y);
      doc.setTextColor(51, 65, 85);
      y += 5.5;
    });
    y += 3;
  }

  // 6. Theoretical comparison Analysis
  let theoryAnalysis = null;
  if (meta.calcTheoretical) {
    const tVal = meta.calcTheoretical(parameters);
    if (tVal !== null && tVal !== undefined) {
      let key = 'Range';
      let formula = '';
      let observed = 'N/A';
      let theoryValStr = '';
      let pctError = null;

      // Extract theoretical value matching
      const tKey = Object.keys(tVal)[0];
      theoryValStr = String(tVal[tKey]);
      formula = tVal.formula || '';

      if (expName.toLowerCase() === 'simple pendulum') {
        key = 'Time Period (T)';
        observed = results['Theoretical Period (T)'] || results['period'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(theoryValStr);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === "ohm's law") {
        key = 'Current (I)';
        observed = results['Electric Current (I)'] || results['current'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(theoryValStr);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'projectile motion') {
        key = 'Horizontal Range (R)';
        observed = results['Horizontal Range (R)'] || results['range'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(tVal['Theoretical Range']);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'acid-base titration') {
        key = 'Solution pH';
        observed = results['Solution pH'] || results['pH'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(theoryValStr);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'electrolysis of water') {
        key = 'Hydrogen Gas Volume';
        observed = results['Hydrogen Gas (H₂)'] || results['h2Volume'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(tVal['Theoretical H₂ Volume']);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'ph measurement') {
        key = 'Solution pH';
        observed = results['Measured pH'] || results['pH'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(theoryValStr);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      } else if (expName.toLowerCase() === 'osmosis & diffusion') {
        key = 'Liquid Rise (mm)';
        observed = results['Liquid Rise/Fall'] || results['waterRise'] || 'N/A';
        const obsNum = parseFloat(observed);
        const theoryNum = parseFloat(theoryValStr);
        if (!isNaN(obsNum) && !isNaN(theoryNum) && theoryNum > 0) {
          pctError = Math.abs((obsNum - theoryNum) / theoryNum) * 100;
        }
      }

      theoryAnalysis = {
        key,
        formula,
        observed: typeof observed === 'number' ? observed.toFixed(3) : observed,
        theoryValStr,
        pctError: pctError !== null ? `${pctError.toFixed(2)}%` : '0.00%'
      };
    }
  }

  if (theoryAnalysis) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VII. Theoretical vs. Observed Analysis", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    const headers = ["Metric Analyzed", "Theoretical Value (Formula)", "Observed Value (Simulation)", "Percentage Deviation"];
    const row = [
      theoryAnalysis.key,
      theoryAnalysis.theoryValStr,
      theoryAnalysis.observed,
      theoryAnalysis.pctError
    ];
    y = drawTable(doc, headers, [row], y, [45, 45, 45, 35]);

    if (y + 6 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'oblique'); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
    doc.text(`*Based on physical relation formula: ${theoryAnalysis.formula}`, 20, y);
    y += 8;
  }

  // 7. Recorded Trials Table
  if (trials.length > 0) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(15, 23, 42);
    doc.text("VIII. Recorded Observation Table (Trials)", 20, y);
    doc.setDrawColor(226, 232, 240); doc.line(20, y + 2, 190, y + 2);
    y += 7;

    const headers = Object.keys(trials[0]);
    const rows = trials.map(t => Object.values(t).map(v => String(v)));
    const colWidth = 170 / headers.length;
    const colWidths = headers.map(() => colWidth);

    y = drawTable(doc, headers, rows, y, colWidths);
    y += 4;
  }

  // 8. Lined Student Content
  y = drawTextSection(doc, "IX. Practice Observations", obs.observation, y);
  if (obs.conclusion) {
    y = drawTextSection(doc, "X. Conclusion", obs.conclusion, y);
  }
  if (obs.notes) {
    y = drawTextSection(doc, "XI. Personal Notes", obs.notes, y);
  }

  // Signatures / footer
  if (y + 18 > 270) { doc.addPage(); y = 20; }
  y += 12;
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
  doc.setLineWidth(0.2);
  doc.line(20, y, 75, y); 
  doc.text("Student Signature", 20, y + 4.5);
  doc.text("(For self-evaluation)", 20, y + 8.5);

  // Dynamic Page Footers (Second Pass)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(20, 280, 190, 280);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by EduSim | Personal Practice Observation Notebook", 20, 284);
    doc.setTextColor(239, 68, 68);
    doc.text("This document is for personal learning only. It has not been submitted or graded.", 20, 287);
    
    const pageText = `Page ${i} of ${pageCount}`;
    doc.setTextColor(148, 163, 184);
    doc.text(pageText, 190 - doc.getTextWidth(pageText), 284);
  }

  // Save/Download Action
  const cleanStr = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '');
  const expClean = cleanStr(expName);
  const dateClean = new Date(obs.createdAt).toISOString().split('T')[0];
  const safeFilename = `PRACTICE_${expClean}_${obs.practiceObservationId}_${dateClean}.pdf`;
  
  doc.save(safeFilename);
}
