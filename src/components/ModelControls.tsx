import { RefreshCw, Save, Info } from 'lucide-react';
import { useState } from 'react';

interface ModelControlsProps {
  onReset: () => void;
  isLoading: boolean;
  mode: string;
}

const ModelControls = ({ onReset, isLoading, mode }: ModelControlsProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="prediction-card rounded-2xl p-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
          Model Controls
        </h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground animate-fade-in">
          <p className="mb-2">
            <strong className="text-foreground">On-device learning:</strong> When you correct a wrong prediction, the model learns from your feedback directly in your browser.
          </p>
          <p className="mb-2">
            <strong className="text-foreground">Saved locally:</strong> Your trained model is saved in your browser and persists across sessions.
          </p>
          <p>
            <strong className="text-foreground">Reset:</strong> Restores the original pre-trained model.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg font-mono text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reset Model
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">Mode</span>
          <span className="text-foreground capitalize">{mode}</span>
        </div>
        <div className="flex justify-between text-xs font-mono mt-1">
          <span className="text-muted-foreground">Storage</span>
          <span className="text-success flex items-center gap-1">
            <Save className="w-3 h-3" />
            IndexedDB
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelControls;
