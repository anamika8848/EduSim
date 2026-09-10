import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { experimentService } from '../../services/experimentService'

// Lazy load experiment simulations
const SimplePendulum = React.lazy(() => import('../../experiments/SimplePendulum'))
const OhmsLaw = React.lazy(() => import('../../experiments/OhmsLaw'))
const ProjectileMotion = React.lazy(() => import('../../experiments/ProjectileMotion'))
const AcidBaseTitration = React.lazy(() => import('../../experiments/AcidBaseTitration'))
const ElectrolysisOfWater = React.lazy(() => import('../../experiments/ElectrolysisOfWater'))
const PHMeasurement = React.lazy(() => import('../../experiments/PHMeasurement'))
const OsmosisDiffusion = React.lazy(() => import('../../experiments/OsmosisDiffusion'))
const CellMicroscope = React.lazy(() => import('../../experiments/CellMicroscope'))
const BloodGrouping = React.lazy(() => import('../../experiments/BloodGrouping'))

const EXPERIMENT_MAP = {
  'simple pendulum': SimplePendulum,
  "ohm's law": OhmsLaw,
  'projectile motion': ProjectileMotion,
  'acid-base titration': AcidBaseTitration,
  'electrolysis of water': ElectrolysisOfWater,
  'ph measurement': PHMeasurement,
  'osmosis & diffusion': OsmosisDiffusion,
  'cell under microscope': CellMicroscope,
  'blood grouping test': BloodGrouping,
}

const SUBJECT_COLORS = {
  PHYSICS: '#3b82f6',
  CHEMISTRY: '#f59e0b',
  BIOLOGY: '#10b981',
}

const SUBJECT_ICONS = {
  PHYSICS: '⚛️',
  CHEMISTRY: '🧪',
  BIOLOGY: '🧬',
}

