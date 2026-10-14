import { useMemo, useState } from 'react';
import { Check, Edit3, X, HelpCircle, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface PredictionDisplayProps {
  predictions: number[] | null;
  isLoading: boolean;
  isTraining: boolean;
  trainingProgress: number;
  classes: string[];
  onCorrection: (correctLabel: string) => void;
  className?: string;
}

const PredictionDisplay = ({
  predictions,
  isLoading,
  isTraining,
  trainingProgress,
  classes,
  onCorrection,
  className = '',
}: PredictionDisplayProps) => {
  const [showCorrection, setShowCorrection] = useState(false);

  const { topLabel, confidencePercent, sortedPredictions } = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { topLabel: null, confidencePercent: 0, sortedPredictions: [] };
    }

    const maxConfidence = Math.max(...predictions);
    const topIndex = predictions.indexOf(maxConfidence);

    const indexed = predictions.map((prob, idx) => ({ prob, idx, label: classes[idx] }));
    const sorted = indexed.sort((a, b) => b.prob - a.prob).slice(0, 5);

    return {
      topLabel: classes[topIndex],
      confidencePercent: Math.round(maxConfidence * 100),
      sortedPredictions: sorted,
    };
  }, [predictions, classes]);

  const handleCorrection = (label: string) => {
    sounds.playTap();
    onCorrection(label);
    setShowCorrection(false);
  };

  return (
    <div className={`flex flex-col w-full max-w-sm rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card p-6 select-none transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50">
          Neural Prediction
        </span>
        {topLabel !== null && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-apple-blue/10 text-apple-blue">
            {confidencePercent}% Confidence
          </span>
        )}
      </div>

      {/* On-device Training Progress Bar */}
      {isTraining && (
        <div className="mb-4 p-3 rounded-xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-apple-blue font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Fine-Tuning On-Device...
            </span>
            <span className="text-apple-ink/70 dark:text-white/70">{Math.round(trainingProgress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-apple-blue rounded-full transition-all duration-150"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary Display */}
      <div className="text-center py-4">
        {isLoading ? (
          <div className="h-28 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topLabel !== null ? (
          <div className="animate-scale-in">
            <span className="text-8xl font-bold font-mono tracking-tighter text-apple-ink dark:text-white block leading-none">
              {topLabel}
            </span>

            {/* Apple Action Pills for verification / correction */}
            {!showCorrection ? (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => { sounds.playTap(); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/15 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accurate
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playTap(); setShowCorrection(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/10 text-apple-ink/80 dark:text-white/80 text-xs font-medium hover:text-apple-blue active:scale-95 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Correct Model
                </button>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-2xl bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/5 animate-fade-in text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-apple-ink/60 dark:text-white/60">
                    Select true character:
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowCorrection(false)}
                    className="text-apple-ink/40 dark:text-white/40 hover:text-apple-ink dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {classes.map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleCorrection(label)}
                      disabled={isTraining}
                      className={`p-2 rounded-xl text-xs font-mono font-medium transition-all active:scale-95 ${
                        label === topLabel
                          ? 'bg-apple-blue text-white shadow-xs'
                          : 'bg-white dark:bg-apple-tile-1 hover:bg-apple-surface-parchment dark:hover:bg-apple-tile-3 text-apple-ink dark:text-white border border-black/5 dark:border-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center text-apple-ink/30 dark:text-white/30">
            <span className="text-sm font-medium">No character detected</span>
            <span className="text-xs mt-1">Start sketching on the canvas</span>
          </div>
        )}
      </div>

      {/* Top Candidates Probability Breakdown */}
      {sortedPredictions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50 block mb-2">
            Confidence Distribution
          </span>
          {sortedPredictions.map((pred, i) => {
            const percent = Math.round(pred.prob * 100);
            return (
              <div key={pred.label} className="flex items-center gap-2.5 text-xs font-mono">
                <span className={`w-4 font-bold text-center ${i === 0 ? 'text-apple-blue' : 'text-apple-ink/70 dark:text-white/70'}`}>
                  {pred.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      i === 0 ? 'bg-apple-blue' : 'bg-apple-ink/20 dark:bg-white/20'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] text-apple-ink/60 dark:text-white/60">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay;
