import React from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Activity,
  Maximize2,
  Eye,
  Filter,
} from 'lucide-react';
import { MultiFrameworkState } from '../services/ensemblePerception';

interface EnsembleAccuracyPanelProps {
  config: MultiFrameworkState;
  onChangeConfig: (newConfig: MultiFrameworkState) => void;
  consensusMetrics?: {
    totalEnsembleDetections: number;
    frameworkConsensusRate: number;
    distractorsSuppressedCount: number;
    precisionBoost: number;
  };
  isTfRunning?: boolean;
  tfLatencyMs?: number | null;
}

export const EnsembleAccuracyPanel: React.FC<EnsembleAccuracyPanelProps> = ({
  config,
  onChangeConfig,
  consensusMetrics,
  isTfRunning = false,
  tfLatencyMs = null,
}) => {
  const toggleProp = (key: keyof MultiFrameworkState) => {
    onChangeConfig({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/60">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
                DEEP LEARNING MULTI-FRAMEWORK ACCURACY ENSEMBLE
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              TensorFlow.js Edge Detector + PyTorch Kinematic Priors + Gemini Multimodal Vision Consensus
            </p>
          </div>
        </div>

        {/* Live Performance Stats */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">mAP@0.5:</span>
            <span className="text-emerald-400 font-bold">{config.mAPScore}%</span>
            <span className="text-[10px] text-cyan-400">(+{config.ensembleAccuracyBoost}%)</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">Rejection:</span>
            <span className="text-cyan-400 font-bold">{config.distractorRejectionRate}%</span>
          </div>
          {tfLatencyMs !== null && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">TF Edge:</span>
              <span className="text-amber-400 font-bold">{tfLatencyMs}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Framework Pipeline Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Node 1: TensorFlow.js */}
        <div
          onClick={() => toggleProp('isTfActive')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.isTfActive
              ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-950/20'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isTfActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              TensorFlow.js (COCO-SSD)
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                config.isTfActive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {config.isTfActive ? 'ON-DEVICE' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Client-side neural bounding box detector. Provides instantaneous real-time spatial proposals for road agents.
          </p>
        </div>

        {/* Node 2: PyTorch Spatial Prior */}
        <div
          onClick={() => toggleProp('isPyTorchPriorActive')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.isPyTorchPriorActive
              ? 'bg-slate-900/90 border-violet-500/50 shadow-md shadow-violet-950/20'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isPyTorchPriorActive ? 'bg-violet-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              PyTorch Kinematic Prior
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                config.isPyTorchPriorActive ? 'bg-violet-950 text-violet-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {config.isPyTorchPriorActive ? 'PRIOR ACTIVE' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Pedestrian aspect-ratio, gaze vector & roadway curb proximity heuristics. Suppresses flat commercial ads.
          </p>
        </div>

        {/* Node 3: Gemini Multimodal Reasoner */}
        <div
          onClick={() => toggleProp('isGeminiActive')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.isGeminiActive
              ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/20'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isGeminiActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              Gemini Vision Reasoner
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                config.isGeminiActive ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {config.isGeminiActive ? 'VLM REASON' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            High-level semantic context, behavioral intent classification, and multi-hop distractor causality analysis.
          </p>
        </div>

        {/* Node 4: Kalman Temporal Filter */}
        <div
          onClick={() => toggleProp('isKalmanFilterActive')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            config.isKalmanFilterActive
              ? 'bg-slate-900/90 border-blue-500/50 shadow-md shadow-blue-950/20'
              : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isKalmanFilterActive ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              Kalman / Tracklet Filter
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                config.isKalmanFilterActive ? 'bg-blue-950 text-blue-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {config.isKalmanFilterActive ? 'SMOOTHING' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Maintains continuous agent tracklets across video frames to prevent bounding box jitter and frame-drop dropouts.
          </p>
        </div>
      </div>

      {/* Threshold Sliders & Fine Tuning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Neural Confidence Gate:
            </span>
            <span className="text-cyan-300 font-bold">
              {(config.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.85"
            step="0.05"
            value={config.confidenceThreshold}
            onChange={(e) =>
              onChangeConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>High Recall (10%)</span>
            <span>Balanced (45%)</span>
            <span>High Precision (85%)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              Spatial IoU Consensus Overlap:
            </span>
            <span className="text-indigo-300 font-bold">
              {(config.iouThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.75"
            step="0.05"
            value={config.iouThreshold}
            onChange={(e) =>
              onChangeConfig({ ...config, iouThreshold: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Loose (15%)</span>
            <span>Standard (35%)</span>
            <span>Strict (75%)</span>
          </div>
        </div>
      </div>

      {/* Consensus Breakdown Bar */}
      {consensusMetrics && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs font-mono text-cyan-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Ensemble Agreement: <strong>{consensusMetrics.frameworkConsensusRate}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              Distractors Suppressed by Priors: <strong>{consensusMetrics.distractorsSuppressedCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>
              Overall mAP Gain: <strong>+{consensusMetrics.precisionBoost}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
