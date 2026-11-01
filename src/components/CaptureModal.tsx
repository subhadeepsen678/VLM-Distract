import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Play,
} from 'lucide-react';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneType: 'clean' | 'distracted';
  onCaptureComplete: (dataUrl: string, source: 'webcam' | 'upload', customTitle?: string) => void;
}

const DIGITAL_DISTRACTORS = [
  { id: 'none', label: 'No Virtual Injection (Use Real Physical Distractor)' },
  { id: 'billboard', label: 'Neon Promo Billboard ("FLASH SALE 90% OFF")' },
  { id: 'balloons', label: 'Shiny Helium Party Balloons' },
  { id: 'glare', label: 'Intense Optical Headlight Glare & Flare' },
  { id: 'caution_sign', label: 'Flashing High-Viz Neon Construction Sign' },
];

export const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  sceneType,
  onCaptureComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneCameraInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  // Default to environment (rear camera) on mobile for road/scene capture
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedDistractor, setSelectedDistractor] = useState<string>('none');
  const [previewCapturedUrl, setPreviewCapturedUrl] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Scan system camera devices
  const refreshDeviceList = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
      return videoInputs;
    } catch (err) {
      console.warn('Could not enumerate video devices in modal:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      refreshDeviceList();
    } else {
      stopCamera();
      setPreviewCapturedUrl(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (overrideDeviceId?: string) => {
    stopCamera();
    setCameraError(null);
    setIsStarting(true);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'WebRTC live camera streaming is restricted in this browser or iframe. Tap the "Take Photo with Phone Camera" button below to open your phone camera directly.'
      );
      setIsStarting(false);
      return;
    }

    const deviceIdToUse = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;
    let mediaStream: MediaStream | null = null;

    // Strategy 1: Specific Device ID
    if (deviceIdToUse) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceIdToUse },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (errExact) {
        console.warn('Modal exact deviceId failed, attempting flexible deviceId:', errExact);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceIdToUse,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (errFlex) {
          console.warn('Flexible deviceId failed, falling back:', errFlex);
        }
      }
    }

    // Strategy 2: Ideal facingMode and 720p
    if (!mediaStream) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        console.warn('Strategy 2 facingMode failed, trying generic video: true:', err1);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: any) {
          console.error('All camera attempts failed:', err3);
          const isPermission =
            err3.name === 'NotAllowedError' ||
            err3.name === 'PermissionDeniedError' ||
            err3.name === 'SecurityError';

          setCameraError(
            isPermission
              ? 'Live camera permission denied or blocked by iframe container. Tap "Take Photo with Phone Camera" below to use your native phone camera directly.'
              : `Live camera unavailable (${err3.message || err3.name || 'Device error'}). Tap "Take Photo with Phone Camera" below to open your phone camera.`
          );
          setCameraActive(false);
          setIsStarting(false);
          return;
        }
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      setCameraActive(true);
      setIsStarting(false);

      const activeTrack = mediaStream.getVideoTracks()[0];
      if (activeTrack) {
        const settings = activeTrack.getSettings();
        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
        if (settings.facingMode) {
          setFacingMode(settings.facingMode as any);
        }
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video play() was prevented by browser autoplay policy:', playErr);
        }
      }

      await refreshDeviceList();
    }
  };

  const handleCameraChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  const handleCycleCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDev = videoDevices[nextIndex];
      if (nextDev && nextDev.deviceId) {
        handleCameraChange(nextDev.deviceId);
        return;
      }
    }
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedDeviceId('');
    startCamera('');
  };

  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedDeviceId('');
    startCamera('');
  };

  // Stamp digital distractor onto an existing 2D canvas if requested
  const applyDistractorToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    distractorId: string
  ) => {
    if (distractorId === 'billboard') {
      const bw = width * 0.42;
      const bh = height * 0.28;
      const bx = width * 0.52;
      const by = height * 0.08;

      ctx.save();
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 24px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ FLASH SALE 90% OFF ⚡', bx + bw / 2, by + bh * 0.4);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('WIN FREE ELECTRIC CAR', bx + bw / 2, by + bh * 0.65);

      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('>>> CLICK HERE NOW <<<', bx + bw / 2, by + bh * 0.85);
      ctx.restore();
    } else if (distractorId === 'balloons') {
      ctx.save();
      const cx = width * 0.72;
      const cy = height * 0.35;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 120);
      ctx.lineTo(cx - 30, cy);
      ctx.moveTo(cx, cy + 120);
      ctx.lineTo(cx + 25, cy - 20);
      ctx.moveTo(cx, cy + 120);
      ctx.lineTo(cx, cy - 35);
      ctx.stroke();

      const balloons = [
        { x: cx - 30, y: cy, r: 35, color: '#f43f5e', border: '#fda4af' },
        { x: cx + 25, y: cy - 20, r: 38, color: '#06b6d4', border: '#a5f3fc' },
        { x: cx, y: cy - 35, r: 32, color: '#a855f7', border: '#e9d5ff' },
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
      const gy = height * 0.45;
      const grad = ctx.createRadialGradient(gx, gy, 5, gx, gy, 140);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.75)');
      grad.addColorStop(0.7, 'rgba(129, 140, 248, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(gx - 200, gy);
      ctx.lineTo(gx + 200, gy);
      ctx.stroke();
      ctx.restore();
    } else if (distractorId === 'caution_sign') {
      ctx.save();
      const sx = width * 0.68;
      const sy = height * 0.4;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 50);
      ctx.lineTo(sx + 60, sy + 40);
      ctx.lineTo(sx - 60, sy + 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', sx, sy + 30);
      ctx.restore();
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (sceneType === 'distracted' && selectedDistractor !== 'none') {
      applyDistractorToCanvas(ctx, canvas.width, canvas.height, selectedDistractor);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewCapturedUrl(dataUrl);
  };

  const handleConfirmCapture = () => {
    if (!previewCapturedUrl) return;
    const distractorLabel =
      selectedDistractor !== 'none'
        ? DIGITAL_DISTRACTORS.find((d) => d.id === selectedDistractor)?.label
        : undefined;

    onCaptureComplete(
      previewCapturedUrl,
      'webcam',
      distractorLabel ? `Camera + ${distractorLabel}` : undefined
    );
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (sceneType === 'distracted' && selectedDistractor !== 'none') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              applyDistractorToCanvas(ctx, canvas.width, canvas.height, selectedDistractor);
              setPreviewCapturedUrl(canvas.toDataURL('image/jpeg', 0.92));
            } else {
              setPreviewCapturedUrl(result);
            }
          };
          img.src = result;
        } else {
          setPreviewCapturedUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Hidden Phone Native Camera Input */}
        <input
          ref={phoneCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                sceneType === 'clean'
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/70 border border-amber-800 text-amber-400'
              }`}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {sceneType === 'clean' ? 'Capture Baseline Clean Scene' : 'Capture Distracted Scene'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {sceneType === 'clean'
                  ? 'Point camera at pedestrian/roadway scene'
                  : 'Hold a physical distractor in front of camera or select virtual injection'}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Native Phone Camera Banner (Guaranteed to work on all mobile devices!) */}
          <div className="p-3 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-900/60 text-blue-300 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Testing on a Mobile Phone or Tablet?
                </span>
                <span className="text-[11px] text-blue-200 block">
                  Tap below to launch your phone's native camera directly with 0 permission issues.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => phoneCameraInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-950 flex items-center justify-center gap-1.5 shrink-0 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo with Phone Camera</span>
            </button>
          </div>

          {/* Distracted Scene Perturbation Controls */}
          {sceneType === 'distracted' && (
            <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Distraction Setup (Physical or Virtual Injection):</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Hold any real physical object in view (poster, mug, bright sign), or select a virtual distractor overlay below:
              </p>
              <select
                value={selectedDistractor}
                onChange={(e) => setSelectedDistractor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500"
              >
                {DIGITAL_DISTRACTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Viewport / Preview */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {previewCapturedUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={previewCapturedUrl}
                  alt="Captured frame"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-xs text-cyan-300 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Snapshot Captured</span>
                </div>
              </div>
            ) : cameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onClick={() => videoRef.current?.play()}
                  className="w-full h-full object-cover"
                />
                {/* HUD Crosshairs */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-32 h-32 border border-cyan-500/40 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0" />
                    <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                    <div className="w-3 h-3 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />
                    <div className="w-3 h-3 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />
                  </div>
                </div>

                {/* Camera toolbar overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
                  <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
                    <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      className="bg-transparent text-cyan-300 font-mono text-[11px] focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
                      title="Select system camera"
                    >
                      {videoDevices.length === 0 ? (
                        <option value="" className="bg-slate-900 text-slate-300">
                          Default Camera
                        </option>
                      ) : (
                        videoDevices.map((dev, idx) => (
                          <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900 text-slate-100">
                            {dev.label ? dev.label : `Camera ${idx + 1} (${dev.deviceId.slice(0, 8)}...)`}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => refreshDeviceList()}
                      className="p-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Scan & refresh camera devices"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCycleCamera}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      title="Switch to next camera"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>{videoDevices.length > 1 ? 'Switch Cam' : (facingMode === 'environment' ? 'Rear' : 'Front')}</span>
                    </button>
                    <span className="text-[11px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-1 rounded border border-cyan-900/40 hidden sm:inline">
                      LIVE STREAM
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 max-w-md mx-auto">
                {cameraError ? (
                  <div className="space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-amber-200 leading-relaxed">{cameraError}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => phoneCameraInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Take Photo with Phone Camera</span>
                      </button>
                      <button
                        onClick={() => startCamera()}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200"
                      >
                        Retry WebRTC Stream
                      </button>
                    </div>
                  </div>
                ) : isStarting ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-mono">Connecting to optical sensor...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400">Camera standby...</p>
                    <button
                      onClick={() => startCamera()}
                      className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => phoneCameraInputRef.current?.click()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 text-xs text-white font-medium transition-all"
                title="Open native mobile phone camera directly"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Choose File</span>
              </button>

              {previewCapturedUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewCapturedUrl(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                >
                  Retake Photo
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {previewCapturedUrl ? (
                <button
                  type="button"
                  onClick={handleConfirmCapture}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Use This Frame for Benchmark</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!cameraActive}
                  onClick={handleCaptureFrame}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Snapshot</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
