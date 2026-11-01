export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface PedestrianDetail {
  id: string;
  location_description?: string;
  intent: string;
  intent_confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | string;
  action_cues?: string[];
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface DistractorDetail {
  name: string;
  category: 'physical_object' | 'advertising_billboard' | 'bright_clothing' | 'glare_reflection' | 'visual_noise' | 'other' | string;
  interference_level: 'none' | 'low' | 'medium' | 'high' | string;
  mechanism?: string;
  box_2d?: [number, number, number, number];
}

export interface SceneAnalysis {
  pedestrians_detected: number;
  pedestrians?: PedestrianDetail[];
  intent_predictions: string[];
  distractors_identified: DistractorDetail[];
  distractor_names: string[];
  scene_summary: string;
  robustness_risk_warning?: string;
  recommended_vehicle_action: string;
  overall_confidence: number;
}

export interface SceneState {
  imageUrl: string | null;
  imageBase64: string | null;
  status: 'idle' | 'capturing' | 'analyzing' | 'completed' | 'error';
  analysis: SceneAnalysis | null;
  error: string | null;
  timestamp: string | null;
  source: 'webcam' | 'preset' | 'upload';
  sourceTitle?: string;
}

export interface ComparisonMetrics {
  isRobust: boolean;
  intentShiftDetected: boolean;
  pedestrianDelta: number;
  distractionSeverity: 'Robust (No Shift)' | 'Minor Ambiguity' | 'High Degradation' | 'Critical Failure';
  failureCategory: string | null;
  robustnessScore: number; // 0 to 100
  confidenceDelta: number;
  detailedDivergence: string[];
  actionChanged: boolean;
}

export interface LiveIncident {
  id: string;
  timestamp: string;
  type: 'intent_shift' | 'distractor_detected' | 'critical_safety' | 'normal';
  title: string;
  detail: string;
  distractor?: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  researchHypothesis: string;
  cleanPromptCue: string;
  distractedPromptCue: string;
  cleanSvg: string;
  distractedSvg: string;
}

export interface LiveStreamEvent {
  id: string;
  timestamp: string;
  type: 'pedestrian' | 'distractor' | 'intent_shift' | 'policy_alert' | 'info';
  message: string;
  severity?: 'normal' | 'warning' | 'critical';
}

