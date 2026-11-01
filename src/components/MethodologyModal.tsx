import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu, Target, ExternalLink } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Research Protocol & Methodology
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Framework Autonomous Perception & Robustness Evaluation Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              1. Theoretical Motivation & Multi-Framework Consensus
            </h4>
            <p>
              In safety-critical autonomous driving perception, Vision-Language Models (VLMs) and multimodal foundational models are increasingly employed for holistic scene understanding, intent prediction, and safety policy derivation. However, real-world traffic scenes are inundated with visually salient, non-pertinent distractors: commercial LED billboards, flashing shop signs, unusual handheld objects (umbrellas, balloons, flyers), optical glare, and moving mascots.
            </p>
            <p>
              To eliminate false positives and guarantee safety, this platform deploys a <strong>Multi-Framework Deep Learning Ensemble</strong>: client-side <strong>TensorFlow.js (COCO-SSD)</strong> generates low-latency spatial bounding boxes, <strong>PyTorch kinematic priors</strong> evaluate pedestrian gaze and curb proximity to reject 2D advertising imposters, and <strong>Gemini Multimodal VLM</strong> performs high-level semantic intent reasoning and scene policy derivation.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              2. Robustness Failure Taxonomy
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-rose-400 block">Attention Saliency Hijack</span>
                <p className="text-slate-400">
                  High-contrast visual clutter causes token attention to focus away from critical pedestrian posture, causing intent to flip from crossing to stationary.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-amber-400 block">Perceptual Masking (False Negative)</span>
                <p className="text-slate-400">
                  Photometric blooming, glare, or overlapping objects obscure pedestrian contours, causing the VLM to drop pedestrian detection entirely.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-fuchsia-400 block">Hallucinated Targets (False Positive)</span>
                <p className="text-slate-400">
                  Anthropomorphic distractors (e.g., waving tube mascots, mannequin signs) trigger false pedestrian detections and ghost braking policies.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-emerald-400 block">Invariance & Robustness</span>
                <p className="text-slate-400">
                  The model accurately identifies the distractor as irrelevant noise while maintaining invariant pedestrian intent classification.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              3. Empirical Benchmark Protocol
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
              <li>
                <strong className="text-white">State 1 (Baseline Capture):</strong> Obtain an unperturbed traffic scene featuring a pedestrian at a curb or roadway crossing. Run VLM inference to establish baseline intent and policy telemetry.
              </li>
              <li>
                <strong className="text-white">State 2 (Perturbed Capture):</strong> Introduce a physical distractor (e.g. brightly colored sign, coffee mug, umbrella in camera frame) or load a paired benchmark preset. Run identical VLM inference.
              </li>
              <li>
                <strong className="text-white">Comparative Differential Analysis:</strong> The automated evaluation engine computes intent agreement, detection count delta ($\Delta$), confidence variation, and vehicle policy consistency.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
