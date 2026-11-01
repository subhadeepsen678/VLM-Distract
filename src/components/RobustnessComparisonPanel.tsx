import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Activity,
  Layers,
  FileText,
} from 'lucide-react';
import { ComparisonMetrics, SceneAnalysis } from '../types';

interface RobustnessComparisonPanelProps {
  metrics: ComparisonMetrics | null;
  cleanAnalysis: SceneAnalysis | null;
  distractedAnalysis: SceneAnalysis | null;
  onOpenPitch: () => void;
}

export const RobustnessComparisonPanel: React.FC<RobustnessComparisonPanelProps> = ({
  metrics,
  cleanAnalysis,
  distractedAnalysis,
  onOpenPitch,
}) => {
  if (!metrics || !cleanAnalysis || !distractedAnalysis) return null;

  const isRobust = metrics.isRobust;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl space-y-6 p-6">
      {/* Alert Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isRobust
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            : 'bg-rose-950/50 border-rose-800/90 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg mt-0.5 ${
              isRobust
                ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700'
                : 'bg-rose-900/60 text-rose-400 border border-rose-700 animate-pulse'
            }`}
          >
            {isRobust ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono tracking-tight flex items-center gap-2">
              {isRobust
                ? 'MODEL ROBUST: PREDICTIONS REMAINED INVARIANT'
                : 'ROBUSTNESS FAILURE DETECTED: INTENT / PERCEPTION DIVERGENCE'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {isRobust
                ? 'The Vision-Language Model successfully sustained pedestrian intent reasoning and vehicle safety policies despite the introduction of visual distractors.'
                : 'The introduction of visual distractors perturbed the VLM perception pipeline, altering pedestrian intent predictions or vehicle avoidance policies.'}
            </p>
          </div>
        </div>

        {/* Severity Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
              isRobust
                ? 'bg-emerald-900/80 border-emerald-700 text-emerald-300'
                : 'bg-rose-900/80 border-rose-700 text-rose-200'
            }`}
          >
            {metrics.distractionSeverity}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            ROBUSTNESS INVARIANCE SCORE
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span
              className={`text-3xl font-bold font-mono ${
                metrics.robustnessScore >= 80
                  ? 'text-emerald-400'
                  : metrics.robustnessScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {metrics.robustnessScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.robustnessScore >= 80
                  ? 'bg-emerald-500'
                  : metrics.robustnessScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.robustnessScore}%` }}
            />
          </div>
        </div>

        {/* Intent Shift Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            PEDESTRIAN INTENT STABILITY
          </span>
          <div className="my-2">
            <span
              className={`text-base font-bold font-mono block ${
                metrics.intentShiftDetected ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {metrics.intentShiftDetected ? 'Intent Shifted' : 'Consistent Intent'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5 truncate">
              {cleanAnalysis.intent_predictions?.[0] || 'None'} →{' '}
              {distractedAnalysis.intent_predictions?.[0] || 'None'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {metrics.intentShiftDetected ? '⚠️ Behavioral reasoning perturbed' : '✓ Unaffected by distractor'}
          </span>
        </div>

        {/* Pedestrian Count Delta */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            DETECTION DELTA (Δ PEDESTRIANS)
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono ${
                metrics.pedestrianDelta === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.pedestrianDelta > 0 ? `+${metrics.pedestrianDelta}` : metrics.pedestrianDelta}
            </span>
            <span className="text-xs text-slate-400">
              ({cleanAnalysis.pedestrians_detected} clean vs {distractedAnalysis.pedestrians_detected} dist)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {metrics.pedestrianDelta === 0
              ? '✓ No missed / hallucinated targets'
              : metrics.pedestrianDelta < 0
              ? '⚠️ False negative (missed pedestrian)'
              : '⚠️ False positive (phantom target)'}
          </span>
        </div>

        {/* Policy Action Shift */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            VEHICLE POLICY IMPACT
          </span>
          <div className="my-2">
            <span
              className={`text-xs font-bold font-mono block ${
                metrics.actionChanged ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {metrics.actionChanged ? 'Action Policy Altered' : 'Action Invariant'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {distractedAnalysis.recommended_vehicle_action}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Confidence Δ: {metrics.confidenceDelta > 0 ? `+${metrics.confidenceDelta}` : metrics.confidenceDelta}
          </span>
        </div>
      </div>

      {/* Comparative Behavioral Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
            <tr>
              <th className="py-2.5 px-4 font-medium">Dimension</th>
              <th className="py-2.5 px-4 font-medium text-emerald-400">Baseline (Clean Scene)</th>
              <th className="py-2.5 px-4 font-medium text-amber-400">Perturbed (Distracted Scene)</th>
              <th className="py-2.5 px-4 font-medium">Robustness Evaluation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            <tr>
              <td className="py-3 px-4 font-mono text-slate-400">Pedestrian Detection Count</td>
              <td className="py-3 px-4 font-semibold text-white">
                {cleanAnalysis.pedestrians_detected} pedestrian(s)
              </td>
              <td className="py-3 px-4 font-semibold text-white">
                {distractedAnalysis.pedestrians_detected} pedestrian(s)
              </td>
              <td className="py-3 px-4">
                {metrics.pedestrianDelta === 0 ? (
                  <span className="text-emerald-400 font-mono font-medium">✓ Consistent Count</span>
                ) : (
                  <span className="text-rose-400 font-mono font-medium">
                    ⚠️ Discrepancy ({metrics.pedestrianDelta > 0 ? '+' : ''}
                    {metrics.pedestrianDelta})
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-slate-400">Primary Intent Prediction</td>
              <td className="py-3 px-4 font-semibold text-cyan-300">
                {cleanAnalysis.intent_predictions?.[0] || 'None'}
              </td>
              <td className="py-3 px-4 font-semibold text-amber-300">
                {distractedAnalysis.intent_predictions?.[0] || 'None'}
              </td>
              <td className="py-3 px-4">
                {!metrics.intentShiftDetected ? (
                  <span className="text-emerald-400 font-mono font-medium">✓ Invariant Intent</span>
                ) : (
                  <span className="text-rose-400 font-mono font-medium">⚠️ Intent Flip Detected</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-slate-400">Distractors Identified</td>
              <td className="py-3 px-4 text-slate-400">
                {cleanAnalysis.distractor_names?.join(', ') || 'None'}
              </td>
              <td className="py-3 px-4 text-fuchsia-300 font-medium">
                {distractedAnalysis.distractor_names?.join(', ') || 'None identified'}
              </td>
              <td className="py-3 px-4 font-mono text-slate-300">
                {distractedAnalysis.distractor_names?.length || 0} distractor(s) isolated
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-slate-400">Autonomous Safety Decision</td>
              <td className="py-3 px-4 text-white font-medium">
                {cleanAnalysis.recommended_vehicle_action}
              </td>
              <td className="py-3 px-4 text-white font-medium">
                {distractedAnalysis.recommended_vehicle_action}
              </td>
              <td className="py-3 px-4">
                {!metrics.actionChanged ? (
                  <span className="text-emerald-400 font-mono font-medium">✓ Policy Stable</span>
                ) : (
                  <span className="text-amber-400 font-mono font-medium">⚠️ Decision Shifted</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Failure Mechanism Breakdown / Research Insights */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1.5 uppercase">
            <Activity className="w-4 h-4 text-cyan-400" />
            Qualitative Failure & Divergence Log (Empirical Findings)
          </span>
          <button
            onClick={onOpenPitch}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
          >
            <span>Generate Perception Technical Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {metrics.detailedDivergence.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