const AI_KNOWLEDGE = {
  'simple pendulum': {
    procedure: [
      'Set up the pendulum with initial length 50cm',
      'Release from 15° angle and start timer',
      'Record 10 complete oscillations',
      'Calculate time period T = total time / 10',
      'Change length and repeat',
      'Plot L vs T² graph',
    ],
    hints: [
      'The time period T = 2π√(L/g) where g = 9.8 m/s²',
      'T² is directly proportional to L — this is the key relationship',
      'Measure at least 5 different lengths for a good graph',
      'Use small angles (< 15°) for accurate results',
      'The mass of the bob does NOT affect the time period',
    ],
    theory: 'A simple pendulum exhibits Simple Harmonic Motion (SHM). The restoring force is provided by gravity acting along the tangential direction. For small angles, T = 2π√(L/g).',
    responses: {
      'what is happening': 'The pendulum bob swings back and forth due to gravity. The time period depends only on the length, not the mass or amplitude (for small angles).',
      'why this step': 'Recording multiple oscillations and averaging reduces timing errors, giving more accurate results.',
      'explain the theory': 'At any displacement x from equilibrium, gravity provides a restoring force F = -mg sinθ ≈ -mgθ for small angles. This gives SHM with T = 2π√(L/g).',
    }
  },
  "ohm's law": {
    procedure: [
      "Connect the circuit with resistor",
      "Set voltage to 2V using slider",
      "Record ammeter reading",
      "Increase voltage in steps of 2V",
      "Plot V vs I graph",
      "Calculate slope (resistance)",
    ],
    hints: [
      "Ohm's Law: V = IR, so I = V/R",
      "The V-I graph should be a straight line through the origin",
      "Slope of V vs I = Resistance (Ω)",
      "Power dissipated P = V × I = I²R = V²/R",
      "Keep resistance constant to verify linear V-I relationship",
    ],
    theory: "Ohm's Law states that the current through a conductor is directly proportional to voltage and inversely proportional to resistance, provided temperature remains constant.",
    responses: {
      'what is happening': 'As voltage increases, more electrical pressure pushes current through the resistor. The current flows proportionally to voltage.',
      'why this step': 'Systematic voltage increase while recording current allows us to plot the V-I characteristic and verify the linear relationship.',
      'explain the theory': 'V = IR. The resistance R is the constant of proportionality. For ohmic conductors, this relationship is linear at constant temperature.',
    }
  },
  'projectile motion': {
    procedure: [
      "Set launch angle using slider",
      "Set initial velocity",
      "Fire the projectile",
      "Observe trajectory and range",
      "Try different angles",
      "Find angle for maximum range",
    ],
    hints: [
      "Maximum range occurs at exactly 45°",
      "Horizontal: x = v·cos(θ)·t, Vertical: y = v·sin(θ)·t - ½gt²",
      "Range = v²·sin(2θ)/g",
      "Complementary angles give equal ranges (30° and 60°)",
      "Maximum height = v²·sin²(θ)/(2g)",
    ],
    theory: "Projectile motion is a form of motion where an object moves in a curved path under gravity. The horizontal and vertical components are independent.",
    responses: {
      'what is happening': 'The projectile moves horizontally at constant velocity while gravity accelerates it downward, creating a parabolic trajectory.',
      'why this step': 'Testing multiple angles shows how range varies with launch angle, revealing the optimal 45° angle.',
      'explain the theory': 'Horizontal: no acceleration, constant velocity. Vertical: uniform acceleration due to gravity g = 9.8 m/s². Combined motion creates a parabola.',
    }
  },
  'acid-base titration': {
    procedure: [
      "Fill burette with NaOH solution",
      "Add HCl to conical flask with indicator",
      "Note initial burette reading",
      "Add NaOH dropwise with stirring",
      "Observe color change at endpoint",
      "Calculate molarity using M1V1=M2V2",
    ],
    hints: [
      "The equivalence point (endpoint) is at pH 7 for strong acid-strong base",
      "Flask color changes from red→orange→yellow→green at endpoint",
      "Add NaOH slowly near the endpoint to avoid overshooting",
      "M1V1 = M2V2 at equivalence point",
      "The pH curve is an S-shaped sigmoid",
    ],
    theory: "Acid-base titration determines the concentration of an unknown acid/base using a known concentration titrant. At equivalence point, moles of acid = moles of base.",
    responses: {
      'what is happening': 'NaOH (base) neutralizes HCl (acid): HCl + NaOH → NaCl + H₂O. As NaOH is added, the excess H⁺ ions decrease, raising the pH.',
      'why this step': 'Dropwise addition near the endpoint prevents adding excess NaOH, which would raise pH beyond 7.',
      'explain the theory': 'At equivalence point: moles NaOH = moles HCl. Since M = moles/volume, we get M₁V₁ = M₂V₂.',
    }
  },
  'electrolysis of water': {
    procedure: [
      "Fill apparatus with dilute H₂SO₄",
      "Connect electrodes to power supply",
      "Turn on current and observe",
      "Watch gas collect in tubes",
      "Compare volumes (H₂:O₂ = 2:1)",
      "Test gases with glowing splint",
    ],
    hints: [
      "H₂ collects at cathode (-), O₂ at anode (+)",
      "Volume ratio H₂:O₂ = 2:1 always",
      "Higher current → faster gas production",
      "H₂ burns with 'pop' (hydrogen test)",
      "O₂ relights glowing splint (oxygen test)",
    ],
    theory: "Electrolysis decomposes water using electrical energy. 2H₂O → 2H₂ + O₂. Hydrogen and oxygen are produced at the electrodes in a 2:1 volume ratio.",
    responses: {
      'what is happening': 'Electric current splits water molecules. H⁺ ions move to cathode (−) forming H₂ gas. OH⁻ ions move to anode (+) forming O₂ gas.',
      'why this step': 'Measuring gas volumes over time confirms the 2:1 ratio, verifying Faraday\'s law of electrolysis.',
      'explain the theory': 'At cathode: 4H⁺ + 4e⁻ → 2H₂. At anode: 2H₂O → O₂ + 4H⁺ + 4e⁻. Overall: 2H₂O → 2H₂ + O₂.',
    }
  },
  'ph measurement': {
    procedure: [
      "Select the solution to test",
      "Dip pH meter/indicator",
      "Read and record the pH value",
      "Classify as acid, neutral, or base",
      "Test multiple solutions",
      "Compare and analyze results",
    ],
    hints: [
      "pH < 7 = Acidic, pH = 7 = Neutral, pH > 7 = Basic",
      "pH = -log[H⁺] concentration",
      "Each pH unit = 10× change in [H⁺]",
      "Strong acids (HCl) have pH near 1, strong bases (NaOH) near 14",
      "pH scale runs from 0 to 14",
    ],
    theory: "The pH scale measures hydrogen ion concentration in solution. pH = -log₁₀[H⁺]. Acids have excess H⁺ ions, bases have excess OH⁻ ions.",
    responses: {
      'what is happening': 'The pH meter measures the activity of H⁺ ions in solution. More H⁺ ions = lower pH (more acidic).',
      'why this step': 'Testing multiple solutions reveals the wide range of pH values in everyday substances.',
      'explain the theory': 'pH = -log[H⁺]. Pure water: [H⁺] = 10⁻⁷ M, pH = 7. Lemon juice: [H⁺] ≈ 10⁻² M, pH = 2.',
    }
  },
  'osmosis & diffusion': {
    procedure: [
      "Set up the semi-permeable membrane",
      "Add solutions of different concentrations",
      "Start the timer",
      "Observe water movement direction",
      "Record water level changes",
      "Compare results at different concentrations",
    ],
    hints: [
      "Water moves from low to high solute concentration",
      "Higher concentration difference → faster osmosis",
      "The pressure driving osmosis is called osmotic pressure",
      "Osmotic pressure = iMRT (van't Hoff equation)",
      "At equilibrium, no net movement of water",
    ],
    theory: "Osmosis is the diffusion of water through a semipermeable membrane from a region of lower solute concentration to higher solute concentration.",
    responses: {
      'what is happening': 'Water molecules diffuse through the membrane toward the more concentrated solution, trying to equalize concentrations.',
      'why this step': 'Different concentration pairs show how the rate and extent of osmosis depends on the concentration gradient.',
      'explain the theory': 'Water moves down its concentration gradient. Higher solute concentration means lower water concentration, so water flows in.',
    }
  },
  'cell under microscope': {
    procedure: [
      "Select cell type (Animal/Plant)",
      "Start at lowest magnification (4x)",
      "Identify the cell membrane/wall",
      "Increase magnification gradually",
      "Click on organelles to identify them",
      "Record observations in the worksheet",
    ],
    hints: [
      "Plant cells have cell wall, chloroplasts, and large vacuole",
      "Animal cells have lysosomes and centrioles",
      "Nucleus contains genetic material (DNA)",
      "Mitochondria = powerhouse of the cell",
      "Chloroplasts contain chlorophyll for photosynthesis",
    ],
    theory: "Cells are the basic structural and functional units of life. Animal and plant cells share many organelles but differ in having cell walls, chloroplasts, and vacuole size.",
    responses: {
      'what is happening': 'Higher magnification reveals more detail of cell structures. Each organelle has a specific function in maintaining cell life.',
      'why this step': 'Systematic observation from low to high magnification helps locate and study cellular structures methodically.',
      'explain the theory': 'Cell theory: all living things are made of cells, cells are the basic unit of life, all cells come from pre-existing cells.',
    }
  },
  'blood grouping test': {
    procedure: [
      "Select a blood sample to type",
      "Add Anti-A serum to well 1",
      "Add Anti-B serum to well 2",
      "Add Anti-AB serum to well 3",
      "Observe agglutination pattern",
      "Determine blood group from results",
    ],
    hints: [
      "Agglutination (clumping) indicates antigen-antibody reaction",
      "Anti-A serum reacts with A antigens (Type A and AB blood)",
      "Anti-B serum reacts with B antigens (Type B and AB blood)",
      "Type O has no antigens, universal donor",
      "Type AB has both antigens, universal recipient",
    ],
    theory: "Blood groups are determined by antigens on red blood cells. ABO system: Type A has A antigens, Type B has B antigens, AB has both, O has none.",
    responses: {
      'what is happening': 'Antibodies in the serum bind to matching antigens on red blood cells, causing agglutination (clumping).',
      'why this step': 'Testing with multiple antisera creates a unique agglutination pattern that identifies the blood group.',
      'explain the theory': 'Karl Landsteiner discovered ABO system. Agglutination occurs when antibody meets matching antigen. Results create a 3-bit binary pattern identifying 4 blood groups.',
    }
  },
}

