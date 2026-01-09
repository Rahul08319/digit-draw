import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

interface PredictionDisplayProps {
  predictions: number[] | null;
  isLoading: boolean;
  isTraining: boolean;
  trainingProgress: number;
  classes: string[];
  onCorrection: (correctLabel: string) => void;
}

const PredictionDisplay = ({ 
  predictions, 
  isLoading, 
  isTraining,
  trainingProgress,
  classes,
  onCorrection 
}: PredictionDisplayProps) => {
  const [showCorrection, setShowCorrection] = useState(false);

  const { topPrediction, topLabel, confidencePercent, sortedPredictions } = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { topPrediction: null, topLabel: null, confidencePercent: 0, sortedPredictions: [] };
    }
    
    const maxConfidence = Math.max(...predictions);
    const topIndex = predictions.indexOf(maxConfidence);
    
    // Get sorted predictions for display
    const indexed = predictions.map((prob, idx) => ({ prob, idx, label: classes[idx] }));
    const sorted = indexed.sort((a, b) => b.prob - a.prob).slice(0, 10);
    
    return {
      topPrediction: topIndex,
      topLabel: classes[topIndex],
      confidencePercent: Math.round(maxConfidence * 100),
      sortedPredictions: sorted,
    };
  }, [predictions, classes]);

  const handleCorrection = (label: string) => {
    onCorrection(label);
    setShowCorrection(false);
  };

  return (
    <div className="prediction-card rounded-2xl p-6 w-full max-w-sm">
      <h2 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-4">
        Prediction
      </h2>
      
      {/* Training Progress */}
      {isTraining && (
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-primary">Learning...</span>
            <span className="text-muted-foreground">{Math.round(trainingProgress)}%</span>
          </div>
          <div className="confidence-bar h-2 rounded-full">
            <div 
              className="confidence-fill-highlight h-full rounded-full transition-all duration-200"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Main Prediction */}
      <div className="text-center mb-6">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topLabel !== null ? (
          <div className="animate-scale-in">
            <span className="text-8xl font-bold text-primary text-glow font-mono">
              {topLabel}
            </span>
            <p className="text-muted-foreground font-mono text-sm mt-2">
              {confidencePercent}% confidence
            </p>
            
            {/* Correction buttons */}
            {!showCorrection ? (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => setShowCorrection(false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-success/20 text-success rounded-lg text-xs font-mono hover:bg-success/30 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Correct
                </button>
                <button
                  onClick={() => setShowCorrection(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg text-xs font-mono hover:bg-destructive/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Wrong
                </button>
              </div>
            ) : (
              <div className="mt-4 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-3">Select the correct character:</p>
                <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                  {classes.map((label) => (
                    <button
                      key={label}
                      onClick={() => handleCorrection(label)}
                      disabled={isTraining}
                      className={`p-2 rounded-lg font-mono text-sm transition-all hover:scale-105 ${
                        label === topLabel 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCorrection(false)}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <span className="text-muted-foreground font-mono text-sm">
              Waiting for input...
            </span>
          </div>
        )}
      </div>

      {/* Top Confidence Bars */}
      {!showCorrection && (
        <div className="space-y-2">
          <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-3">
            Top Predictions
          </h3>
          {sortedPredictions.length > 0 ? (
            sortedPredictions.map(({ label, prob, idx }) => {
              const percent = Math.round(prob * 100);
              const isTop = idx === topPrediction;
              
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`font-mono text-sm w-6 ${isTop ? 'text-primary text-glow' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                  <div className="confidence-bar flex-1 h-2 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? 'confidence-fill-highlight' : 'confidence-fill'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={`font-mono text-xs w-10 text-right ${isTop ? 'text-primary' : 'text-muted-foreground'}`}>
                    {percent}%
                  </span>
                </div>
              );
            })
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono text-sm w-6 text-muted-foreground">-</span>
                <div className="confidence-bar flex-1 h-2 rounded-full" />
                <span className="font-mono text-xs w-10 text-right text-muted-foreground">0%</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay;
