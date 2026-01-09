import { useMemo } from 'react';

interface PredictionDisplayProps {
  predictions: number[] | null;
  isLoading: boolean;
}

const PredictionDisplay = ({ predictions, isLoading }: PredictionDisplayProps) => {
  const { topPrediction, confidencePercent } = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return { topPrediction: null, confidencePercent: 0 };
    }
    
    const maxConfidence = Math.max(...predictions);
    const topDigit = predictions.indexOf(maxConfidence);
    
    return {
      topPrediction: topDigit,
      confidencePercent: Math.round(maxConfidence * 100),
    };
  }, [predictions]);

  return (
    <div className="prediction-card rounded-2xl p-6 w-full max-w-sm">
      <h2 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-4">
        Prediction
      </h2>
      
      {/* Main Prediction */}
      <div className="text-center mb-6">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topPrediction !== null ? (
          <div className="animate-scale-in">
            <span className="text-8xl font-bold text-primary text-glow font-mono">
              {topPrediction}
            </span>
            <p className="text-muted-foreground font-mono text-sm mt-2">
              {confidencePercent}% confidence
            </p>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <span className="text-muted-foreground font-mono text-sm">
              Waiting for input...
            </span>
          </div>
        )}
      </div>

      {/* Confidence Bars */}
      <div className="space-y-2">
        <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-3">
          All Probabilities
        </h3>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
          const confidence = predictions?.[digit] ?? 0;
          const percent = Math.round(confidence * 100);
          const isTop = digit === topPrediction && predictions !== null;
          
          return (
            <div key={digit} className="flex items-center gap-3">
              <span className={`font-mono text-sm w-4 ${isTop ? 'text-primary text-glow' : 'text-muted-foreground'}`}>
                {digit}
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
        })}
      </div>
    </div>
  );
};

export default PredictionDisplay;
