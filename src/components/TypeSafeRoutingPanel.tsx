import { useState } from 'react';
import { TypeSafeEvaluationResult } from '@/lib/typesafeRouting';
import { ShieldCheck, Cpu, ArrowRight, Activity, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface TypeSafeRoutingPanelProps {
  evaluation: TypeSafeEvaluationResult | null;
  className?: string;
}

const TypeSafeRoutingPanel = ({ evaluation, className = '' }: TypeSafeRoutingPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!evaluation) {
    return (
      <div className={`p-5 rounded-[20px] bg-apple-surface-parchment/60 dark:bg-apple-tile-1/60 border border-black/[0.06] dark:border-white/[0.08] text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-apple-ink/50 dark:text-white/50">
          <Activity className="w-3.5 h-3.5" />
          <span>TypeSafe System One Routing Architecture</span>
        </div>
        <p className="text-[12px] text-apple-ink/40 dark:text-white/40 mt-1">
          Draw on canvas to trigger live System One evaluation & routing
        </p>
      </div>
    );
  }

  const isFast = evaluation.routingPath === 'fast_path_commit';

  return (
    <div className={`rounded-[20px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header Banner */}
      <div className="p-4 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isFast ? 'bg-emerald-500/10 text-emerald-500' : 'bg-apple-blue/10 text-apple-blue'
          }`}>
            {isFast ? <ShieldCheck className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/60 dark:text-white/60">
                TypeSafe System One Engine
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isFast 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-apple-blue/10 text-apple-blue'
              }`}>
                {isFast ? 'Fast Path Commit' : 'System One Evaluated'}
              </span>
            </div>
            <span className="text-[11px] text-apple-ink/50 dark:text-white/50 font-mono">
              Latency: {evaluation.executionTimeMs}ms • Jev Model Primitives
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { sounds.playTap(); setIsExpanded(!isExpanded); }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-apple-blue hover:text-apple-blue-hover font-medium active:scale-95 transition-all"
        >
          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Primary Routing Strip */}
      <div className="p-4 bg-apple-surface-parchment/50 dark:bg-apple-tile-2/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {/* Intent (Choice) */}
          <div className="p-2.5 rounded-xl bg-apple-canvas dark:bg-apple-tile-1 border border-black/5 dark:border-white/5">
            <span className="text-[10px] uppercase font-semibold text-apple-ink/50 dark:text-white/50 block mb-0.5">
              Intent (Choice)
            </span>
            <span className="text-xs font-mono font-semibold text-apple-ink dark:text-white capitalize">
              {evaluation.intent.selected.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Validity (Noul) */}
          <div className="p-2.5 rounded-xl bg-apple-canvas dark:bg-apple-tile-1 border border-black/5 dark:border-white/5">
            <span className="text-[10px] uppercase font-semibold text-apple-ink/50 dark:text-white/50 block mb-0.5">
              Validity (Noul)
            </span>
            <span className={`text-xs font-mono font-semibold ${
              evaluation.isValidDigit.probability > 0.5 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {(evaluation.isValidDigit.probability * 100).toFixed(0)}% valid
            </span>
          </div>

          {/* Clarity (Score) */}
          <div className="p-2.5 rounded-xl bg-apple-canvas dark:bg-apple-tile-1 border border-black/5 dark:border-white/5">
            <span className="text-[10px] uppercase font-semibold text-apple-ink/50 dark:text-white/50 block mb-0.5">
              Clarity (Score)
            </span>
            <span className="text-xs font-mono font-semibold text-apple-ink dark:text-white">
              {evaluation.clarityScore.score}/5.0
            </span>
          </div>

          {/* Escalation (Noul) */}
          <div className="p-2.5 rounded-xl bg-apple-canvas dark:bg-apple-tile-1 border border-black/5 dark:border-white/5">
            <span className="text-[10px] uppercase font-semibold text-apple-ink/50 dark:text-white/50 block mb-0.5">
              Escalate (Noul)
            </span>
            <span className={`text-xs font-mono font-semibold ${
              evaluation.escalateToHuman.verdict ? 'text-amber-500' : 'text-apple-ink/60 dark:text-white/60'
            }`}>
              {evaluation.escalateToHuman.verdict ? 'Yes (Low Margin)' : 'No (Automated)'}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-apple-ink/60 dark:text-white/60 mt-3 leading-relaxed">
          {evaluation.reasoningNote}
        </p>
      </div>

      {/* Expanded Detailed Inspection */}
      {isExpanded && (
        <div className="p-4 border-t border-black/[0.05] dark:border-white/[0.08] space-y-4 animate-fade-in text-xs">
          {/* Decision Architecture Explanation */}
          <div>
            <span className="font-semibold text-apple-ink dark:text-white block mb-1">
              Architecture & Routing Logic:
            </span>
            <p className="text-apple-ink/70 dark:text-white/70 leading-relaxed text-[12px]">
              TypeSafe System One models (Jev) serve as programmable common sense. When fast-path edge predictions exhibit high entropy or tight margins, the pipeline speculatively executes parallel typed judgments (Intent Choice, Numeral Noul, and Clarity Score) rather than relying on uncalibrated raw softmax outputs.
            </p>
          </div>

          {/* Intent Distribution Bars */}
          <div>
            <span className="font-semibold text-apple-ink dark:text-white block mb-2">
              Intent Choice Probability Distribution:
            </span>
            <div className="space-y-1.5 font-mono">
              {Object.entries(evaluation.intent.distribution).map(([key, prob]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-28 text-[11px] truncate text-apple-ink/60 dark:text-white/60 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-apple-blue rounded-full"
                      style={{ width: `${Math.round(prob * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] text-apple-ink/70 dark:text-white/70">
                    {(prob * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeSafeRoutingPanel;
