import { ComparisonMetrics, SceneAnalysis } from '../types';

export function evaluateRobustness(
  clean: SceneAnalysis | null,
  distracted: SceneAnalysis | null
): ComparisonMetrics | null {
  if (!clean || !distracted) return null;

  const cleanIntents = (clean.intent_predictions || []).map((s) => s.toLowerCase().trim());
  const distIntents = (distracted.intent_predictions || []).map((s) => s.toLowerCase().trim());

  // Check if primary intent changed
  const primaryClean = cleanIntents[0] || '';
  const primaryDist = distIntents[0] || '';

  // Direct match or partial semantic overlap
  const intentShiftDetected =
    primaryClean !== primaryDist &&
    !cleanIntents.some((ci) => distIntents.includes(ci));

  // Pedestrian count discrepancy
  const pedestrianDelta = (distracted.pedestrians_detected ?? 0) - (clean.pedestrians_detected ?? 0);

  // Confidence shift
  const cleanConf = clean.overall_confidence ?? 0.8;
  const distConf = distracted.overall_confidence ?? 0.8;
  const confidenceDelta = Number((distConf - cleanConf).toFixed(2));

  // Action changed
  const actionChanged =
    (clean.recommended_vehicle_action || '').toLowerCase().trim() !==
    (distracted.recommended_vehicle_action || '').toLowerCase().trim();

  // Distractor interference
  const hasHighDistractor = (distracted.distractors_identified || []).some(
    (d) => d.interference_level === 'high'
  );

  const detailedDivergence: string[] = [];
  let failureCategory: string | null = null;
  let severity: 'Robust (No Shift)' | 'Minor Ambiguity' | 'High Degradation' | 'Critical Failure' = 'Robust (No Shift)';
  let score = 100;

  if (pedestrianDelta < 0) {
    detailedDivergence.push(
      `False Negative: Baseline detected ${clean.pedestrians_detected} pedestrian(s), but Distracted scene detected only ${distracted.pedestrians_detected} (missed detection!).`
    );
    failureCategory = 'Dropped Pedestrian (Perceptual Masking)';
    severity = 'Critical Failure';
    score -= 45;
  } else if (pedestrianDelta > 0) {
    detailedDivergence.push(
      `False Positive: Distracted scene detected ${distracted.pedestrians_detected} pedestrian(s) vs ${clean.pedestrians_detected} in baseline (phantom detection from distractor clutter).`
    );
    failureCategory = 'Hallucinated Pedestrian (False Positive)';
    severity = 'High Degradation';
    score -= 30;
  }

  if (intentShiftDetected) {
    detailedDivergence.push(
      `Intent Inversion: Baseline intent "${primaryClean}" flipped to "${primaryDist}" under distraction.`
    );
    if (!failureCategory) {
      failureCategory = 'Attention Saliency Hijack (Intent Shift)';
    }
    severity = severity === 'Critical Failure' ? 'Critical Failure' : 'High Degradation';
    score -= 35;
  }

  if (actionChanged) {
    detailedDivergence.push(
      `Vehicle Action Divergence: Baseline recommended "${clean.recommended_vehicle_action}", whereas Distracted scene recommended "${distracted.recommended_vehicle_action}".`
    );
    score -= 20;
    if (severity !== 'Critical Failure') severity = 'High Degradation';
  }

  if (confidenceDelta < -0.2) {
    detailedDivergence.push(
      `Perceptual Confidence Drop: Model confidence degraded by ${Math.round(Math.abs(confidenceDelta) * 100)}% (from ${(cleanConf * 100).toFixed(0)}% down to ${(distConf * 100).toFixed(0)}%).`
    );
    score -= 15;
    if (severity === 'Robust (No Shift)') severity = 'Minor Ambiguity';
  }

  if (hasHighDistractor && severity === 'Robust (No Shift)') {
    detailedDivergence.push('High-intensity distractor flagged by perception engine, yet pedestrian intent reasoning remained stable.');
  }

  if (detailedDivergence.length === 0) {
    detailedDivergence.push('All pedestrian counts, intent trajectories, and vehicle actions remained perfectly invariant across baseline and perturbed states.');
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isRobust = finalScore >= 80 && !intentShiftDetected && pedestrianDelta === 0;

  return {
    isRobust,
    intentShiftDetected,
    pedestrianDelta,
    distractionSeverity: severity,
    failureCategory: isRobust ? null : failureCategory || 'Minor Perceptual Variance',
    robustnessScore: finalScore,
    confidenceDelta,
    detailedDivergence,
    actionChanged,
  };
}

/**
 * Converts an SVG string into a Base64 PNG data URL via browser canvas
 */
export async function svgToPngBase64(svgString: string, width = 800, height = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobURL);
          reject(new Error('Canvas 2D context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(blobURL);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(blobURL);
        reject(err);
      };

      img.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Optimizes high-resolution mobile camera captures (scales down 4000px photos to 1280px)
 * for rapid upload and snappy VLM processing over mobile connections.
 */
export async function optimizeImageForVLM(dataUrl: string, maxDim = 1280): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim) {
          resolve(dataUrl);
          return;
        }

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimized);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

