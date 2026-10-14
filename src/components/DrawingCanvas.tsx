import { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Trash2, Eraser, Pen, ZoomIn } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface DrawingCanvasProps {
  onCanvasChange: (canvas: HTMLCanvasElement | null, strokeCount: number) => void;
  onClear: () => void;
  previewUrl?: string;
  className?: string;
}

const STROKE_WIDTHS = [
  { label: 'Fine', value: 16 },
  { label: 'Standard', value: 24 },
  { label: 'Bold', value: 32 },
];

const DrawingCanvas = ({
  onCanvasChange,
  onClear,
  previewUrl,
  className = '',
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeWidth, setStrokeWidth] = useState<number>(24);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const strokeCountRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastThrottleTimeRef = useRef<number>(0);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d', { willReadFrequently: true });
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    // Crisp high-contrast canvas: true black background with white strokes
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [getContext]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Notify parent of real-time canvas updates with throttling
  const triggerCanvasUpdate = useCallback((immediate = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = performance.now();
    if (!immediate && now - lastThrottleTimeRef.current < 60) {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          onCanvasChange(canvas, strokeCountRef.current);
          lastThrottleTimeRef.current = performance.now();
        });
      }
      return;
    }

    lastThrottleTimeRef.current = now;
    onCanvasChange(canvas, strokeCountRef.current);
  }, [onCanvasChange]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    canvas.setPointerCapture(e.pointerId);

    // Save history state before new stroke
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory(prev => [...prev.slice(-10), snapshot]); // keep up to 10 undos
    strokeCountRef.current += 1;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = tool === 'eraser' ? '#000000' : '#ffffff';

    // Dot on single tap
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();

    setIsDrawing(true);
    setHasDrawn(true);
    sounds.playTap();
    triggerCanvasUpdate(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const ctx = getContext();
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    triggerCanvasUpdate(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    setIsDrawing(false);
    triggerCanvasUpdate(true);
  };

  const handleUndo = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas || strokeHistory.length === 0) return;

    sounds.playTap();
    const previous = strokeHistory[strokeHistory.length - 1];
    setStrokeHistory(prev => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
    strokeCountRef.current = Math.max(0, strokeCountRef.current - 1);

    if (strokeHistory.length <= 1) {
      setHasDrawn(false);
    }
    triggerCanvasUpdate(true);
  };

  const handleClear = () => {
    sounds.playTap();
    initCanvas();
    setHasDrawn(false);
    setStrokeHistory([]);
    strokeCountRef.current = 0;
    onCanvasChange(null, 0);
    onClear();
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-[360px] mx-auto select-none ${className}`}>
      {/* Canvas Container with Apple Elevation & Hairline */}
      <div className="relative group w-full aspect-square rounded-[22px] bg-black p-3.5 shadow-apple-card border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-300">
        
        {/* Subtle MNIST Center Alignment Crosshair Guide */}
        <div className="absolute inset-3.5 pointer-events-none opacity-20 border border-dashed border-white/40 rounded-xl flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>

        {/* The Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full rounded-2xl touch-none cursor-crosshair bg-black"
          style={{ touchAction: 'none' }}
        />

        {/* Real-Time MNIST 28x28 Preprocessed Tensor Picture-in-Picture Capsule */}
        {previewUrl && (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 shadow-sm pointer-events-none animate-fade-in">
            <img 
              src={previewUrl} 
              alt="28x28 MNIST preprocessed input" 
              className="w-5 h-5 rounded border border-white/30 image-pixelated bg-black"
            />
            <span className="text-[10px] font-mono text-white/80 font-medium pr-0.5">28×28</span>
          </div>
        )}

        {/* Empty Canvas Prompt Overlay */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-6">
            <span className="text-sm font-medium text-white/40 tracking-tight mb-1">
              Draw any digit (0–9)
            </span>
            <span className="text-[11px] text-white/25">
              Live AI recognizes strokes in real-time
            </span>
          </div>
        )}
      </div>

      {/* Apple-Style Fluid Toolbar */}
      <div className="w-full mt-3 flex items-center justify-between px-1 gap-2">
        {/* Tool Selector (Pen vs Eraser) */}
        <div className="flex items-center p-1 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => { sounds.playTap(); setTool('pen'); }}
            aria-label="Draw Tool"
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
              tool === 'pen'
                ? 'bg-apple-blue text-white shadow-sm'
                : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-blue'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { sounds.playTap(); setTool('eraser'); }}
            aria-label="Eraser Tool"
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
              tool === 'eraser'
                ? 'bg-apple-blue text-white shadow-sm'
                : 'text-apple-ink/70 dark:text-white/70 hover:text-apple-blue'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center p-1 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/5 dark:border-white/10 gap-0.5">
          {STROKE_WIDTHS.map(sw => (
            <button
              key={sw.label}
              type="button"
              onClick={() => { sounds.playTap(); setStrokeWidth(sw.value); }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all active:scale-95 ${
                strokeWidth === sw.value
                  ? 'bg-white dark:bg-apple-tile-2 text-apple-ink dark:text-white shadow-xs'
                  : 'text-apple-ink/60 dark:text-white/60 hover:text-apple-ink dark:hover:text-white'
              }`}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Undo and Clear Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeHistory.length === 0}
            aria-label="Undo Stroke"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/5 dark:border-white/10 text-apple-ink/70 dark:text-white/70 hover:text-apple-ink dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn}
            aria-label="Clear Canvas"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-apple-surface-parchment dark:bg-apple-tile-1 border border-black/5 dark:border-white/10 text-apple-ink/70 dark:text-white/70 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
