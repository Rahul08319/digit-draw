import { RefreshCw, Download, Upload, Info, Save } from 'lucide-react';
import { useState, useRef } from 'react';

interface ModelControlsProps {
  onReset: () => void;
  onDownload: () => void;
  onImport: (files: FileList) => Promise<boolean>;
  isLoading: boolean;
  mode: string;
}

const ModelControls = ({ onReset, onDownload, onImport, isLoading, mode }: ModelControlsProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
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
      
      // Reset status after 3 seconds
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
            <strong className="text-foreground">Export:</strong> Download your trained model to share with others or backup.
          </p>
          <p className="mb-2">
            <strong className="text-foreground">Import:</strong> Load a model file shared by someone else.
          </p>
          <p>
            <strong className="text-foreground">Reset:</strong> Restores the original untrained model.
          </p>
        </div>
      )}

      {/* Import Status Message */}
      {importStatus !== 'idle' && (
        <div className={`mb-3 p-2 rounded-lg text-xs font-mono text-center animate-fade-in ${
          importStatus === 'success' 
            ? 'bg-success/20 text-success' 
            : 'bg-destructive/20 text-destructive'
        }`}>
          {importStatus === 'success' ? 'Model imported successfully!' : 'Failed to import model'}
        </div>
      )}

      {/* Export/Import Buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onDownload}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-mono text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={handleImportClick}
          disabled={isLoading || isImporting}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg font-mono text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className={`w-4 h-4 ${isImporting ? 'animate-pulse' : ''}`} />
          {isImporting ? 'Importing...' : 'Import'}
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
        onClick={onReset}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg font-mono text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        Reset Model
      </button>

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

      {/* Import Instructions */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-mono">
          To import: Select both the .json and .bin files from an exported model.
        </p>
      </div>
    </div>
  );
};

export default ModelControls;
