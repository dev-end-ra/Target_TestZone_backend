// Assigns chapter tags to the 150 existing seeded questions
// Run: node scripts/addChapters.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
dotenv.config();

// Map question text keywords → chapter name
const physicsChapters = [
  { keywords: ['circular', 'centripetal'], chapter: 'Circular Motion' },
  { keywords: ['Newton', 'F = ma', 'force'], chapter: "Newton's Laws of Motion" },
  { keywords: ['escape velocity', 'gravitational potential', 'gravitation'], chapter: 'Gravitation' },
  { keywords: ['angular momentum', 'moment of inertia', 'rotational', 'torque'], chapter: 'Rotational Motion' },
  { keywords: ['SHM', 'simple pendulum', 'restoring force', 'oscillation'], chapter: 'Oscillations' },
  { keywords: ['Hooke', 'elastic', 'Poisson', 'stress', 'strain'], chapter: 'Elasticity' },
  { keywords: ['surface tension'], chapter: 'Surface Tension' },
  { keywords: ['sound', 'standing wave', 'stationary wave'], chapter: 'Wave Motion' },
  { keywords: ['kinetic energy of a gas', 'absolute temperature', 'adiabatic'], chapter: 'Kinetic Theory of Gases' },
  { keywords: ['critical angle', 'total internal', 'refraction', 'fringe width', "Young's double"], chapter: 'Wave Optics' },
  { keywords: ['photoelectric', 'work function', 'photon', 'de Broglie', 'stopping potential'], chapter: 'Electrons and Photons' },
  { keywords: ['Bohr orbit', 'hydrogen', 'atomic'], chapter: 'Atoms and Nuclei' },
  { keywords: ['half-life', 'radioactive', 'alpha particle', 'nuclear binding', 'neutrino'], chapter: 'Nuclear Physics' },
  { keywords: ['P-type', 'N-type', 'rectifier', 'semiconductor'], chapter: 'Semiconductors' },
  { keywords: ['Coulomb', 'electric charge', 'electric potential', 'capacitor'], chapter: 'Electrostatics' },
  { keywords: ['Ohm', 'resistor', 'current electricity'], chapter: 'Current Electricity' },
  { keywords: ['magnetic field', 'Biot-Savart', 'Ampere', 'Faraday', 'Lenz', 'electromagnetic induction', 'magnetic flux', 'self-inductance'], chapter: 'Magnetism' },
  { keywords: ['impedance', 'LCR', 'resonance', 'capacitor', 'displacement current'], chapter: 'AC Circuits' },
  { keywords: ['visible light', 'lens', 'power of a lens', 'mirror'], chapter: 'Ray Optics' },
  { keywords: ['Bernoulli', 'projectile', 'latent heat', 'Carnot', 'efficiency'], chapter: 'Thermodynamics' },
];

const chemistryChapters = [
  { keywords: ['solid', 'FCC', 'unit cell', 'melting point'], chapter: 'Solid State' },
  { keywords: ['Henry', 'solubility', "van't Hoff", 'colligative', "Raoult's", 'osmotic', 'molality'], chapter: 'Solutions' },
  { keywords: ['thermodynamics', 'Gibbs', 'enthalpy', 'spontaneous', 'neutralisation', 'buffer'], chapter: 'Chemical Thermodynamics' },
  { keywords: ['electrode', 'Faraday', 'electrolysis', 'SHE'], chapter: 'Electrochemistry' },
  { keywords: ['rate constant', 'activation energy', 'Arrhenius', 'order'], chapter: 'Chemical Kinetics' },
  { keywords: ['d-block', 'transition', 'coordination', 'EAN', 'IUPAC.*\\['], chapter: 'Coordination Compounds' },
  { keywords: ['chlorine', 'bleaching', 'halogen', 'fluorine'], chapter: 'p-Block Elements' },
  { keywords: ['Cr', 'K₂Cr₂O₇', 'oxidation state'], chapter: 'd and f Block Elements' },
  { keywords: ['Lucas', 'alcohol', 'phenol'], chapter: 'Alcohols and Phenols' },
  { keywords: ['Tollen', 'aldehyde', 'ketone', 'HCHO', 'carbonyl', 'carboxylic', 'IUPAC.*CHO'], chapter: 'Carbonyl Compounds' },
  { keywords: ['Gabriel', 'Hinsberg', 'amine'], chapter: 'Amines' },
  { keywords: ['glucose', 'sucrose', 'carbohydrate', 'aldohexose'], chapter: 'Biomolecules' },
  { keywords: ['Nylon', 'Bakelite', 'Teflon', 'Kevlar', 'polymer'], chapter: 'Polymers' },
  { keywords: ['vitamin', 'DNA', 'zwitterion', 'amino acid', 'fermentation'], chapter: 'Chemistry in Everyday Life' },
  { keywords: ['Lewis acid', 'pH', 'HCl', 'buffer', 'ionisation'], chapter: 'Ionic Equilibrium' },
  { keywords: ['H₂SO₄', 'Zn', 'H₂', 'dil.'], chapter: 'General Chemistry' },
  { keywords: ['SN2', 'Markovnikov', 'halogenation', 'free radical', 'alkene', 'alkane'], chapter: 'Organic Reaction Mechanisms' },
  { keywords: ['hybridisation', 'dipole moment', 'sp', 'NH₃', 'CO₂'], chapter: 'Chemical Bonding' },
  { keywords: ['coordination number', 'NaCl', 'crystal'], chapter: 'Solid State' },
  { keywords: ['greenhouse', 'nitrogen', 'milk', 'curd'], chapter: 'Environmental Chemistry' },
];

