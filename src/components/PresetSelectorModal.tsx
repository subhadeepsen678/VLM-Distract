import React from 'react';
import { X, Layers, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { PresetScenario } from '../types';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: PresetScenario) => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Standardized Autonomous Benchmark Presets
              </h3>
              <p className="text-xs text-slate-400">
                Pre-curated traffic test pairs designed for empirical evaluation of AV perception under visual clutter.
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

        {/* Preset Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_SCENARIOS.map((preset) => (
              <div
                key={preset.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {preset.id}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{preset.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-semibold font-mono block mb-0.5">
                      Hypothesis:
                    </span>
                    {preset.researchHypothesis}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Includes Clean & Distracted Pair
                  </span>
                  <button
                    onClick={() => {
                      onSelectScenario(preset);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load Benchmark Pair</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
