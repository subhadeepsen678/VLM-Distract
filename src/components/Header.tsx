import React from 'react';
import {
  ShieldAlert,
  Cpu,
  FileSpreadsheet,
  Mail,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Video,
  Columns,
} from 'lucide-react';

interface HeaderProps {
  modelName: string;
  setModelName: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  activeView: 'live' | 'benchmark';
  setActiveView: (view: 'live' | 'benchmark') => void;
  onOpenPitch: () => void;
  onOpenExport: () => void;
  onOpenMethodology: () => void;
  onOpenPresets: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelName,
  setModelName,
  temperature,
  setTemperature,
  activeView,
  setActiveView,
  onOpenPitch,
  onOpenExport,
  onOpenMethodology,
  onOpenPresets,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Lab Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                VLM-DISTRACT
                <span className="text-xs font-normal text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                  v1.3 Real-Time HUD
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Vision-Language Robustness & Intent Benchmark</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-mono">
                TensorFlow • PyTorch Priors • Gemini Ensemble
              </span>
            </p>
          </div>
        </div>

        {/* View Switcher: Live Stream vs Dual Benchmark */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveView('live')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeView === 'live'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {activeView === 'live' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeView === 'live' ? 'bg-cyan-300' : 'bg-slate-500'}`} />
            </span>
            <Video className="w-3.5 h-3.5" />
            <span>Real-Time Live Stream</span>
          </button>

          <button
            onClick={() => setActiveView('benchmark')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeView === 'benchmark'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual Benchmark</span>
          </button>
        </div>

        {/* Model & Parameter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-mono">VLM:</span>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-slate-100">
                gemini-3.8-flash (Standard - Active)
              </option>
              <option value="gemini-flash-latest" className="bg-slate-900 text-slate-100">
                gemini-flash-latest (High Throughput)
              </option>
            </select>
          </div>

          {/* Temperature Setting */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 font-mono">Temp:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Temperature: ${temperature}`}
            />
            <span className="font-mono text-cyan-300 w-6 text-right">{temperature}</span>
          </div>

          {/* Preset Benchmark Button */}
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-700/60 hover:bg-indigo-900 text-indigo-300 text-xs font-medium transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          {/* Export Data */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
            title="Export experiment trials to JSON/CSV/LaTeX"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Technical Report & Proposal */}
          <button
            onClick={onOpenPitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Technical Report</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Experiment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Help / Methodology */}
          <button
            onClick={onOpenMethodology}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Research Background & Methodology"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