const mathsChapters = [
  { keywords: ['contrapositive', 'conditional', 'logic'], chapter: 'Mathematical Logic' },
  { keywords: ['matrix', 'determinant', 'det(', 'inverse of matrix'], chapter: 'Matrices and Determinants' },
  { keywords: ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'principal value', 'inverse'], chapter: 'Inverse Trigonometry' },
  { keywords: ['pair of lines', 'combined equation', 'angle between lines'], chapter: 'Pair of Straight Lines' },
  { keywords: ['circle', 'radius', 'centre'], chapter: 'Circle' },
  { keywords: ['parabola', 'ellipse', 'eccentricity', 'focus', 'conic'], chapter: 'Conic Sections' },
  { keywords: ['vector', 'cross product', 'dot product', 'a⃗', 'b⃗'], chapter: 'Vectors' },
  { keywords: ['direction cosines', '3D', 'z-axis'], chapter: '3D Geometry' },
  { keywords: ['lim', 'limit'], chapter: 'Limits' },
  { keywords: ["d/dx", 'derivative', "f'(x)", "Rolle's", 'increasing', 'decreasing'], chapter: 'Differentiation' },
  { keywords: ['∫', 'integration', 'area', 'definite'], chapter: 'Integration' },
  { keywords: ['differential equation', 'dy/dx = y', 'order of'], chapter: 'Differential Equations' },
  { keywords: ['P(A', 'probability', 'mutually exclusive', 'independent'], chapter: 'Probability' },
  { keywords: ['mean', 'standard deviation', 'variance'], chapter: 'Statistics' },
  { keywords: ['sin 2A', 'cos 2A', 'tan(A + B)', 'sine rule', 'tan A'], chapter: 'Trigonometry' },
  { keywords: ['n!', 'arrange', 'ⁿCr', 'Pascal'], chapter: 'Permutations and Combinations' },
  { keywords: ['binomial', 'coefficients', '(1+x)ⁿ', 'general term'], chapter: 'Binomial Theorem' },
  { keywords: ['AP', 'GP', 'nth term', 'sum of first n'], chapter: 'Sequences and Series' },
  { keywords: ['complex', '|z|', 'argument', 'z = '], chapter: 'Complex Numbers' },
];

function getChapter(text, subject) {
  const lower = text.toLowerCase();
  const map = subject === 'Physics' ? physicsChapters
    : subject === 'Chemistry' ? chemistryChapters
    : mathsChapters;

  for (const { keywords, chapter } of map) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return chapter;
  }
  return 'General';
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/target_testzone');
  console.log('Connected to MongoDB');

  const questions = await Question.find({ $or: [{ chapter: { $exists: false } }, { chapter: 'General' }] });
  console.log(`Found ${questions.length} questions to tag`);

  let updated = 0;
  for (const q of questions) {
    const chapter = getChapter(q.text, q.subject);
    if (chapter !== 'General' || !q.chapter) {
      await Question.findByIdAndUpdate(q._id, { chapter });
      updated++;
    }
  }
  console.log(`✅ Tagged ${updated} questions with chapters`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
