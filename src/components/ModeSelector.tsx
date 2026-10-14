import { RecognitionMode } from '@/hooks/useDigitRecognition';
import { Hash, Type } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface ModeSelectorProps {
  mode: RecognitionMode;
  onModeChange: (mode: RecognitionMode) => void;
  disabled?: boolean;
}

const ModeSelector = ({ mode, onModeChange, disabled }: ModeSelectorProps) => {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
      <button
        type="button"
        onClick={() => { sounds.playTap(); onModeChange('digits'); }}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
          mode === 'digits'
            ? 'bg-apple-blue text-white shadow-sm'
            : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-blue'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <Hash className="w-3.5 h-3.5" />
        <span>Digits (0–9)</span>
      </button>
      <button
        type="button"
        onClick={() => { sounds.playTap(); onModeChange('alphanumeric'); }}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
          mode === 'alphanumeric'
            ? 'bg-apple-blue text-white shadow-sm'
            : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-blue'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <Type className="w-3.5 h-3.5" />
        <span>Alphanumeric (0–Z)</span>
      </button>
    </div>
  );
};

export default ModeSelector;
