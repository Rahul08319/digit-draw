import { useState, useCallback } from 'react';
import AppleGlobalNav from '@/components/AppleGlobalNav';
import DrawingCanvas from '@/components/DrawingCanvas';
import PredictionDisplay from '@/components/PredictionDisplay';
import NeuralNetworkViz from '@/components/NeuralNetworkViz';
import ModelControls from '@/components/ModelControls';
import ModeSelector from '@/components/ModeSelector';
import DigitGameMode from '@/components/DigitGameMode';
import TypeSafeRoutingPanel from '@/components/TypeSafeRoutingPanel';
import ArchitectureView from '@/components/ArchitectureView';
import AppleFooter from '@/components/AppleFooter';
import { useDigitRecognition } from '@/hooks/useDigitRecognition';
import { Brain, Sparkles, Shield, Cpu, Activity, Play } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'game' | 'architecture'>('studio');

  const {
    isModelLoading,
    predictions,
    typeSafeResult,
    preprocessedPreview,
    isProcessing,
    isTraining,
    trainingProgress,
    mode,
    modelLoadError,
    modelSource,
    predictCanvas,
    clearPredictions,
    trainOnCorrection,
    switchMode,
    resetModel,
    downloadModel,
    importModel,
    getClasses,
  } = useDigitRecognition();

  const handleCanvasChange = useCallback((canvas: HTMLCanvasElement | null, strokeCount: number) => {
    predictCanvas(canvas, strokeCount);
  }, [predictCanvas]);

  const handleClear = useCallback(() => {
    clearPredictions();
  }, [clearPredictions]);

  const handleCorrection = useCallback((correctLabel: string) => {
    trainOnCorrection(correctLabel);
  }, [trainOnCorrection]);

  return (
    <div className="min-h-screen bg-apple-surface-parchment dark:bg-black text-apple-ink dark:text-white flex flex-col transition-colors selection:bg-apple-blue selection:text-white">
      {/* 44px Apple Global Navigation */}
      <AppleGlobalNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Loading Modal */}
      {isModelLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div className="p-8 rounded-[24px] bg-white dark:bg-apple-tile-1 border border-black/10 dark:border-white/10 shadow-apple-product text-center max-w-sm mx-4">
            <div className="w-10 h-10 border-3 border-apple-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold tracking-tight text-apple-ink dark:text-white mb-1">
              Initializing Neural Network
            </h3>
            <p className="text-xs text-apple-ink/60 dark:text-white/60 font-mono">
              {mode === 'digits' 
                ? 'Loading pre-trained MNIST CNN (33k params)...' 
                : 'Initializing alphanumeric model...'}
            </p>
          </div>
        </div>
      )}

      {/* Model Error Alert */}
      {modelLoadError && (
        <div className="max-w-md mx-auto my-4 px-4">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-xs font-mono text-red-600 dark:text-red-400">
            {modelLoadError}
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-8">
        {/* Hero Section (Always visible on studio/game) */}
        {activeTab !== 'architecture' && (
          <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-in">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-apple-blue/10 text-apple-blue text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Convolutional Intelligence</span>
            </div>

            {/* Display Headline with Apple tight tracking */}
            <h1 className="text-4xl md:text-6xl font-semibold tracking-apple-hero text-apple-ink dark:text-white mb-3">
              Digit Recognition. <span className="text-apple-blue">Refined.</span>
            </h1>

            {/* Tagline */}
            <p className="text-[17px] leading-relaxed text-apple-ink/70 dark:text-white/70 max-w-xl mx-auto mb-6">
              Draw any numeral and experience instant on-device classification powered by TensorFlow.js, verified with TypeSafe System One routing.
            </p>

            {/* Mode Selector and Quick Mode Switch */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ModeSelector 
                mode={mode} 
                onModeChange={switchMode} 
                disabled={isModelLoading || isTraining} 
              />

              <div className="h-5 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/5 dark:bg-white/5 text-xs text-apple-ink/70 dark:text-white/70 font-mono px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Source: {modelSource === 'bundled_cnn' ? 'Bundled Pre-Trained CNN' : 'IndexedDB Fine-Tuned'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Studio View */}
        {activeTab === 'studio' && (
          <div className="space-y-8 animate-fade-in">
            {/* Primary Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start justify-items-center">
              
              {/* Card 1: Drawing Canvas */}
              <div className="w-full flex justify-center">
                <DrawingCanvas 
                  onCanvasChange={handleCanvasChange}
                  onClear={handleClear}
                  previewUrl={preprocessedPreview}
                />
              </div>

              {/* Card 2: Real-Time Prediction Display */}
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

              {/* Card 3: Neural Network Topology Visualizer */}
              <div className="w-full flex justify-center">
                <NeuralNetworkViz 
                  isActive={isProcessing || (predictions !== null)}
                  isTraining={isTraining}
                  mode={mode}
                />
              </div>

              {/* Card 4: Model Management Controls */}
              <div className="w-full flex justify-center">
                <ModelControls 
                  onReset={resetModel}
                  onDownload={downloadModel}
                  onImport={importModel}
                  isLoading={isModelLoading}
                  mode={mode}
                />
              </div>
            </div>

            {/* TypeSafe System One Routing & Judgment Inspector */}
            <div className="w-full max-w-4xl mx-auto pt-4">
              <TypeSafeRoutingPanel evaluation={typeSafeResult} />
            </div>

            {/* Feature Highlight Cards (Apple Museum Style) */}
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.06] dark:border-white/[0.08] shadow-apple-card">
                <div className="w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center mb-3">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-base font-semibold text-apple-ink dark:text-white mb-1.5">
                  Real-Time 60Hz Inference
                </h4>
                <p className="text-xs text-apple-ink/70 dark:text-white/70 leading-relaxed">
                  Strokes are normalized using MNIST aspect-ratio scaling and center-of-mass alignment while the pen is in motion.
                </p>
              </div>

              <div className="p-6 rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.06] dark:border-white/[0.08] shadow-apple-card">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-base font-semibold text-apple-ink dark:text-white mb-1.5">
                  TypeSafe System One Routing
                </h4>
                <p className="text-xs text-apple-ink/70 dark:text-white/70 leading-relaxed">
                  Evaluates drawing intent (Choice), digit validity (Noul), and stroke clarity (Score) to route ambiguous edge-cases.
                </p>
              </div>

              <div className="p-6 rounded-[22px] bg-apple-canvas dark:bg-apple-tile-1 border border-black/[0.06] dark:border-white/[0.08] shadow-apple-card">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-base font-semibold text-apple-ink dark:text-white mb-1.5">
                  Private On-Device Learning
                </h4>
                <p className="text-xs text-apple-ink/70 dark:text-white/70 leading-relaxed">
                  Fine-tunes CNN convolutional filters directly in browser IndexedDB with data augmentation and zero cloud transmission.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Digit Sprint Game */}
        {activeTab === 'game' && (
          <div className="w-full py-4 animate-fade-in">
            <DigitGameMode 
              onCanvasChange={handleCanvasChange}
              predictions={predictions}
              classes={getClasses()}
              previewUrl={preprocessedPreview}
            />
          </div>
        )}

        {/* Tab 3: System Architecture & TypeSafe AI Specification */}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Museum-Grade Apple Footer */}
      <AppleFooter />
    </div>
  );
};

export default Index;
