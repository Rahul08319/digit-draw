import { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { preprocessCanvas, PreprocessingResult } from '@/lib/mnistPreprocessing';
import { 
  DrawingMetrics, 
  TypeSafeEvaluationResult, 
  computeEntropy, 
  evaluateAndRouteWithSystemOne 
} from '@/lib/typesafeRouting';

export type RecognitionMode = 'digits' | 'alphanumeric';

const DIGIT_CLASSES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const LETTER_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const getClasses = (mode: RecognitionMode): string[] => {
  return mode === 'digits' ? DIGIT_CLASSES : [...DIGIT_CLASSES, ...LETTER_CLASSES];
};

export const useDigitRecognition = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [typeSafeResult, setTypeSafeResult] = useState<TypeSafeEvaluationResult | null>(null);
  const [preprocessedPreview, setPreprocessedPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [mode, setMode] = useState<RecognitionMode>('digits');
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [modelSource, setModelSource] = useState<'bundled_cnn' | 'indexeddb' | 'fresh_initialized'>('bundled_cnn');
  
  const modelRef = useRef<tf.LayersModel | null>(null);
  const lastNormalizedTensorRef = useRef<Float32Array | null>(null);
  const isPredictingRef = useRef<boolean>(false);

  // Fallback: Create CNN architecture
  const createModel = useCallback((numClasses: number) => {
    const newModel = tf.sequential();
    
    // First convolutional layer
    newModel.add(tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 3,
      filters: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    newModel.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    
    // Second convolutional layer
    newModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    newModel.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    
    // Third convolutional layer
    newModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    
    // Flatten and dense
    newModel.add(tf.layers.flatten());
    newModel.add(tf.layers.dense({ units: 64, activation: 'relu', kernelInitializer: 'heNormal' }));
    newModel.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    newModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return newModel;
  }, []);

  // Load pre-trained model: bundled CNN -> IndexedDB -> fresh architecture
  const loadModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      setModelLoadError(null);

      const modelKey = `indexeddb://digit-recognition-${mode}`;

      // Check IndexedDB for user fine-tuned weights first
      try {
        const savedModel = await tf.loadLayersModel(modelKey);
        savedModel.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy'],
        });
        
        if (modelRef.current) modelRef.current.dispose();
        modelRef.current = savedModel;
        setModel(savedModel);
        setModelSource('indexeddb');
        setIsModelLoading(false);
        return;
      } catch {
        // No IndexedDB model found, try bundled model
      }

      // Try loading pre-trained bundled model from public/model/model.json
      if (mode === 'digits') {
        try {
          const bundledModel = await tf.loadLayersModel('/model/model.json');
          bundledModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
          });
          
          if (modelRef.current) modelRef.current.dispose();
          modelRef.current = bundledModel;
          setModel(bundledModel);
          setModelSource('bundled_cnn');
          setIsModelLoading(false);
          return;
        } catch (bundledErr) {
          console.warn('Could not load bundled model from /model/model.json:', bundledErr);
        }
      }

      // Fallback: Initialize fresh model
      const numClasses = mode === 'digits' ? 10 : 36;
      const newModel = createModel(numClasses);
      if (modelRef.current) modelRef.current.dispose();
      modelRef.current = newModel;
      setModel(newModel);
      setModelSource('fresh_initialized');
      setIsModelLoading(false);
    } catch (error) {
      console.error('Error loading model:', error);
      setModelLoadError('Failed to load neural network. Please reload.');
      setIsModelLoading(false);
    }
  }, [mode, createModel]);

  useEffect(() => {
    loadModel();
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, [loadModel]);

  /**
   * High-accuracy Real-Time Canvas Prediction Pipeline
   */
  const predictCanvas = useCallback(async (
    canvas: HTMLCanvasElement | null, 
    strokeCount: number = 1
  ) => {
    if (!canvas || !modelRef.current) {
      setPredictions(null);
      setTypeSafeResult(null);
      setPreprocessedPreview('');
      return;
    }

    if (isPredictingRef.current) return;
    isPredictingRef.current = true;

    try {
      // Step 1: Preprocess canvas with MNIST standard bounding box & center of mass
      const prepResult: PreprocessingResult = preprocessCanvas(canvas);
      setPreprocessedPreview(prepResult.previewDataUrl);

      if (!prepResult.hasContent) {
        setPredictions(null);
        setTypeSafeResult(null);
        isPredictingRef.current = false;
        return;
      }

      lastNormalizedTensorRef.current = prepResult.normalizedArray;

      // Step 2: Feed 28x28 into model
      const currentModel = modelRef.current;
      const inputTensor = tf.tensor4d(prepResult.normalizedArray, [1, 28, 28, 1]);
      const prediction = currentModel.predict(inputTensor) as tf.Tensor;
      const probabilitiesTyped = await prediction.data();
      const probsArray = Array.from(probabilitiesTyped);

      inputTensor.dispose();
      prediction.dispose();

      setPredictions(probsArray);

      // Step 3: Compute TypeSafe System One Metrics & Route
      const sorted = probsArray
        .map((p, idx) => ({ prob: p, idx }))
        .sort((a, b) => b.prob - a.prob);

      const top1 = sorted[0];
      const top2 = sorted[1] || { prob: 0, idx: 0 };
      const margin = top1.prob - top2.prob;
      const entropy = computeEntropy(probsArray);

      const nonZeroPixels = prepResult.normalizedArray.filter(v => v > 0.05).length;
      const pixelCoverage = nonZeroPixels / 784;

      const boxW = prepResult.boundingBox ? prepResult.boundingBox.maxX - prepResult.boundingBox.minX : 20;
      const boxH = prepResult.boundingBox ? prepResult.boundingBox.maxY - prepResult.boundingBox.minY : 20;
      const aspectRatio = boxW / Math.max(1, boxH);

      const comDist = Math.hypot(prepResult.centerOfMass.x - 14, prepResult.centerOfMass.y - 14);

      const drawingMetrics: DrawingMetrics = {
        strokeCount,
        pixelCoverage,
        aspectRatio,
        density: pixelCoverage,
        centerOfMassOffset: comDist,
        fastPrediction: top1.idx,
        fastConfidence: top1.prob,
        secondaryPrediction: top2.idx,
        secondaryConfidence: top2.prob,
        margin,
        entropy,
      };

      const classes = getClasses(mode);
      const evalResult = evaluateAndRouteWithSystemOne(drawingMetrics, classes);
      setTypeSafeResult(evalResult);

    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      isPredictingRef.current = false;
    }
  }, [mode]);

  // Backward compatible predict method
  const predict = useCallback(async (imageData: ImageData | null) => {
    if (!imageData) {
      setPredictions(null);
      setTypeSafeResult(null);
      setPreprocessedPreview('');
      return;
    }
    // Create temporary canvas
    const temp = document.createElement('canvas');
    temp.width = imageData.width;
    temp.height = imageData.height;
    const ctx = temp.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      predictCanvas(temp, 1);
    }
  }, [predictCanvas]);

  const clearPredictions = useCallback(() => {
    setPredictions(null);
    setTypeSafeResult(null);
    setPreprocessedPreview('');
    lastNormalizedTensorRef.current = null;
  }, []);

  const trainOnCorrection = useCallback(async (correctLabel: string) => {
    if (!modelRef.current || !lastNormalizedTensorRef.current) {
      console.error('Cannot train: no model or image data');
      return;
    }

    const classes = getClasses(mode);
    const labelIndex = classes.indexOf(correctLabel);
    if (labelIndex === -1) return;

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      const currentModel = modelRef.current;
      const normalizedArray = lastNormalizedTensorRef.current;
      const tensor = tf.tensor4d(normalizedArray, [1, 28, 28, 1]);
      const labelTensor = tf.oneHot(tf.tensor1d([labelIndex], 'int32'), classes.length);

      // Data augmentation
      const augmentedInputs: tf.Tensor4D[] = [tensor];
      const augmentedLabels: tf.Tensor2D[] = [labelTensor as tf.Tensor2D];

      for (let i = 0; i < 4; i++) {
        const augmented = tf.tidy(() => {
          const shifted = tf.image.cropAndResize(
            tensor,
            [[
              0.06 * (Math.random() - 0.5),
              0.06 * (Math.random() - 0.5),
              1 + 0.06 * (Math.random() - 0.5),
              1 + 0.06 * (Math.random() - 0.5)
            ]],
            [0],
            [28, 28]
          );
          return shifted as tf.Tensor4D;
        });
        augmentedInputs.push(augmented);
        augmentedLabels.push(labelTensor.clone() as tf.Tensor2D);
      }

      const xs = tf.concat(augmentedInputs) as tf.Tensor4D;
      const ys = tf.concat(augmentedLabels) as tf.Tensor2D;

      const epochs = 12;
      for (let epoch = 0; epoch < epochs; epoch++) {
        await currentModel.fit(xs, ys, {
          epochs: 1,
          batchSize: 5,
          shuffle: true,
          verbose: 0,
        });
        setTrainingProgress(((epoch + 1) / epochs) * 100);
      }

      // Save updated model to IndexedDB
      const modelKey = `indexeddb://digit-recognition-${mode}`;
      await currentModel.save(modelKey);
      setModelSource('indexeddb');

      // Cleanup
      xs.dispose();
      ys.dispose();
      tensor.dispose();
      labelTensor.dispose();
      augmentedInputs.forEach(t => t.dispose());
      augmentedLabels.forEach(t => t.dispose());

      // Re-run inference with updated model
      const tempTensor = tf.tensor4d(normalizedArray, [1, 28, 28, 1]);
      const newPred = currentModel.predict(tempTensor) as tf.Tensor;
      const newProb = await newPred.data();
      setPredictions(Array.from(newProb));
      tempTensor.dispose();
      newPred.dispose();

    } catch (err) {
      console.error('Fine-tuning error:', err);
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  }, [mode]);

  const switchMode = useCallback((newMode: RecognitionMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      setPredictions(null);
      setTypeSafeResult(null);
    }
  }, [mode]);

  const resetModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      const modelKey = `indexeddb://digit-recognition-${mode}`;
      try {
        await tf.io.removeModel(modelKey);
      } catch {
        // ok if not present
      }
      await loadModel();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsModelLoading(false);
    }
  }, [mode, loadModel]);

  const downloadModel = useCallback(async () => {
    if (!modelRef.current) return;
    try {
      await modelRef.current.save(`downloads://digit-draw-${mode}-model`);
    } catch (err) {
      console.error('Download error:', err);
    }
  }, [mode]);

  const importModel = useCallback(async (files: FileList): Promise<boolean> => {
    try {
      setIsModelLoading(true);
      const jsonFile = Array.from(files).find(f => f.name.endsWith('.json'));
      const binFiles = Array.from(files).filter(f => f.name.endsWith('.bin'));

      if (!jsonFile || binFiles.length === 0) {
        throw new Error('Please select both a model.json and .bin weight file(s)');
      }

      const importedModel = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, ...binFiles]));
      importedModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      if (modelRef.current) modelRef.current.dispose();
      modelRef.current = importedModel;
      setModel(importedModel);

      // Save to IndexedDB
      const modelKey = `indexeddb://digit-recognition-${mode}`;
      await importedModel.save(modelKey);
      setModelSource('indexeddb');

      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    } finally {
      setIsModelLoading(false);
    }
  }, [mode]);

  return {
    model,
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
    predict,
    predictCanvas,
    clearPredictions,
    trainOnCorrection,
    switchMode,
    resetModel,
    downloadModel,
    importModel,
    getClasses: () => getClasses(mode),
  };
};
