import { RefreshCw, Download, Upload, Info, HardDrive, Shield } from 'lucide-react';
import { useState, useRef } from 'react';
import { sounds } from '@/lib/soundEffects';

interface ModelControlsProps {
  onReset: () => void;
  onDownload: () => void;
  onImport: (files: FileList) => Promise<boolean>;
  isLoading: boolean;
  mode: string;
  className?: string;
}

const ModelControls = ({
  onReset,
  onDownload,
  onImport,
  isLoading,
  mode,
  className = '',
}: ModelControlsProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    sounds.playTap();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportStatus('idle');

    try {
      const success = await onImport(files);
      setImportStatus(success ? 'success' : 'error');
      if (success) sounds.playSuccess();
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col w-full max-w-sm rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.08] dark:border-white/[0.1] shadow-apple-card p-6 select-none transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-apple-ink/50 dark:text-white/50">
          Model Management
        </span>
        <button
          type="button"
          onClick={() => { sounds.playTap(); setShowInfo(!showInfo); }}
          className="text-apple-ink/50 dark:text-white/50 hover:text-apple-blue transition-colors"
          aria-label="Information"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3.5 bg-apple-surface-parchment dark:bg-apple-tile-2 rounded-xl text-[12px] leading-relaxed text-apple-ink/70 dark:text-white/70 animate-fade-in border border-black/5 dark:border-white/5">
          <p className="mb-1.5">
            <strong className="text-apple-ink dark:text-white">Edge Learning:</strong> Correcting predictions fine-tunes CNN layer weights in-browser via WebGL backpropagation.
          </p>
          <p className="mb-1.5">
            <strong className="text-apple-ink dark:text-white">Export:</strong> Download model weights (`model.json` + `.bin`) for backup or multi-device deployment.
          </p>
          <p>
            <strong className="text-apple-ink dark:text-white">Reset:</strong> Clears custom IndexedDB weights and restores the pristine MNIST checkpoint.
          </p>
        </div>
      )}

      {importStatus !== 'idle' && (
        <div className={`mb-3 p-2.5 rounded-xl text-xs font-mono text-center animate-fade-in ${
          importStatus === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-500/10 text-red-500'
        }`}>
          {importStatus === 'success' ? '✓ Model weights restored successfully!' : 'Failed to import model.'}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => { sounds.playTap(); onDownload(); }}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-apple-blue/10 hover:bg-apple-blue/15 text-apple-blue font-medium text-xs transition-all active:scale-95 disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          disabled={isLoading || isImporting}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-2 border border-black/5 dark:border-white/10 hover:text-apple-blue text-apple-ink dark:text-white font-medium text-xs transition-all active:scale-95 disabled:opacity-40"
        >
          <Upload className={`w-3.5 h-3.5 ${isImporting ? 'animate-bounce' : ''}`} />
          {isImporting ? 'Loading...' : 'Import'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.bin"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => { sounds.playTap(); onReset(); }}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/15 transition-all active:scale-95 disabled:opacity-40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        Restore Default Checkpoint
      </button>

      {/* Meta Specs */}
      <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Active Dataset</span>
          <span className="font-semibold text-apple-ink dark:text-white capitalize">MNIST ({mode})</span>
        </div>
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Persistence</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            Browser IndexedDB
          </span>
        </div>
        <div className="flex justify-between text-apple-ink/60 dark:text-white/60">
          <span>Privacy</span>
          <span className="text-apple-ink/80 dark:text-white/80 flex items-center gap-1">
            <Shield className="w-3 h-3 text-apple-blue" />
            100% Zero-Cloud / On-Device
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelControls;