const DEFAULT_KNOWLEDGE = {
  procedure: ['Follow the experiment steps', 'Record observations carefully', 'Repeat for accuracy'],
  hints: ['Take multiple readings', 'Record data systematically', 'Draw conclusions from data'],
  theory: 'Virtual laboratory experiments simulate real lab procedures for safe, accessible science education.',
  responses: {}
}

function AIAssistant({ experimentName }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const knowledge = AI_KNOWLEDGE[experimentName?.toLowerCase()] || DEFAULT_KNOWLEDGE

  useEffect(() => {
    setMessages([{
      role: 'ai',
      text: `Hi! I'm your lab assistant for the ${experimentName} experiment. Ask me anything about the procedure, theory, or observations!`
    }])
  }, [experimentName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.toLowerCase()
    setMessages(prev => [...prev, { role: 'user', text: input }])
    setInput('')

    setTimeout(() => {
      let response = ''
      if (userMsg.includes('what is happening') || userMsg.includes('whats happening')) {
        response = knowledge.responses?.['what is happening'] || `The ${experimentName} experiment demonstrates key scientific principles through interactive observation.`
      } else if (userMsg.includes('why this step') || userMsg.includes('why')) {
        response = knowledge.responses?.['why this step'] || 'Each step builds on the previous to systematically gather accurate data.'
      } else if (userMsg.includes('theory') || userMsg.includes('formula')) {
        response = knowledge.responses?.['explain the theory'] || knowledge.theory
      } else if (userMsg.includes('hint') || userMsg.includes('help') || userMsg.includes('tip')) {
        response = knowledge.hints[Math.floor(Math.random() * knowledge.hints.length)]
      } else if (userMsg.includes('procedure') || userMsg.includes('steps') || userMsg.includes('how')) {
        response = `The procedure is: ${knowledge.procedure.join(' → ')}`
      } else {
        const tips = [
          `For ${experimentName}: ${knowledge.hints[0]}`,
          knowledge.theory,
          'Try changing parameters to see how results vary!',
          'Record multiple trials for more accurate data.',
          `Remember: ${knowledge.hints[Math.floor(Math.random() * knowledge.hints.length)]}`,
        ]
        response = tips[Math.floor(Math.random() * tips.length)]
      }
      setMessages(prev => [...prev, { role: 'ai', text: response }])
    }, 500)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(15, 22, 45, 0.9)',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: 'white',
        }}>AI</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>AI Lab Assistant</div>
          <div style={{ fontSize: '11px', color: '#10b981' }}>● Online</div>
        </div>
      </div>

      {/* Quick buttons */}
      <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {['What is happening?', 'Why this step?', 'Explain the theory'].map(q => (
          <button
            key={q}
            onClick={() => { setInput(q); setTimeout(() => handleSend(), 50) }}
            style={{
              padding: '4px 10px', fontSize: '11px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px', color: '#93c5fd', cursor: 'pointer',
            }}
          >{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'ai' && (
              <div style={{
                width: '24px', height: '24px', minWidth: '24px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700', color: 'white', marginRight: '8px', marginTop: '2px',
              }}>AI</div>
            )}
            <div style={{
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))'
                : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              color: '#e2e8f0',
              lineHeight: '1.5',
            }}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '8px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask your lab question..."
          style={{
            flex: 1, padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#e2e8f0',
            fontSize: '13px', outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', borderRadius: '8px',
            color: 'white', cursor: 'pointer', fontSize: '14px',
          }}
        >↑</button>
      </div>
    </div>
  )
}

