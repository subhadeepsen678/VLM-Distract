import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SceneViewer } from './components/SceneViewer';
import { RobustnessComparisonPanel } from './components/RobustnessComparisonPanel';
import { CaptureModal } from './components/CaptureModal';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { TechnicalReportModal } from './components/TechnicalReportModal';
import { ResearchExportModal } from './components/ResearchExportModal';
import { MethodologyModal } from './components/MethodologyModal';
import { SceneState, ComparisonMetrics, PresetScenario, SceneAnalysis } from './types';
import { evaluateRobustness, svgToPngBase64, optimizeImageForVLM } from './utils/analysisUtils';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { LiveStreamPerception } from './components/LiveStreamPerception';
import { EnsembleAccuracyPanel } from './components/EnsembleAccuracyPanel';
import {
  DEFAULT_ENSEMBLE_CONFIG,
  MultiFrameworkState,
  detectWithTensorFlow,
  fuseMultiFrameworkEnsemble,
  EnsembleDetection,
} from './services/ensemblePerception';
import {
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Video,
  SplitSquareVertical,
} from 'lucide-react';

export default function App() {
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [activeMode, setActiveMode] = useState<'live' | 'benchmark'>('live');
  const [ensembleConfig, setEnsembleConfig] = useState<MultiFrameworkState>(DEFAULT_ENSEMBLE_CONFIG);

  const [cleanState, setCleanState] = useState<SceneState>({
    imageUrl: null,
    imageBase64: null,
    status: 'idle',
    analysis: null,
    error: null,
    timestamp: null,
    source: 'preset',
  });

  const [distractedState, setDistractedState] = useState<SceneState>({
    imageUrl: null,
    imageBase64: null,
    status: 'idle',
    analysis: null,
    error: null,
    timestamp: null,
    source: 'preset',
  });

  // Modal states
  const [captureModalType, setCaptureModalType] = useState<'clean' | 'distracted' | null>(null);
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [showPitchModal, setShowPitchModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);

  // Computed metrics
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null);

  // On mount, auto-load Scenario 1 so the interface immediately has rich research data ready to test
  useEffect(() => {
    const firstScenario = PRESET_SCENARIOS[0];
    loadScenario(firstScenario, false);
  }, []);

  // Update comparison metrics whenever both analyses complete
  useEffect(() => {
    if (cleanState.analysis && distractedState.analysis) {
      const result = evaluateRobustness(cleanState.analysis, distractedState.analysis);
      setComparisonMetrics(result);
    } else {
      setComparisonMetrics(null);
    }
  }, [cleanState.analysis, distractedState.analysis]);

  const loadScenario = async (scenario: PresetScenario, autoAnalyze = false) => {
    try {
      const cleanPng = await svgToPngBase64(scenario.cleanSvg);
      const distPng = await svgToPngBase64(scenario.distractedSvg);

      setCleanState({
        imageUrl: cleanPng,
        imageBase64: cleanPng,
        status: 'idle',
        analysis: null,
        error: null,
        timestamp: new Date().toISOString(),
        source: 'preset',
        sourceTitle: `Preset: ${scenario.title} (Baseline)`,
      });

      setDistractedState({
        imageUrl: distPng,
        imageBase64: distPng,
        status: 'idle',
        analysis: null,
        error: null,
        timestamp: new Date().toISOString(),
        source: 'preset',
        sourceTitle: `Preset: ${scenario.title} (Perturbed)`,
      });

      if (autoAnalyze) {
        // Run analysis on both
        setTimeout(() => {
          analyzeScene('clean', cleanPng, scenario.cleanPromptCue);
          analyzeScene('distracted', distPng, scenario.distractedPromptCue);
        }, 100);
      }
    } catch (err) {
      console.error('Failed to load preset scenario:', err);
    }
  };

  const handleCaptureComplete = async (
    rawUrl: string,
    source: 'webcam' | 'upload',
    customTitle?: string
  ) => {
    const dataUrl = await optimizeImageForVLM(rawUrl);
    if (captureModalType === 'clean' || (!captureModalType && customTitle?.includes('Clean'))) {
      setCleanState({
        imageUrl: dataUrl,
        imageBase64: dataUrl,
        status: 'idle',
        analysis: null,
        error: null,
        timestamp: new Date().toISOString(),
        source,
        sourceTitle: customTitle || (source === 'webcam' ? 'Live Camera Snapshot' : 'Uploaded File'),
      });
    } else {
      setDistractedState({
        imageUrl: dataUrl,
        imageBase64: dataUrl,
        status: 'idle',
        analysis: null,
        error: null,
        timestamp: new Date().toISOString(),
        source,
        sourceTitle: customTitle || (source === 'webcam' ? 'Live Camera Distracted' : 'Uploaded Distracted File'),
      });
    }
  };

  const analyzeScene = async (type: 'clean' | 'distracted', imageBase64?: string, customPrompt?: string) => {
    const targetState = type === 'clean' ? cleanState : distractedState;
    const targetBase64 = imageBase64 || targetState.imageBase64;

    if (!targetBase64) {
      alert(`Please capture or upload an image for the ${type} scene first.`);
      return;
    }

    if (type === 'clean') {
      setCleanState((prev) => ({ ...prev, status: 'analyzing', error: null }));
    } else {
      setDistractedState((prev) => ({ ...prev, status: 'analyzing', error: null }));
    }

    try {
      const response = await fetch('/api/analyze-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: targetBase64,
          sceneType: type,
          modelName,
          temperature,
          customPrompt,
        }),
      });

      const json = await response.json();

      if (!response.ok && !json.data) {
        throw new Error(json.error || `Server returned error status ${response.status}`);
      }

      if (!json.data) {
        throw new Error(json.error || 'No analysis data returned from perception pipeline');
      }

      let effectiveAnalysis = json.data;
      if (ensembleConfig.isTfActive && targetBase64) {
        try {
          const img = new Image();
          img.src = targetBase64;
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
          const tfDets = await detectWithTensorFlow(img, ensembleConfig.confidenceThreshold);
          const fusion = fuseMultiFrameworkEnsemble(tfDets, json.data, ensembleConfig);
          effectiveAnalysis = {
            ...json.data,
            pedestrians_detected: fusion.fusedPedestrians.length,
            pedestrians: fusion.fusedPedestrians,
            distractors_identified: fusion.fusedDistractors,
            distractor_names: fusion.fusedDistractors.map((d) => d.name),
          };
        } catch (e) {
          console.warn('Ensemble fusion for static frame:', e);
        }
      }

      if (type === 'clean') {
        setCleanState((prev) => ({
          ...prev,
          status: 'completed',
          analysis: effectiveAnalysis,
          error: null,
        }));
      } else {
        setDistractedState((prev) => ({
          ...prev,
          status: 'completed',
          analysis: effectiveAnalysis,
          error: null,
        }));
      }
    } catch (err: any) {
      console.warn(`Analysis notice for ${type}:`, err?.message || 'Using local perception state');
      if (type === 'clean') {
        setCleanState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message || 'Vision-Language Model analysis failed.',
        }));
      } else {
        setDistractedState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message || 'Vision-Language Model analysis failed.',
        }));
      }
    }
  };

  const runBothAnalyses = async () => {
    if (cleanState.imageBase64) {
      analyzeScene('clean');
    }
    if (distractedState.imageBase64) {
      analyzeScene('distracted');
    }
  };

  const handleLiveSnapshotToBenchmark = (
    dataUrl: string,
    type: 'clean' | 'distracted',
    analysis: SceneAnalysis
  ) => {
    if (type === 'clean') {
      setCleanState({
        imageUrl: dataUrl,
        imageBase64: dataUrl,
        status: 'completed',
        analysis,
        error: null,
        timestamp: new Date().toISOString(),
        source: 'webcam',
        sourceTitle: 'Live Camera Frame (Clean Baseline)',
      });
    } else {
      setDistractedState({
        imageUrl: dataUrl,
        imageBase64: dataUrl,
        status: 'completed',
        analysis,
        error: null,
        timestamp: new Date().toISOString(),
        source: 'webcam',
        sourceTitle: 'Live Camera Frame (Distracted)',
      });
    }
    setActiveMode('benchmark');
  };

  const handleReset = () => {
    setCleanState({
      imageUrl: null,
      imageBase64: null,
      status: 'idle',
      analysis: null,
      error: null,
      timestamp: null,
      source: 'preset',
    });
    setDistractedState({
      imageUrl: null,
      imageBase64: null,
      status: 'idle',
      analysis: null,
      error: null,
      timestamp: null,
      source: 'preset',
    });
    setComparisonMetrics(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans hud-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Bar */}
      <Header
        modelName={modelName}
        setModelName={setModelName}
        temperature={temperature}
        setTemperature={setTemperature}
        activeView={activeMode}
        setActiveView={setActiveMode}
        onOpenPitch={() => setShowPitchModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenMethodology={() => setShowMethodologyModal(true)}
        onOpenPresets={() => setShowPresetModal(true)}
        onReset={handleReset}
      />

      {/* Main Research Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMode('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                activeMode === 'live'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>REAL-TIME LIVE STREAM HUD</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setActiveMode('benchmark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                activeMode === 'benchmark'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span>DUAL-SCENE BENCHMARK SUITE</span>
              {comparisonMetrics && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-normal">
                  {comparisonMetrics.robustnessScore}/100
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Engine: <span className="text-cyan-400">{modelName}</span>
            </span>
          </div>
        </div>

        {/* VIEW 1: REAL-TIME CONTINUOUS LIVE STREAM */}
        {activeMode === 'live' && (
          <LiveStreamPerception
            modelName={modelName}
            onSendSnapshotToBenchmark={handleLiveSnapshotToBenchmark}
          />
        )}

        {/* VIEW 2: DUAL-SCENE BENCHMARK COMPARISON */}
        {activeMode === 'benchmark' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Research Banner & Quick Benchmark Run */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800">
                    BENCHMARK LAB MODE
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Dual Clean Baseline vs Distracted Scene comparative evaluation
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
                  Comparative Robustness Suite
                </h2>
                <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                  Evaluate whether pedestrian intent predictions and vehicle policies diverge between unperturbed and distracted scenes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={runBothAnalyses}
                  disabled={
                    (!cleanState.imageBase64 && !distractedState.imageBase64) ||
                    cleanState.status === 'analyzing' ||
                    distractedState.status === 'analyzing'
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all font-mono"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>RUN DUAL COMPARATIVE INFERENCE</span>
                </button>

                <button
                  onClick={() => setShowPresetModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Preset Library</span>
                </button>
              </div>
            </div>

            {/* Deep Learning Multi-Framework Accuracy Ensemble Panel */}
            <EnsembleAccuracyPanel
              config={ensembleConfig}
              onChangeConfig={setEnsembleConfig}
            />

            {/* Side-by-Side Dual Perception Viewers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SceneViewer
                title="1. CLEAN SCENE (BASELINE)"
                subtitle="Ground truth traffic scene without distracting visual clutter"
                type="clean"
                state={cleanState}
                onOpenCapture={() => setCaptureModalType('clean')}
                onRunAnalysis={() => analyzeScene('clean')}
                onDirectCapture={(dataUrl) =>
                  handleCaptureComplete(dataUrl, 'webcam', 'Phone Camera Snapshot (Clean)')
                }
              />

              <SceneViewer
                title="2. DISTRACTED SCENE (PERTURBED)"
                subtitle="Scene with physical distractors, commercial signage, or visual clutter"
                type="distracted"
                state={distractedState}
                onOpenCapture={() => setCaptureModalType('distracted')}
                onRunAnalysis={() => analyzeScene('distracted')}
                onDirectCapture={(dataUrl) =>
                  handleCaptureComplete(dataUrl, 'webcam', 'Phone Camera Snapshot (Distracted)')
                }
              />
            </div>

            {/* Automated Comparison Panel */}
            {comparisonMetrics && cleanState.analysis && distractedState.analysis ? (
              <RobustnessComparisonPanel
                metrics={comparisonMetrics}
                cleanAnalysis={cleanState.analysis}
                distractedAnalysis={distractedState.analysis}
                onOpenPitch={() => setShowPitchModal(true)}
              />
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Awaiting Dual Scene Inference
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Run inference on both the Clean Scene and Distracted Scene above to unlock the Automated Robustness Evaluation Engine, Invariance Score, and Perception Safety Report Generator.
                </p>
                <button
                  onClick={runBothAnalyses}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-mono font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Analysis on Loaded Frames</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            VLM-Distract // Autonomous Driving Robustness Benchmark Suite
          </span>
          <span className="text-cyan-400">
            Multi-Framework Architecture: TensorFlow.js • PyTorch Kinematic Priors • Gemini VLM
          </span>
        </div>
      </footer>

      {/* Modals */}
      <CaptureModal
        isOpen={captureModalType !== null}
        onClose={() => setCaptureModalType(null)}
        sceneType={captureModalType || 'clean'}
        onCaptureComplete={handleCaptureComplete}
      />

      <PresetSelectorModal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSelectScenario={(s) => loadScenario(s, false)}
      />

      <TechnicalReportModal
        isOpen={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        metrics={comparisonMetrics}
        cleanAnalysis={cleanState.analysis}
        distractedAnalysis={distractedState.analysis}
        modelName={modelName}
      />

      <ResearchExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        cleanState={cleanState}
        distractedState={distractedState}
        metrics={comparisonMetrics}
        modelName={modelName}
      />

      <MethodologyModal
        isOpen={showMethodologyModal}
        onClose={() => setShowMethodologyModal(false)}
      />
    </div>
  );
}
