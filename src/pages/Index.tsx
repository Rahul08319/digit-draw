import { useCallback } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import PredictionDisplay from '@/components/PredictionDisplay';
import NeuralNetworkViz from '@/components/NeuralNetworkViz';
import { useDigitRecognition } from '@/hooks/useDigitRecognition';
import { Brain } from 'lucide-react';

const Index = () => {
  const { isModelLoading, predictions, isProcessing, predict, clearPredictions } = useDigitRecognition();

  const handleDrawingChange = useCallback((imageData: ImageData | null) => {
    predict(imageData);
  }, [predict]);

  const handleClear = useCallback(() => {
    clearPredictions();
  }, [clearPredictions]);

  return (
    <div className="min-h-screen neural-bg">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary animate-pulse-glow" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Digit <span className="text-primary text-glow">Recognition</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
            Draw a digit (0-9) and watch a neural network predict it in real-time
          </p>
        </div>
      </header>

      {/* Loading State */}
      {isModelLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary font-mono text-sm">Loading Neural Network...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-items-center">
            {/* Drawing Canvas */}
            <div className="w-full flex justify-center lg:col-span-1">
              <DrawingCanvas 
                onDrawingChange={handleDrawingChange} 
                onClear={handleClear}
              />
            </div>

            {/* Prediction Display */}
            <div className="w-full flex justify-center lg:col-span-1">
              <PredictionDisplay 
                predictions={predictions} 
                isLoading={isProcessing} 
              />
            </div>

            {/* Neural Network Visualization */}
            <div className="w-full flex justify-center md:col-span-2 lg:col-span-1">
              <NeuralNetworkViz isActive={isProcessing} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-muted-foreground font-mono text-xs">
          Powered by TensorFlow.js • CNN Architecture
        </p>
      </footer>
    </div>
  );
};

export default Index;
