import { useMemo } from 'react';

interface NeuralNetworkVizProps {
  isActive: boolean;
}

const NeuralNetworkViz = ({ isActive }: NeuralNetworkVizProps) => {
  const layers = useMemo(() => [
    { nodes: 6, label: 'Input' },
    { nodes: 8, label: 'Hidden 1' },
    { nodes: 8, label: 'Hidden 2' },
    { nodes: 4, label: 'Output' },
  ], []);

  return (
    <div className="prediction-card rounded-2xl p-6 w-full max-w-sm">
      <h2 className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-4">
        Neural Network
      </h2>
      
      <div className="flex justify-between items-center h-48 px-2">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="flex flex-col items-center gap-1">
            {Array.from({ length: layer.nodes }).map((_, nodeIndex) => (
              <div
                key={nodeIndex}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-primary glow-primary animate-pulse-glow'
                    : 'bg-muted'
                }`}
                style={{
                  animationDelay: `${(layerIndex * 100 + nodeIndex * 50)}ms`,
                }}
              />
            ))}
            <span className="text-muted-foreground font-mono text-[10px] mt-2 opacity-60">
              {layer.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">Status</span>
          <span className={isActive ? 'text-success' : 'text-muted-foreground'}>
            {isActive ? 'Processing...' : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkViz;
