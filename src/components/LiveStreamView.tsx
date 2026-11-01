import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Video,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  Sliders,
  History,
  Smartphone,
} from 'lucide-react';
import { SceneAnalysis, LiveStreamEvent } from '../types';

interface LiveStreamViewProps {
  modelName: string;
  onSendToBenchmark: (dataUrl: string, target: 'clean' | 'distracted', analysis: SceneAnalysis) => void;
  onOpenPitch: () => void;
}

const DIGITAL_DISTRACTORS = [
  { id: 'none', label: 'None (Physical Distractors in Camera)' },
  { id: 'billboard', label: 'Neon Promo Billboard ("FLASH SALE 90% OFF")' },
  { id: 'balloons', label: 'Shiny Helium Party Balloons' },
  { id: 'glare', label: 'Intense Optical Headlight Glare & Flare' },
  { id: 'caution_sign', label: 'Flashing High-Viz Caution Sign' },
];

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  modelName,
  onSendToBenchmark,
  onOpenPitch,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingLockRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Live sampling interval (ms)
  const [sampleInterval, setSampleInterval] = useState<number>(1500);
  const [selectedDistractor, setSelectedDistractor] = useState<string>('none');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Live inference state
  const [latestAnalysis, setLatestAnalysis] = useState<SceneAnalysis | null>(null);
  const [baselineAnalysis, setBaselineAnalysis] = useState<SceneAnalysis | null>(null);
  const [latestFrameUrl, setLatestFrameUrl] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [frameCount, setFrameCount] = useState<number>(0);

  // Event timeline
  const [events, setEvents] = useState<LiveStreamEvent[]>([]);

  // Robustness tracking
  const [robustnessAlert, setRobustnessAlert] = useState<string | null>(null);
  const [liveRobustnessScore, setLiveRobustnessScore] = useState<number>(100);

  // Initialize camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Handle live processing loop
  useEffect(() => {
    if (isStreaming && cameraActive) {
      // Run immediately
      captureAndAnalyzeFrame();

      const intervalId = window.setInterval(() => {
        captureAndAnalyzeFrame();
      }, sampleInterval);

      timerRef.current = intervalId;

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isStreaming, cameraActive, sampleInterval, selectedDistractor]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('WebRTC camera not supported in this container or browser.');
      return;
    }

    let mediaStream: MediaStream | null = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
      } catch {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err: any) {
          setCameraError(err.message || 'Camera permission denied or camera unavailable.');
          setCameraActive(false);
          return;
        }
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
      setCameraActive(true);
      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = mediaStream;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.muted = true;
        try {
          await v.play();
        } catch (e) {
          console.warn('Autoplay prevented:', e);
        }
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Stamp digital distractor onto an existing 2D canvas if requested
  const applyDistractorToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    distractorId: string
  ) => {
    if (distractorId === 'billboard') {
      const bw = width * 0.44;
      const bh = height * 0.28;
      const bx = width * 0.52;
      const by = height * 0.08;

      ctx.save();
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = `bold ${Math.round(width * 0.032)}px Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('⚡ FLASH SALE 90% OFF ⚡', bx + bw / 2, by + bh * 0.42);

      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.round(width * 0.02)}px sans-serif`;
      ctx.fillText('WIN FREE ELECTRIC CAR', bx + bw / 2, by + bh * 0.68);
      ctx.restore();
    } else if (distractorId === 'balloons') {
      ctx.save();
      const cx = width * 0.72;
      const cy = height * 0.35;
      const balloons = [
        { x: cx - 24, y: cy, r: width * 0.045, color: '#f43f5e', border: '#fda4af' },
        { x: cx + 20, y: cy - 16, r: width * 0.048, color: '#06b6d4', border: '#a5f3fc' },
        { x: cx, y: cy - 28, r: width * 0.042, color: '#a855f7', border: '#e9d5ff' },
      ];
      balloons.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.strokeStyle = b.border;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    } else if (distractorId === 'glare') {
      ctx.save();
      const gx = width * 0.6;
      const gy = height * 0.42;
      const grad = ctx.createRadialGradient(gx, gy, 5, gx, gy, width * 0.2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.75)');
      grad.addColorStop(0.7, 'rgba(129, 140, 248, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (distractorId === 'caution_sign') {
      ctx.save();
      const sx = width * 0.7;
      const sy = height * 0.38;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 40);
      ctx.lineTo(sx + 50, sy + 35);
      ctx.lineTo(sx - 50, sy + 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', sx, sy + 26);
      ctx.restore();
    }
  };

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || processingLockRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    processingLockRef.current = true;
    setIsProcessing(true);

    try {
      // Use scaled-down resolution for real-time live inference (640x360 is extremely fast for VLM processing)
      const targetWidth = 640;
      const targetHeight = Math.round((video.videoHeight / video.videoWidth) * targetWidth) || 360;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        processingLockRef.current = false;
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Apply digital perturbation if enabled
      if (selectedDistractor !== 'none') {
        applyDistractorToCanvas(ctx, targetWidth, targetHeight, selectedDistractor);
      }

      const frameDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setLatestFrameUrl(frameDataUrl);

      const startTime = Date.now();

      const response = await fetch('/api/analyze-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameDataUrl,
          mode: 'live',
          modelName: 'gemini-3.8-flash',
          temperature: 0.1,
        }),
      });

      const json = await response.json();
      const elapsed = Date.now() - startTime;
      setLatencyMs(elapsed);

      if (json.success && json.data) {
        const analysis: SceneAnalysis = json.data;
        setLatestAnalysis(analysis);
        setFrameCount((prev) => prev + 1);

        // Robustness check against locked baseline
        evaluateLiveRobustness(analysis);

        // Add to live timeline if notable
        recordEvent(analysis);
      }
    } catch (err) {
      console.warn('Live frame analysis tick error:', err);
    } finally {
      processingLockRef.current = false;
      setIsProcessing(false);
    }
  };

  const evaluateLiveRobustness = (current: SceneAnalysis) => {
    if (!baselineAnalysis) return;

    const baseIntent = (baselineAnalysis.intent_predictions?.[0] || '').toLowerCase().trim();
    const currIntent = (current.intent_predictions?.[0] || '').toLowerCase().trim();

    const intentChanged = Boolean(baseIntent && currIntent && baseIntent !== currIntent);
    const pedCountDelta = (current.pedestrians_detected ?? 0) - (baselineAnalysis.pedestrians_detected ?? 0);
    const hasDistractor = (current.distractor_names || []).length > 0;

    let score = 100;
    if (intentChanged) score -= 40;
    if (pedCountDelta !== 0) score -= 30;
    if (hasDistractor && intentChanged) score -= 20;

    const finalScore = Math.max(0, Math.min(100, score));
    setLiveRobustnessScore(finalScore);

    if (intentChanged) {
      setRobustnessAlert(
        `⚠️ Saliency Shift Detected: Intent altered from "${baseIntent}" to "${currIntent}"!`
      );
    } else if (pedCountDelta < 0) {
      setRobustnessAlert(
        `⚠️ Perceptual Masking: Baseline detected ${baselineAnalysis.pedestrians_detected} pedestrian(s), live frame dropped to ${current.pedestrians_detected}.`
      );
    } else {
      setRobustnessAlert(null);
    }
  };

  const recordEvent = (current: SceneAnalysis) => {
    const timeStr = new Date().toLocaleTimeString();

    // Check if distractor was detected
    if (current.distractor_names && current.distractor_names.length > 0) {
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          timestamp: timeStr,
          type: 'distractor',
          message: `Distractor isolated: ${current.distractor_names.join(', ')}`,
          severity: 'warning',
        },
        ...prev.slice(0, 19),
      ]);
    }

    // Check if pedestrian intent noted
    if (current.intent_predictions && current.intent_predictions.length > 0) {
      const intent = current.intent_predictions[0];
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          timestamp: timeStr,
          type: 'pedestrian',
          message: `Pedestrian intent: "${intent}" (${Math.round((current.overall_confidence || 0.85) * 100)}% conf)`,
          severity: 'normal',
        },
        ...prev.slice(0, 19),
      ]);
    }
  };

  const handleLockBaseline = () => {
    if (latestAnalysis) {
      setBaselineAnalysis(latestAnalysis);
      setLiveRobustnessScore(100);
      setRobustnessAlert(null);
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Reference Baseline Locked: "${latestAnalysis.intent_predictions?.[0] || 'Clean'}" (${latestAnalysis.pedestrians_detected} ped)`,
          severity: 'normal',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Stream Main Viewport & HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Video Canvas with Perception Overlays */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isStreaming
                    ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <div>
                <h3 className="text-sm font-semibold text-white font-mono tracking-tight flex items-center gap-2">
                  REAL-TIME OPTICAL PERCEPTION HUD
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    LIVE STREAM
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Continuous multimodal vision inference on live camera feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Latency Telemetry */}
              {latencyMs !== null && isStreaming && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  <span>{latencyMs}ms Turnaround</span>
                </span>
              )}

              {/* Bounding Box HUD Toggle */}
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  showBoundingBoxes
                    ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
                title="Toggle Live Perception Bounding Boxes"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>HUD Boxes</span>
              </button>

              {/* Flip Camera */}
              <button
                onClick={toggleFacingMode}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors"
                title={`Switch camera (current: ${facingMode === 'environment' ? 'Rear' : 'Front'})`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-time Video Viewport */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-slate-800">
            {cameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onClick={() => videoRef.current?.play()}
                  className="w-full h-full object-cover"
                />

                {/* Digital Distractor Overlay on Live Feed */}
                {selectedDistractor !== 'none' && (
                  <div className="absolute top-4 right-4 pointer-events-none animate-in fade-in duration-300">
                    {selectedDistractor === 'billboard' && (
                      <div className="bg-black/90 border-2 border-pink-500 rounded-lg p-2.5 shadow-[0_0_20px_rgba(236,72,153,0.6)] text-center">
                        <span className="text-xs font-bold font-sans text-rose-400 block tracking-wider">
                          ⚡ FLASH SALE 90% OFF ⚡
                        </span>
                        <span className="text-[10px] font-sans text-cyan-300 font-bold block">
                          WIN FREE ELECTRIC CAR
                        </span>
                      </div>
                    )}
                    {selectedDistractor === 'caution_sign' && (
                      <div className="w-14 h-14 bg-yellow-400 border-2 border-black flex items-center justify-center shadow-lg transform rotate-6">
                        <span className="text-2xl font-black text-black">!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Perception Bounding Boxes */}
                {showBoundingBoxes && latestAnalysis && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Pedestrians */}
                    {(latestAnalysis.pedestrians || []).map((ped, idx) => {
                      if (!ped.box_2d || ped.box_2d.length !== 4) return null;
                      const [ymin, xmin, ymax, xmax] = ped.box_2d;
                      const top = `${(ymin / 1000) * 100}%`;
                      const left = `${(xmin / 1000) * 100}%`;
                      const height = `${((ymax - ymin) / 1000) * 100}%`;
                      const width = `${((xmax - xmin) / 1000) * 100}%`;

                      const isCritical = ped.risk_level === 'critical' || ped.risk_level === 'high';

                      return (
                        <div
                          key={`live-ped-${idx}`}
                          style={{ top, left, width, height }}
                          className={`absolute border-2 transition-all duration-300 ${
                            isCritical
                              ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                              : 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
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

                    {/* Distractors */}
                    {(latestAnalysis.distractors_identified || []).map((dist, idx) => {
                      if (!dist.box_2d || dist.box_2d.length !== 4) return null;
                      const [ymin, xmin, ymax, xmax] = dist.box_2d;
                      const top = `${(ymin / 1000) * 100}%`;
                      const left = `${(xmin / 1000) * 100}%`;
                      const height = `${((ymax - ymin) / 1000) * 100}%`;
                      const width = `${((xmax - xmin) / 1000) * 100}%`;

                      return (
                        <div
                          key={`live-dist-${idx}`}
                          style={{ top, left, width, height }}
                          className="absolute border-2 border-dashed border-fuchsia-400 bg-fuchsia-400/10 shadow-[0_0_12px_rgba(232,121,249,0.4)]"
                        >
                          <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-fuchsia-700 text-white whitespace-nowrap shadow-md">
                            DISTRACTOR: {dist.name} [{dist.interference_level}]
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Live Scanning HUD Indicator */}
                {isProcessing && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="radar-sweep" />
                  </div>
                )}

                {/* Bottom Stream Status Pill */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <span
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                        isStreaming
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-slate-900/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isStreaming ? `● LIVE ANALYZING (FRAME #${frameCount})` : '⏸ STREAM PAUSED'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-md">
                    {modelName} // SUB-SECOND PIPELINE
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3 max-w-md mx-auto">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-xs text-amber-200">{cameraError || 'Camera stream offline.'}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Start Optical Sensor
                </button>
              </div>
            )}
          </div>

          {/* Stream Controls Bar */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Main Stream Play/Pause Toggle */}
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono shadow-lg transition-all ${
                  isStreaming
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/50'
                }`}
              >
                {isStreaming ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isStreaming ? 'PAUSE REAL-TIME ANALYSIS' : 'START REAL-TIME STREAM'}</span>
              </button>

              {/* Lock Baseline Button */}
              <button
                onClick={handleLockBaseline}
                disabled={!latestAnalysis}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 disabled:opacity-40 text-indigo-300 text-xs font-semibold font-mono transition-all"
                title="Lock current live observation as reference baseline"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>LOCK BASELINE</span>
              </button>
            </div>

            {/* Interval Speed & Distractor Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sampling Rate */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Rate:</span>
                <select
                  value={sampleInterval}
                  onChange={(e) => setSampleInterval(Number(e.target.value))}
                  className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value={1000} className="bg-slate-900">1.0s (Ultra-Fast)</option>
                  <option value={1500} className="bg-slate-900">1.5s (Fast)</option>
                  <option value={2200} className="bg-slate-900">2.2s (Balanced)</option>
                  <option value={3000} className="bg-slate-900">3.0s (Relaxed)</option>
                </select>
              </div>

              {/* Digital Distractor Simulator */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="text-slate-400">Perturbation:</span>
                <select
                  value={selectedDistractor}
                  onChange={(e) => setSelectedDistractor(e.target.value)}
                  className="bg-transparent text-fuchsia-300 font-mono text-xs focus:outline-none cursor-pointer max-w-[120px] truncate"
                >
                  {DIGITAL_DISTRACTORS.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry, Robustness Drift & Event Log */}
        <div className="space-y-4">
          {/* Robustness Drift Alert Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              robustnessAlert
                ? 'bg-rose-950/50 border-rose-800 text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.25)]'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                LIVE ROBUSTNESS INVARIANCE
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  liveRobustnessScore >= 80
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : liveRobustnessScore >= 50
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {liveRobustnessScore}% INVARIANT
              </span>
            </div>

            {robustnessAlert ? (
              <div className="mt-2 text-xs font-medium text-rose-200 space-y-1">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Robustness Degradation Detected!</span>
                </p>
                <p className="text-[11px] text-slate-300">{robustnessAlert}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                {baselineAnalysis
                  ? 'Baseline locked. Monitoring live camera for pedestrian intent shifts or distractor interference...'
                  : 'Point camera at a pedestrian scene and click "Lock Baseline" to benchmark live distractions.'}
              </p>
            )}
          </div>

          {/* Real-time Perception Readout */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              LIVE PERCEPTION TELEMETRY
            </span>

            {latestAnalysis ? (
              <div className="space-y-2.5 text-xs">
                {/* Intent & Count */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">PEDESTRIANS</span>
                    <span className="text-base font-bold text-white font-mono">
                      {latestAnalysis.pedestrians_detected} detected
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">PRIMARY INTENT</span>
                    <span className="text-xs font-bold text-cyan-300 truncate block mt-0.5">
                      {latestAnalysis.intent_predictions?.[0] || 'None'}
                    </span>
                  </div>
                </div>

                {/* Distractors detected */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">ACTIVE DISTRACTORS</span>
                  <div className="flex flex-wrap gap-1">
                    {latestAnalysis.distractor_names && latestAnalysis.distractor_names.length > 0 ? (
                      latestAnalysis.distractor_names.map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-fuchsia-950/80 border border-fuchsia-800 text-fuchsia-200 text-[10px] font-mono"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">No visual clutter flagged</span>
                    )}
                  </div>
                </div>

                {/* Vehicle Action Policy */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">SAFETY POLICY ACTION</span>
                    <span className="text-xs font-bold text-white">
                      {latestAnalysis.recommended_vehicle_action}
                    </span>
                  </div>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>

                {/* Export snapshot to dual benchmark */}
                {latestFrameUrl && (
                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() =>
                        onSendToBenchmark(latestFrameUrl, 'clean', latestAnalysis)
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-[11px] font-mono text-emerald-300 transition-colors"
                    >
                      Send as Baseline
                    </button>
                    <button
                      onClick={() =>
                        onSendToBenchmark(latestFrameUrl, 'distracted', latestAnalysis)
                      }
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-[11px] font-mono text-amber-300 transition-colors"
                    >
                      Send as Distracted
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                Click "Start Real-Time Stream" to begin continuous analysis.
              </p>
            )}
          </div>

          {/* Live Timeline & Event Log */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE REASONING EVENT TIMELINE</span>
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[11px] font-mono">
              {events.length > 0 ? (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-1.5 rounded-lg border flex items-start gap-1.5 ${
                      ev.severity === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0">[{ev.timestamp.split(' ')[0]}]</span>
                    <span className="truncate">{ev.message}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic py-2">No events logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
