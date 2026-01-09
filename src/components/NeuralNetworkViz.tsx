import { useMemo } from 'react';
import { RecognitionMode } from '@/hooks/useDigitRecognition';

interface NeuralNetworkVizProps {
  isActive: boolean;
  isTraining: boolean;
  mode: RecognitionMode;
}

const NeuralNetworkViz = ({ isActive, isTraining, mode }: NeuralNetworkVizProps) => {
  const layers = useMemo(() => [
    { nodes: 6, label: 'Input', sublabel: '28×28' },
    { nodes: 6, label: 'Conv1', sublabel: '32 filters' },
    { nodes: 8, label: 'Conv2', sublabel: '64 filters' },
    { nodes: 8, label: 'Conv3', sublabel: '128 filters' },
    { nodes: 5, label: 'Dense', sublabel: '256 units' },
    { nodes: mode === 'digits' ? 4 : 6, label: 'Output', sublabel: mode === 'digits' ? '10 classes' : '36 classes' },
  ], [mode]);

  return (
    <div className="prediction-card rounded-2xl p-6 w-full max-w-sm">
      <h2 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-4">
        Neural Network
      </h2>
      
      <div className="flex justify-between items-center h-48 px-1 overflow-x-auto">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="flex flex-col items-center gap-0.5 min-w-[40px]">
            {Array.from({ length: layer.nodes }).map((_, nodeIndex) => (
              <div
                key={nodeIndex}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isTraining
                    ? 'bg-accent glow-accent animate-pulse-glow'
                    : isActive
                    ? 'bg-primary glow-primary animate-pulse-glow'
                    : 'bg-muted'
                }`}
                style={{
                  animationDelay: `${(layerIndex * 100 + nodeIndex * 50)}ms`,
                }}
              />
            ))}
            <div className="mt-2 text-center">
              <span className="text-muted-foreground font-mono text-[9px] block opacity-80">
                {layer.label}
              </span>
              <span className="text-muted-foreground font-mono text-[8px] block opacity-50">
                {layer.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">Status</span>
          <span className={
            isTraining 
              ? 'text-accent' 
              : isActive 
              ? 'text-success' 
              : 'text-muted-foreground'
          }>
            {isTraining ? 'Training...' : isActive ? 'Processing...' : 'Idle'}
          </span>
        </div>
        <div className="flex justify-between text-xs font-mono mt-1">
          <span className="text-muted-foreground">Architecture</span>
          <span className="text-foreground">CNN</span>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkViz;