function ProcedurePanel({ experimentName, currentStep, onStepClick, progress }) {
  const knowledge = AI_KNOWLEDGE[experimentName?.toLowerCase()] || DEFAULT_KNOWLEDGE
  const steps = knowledge.procedure

  return (
    <div style={{
      height: '100%',
      background: 'rgba(15, 22, 45, 0.9)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Procedure Steps</div>
        <div style={{ fontSize: '11px', color: '#10b981' }}>{progress}% complete</div>
        <div style={{
          marginTop: '8px',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            onClick={() => onStepClick && onStepClick(i)}
            style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
              background: i === currentStep
                ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
                : 'transparent',
              border: i === currentStep
                ? '1px solid rgba(59,130,246,0.3)'
                : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '22px', height: '22px', minWidth: '22px',
              borderRadius: '50%',
              background: i < currentStep
                ? '#10b981'
                : i === currentStep
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '600', color: 'white',
            }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: '13px',
              color: i === currentStep ? '#e2e8f0' : i < currentStep ? '#10b981' : '#94a3b8',
              lineHeight: '1.4',
            }}>{step}</div>
          </div>
        ))}
      </div>

      {/* Hints */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 Hint</div>
        <div style={{
          fontSize: '12px', color: '#93c5fd', lineHeight: '1.5',
          padding: '8px 10px',
          background: 'rgba(59,130,246,0.08)',
          borderRadius: '6px',
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          {(AI_KNOWLEDGE[experimentName?.toLowerCase()]?.hints || DEFAULT_KNOWLEDGE.hints)[0]}
        </div>
      </div>
    </div>
  )
}

export default function ExperimentLab() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [experiment, setExperiment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(true)

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const res = await experimentService.getAll()
        const exp = res.data.find(e => e.id === parseInt(id))
        if (exp) {
          setExperiment(exp)
        }
      } catch (err) {
        console.error('Failed to fetch experiment:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExperiment()
  }, [id])

  const handleProgressUpdate = (step) => {
    setCurrentStep(step)
    const knowledge = AI_KNOWLEDGE[experiment?.name?.toLowerCase()] || DEFAULT_KNOWLEDGE
    const totalSteps = knowledge.procedure.length
    setProgress(Math.round(((step + 1) / totalSteps) * 100))
  }

  const getSimulationComponent = () => {
    if (!experiment) return null
    const name = experiment.name.toLowerCase()
    const Component = EXPERIMENT_MAP[name]
    if (!Component) return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: '#64748b',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
        <div style={{ fontSize: '18px', color: '#94a3b8' }}>Simulation Coming Soon</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>{experiment.name}</div>
      </div>
    )
    return (
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ color: '#3b82f6', fontSize: '18px' }}>Loading simulation...</div>
        </div>
      }>
        <Component
          experimentData={experiment}
          onProgressUpdate={handleProgressUpdate}
        />
      </Suspense>
    )
  }

  const subjectColor = SUBJECT_COLORS[experiment?.subject] || '#3b82f6'
  const subjectIcon = SUBJECT_ICONS[experiment?.subject] || '🔬'

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0e1a', color: '#3b82f6', fontSize: '18px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚗️</div>
          <div>Loading Laboratory...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#0a0e1a', fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <div style={{
        height: '56px',
        background: 'rgba(15, 22, 45, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px',
        backdropFilter: 'blur(10px)', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', padding: '6px 12px',
            borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >← Back to Labs</button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>
            {experiment?.name || 'Virtual Lab'}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px', fontWeight: '600',
            background: `${subjectColor}20`,
            border: `1px solid ${subjectColor}40`,
            color: subjectColor,
          }}>{subjectIcon} {experiment?.subject}</div>
        </div>

        {/* Panel toggles */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: sidebarOpen ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${sidebarOpen ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: sidebarOpen ? '#93c5fd' : '#64748b',
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
          }}
        >📋 Procedure</button>

        <button
          onClick={() => setAiOpen(!aiOpen)}
          style={{
            background: aiOpen ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${aiOpen ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: aiOpen ? '#c4b5fd' : '#64748b',
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
          }}
        >🤖 AI Assistant</button>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '100px', height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #10b981)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: '12px', color: '#10b981' }}>{progress}% complete</span>
        </div>

        <button
          onClick={() => { setProgress(100); setCurrentStep(99); }}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', color: 'white',
            padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
          }}
        >✓ Mark Done</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Procedure */}
        {sidebarOpen && (
          <div style={{ width: '220px', minWidth: '220px', overflow: 'hidden' }}>
            <ProcedurePanel
              experimentName={experiment?.name}
              currentStep={currentStep}
              onStepClick={handleProgressUpdate}
              progress={progress}
            />
          </div>
        )}

        {/* Center - Simulation */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          {getSimulationComponent()}
        </div>

        {/* Right - AI Assistant */}
        {aiOpen && (
          <div style={{ width: '280px', minWidth: '280px', overflow: 'hidden' }}>
            <AIAssistant experimentName={experiment?.name} />
          </div>
        )}
      </div>
    </div>
  )
}
