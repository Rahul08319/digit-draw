import { useCallback } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import PredictionDisplay from '@/components/PredictionDisplay';
import NeuralNetworkViz from '@/components/NeuralNetworkViz';
import ModeSelector from '@/components/ModeSelector';
import ModelControls from '@/components/ModelControls';
import { useDigitRecognition } from '@/hooks/useDigitRecognition';
import { Brain, Sparkles } from 'lucide-react';

const Index = () => {
  const { 
    isModelLoading, 
    predictions, 
    isProcessing, 
    isTraining,
    trainingProgress,
    mode,
    modelLoadError,
    predict,
    clearPredictions,
    trainOnCorrection,
    switchMode,
    resetModel,
    downloadModel,
    importModel,
    getClasses,
  } = useDigitRecognition();

  const handleDrawingChange = useCallback((imageData: ImageData | null) => {
    predict(imageData);
  }, [predict]);

  const handleClear = useCallback(() => {
    clearPredictions();
  }, [clearPredictions]);

  const handleCorrection = useCallback((correctLabel: string) => {
    trainOnCorrection(correctLabel);
  }, [trainOnCorrection]);

  const handleDownload = useCallback(() => {
    downloadModel();
  }, [downloadModel]);

  const handleImport = useCallback(async (files: FileList): Promise<boolean> => {
    return await importModel(files);
  }, [importModel]);

  return (
    <div className="min-h-screen neural-bg">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary animate-pulse-glow" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Digit <span className="text-primary text-glow">Recognition</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto mb-6">
            Draw characters and watch a neural network predict them in real-time. 
            Correct wrong predictions to train the model on-device!
          </p>
          
          {/* Mode Selector */}
          <div className="flex justify-center mb-2">
            <ModeSelector 
              mode={mode} 
              onModeChange={switchMode}
              disabled={isModelLoading || isTraining}
            />
          </div>
          
          {/* Feature badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full text-accent text-xs font-mono">
            <Sparkles className="w-3 h-3" />
            On-device learning enabled
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isModelLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary font-mono text-sm">Loading Neural Network...</p>
            <p className="text-muted-foreground font-mono text-xs mt-2">
              {mode === 'digits' ? 'Loading pre-trained MNIST model' : 'Initializing alphanumeric model'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {modelLoadError && (
        <div className="max-w-md mx-auto px-4 mb-8">
          <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-4 text-center">
            <p className="text-destructive font-mono text-sm">{modelLoadError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 items-start justify-items-center">
            {/* Drawing Canvas */}
            <div className="w-full flex justify-center">
              <DrawingCanvas 
                onDrawingChange={handleDrawingChange} 
                onClear={handleClear}
              />
            </div>

            {/* Prediction Display */}
            <div className="w-full flex justify-center">
              <PredictionDisplay 
                predictions={predictions} 
                isLoading={isProcessing}
                isTraining={isTraining}
                trainingProgress={trainingProgress}
                classes={getClasses()}
                onCorrection={handleCorrection}
              />
            </div>

            {/* Neural Network Visualization */}
            <div className="w-full flex justify-center">
              <NeuralNetworkViz 
                isActive={isProcessing} 
                isTraining={isTraining}
                mode={mode}
              />
            </div>

            {/* Model Controls */}
            <div className="w-full flex justify-center">
              <ModelControls
                onReset={resetModel}
                onDownload={handleDownload}
                onImport={handleImport}
                isLoading={isModelLoading}
                mode={mode}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-muted-foreground font-mono text-xs">
          Powered by TensorFlow.js • CNN Architecture • On-device Learning
        </p>
      </footer>
    </div>
  );
};

export default Index;
