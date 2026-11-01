import React, { useRef, useState } from 'react';
import {
  User,
  AlertOctagon,
  Eye,
  CheckCircle,
  HelpCircle,
  Code,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Smartphone,
  Camera,
} from 'lucide-react';
import { SceneAnalysis, SceneState } from '../types';

interface SceneViewerProps {
  title: string;
  subtitle: string;
  type: 'clean' | 'distracted';
  state: SceneState;
  onOpenCapture: () => void;
  onRunAnalysis: () => void;
  onDirectCapture?: (dataUrl: string) => void;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  title,
  subtitle,
  type,
  state,
  onOpenCapture,
  onRunAnalysis,
  onDirectCapture,
}) => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const phoneCameraInputRef = useRef<HTMLInputElement>(null);

  const isClean = type === 'clean';
  const hasImage = Boolean(state.imageUrl);
  const isAnalyzing = state.status === 'analyzing';
  const isCompleted = state.status === 'completed' && state.analysis;

  const handlePhoneCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onDirectCapture) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onDirectCapture(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${
        isClean
          ? 'bg-slate-900/90 border-slate-800 shadow-lg'
          : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}
    >
      {/* Hidden input for 1-tap phone camera capture */}
      <input
        ref={phoneCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhoneCameraFile}
        className="hidden"
      />

      {/* Card Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isClean ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-amber-400 ring-4 ring-amber-500/20'
            }`}
          />
          <div>
            <h3 className="text-sm font-semibold text-white font-mono tracking-tight flex items-center gap-2">
              {title}
              {state.sourceTitle && (
                <span className="text-[10px] font-normal text-slate-400 font-sans px-2 py-0.5 rounded bg-slate-800 border border-slate-700 max-w-[140px] sm:max-w-none truncate">
                  {state.sourceTitle}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {hasImage && isCompleted && (
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                showBoundingBoxes
                  ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Autonomous Bounding Box Perception Layer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HUD Boxes</span>
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => setShowJsonModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs transition-colors"
              title="Inspect Raw VLM JSON Telemetry"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Phone Camera Shutter */}
          <button
            onClick={() => phoneCameraInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700/60 text-blue-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Snap instantly with phone camera"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Phone Cam</span>
          </button>

          <button
            onClick={onOpenCapture}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {hasImage ? 'Change Image' : 'Capture Image'}
          </button>
        </div>
      </div>

      {/* Viewport / Frame */}
      <div className="relative aspect-video bg-black/90 flex items-center justify-center overflow-hidden border-b border-slate-800">
        {hasImage ? (
          <div className="relative w-full h-full group">
            <img
              src={state.imageUrl!}
              alt={title}
              className="w-full h-full object-contain"
            />

            {/* Perception Bounding Box Overlays */}
            {showBoundingBoxes && isCompleted && state.analysis && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Pedestrian Boxes */}
                {(state.analysis.pedestrians || []).map((ped, idx) => {
                  if (!ped.box_2d || ped.box_2d.length !== 4) return null;
                  const [ymin, xmin, ymax, xmax] = ped.box_2d;
                  const top = `${(ymin / 1000) * 100}%`;
                  const left = `${(xmin / 1000) * 100}%`;
                  const height = `${((ymax - ymin) / 1000) * 100}%`;
                  const width = `${((xmax - xmin) / 1000) * 100}%`;

                  const isCritical = ped.risk_level === 'critical' || ped.risk_level === 'high';

                  return (
                    <div
                      key={`ped-${idx}`}
                      style={{ top, left, width, height }}
                      className={`absolute border-2 transition-all ${
                        isCritical
                          ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                          : 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      }`}
                    >
                      <div
                        className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap shadow-md ${
                          isCritical ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white'
                        }`}
                      >
                        PED: {ped.intent} ({Math.round((ped.intent_confidence || 0.85) * 100)}%)
                      </div>
                    </div>
                  );
                })}

                {/* Distractor Boxes */}
                {(state.analysis.distractors_identified || []).map((dist, idx) => {
                  if (!dist.box_2d || dist.box_2d.length !== 4) return null;
                  const [ymin, xmin, ymax, xmax] = dist.box_2d;
                  const top = `${(ymin / 1000) * 100}%`;
                  const left = `${(xmin / 1000) * 100}%`;
                  const height = `${((ymax - ymin) / 1000) * 100}%`;
                  const width = `${((xmax - xmin) / 1000) * 100}%`;

                  return (
                    <div
                      key={`dist-${idx}`}
                      style={{ top, left, width, height }}
                      className="absolute border-2 border-dashed border-fuchsia-400 bg-fuchsia-400/10 shadow-[0_0_10px_rgba(232,121,249,0.3)]"
                    >
                      <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-fuchsia-700 text-white whitespace-nowrap shadow-md">
                        DISTRACTOR: {dist.name} [{dist.interference_level}]
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scanline HUD indicator */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none flex flex-col justify-between p-4">
                <div className="radar-sweep" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800 animate-pulse">
                    VLM PERCEPTION INFERENCE RUNNING...
                  </span>
                  <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center space-y-3">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border ${
                isClean
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-400'
              }`}
            >
              {isClean ? <User className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {isClean ? 'No Baseline Scene Captured' : 'No Distracted Scene Captured'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                {isClean
                  ? 'Capture a traffic scene using your camera or choose a preset.'
                  : 'Capture scene with a physical distractor held in frame.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={() => phoneCameraInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/50 flex items-center justify-center gap-1.5 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Snap with Phone Camera</span>
              </button>
              <button
                onClick={onOpenCapture}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                  isClean
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                Open Camera Hub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Telemetry & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {hasImage && !isCompleted && !isAnalyzing && (
          <div className="py-6 text-center space-y-3">
            <p className="text-xs text-slate-400">Frame ready for Vision-Language reasoning.</p>
            <button
              onClick={onRunAnalysis}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 flex items-center gap-2 mx-auto transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run VLM Perception Inference</span>
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-cyan-300">Evaluating pedestrian intent & distractors...</p>
          </div>
        )}

        {state.error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-xs text-rose-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-rose-200">
              <AlertOctagon className="w-4 h-4" />
              <span>Perception Engine Error</span>
            </div>
            <p className="text-slate-300">{state.error}</p>
          </div>
        )}

        {isCompleted && state.analysis && (
          <div className="space-y-4 text-xs">
            {/* Primary Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">PEDESTRIANS</span>
                <span className="text-base font-bold text-white">
                  {state.analysis.pedestrians_detected} detected
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MODEL CONFIDENCE</span>
                <span className="text-base font-bold text-cyan-300">
                  {Math.round((state.analysis.overall_confidence || 0.85) * 100)}%
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">DISTRACTORS</span>
                <span className="text-base font-bold text-fuchsia-300">
                  {state.analysis.distractors_identified?.length || 0} flagged
                </span>
              </div>
            </div>

            {/* Pedestrian Intent List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Predicted Pedestrian Intent:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {state.analysis.intent_predictions && state.analysis.intent_predictions.length > 0 ? (
                  state.analysis.intent_predictions.map((intent, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-200 font-medium text-xs flex items-center gap-1.5"
                    >
                      <User className="w-3 h-3 text-cyan-400" />
                      {intent}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No pedestrians / intent identified</span>
                )}
              </div>
            </div>

            {/* Action Cues & Detailed Pedestrian Telemetry */}
            {state.analysis.pedestrians && state.analysis.pedestrians.length > 0 && (
              <div className="space-y-2">
                {state.analysis.pedestrians.map((p, i) => (
                  <div
                    key={p.id || i}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-semibold">
                        {p.id || `Pedestrian #${i + 1}`}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                          p.risk_level === 'critical'
                            ? 'bg-rose-950 border border-rose-800 text-rose-300'
                            : p.risk_level === 'high'
                            ? 'bg-amber-950 border border-amber-800 text-amber-300'
                            : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        Risk: {p.risk_level}
                      </span>
                    </div>
                    {p.location_description && (
                      <p className="text-slate-300 text-[11px]">{p.location_description}</p>
                    )}
                    {p.action_cues && p.action_cues.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.action_cues.map((cue, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                          >
                            • {cue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Distractors List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Identified Visual Distractors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {state.analysis.distractors_identified && state.analysis.distractors_identified.length > 0 ? (
                  state.analysis.distractors_identified.map((dist, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-fuchsia-950/60 border border-fuchsia-800/80 text-fuchsia-200 text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-fuchsia-400" />
                      <span>{dist.name}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-fuchsia-900/60 text-fuchsia-300 font-mono">
                        {dist.interference_level}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No significant visual distractors found</span>
                )}
              </div>
            </div>

            {/* Vehicle Recommended Action */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Autonomous Vehicle Policy Action:
                </span>
                <span className="text-xs font-semibold text-white">
                  {state.analysis.recommended_vehicle_action}
                </span>
              </div>
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Scene Summary */}
            <p className="text-slate-400 text-[11px] leading-relaxed border-t border-slate-800/60 pt-2">
              <span className="text-slate-300 font-medium">Scene Summary: </span>
              {state.analysis.scene_summary}
            </p>
          </div>
        )}
      </div>

      {/* Raw JSON Modal */}
      {showJsonModal && state.analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="font-mono text-xs text-cyan-400 font-bold">
                RAW JSON TELEMETRY [{type.toUpperCase()}]
              </span>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950">
              <pre>{JSON.stringify(state.analysis, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
