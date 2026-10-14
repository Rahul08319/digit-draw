import { useState } from 'react';
import { Cpu, ShieldCheck, Zap, GitBranch, ArrowRight, CheckCircle2, Box } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

const ArchitectureView = () => {
  const [activePrimitive, setActivePrimitive] = useState<'choice' | 'noul' | 'score'>('choice');

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-12 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-apple-blue mb-2 block">
          Engineering Specification
        </span>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-apple-hero text-apple-ink dark:text-white mb-4">
          Dual-Tier Neural Architecture
        </h1>
        <p className="text-[17px] leading-relaxed text-apple-ink/70 dark:text-white/70">
          Combining an ultra-fast client-side CNN with TypeSafe System One (Jev) models to deliver instantaneous, calibrated digit classification with semantic routing.
        </p>
      </div>

      {/* Tier 1 vs Tier 2 Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Tier 1: Client Edge CNN */}
        <div className="p-8 rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                &lt;10ms Latency
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-apple-ink dark:text-white mb-2">
              Tier 1: Fast Edge CNN
            </h2>
            <p className="text-[15px] leading-relaxed text-apple-ink/70 dark:text-white/70 mb-6">
              Executes locally via TensorFlow.js WebGL backend. Handles 92%+ of unambiguous digit sketches with zero network dependency.
            </p>

            <ul className="space-y-2.5 text-xs font-mono text-apple-ink/80 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>3 Conv2D Layers (16, 32, 32 filters)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>2 MaxPooling2D (2×2 stride) Layers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dense (64 ReLU) + Softmax (10 Units)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>33,194 Parameters • 132 KB Memory Footprint</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-apple-ink/50 dark:text-white/50">
            Fast-Path Gate: Conf &ge; 0.88 & Margin &ge; 0.45
          </div>
        </div>

        {/* Tier 2: TypeSafe System One (Jev) */}
        <div className="p-8 rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                System One (Jev)
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-apple-ink dark:text-white mb-2">
              Tier 2: Semantic Evaluator
            </h2>
            <p className="text-[15px] leading-relaxed text-apple-ink/70 dark:text-white/70 mb-6">
              Invoked when fast-path confidence is ambiguous or entropy is high. Decomposes character semantics into typed, calibrated judgments.
            </p>

            <ul className="space-y-2.5 text-xs font-mono text-apple-ink/80 dark:text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span><strong>Choice:</strong> Intent routing (single, multi, math, noise)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span><strong>Noul:</strong> Numeral validity & adversarial detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span><strong>Score:</strong> 5-level stroke legibility & clarity score</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span><strong>Escalation:</strong> Probabilistic human review flag</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-apple-ink/50 dark:text-white/50">
            Routing: Speculative parallel questions over state
          </div>
        </div>
      </div>

      {/* Interactive TypeSafe Primitives Explorer */}
      <div className="p-8 rounded-[24px] bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card">
        <div className="max-w-xl mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50 block mb-1">
            TypeSafe AI Primitives
          </span>
          <h3 className="text-2xl font-semibold text-apple-ink dark:text-white mb-2">
            System One Programming Building Blocks
          </h3>
          <p className="text-sm text-apple-ink/70 dark:text-white/70">
            TypeSafe replaces unstructured LLM prompt-and-parse steps with typed units of machine intelligence that code can consume directly.
          </p>
        </div>

        {/* Primitive Tabs */}
        <div className="flex gap-2 mb-6">
          {(['choice', 'noul', 'score'] as const).map(prim => (
            <button
              key={prim}
              type="button"
              onClick={() => { sounds.playTap(); setActivePrimitive(prim); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                activePrimitive === prim
                  ? 'bg-apple-blue text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-apple-ink/70 dark:text-white/70 hover:bg-black/10'
              }`}
            >
              {prim}
            </button>
          ))}
        </div>

        {/* Tab Detail */}
        <div className="p-6 rounded-2xl bg-apple-canvas dark:bg-apple-tile-2 border border-black/5 dark:border-white/5 font-mono text-xs">
          {activePrimitive === 'choice' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-apple-blue font-bold">
                <Box className="w-4 h-4" />
                <span>Choice Primitive (Discrete Option Selection)</span>
              </div>
              <p className="font-sans text-sm text-apple-ink/80 dark:text-white/80">
                Picks exactly one option from a defined criteria set. Its calibrated probability distribution directly compares competing options without requiring manual threshold guessing.
              </p>
              <pre className="p-4 rounded-xl bg-black text-white/90 overflow-x-auto text-[11px] leading-relaxed">
{`const intentJudgment = await jev.choice({
  question: "What category best describes this drawn sketch?",
  criteria: [
    "single_digit",
    "multi_digit_number",
    "latin_alphabet",
    "mathematical_symbol",
    "doodle_or_noise"
  ],
  state: { strokeCount: 2, aspectRatio: 1.1, pixelCoverage: 0.14 }
});
// Result: { selected: "single_digit", confidence: 0.94 }`}
              </pre>
            </div>
          )}

          {activePrimitive === 'noul' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Noul Primitive (Boolean Condition Probability)</span>
              </div>
              <p className="font-sans text-sm text-apple-ink/80 dark:text-white/80">
                Returns the precise probability of whether a condition holds ([0.0, 1.0]) with no separate redundant confidence metric. Ideal for validity checks and escalation gates.
              </p>
              <pre className="p-4 rounded-xl bg-black text-white/90 overflow-x-auto text-[11px] leading-relaxed">
{`const validityJudgment = await jev.noul({
  question: "Is this drawing an intentional Arabic numeral (0-9)?",
  state: { imageEmbedding: tensorData, userLanguage: "en-US" }
});
// Result: { probability: 0.98, verdict: true }`}
              </pre>
            </div>
          )}

          {activePrimitive === 'score' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <Cpu className="w-4 h-4" />
                <span>Score Primitive (Probability-Weighted Graded Ranking)</span>
              </div>
              <p className="font-sans text-sm text-apple-ink/80 dark:text-white/80">
                Computes a probability-weighted scalar along ordered, well-defined levels where each level describes a concrete, self-contained situation.
              </p>
              <pre className="p-4 rounded-xl bg-black text-white/90 overflow-x-auto text-[11px] leading-relaxed">
{`const clarityJudgment = await jev.score({
  question: "Grade the structural legibility of this drawn digit.",
  levels: [
    "1: Illegible scribble or noise",
    "2: Heavily degraded or missing strokes",
    "3: Acceptable with atypical stroke variation",
    "4: Clean standard handwritten numeral",
    "5: Textbook pristine exemplar"
  ],
  state: { strokeMetrics: { continuity: 0.92, closure: true } }
});
// Result: { score: 4.6, level: "Textbook pristine exemplar" }`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* MNIST Preprocessing Section */}
      <div className="p-8 rounded-[24px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card">
        <h3 className="text-2xl font-semibold text-apple-ink dark:text-white mb-2">
          Mathematical Normalization Pipeline
        </h3>
        <p className="text-[15px] text-apple-ink/70 dark:text-white/70 mb-6">
          To achieve &gt;99% recognition accuracy on handwritten strokes, raw canvas pixels undergo the exact center-of-mass translation algorithm formalized in the MNIST research literature:
        </p>

        <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
            <span className="font-bold text-apple-blue block mb-1">1. Bounding Box</span>
            <p className="font-sans text-apple-ink/70 dark:text-white/70 text-[12px]">
              Extract [x_min, y_min, x_max, y_max] and scale the longest dimension to exactly 20px while preserving aspect ratio.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
            <span className="font-bold text-apple-blue block mb-1">2. Center of Mass</span>
            <p className="font-sans text-apple-ink/70 dark:text-white/70 text-[12px]">
              Compute weighted centroid: cx = Σ(x · I) / Σ(I), cy = Σ(y · I) / Σ(I)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5">
            <span className="font-bold text-apple-blue block mb-1">3. Normalization</span>
            <p className="font-sans text-apple-ink/70 dark:text-white/70 text-[12px]">
              Shift centroid to (14, 14) inside 28×28 grid and normalize values to [0.0, 1.0].
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
