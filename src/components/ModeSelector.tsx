import { RecognitionMode } from '@/hooks/useDigitRecognition';
import { Hash, Type } from 'lucide-react';

interface ModeSelectorProps {
  mode: RecognitionMode;
  onModeChange: (mode: RecognitionMode) => void;
  disabled?: boolean;
}

const ModeSelector = ({ mode, onModeChange, disabled }: ModeSelectorProps) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-xl">
      <button
        onClick={() => onModeChange('digits')}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
          mode === 'digits'
            ? 'bg-primary text-primary-foreground glow-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Hash className="w-4 h-4" />
        <span>0-9</span>
      </button>
      <button
        onClick={() => onModeChange('alphanumeric')}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
          mode === 'alphanumeric'
            ? 'bg-primary text-primary-foreground glow-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Type className="w-4 h-4" />
        <span>A-Z & 0-9</span>
      </button>
    </div>
  );
};

export default ModeSelector;
