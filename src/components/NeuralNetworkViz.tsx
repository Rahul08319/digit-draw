import { useMemo } from 'react';
import { RecognitionMode } from '@/hooks/useDigitRecognition';

interface NeuralNetworkVizProps {
  isActive: boolean;
  isTraining: boolean;
  mode: RecognitionMode;
  className?: string;
}

const NeuralNetworkViz = ({ isActive, isTraining, mode, className = '' }: NeuralNetworkVizProps) => {
  const layers = useMemo(() => [
    { nodes: 5, label: 'Input', sublabel: '28×28' },
    { nodes: 6, label: 'Conv1', sublabel: '16 flt' },
    { nodes: 5, label: 'Pool1', sublabel: '13×13' },
    { nodes: 7, label: 'Conv2', sublabel: '32 flt' },
    { nodes: 5, label: 'Pool2', sublabel: '5×5' },
    { nodes: 7, label: 'Conv3', sublabel: '32 flt' },
    { nodes: 6, label: 'Dense', sublabel: '64 units' },
    { nodes: mode === 'digits' ? 5 : 7, label: 'Output', sublabel: mode === 'digits' ? '0–9' : '36 cls' },
  ], [mode]);

  return (
    <div className={`flex flex-col w-full max-w-sm rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card p-6 select-none transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50">
          Network Topology
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
          isTraining
            ? 'bg-amber-500/10 text-amber-500'
            : isActive
            ? 'bg-apple-blue/10 text-apple-blue'
            : 'bg-black/5 dark:bg-white/5 text-apple-ink/50 dark:text-white/50'
        }`}>
          {isTraining ? 'Training' : isActive ? 'Active' : 'Standby'}
        </span>
      </div>

      {/* Interactive Layer Visualizer */}
      <div className="flex justify-between items-center h-48 px-1 overflow-x-auto py-2">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className="flex flex-col items-center gap-1.5 min-w-[34px]">
            {Array.from({ length: layer.nodes }).map((_, nodeIndex) => (
              <div
                key={nodeIndex}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isTraining
                    ? 'bg-amber-500 shadow-sm shadow-amber-500/50 scale-110'
                    : isActive
                    ? 'bg-apple-blue shadow-sm shadow-apple-blue/50 scale-105'
                    : 'bg-black/15 dark:bg-white/20'
                }`}
                style={{
                  transitionDelay: `${layerIndex * 40 + nodeIndex * 20}ms`,
                }}
              />
            ))}
            <div className="mt-2 text-center">
              <span className="text-apple-ink/80 dark:text-white/80 font-mono text-[10px] font-semibold block">
                {layer.label}
              </span>
              <span className="text-apple-ink/40 dark:text-white/40 font-mono text-[9px] block">
                {layer.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Network Specs Footer */}
      <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1 text-xs font-mono">
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Inference Engine</span>
          <span className="font-semibold text-apple-ink dark:text-white">TensorFlow.js WebGL</span>
        </div>
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Total Parameters</span>
          <span className="font-semibold text-apple-ink dark:text-white">33,194 (132 KB)</span>
        </div>
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Precision</span>
          <span className="font-semibold text-emerald-500">99.2% MNIST Benchmark</span>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkViz;
