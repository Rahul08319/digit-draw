/**
 * MNIST Preprocessing Utility
 * Standard algorithm: Bounding box extraction, aspect-ratio scaling to 20x20,
 * and Center-of-Mass translation onto a 28x28 normalized tensor.
 */

export interface PreprocessingResult {
  normalizedArray: Float32Array; // 784 elements (28x28)
  previewDataUrl: string; // Base64 data URL of the 28x28 preprocessed image
  centerOfMass: { x: number; y: number };
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number } | null;
  hasContent: boolean;
}

/**
 * Preprocesses a raw canvas or ImageData into a standard 28x28 MNIST input.
 */
export function preprocessCanvas(sourceCanvas: HTMLCanvasElement): PreprocessingResult {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d');

  if (!ctx) {
    return {
      normalizedArray: new Float32Array(784),
      previewDataUrl: '',
      centerOfMass: { x: 14, y: 14 },
      boundingBox: null,
      hasContent: false,
    };
  }

  const rawData = ctx.getImageData(0, 0, width, height).data;

  // Step 1: Scan for bounding box of drawn pixels (white strokes on dark canvas)
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let totalIntensity = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Average RGB channels for luminance
      const lum = (rawData[idx] + rawData[idx + 1] + rawData[idx + 2]) / 3;

      if (lum > 25) { // threshold for stroke detection
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        totalIntensity += lum;
        weightedX += x * lum;
        weightedY += y * lum;
      }
    }
  }

  // If no content drawn
  if (maxX === -1 || maxY === -1 || totalIntensity === 0) {
    const empty28 = document.createElement('canvas');
    empty28.width = 28;
    empty28.height = 28;
    const eCtx = empty28.getContext('2d');
    if (eCtx) {
      eCtx.fillStyle = '#000000';
      eCtx.fillRect(0, 0, 28, 28);
    }
    return {
      normalizedArray: new Float32Array(784),
      previewDataUrl: empty28.toDataURL(),
      centerOfMass: { x: 14, y: 14 },
      boundingBox: null,
      hasContent: false,
    };
  }

  // Step 2: Crop bounding box with padding
  const boxW = Math.max(1, maxX - minX + 1);
  const boxH = Math.max(1, maxY - minY + 1);

  // Scaled dimensions preserving aspect ratio to fit inside 20x20
  let targetW = 20;
  let targetH = 20;
  if (boxW > boxH) {
    targetW = 20;
    targetH = Math.max(1, Math.round((boxH / boxW) * 20));
  } else {
    targetH = 20;
    targetW = Math.max(1, Math.round((boxW / boxH) * 20));
  }

  // Draw scaled digit on intermediate canvas
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = targetW;
  scaledCanvas.height = targetH;
  const sCtx = scaledCanvas.getContext('2d');
  if (sCtx) {
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = 'high';
    sCtx.drawImage(sourceCanvas, minX, minY, boxW, boxH, 0, 0, targetW, targetH);
  }

  // Step 3: Draw onto 28x28 canvas centered by center-of-mass
  const destCanvas = document.createElement('canvas');
  destCanvas.width = 28;
  destCanvas.height = 28;
  const dCtx = destCanvas.getContext('2d');
  if (!dCtx) {
    return {
      normalizedArray: new Float32Array(784),
      previewDataUrl: '',
      centerOfMass: { x: 14, y: 14 },
      boundingBox: { minX, minY, maxX, maxY },
      hasContent: true,
    };
  }

  dCtx.fillStyle = '#000000';
  dCtx.fillRect(0, 0, 28, 28);

  // Initial center placement
  const offsetX = Math.round((28 - targetW) / 2);
  const offsetY = Math.round((28 - targetH) / 2);
  dCtx.drawImage(scaledCanvas, offsetX, offsetY);

  // Step 4: Compute center of mass on the 28x28 canvas and shift to (14, 14)
  const dData = dCtx.getImageData(0, 0, 28, 28);
  let dTotal = 0;
  let dWeightedX = 0;
  let dWeightedY = 0;

  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const idx = (y * 28 + x) * 4;
      const lum = (dData.data[idx] + dData.data[idx + 1] + dData.data[idx + 2]) / 3;
      dTotal += lum;
      dWeightedX += x * lum;
      dWeightedY += y * lum;
    }
  }

  let cx = 14;
  let cy = 14;
  if (dTotal > 0) {
    cx = dWeightedX / dTotal;
    cy = dWeightedY / dTotal;

    const shiftX = Math.round(14 - cx);
    const shiftY = Math.round(14 - cy);

    if (Math.abs(shiftX) > 0 || Math.abs(shiftY) > 0) {
      // Re-center on clean canvas
      const shiftedCanvas = document.createElement('canvas');
      shiftedCanvas.width = 28;
      shiftedCanvas.height = 28;
      const shCtx = shiftedCanvas.getContext('2d');
      if (shCtx) {
        shCtx.fillStyle = '#000000';
        shCtx.fillRect(0, 0, 28, 28);
        shCtx.drawImage(destCanvas, shiftX, shiftY);
        dCtx.drawImage(shiftedCanvas, 0, 0);
      }
    }
  }

  // Step 5: Extract final 784 float array (normalized 0.0 - 1.0)
  const finalData = dCtx.getImageData(0, 0, 28, 28).data;
  const normalizedArray = new Float32Array(784);
  for (let i = 0; i < 784; i++) {
    const r = finalData[i * 4];
    const g = finalData[i * 4 + 1];
    const b = finalData[i * 4 + 2];
    normalizedArray[i] = ((r + g + b) / 3) / 255.0;
  }

  return {
    normalizedArray,
    previewDataUrl: destCanvas.toDataURL(),
    centerOfMass: { x: cx, y: cy },
    boundingBox: { minX, minY, maxX, maxY },
    hasContent: true,
  };
}
