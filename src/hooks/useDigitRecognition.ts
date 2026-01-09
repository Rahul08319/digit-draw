import { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export type RecognitionMode = 'digits' | 'alphanumeric';

// 0-9 for digits, A-Z for letters = 36 classes total
const DIGIT_CLASSES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const LETTER_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const getClasses = (mode: RecognitionMode): string[] => {
  return mode === 'digits' ? DIGIT_CLASSES : [...DIGIT_CLASSES, ...LETTER_CLASSES];
};

export const useDigitRecognition = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [mode, setMode] = useState<RecognitionMode>('digits');
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);
  const lastImageDataRef = useRef<ImageData | null>(null);

  // Create the CNN model architecture
  const createModel = useCallback((numClasses: number) => {
    const newModel = tf.sequential();
    
    // First convolutional layer
    newModel.add(tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 3,
      filters: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    newModel.add(tf.layers.batchNormalization());
    newModel.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    
    // Second convolutional layer
    newModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    newModel.add(tf.layers.batchNormalization());
    newModel.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    
    // Third convolutional layer
    newModel.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 128,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));
    newModel.add(tf.layers.batchNormalization());
    
    // Flatten and dense layers
    newModel.add(tf.layers.flatten());
    newModel.add(tf.layers.dropout({ rate: 0.25 }));
    newModel.add(tf.layers.dense({ units: 256, activation: 'relu', kernelInitializer: 'heNormal' }));
    newModel.add(tf.layers.dropout({ rate: 0.5 }));
    newModel.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    newModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return newModel;
  }, []);

  // Load pre-trained weights or initialize model
  const loadModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      setModelLoadError(null);
      
      const numClasses = mode === 'digits' ? 10 : 36;
      
      // Try to load pre-trained model from IndexedDB first
      const modelKey = `indexeddb://digit-recognition-${mode}`;
      
      try {
        const savedModel = await tf.loadLayersModel(modelKey);
        savedModel.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy'],
        });
        
        if (modelRef.current) {
          modelRef.current.dispose();
        }
        modelRef.current = savedModel;
        setModel(savedModel);
        console.log('Loaded model from IndexedDB');
      } catch {
        // No saved model, create a new one
        console.log('No saved model found, creating new model...');
        
        const newModel = createModel(numClasses);
        
        if (modelRef.current) {
          modelRef.current.dispose();
        }
        modelRef.current = newModel;
        setModel(newModel);
        
        // Save the initial model to IndexedDB
        try {
          await newModel.save(modelKey);
          console.log('Initial model saved to IndexedDB');
        } catch (saveError) {
          console.log('Could not save model:', saveError);
        }
      }
      
      setIsModelLoading(false);
    } catch (error) {
      console.error('Error loading model:', error);
      setModelLoadError('Failed to load model. Please refresh the page.');
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

  const preprocessImage = useCallback((imageData: ImageData): tf.Tensor4D => {
    return tf.tidy(() => {
      // Convert ImageData to tensor
      let tensor = tf.browser.fromPixels(imageData, 1);
      
      // Resize to 28x28
      tensor = tf.image.resizeBilinear(tensor as tf.Tensor3D, [28, 28]);
      
      // Normalize to 0-1
      tensor = tensor.div(255.0);
      
      // Add batch dimension
      return tensor.expandDims(0) as tf.Tensor4D;
    });
  }, []);

  const predict = useCallback(async (imageData: ImageData | null) => {
    if (!imageData || !model) {
      setPredictions(null);
      return;
    }

    lastImageDataRef.current = imageData;
    setIsProcessing(true);

    try {
      const tensor = preprocessImage(imageData);
      const prediction = model.predict(tensor) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Clean up tensors
      tensor.dispose();
      prediction.dispose();

      setPredictions(Array.from(probabilities));
    } catch (error) {
      console.error('Prediction error:', error);
      setPredictions(null);
    } finally {
      setIsProcessing(false);
    }
  }, [model, preprocessImage]);

  const trainOnCorrection = useCallback(async (correctLabel: string) => {
    if (!model || !lastImageDataRef.current) {
      console.error('Cannot train: no model or image data');
      return;
    }

    const classes = getClasses(mode);
    const labelIndex = classes.indexOf(correctLabel);
    
    if (labelIndex === -1) {
      console.error('Invalid label:', correctLabel);
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      const imageData = lastImageDataRef.current;
      const tensor = preprocessImage(imageData);
      
      // Create one-hot encoded label
      const labelTensor = tf.oneHot(tf.tensor1d([labelIndex], 'int32'), classes.length);

      // Data augmentation - create variations of the input
      const augmentedInputs: tf.Tensor4D[] = [tensor];
      const augmentedLabels: tf.Tensor2D[] = [labelTensor as tf.Tensor2D];

      // Add slightly shifted/rotated versions
      for (let i = 0; i < 4; i++) {
        const augmented = tf.tidy(() => {
          const shifted = tf.image.cropAndResize(
            tensor,
            [[
              0.05 * (Math.random() - 0.5),
              0.05 * (Math.random() - 0.5),
              1 + 0.05 * (Math.random() - 0.5),
              1 + 0.05 * (Math.random() - 0.5)
            ]],
            [0],
            [28, 28]
          );
          return shifted as tf.Tensor4D;
        });
        augmentedInputs.push(augmented);
        augmentedLabels.push(labelTensor.clone() as tf.Tensor2D);
      }

      const batchedInputs = tf.concat(augmentedInputs, 0);
      const batchedLabels = tf.concat(augmentedLabels, 0);

      // Train on the correction with multiple epochs
      const epochs = 10;
      for (let epoch = 0; epoch < epochs; epoch++) {
        await model.fit(batchedInputs, batchedLabels, {
          epochs: 1,
          batchSize: 5,
          shuffle: true,
          verbose: 0,
        });
        setTrainingProgress(((epoch + 1) / epochs) * 100);
      }

      // Clean up tensors
      tensor.dispose();
      labelTensor.dispose();
      batchedInputs.dispose();
      batchedLabels.dispose();
      augmentedInputs.forEach(t => t.dispose());
      augmentedLabels.forEach(t => t.dispose());

      // Save updated model
      const modelKey = `indexeddb://digit-recognition-${mode}`;
      await model.save(modelKey);
      console.log('Model saved after training');

      // Re-run prediction with updated model
      await predict(lastImageDataRef.current);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  }, [model, mode, preprocessImage, predict]);

  const clearPredictions = useCallback(() => {
    setPredictions(null);
    lastImageDataRef.current = null;
  }, []);

  const switchMode = useCallback((newMode: RecognitionMode) => {
    setMode(newMode);
    setPredictions(null);
    lastImageDataRef.current = null;
  }, []);

  const resetModel = useCallback(async () => {
    const modelKey = `indexeddb://digit-recognition-${mode}`;
    try {
      await tf.io.removeModel(modelKey);
      console.log('Model removed from IndexedDB');
    } catch {
      // Model might not exist
    }
    await loadModel();
  }, [mode, loadModel]);

  return {
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
    getClasses: () => getClasses(mode),
  };
};
