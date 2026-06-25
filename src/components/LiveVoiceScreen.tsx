import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Square, Sparkles, AlertCircle, RefreshCw, X, ArrowLeft } from 'lucide-react';

interface LiveVoiceScreenProps {
  user: any;
  darkMode: boolean;
  onBackToChat: () => void;
}

export default function LiveVoiceScreen({ user, darkMode, onBackToChat }: LiveVoiceScreenProps) {
  if (user?.email !== 'naiknirmal654@gmail.com') {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-colors ${
        darkMode ? 'bg-[#141413] text-white' : 'bg-[#faf9f5] text-[#141413]'
      }`}>
        <div className={`border p-8 text-center rounded-[24px] max-w-sm space-y-4 shadow-xs ${
          darkMode ? 'border-neutral-800 bg-[#1c1b18]/80' : 'border-neutral-200 bg-white/80'
        }`}>
          <div className="text-3xl">🎤</div>
          <h3 className="font-serif text-xl font-bold tracking-tight">Voice Assistant</h3>
          <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold">Founder Preview Only</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            This feature is currently being tested and is not yet available to students.
          </p>
          <button
            onClick={onBackToChat}
            className={`w-full py-2 bg-neutral-900 dark:bg-white dark:text-black border text-white rounded-full font-mono text-xs hover:scale-[1.02] active:scale-[0.98] tracking-wide transition-all cursor-pointer ${
              darkMode ? 'border-white text-black bg-white hover:bg-neutral-100' : 'border-neutral-900 text-white bg-neutral-900 hover:bg-black'
            }`}
          >
            Return to Chat
          </button>
        </div>
      </div>
    );
  }

  const [status, setStatus] = useState<'connecting' | 'ready' | 'listening' | 'speaking' | 'muted' | 'interrupted' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isClientMuted, setIsClientMuted] = useState(false);
  const [userLevel, setUserLevel] = useState(0);
  const [iraLevel, setIraLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Timing references for gapless 24kHz audio playback
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Ref for accessing state in callbacks without stale closures
  const stateRef = useRef({
    status: 'connecting',
    isMuted: false
  });

  useEffect(() => {
    stateRef.current.status = status;
    stateRef.current.isMuted = isClientMuted;
  }, [status, isClientMuted]);

  useEffect(() => {
    initSession();
    return () => {
      cleanupSession();
    };
  }, []);

  const initSession = async () => {
    setStatus('connecting');
    setErrorMessage('');

    // Establish secure WebSocket relative url
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live-assistant`;
    console.log("[WS Client Voice Screen] Connecting to:", wsUrl);

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[WS Client Voice Screen] Connection open. Waiting for ready status");
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.ready) {
            console.log("[WS Client Voice Screen] Server Live Session is Ready!");
            setStatus('ready');
            // Auto start recording once connected
            startAmplifyRecording();
          }

          if (msg.audio) {
            setStatus('speaking');
            playAudioChunk(msg.audio);
          }

          if (msg.interrupted) {
            console.log("[WS Client Voice Screen] Gemini Live signal: interrupted during speaking!");
            setStatus('interrupted');
            stopAllSpeakerQueue();
            setTimeout(() => {
              if (stateRef.current.status === 'interrupted') {
                setStatus('listening');
              }
            }, 800);
          }

          if (msg.turnComplete) {
            console.log("[WS Client Voice Screen] Gemini finished chunk stream turn.");
            setTimeout(() => {
              if (stateRef.current.status === 'speaking') {
                setStatus('listening');
              }
            }, 500);
          }

          if (msg.error) {
            console.error("[WS Client Voice Screen Error message]", msg.error);
            setErrorMessage(msg.error);
            setStatus('error');
          }

          if (msg.closed) {
            setStatus('connecting');
          }
        } catch (e: any) {
          console.error("[WS Client Voice Screen] Could not parse inbound ws frame:", e);
        }
      };

      wsRef.current.onerror = (e) => {
        console.error("[WS Client Voice Screen Connect Error]", e);
        setStatus('error');
        setErrorMessage("Could not connect to voice assistant gateway.");
      };

      wsRef.current.onclose = () => {
        console.log("[WS Client Voice Screen] Socket closed");
        if (stateRef.current.status !== 'error') {
          setStatus('connecting');
        }
      };

    } catch (err: any) {
      console.error("[WS Client Voice Screen init failure]", err);
      setStatus('error');
      setErrorMessage(err.message || "Unknown setup error");
    }
  };

  const startAmplifyRecording = async () => {
    try {
      // 1. Capture microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      micStreamRef.current = stream;

      // 2. Initialize Input Context for mic capture
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      inputAudioCtxRef.current = inputCtx;

      const deviceSampleRate = inputCtx.sampleRate;
      console.log(`[Audio Setup] Mic context enabled at device rate: ${deviceSampleRate}Hz. Resampling to 16000Hz live.`);

      const source = inputCtx.createMediaStreamSource(stream);
      
      // Use standard ScriptProcessor node to capture mono stream
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (stateRef.current.isMuted) {
          setUserLevel(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // a) Compute live user vocal volume level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setUserLevel(Math.min(100, Math.round(rms * 150)));

        // b) If user starts speaking louder, automatically interrupt playing response
        if (rms > 0.04 && stateRef.current.status === 'speaking') {
          console.log("[User Input Sync] Auto-intercept user voice command, purging queue...");
          stopAllSpeakerQueue();
          setStatus('listening');
        }

        // c) Resample input block from device input sampling rate down to 16000Hz for Gemini
        const resampledData = resampleBuffer(inputData, deviceSampleRate, 16000);

        // d) Float32 array downsampled stream to 16-bit little-endian binary 
        const pcmBuffer = floatTo16BitPCM(resampledData);

        // e) Send down to Express WS Server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Audio = arrayBufferToBase64(pcmBuffer);
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
          
          if (stateRef.current.status === 'ready' || stateRef.current.status === 'interrupted') {
            setStatus('listening');
          }
        }
      };

    } catch (err: any) {
      console.error("[Audio Capture Blocked]", err);
      setStatus('error');
      setErrorMessage("Microphone permission denied or source unavailable. Please check system preferences.");
    }
  };

  // Resampling helper
  const resampleBuffer = (input: Float32Array, fromRate: number, toRate: number): Float32Array => {
    if (fromRate === toRate) return input;
    const ratio = fromRate / toRate;
    const newLength = Math.round(input.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);
      let sum = 0;
      let count = 0;
      for (let j = start; j < end && j < input.length; j++) {
        sum += input[j];
        count++;
      }
      result[i] = count > 0 ? sum / count : 0;
    }
    return result;
  };

  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Playback engine - 24kHz raw PCM little-endian
  const playAudioChunk = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Convert from little-endian PCM base64 back to Float32 array
      const binary = window.atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const dataView = new DataView(bytes.buffer);
      const sampleCount = bytes.length / 2;
      const float32Data = new Float32Array(sampleCount);
      
      let sum = 0;
      for (let i = 0; i < sampleCount; i++) {
        const val = dataView.getInt16(i * 2, true) / 32768.0;
        float32Data[i] = val;
        sum += val * val;
      }
      
      // Compute RMS of outbound voice wave for pulsing animation
      const rms = Math.sqrt(sum / sampleCount);
      setIraLevel(Math.min(100, Math.round(rms * 160)));

      // Queue output chunk precisely
      const buffer = audioCtx.createBuffer(1, sampleCount, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05; // 50ms smooth margin
      }

      source.start(nextStartTimeRef.current);
      activeSourcesRef.current.push(source);

      // Clean reference on finish
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIraLevel(0);
        }
      };

      nextStartTimeRef.current += buffer.duration;

    } catch (err) {
      console.error("[Voice Screen AudioPlayback Error]", err);
    }
  };

  const stopAllSpeakerQueue = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIraLevel(0);
  };

  const toggleClientMute = () => {
    setIsClientMuted(prev => !prev);
    if (!isClientMuted) {
      setUserLevel(0);
    }
  };

  const handleManualInterrupt = () => {
    console.log("[Voice Screen] Manual user interruption triggered.");
    stopAllSpeakerQueue();
    setStatus('listening');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: "[Interrupted by Student]" }));
    }
  };

  const handleResetSession = () => {
    cleanupSession();
    initSession();
  };

  const cleanupSession = () => {
    console.log("[Voice Screen Cleanup] Closing live connections");
    stopAllSpeakerQueue();

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setUserLevel(0);
    setIraLevel(0);
  };

  // Determine breathing parameters
  const getOrbBreathingConfig = () => {
    if (status === 'speaking') {
      // waveform expansion
      return {
        scale: [1, 1.08 + (iraLevel / 220), 0.99, 1.05 + (iraLevel / 220), 1],
        borderRadius: ["42% 58% 70% 30% / 45% 45% 55% 55%", "70% 30% 52% 48% / 60% 40% 60% 40%", "42% 58% 70% 30% / 45% 45% 55% 55%"],
        transition: {
          scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
          borderRadius: { duration: 2.2, repeat: Infinity, ease: "linear" }
        }
      };
    } else if (status === 'listening') {
      // stronger pulse
      return {
        scale: [1, 1.06 + (userLevel / 200), 1],
        borderRadius: ["50% 50% 50% 50% / 50% 50% 50% 50%", "45% 55% 40% 60% / 55% 45% 55% 45%", "50% 50% 50% 50% / 50% 50% 50% 50%"],
        transition: {
          scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          borderRadius: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
        }
      };
    } else {
      // slow idle pulse
      return {
        scale: [1, 1.02, 1],
        borderRadius: ["48% 52% 52% 48% / 48% 48% 52% 52%", "52% 48% 48% 52% / 52% 52% 48% 48%", "48% 52% 52% 48% / 48% 48% 52% 52%"],
        transition: {
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      };
    }
  };

  const currentOrbAnimation = getOrbBreathingConfig();

  return (
    <div className={`relative flex flex-col justify-between items-center w-full h-full min-h-screen px-6 py-8 md:py-16 transition-colors duration-500 overflow-hidden ${
      darkMode 
        ? 'bg-[#12110e] text-[#faf9f5]' 
        : 'bg-[#F8F7F3] text-[#141413]'
    }`}>
      
      {/* Absolute Ambient Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[120px] ${
          darkMode ? 'bg-pink-900/10' : 'bg-pink-100/30'
        }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] ${
          darkMode ? 'bg-amber-900/10' : 'bg-amber-100/30'
        }`} />
      </div>

      {/* Embedded Grain/Noise Filter */}
      <svg className="absolute w-0 h-0">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.045 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Top clean navigation bar */}
      <div className="relative z-10 flex w-full max-w-5xl justify-between items-center">
        <button 
          onClick={onBackToChat}
          className={`group flex items-center gap-2 px-3.5 py-1.5 text-xs font-light tracking-wide rounded-full border transition-all ${
            darkMode 
              ? 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white hover:border-neutral-700' 
              : 'border-[#dedcd1] bg-white/60 backdrop-blur-sm text-[#706e64] hover:text-[#141413] hover:border-black/20'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Exit Voice</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center gap-1 uppercase font-sans animate-pulse mr-2">
            🎤 Voice Assistant (Founder Beta)
          </span>
          {status === 'connecting' && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Connecting pipeline
            </span>
          )}
          {status === 'ready' && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Ready
            </span>
          )}
          {status === 'listening' && (
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Listening
            </span>
          )}
          {status === 'speaking' && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Speaking
            </span>
          )}
          {status === 'interrupted' && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" />
              Syncing
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertCircle className="w-3 h-3" />
              Blocked
            </span>
          )}
        </div>
      </div>

      {/* Main Container - Centered horizontally and vertically */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full my-6">
        
        {/* Living, Morphing Gradient Orb with soft grain texture */}
        <div className="relative flex items-center justify-center w-full">
          
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 m-auto w-[42vw] h-[42vw] max-w-[450px] max-h-[450px] min-w-[310px] min-h-[310px] rounded-full blur-[64px] bg-gradient-to-tr from-pink-400/20 via-orange-300/10 to-indigo-400/20 mix-blend-screen opacity-70 pointer-events-none" />

          {/* Morphing Living Orb */}
          <motion.div
            animate={{
              scale: currentOrbAnimation.scale,
              borderRadius: currentOrbAnimation.borderRadius,
            }}
            transition={currentOrbAnimation.transition}
            className="relative w-[38vw] h-[38vw] max-w-[400px] max-h-[400px] min-w-[280px] min-h-[280px] shadow-2xl overflow-hidden transition-all duration-700 select-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FB7185 0%, #FDBA74 35%, #FEF3C7 65%, #DDD6FE 100%)',
              boxShadow: '0 25px 50px -12px rgba(244, 114, 182, 0.25), inset 0 2px 20px rgba(255, 255, 255, 0.4), inset 0 -4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Morphing sub-elements inside the orb for drifting colors */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F472B6] via-[#FB7185] to-[#FEF3C7] mix-blend-normal" />
            
            {/* Animated drift overlays */}
            <motion.div 
              animate={{
                x: [0, 40, -30, 0],
                y: [0, -50, 20, 0],
                scale: [1, 1.25, 0.9, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-[-20%] rounded-full bg-gradient-to-br from-[#FEF3C7] to-[#DDD6FE] mix-blend-color-burn opacity-60"
            />

            <motion.div 
              animate={{
                x: [0, -30, 40, 0],
                y: [0, 20, -40, 0],
                scale: [1, 0.85, 1.15, 1],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-[-20%] rounded-full bg-gradient-to-tr from-[#F472B6] via-amber-200 to-[#FDBA74] mix-blend-soft-light opacity-80"
            />

            {/* Grain Texture Overlay Applied via SVG filter */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay filter contrast-[1.1]"
              style={{ filter: "url(#grain-filter)" }}
            />
          </motion.div>
        </div>

        {/* Text Area Below Orb */}
        <div className="mt-12 text-center max-w-xl px-6 select-text space-y-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-normal tracking-wide">
              IRA AI
            </h1>
            <p className={`text-xs uppercase tracking-widest font-mono ${
              darkMode ? 'text-amber-400/80' : 'text-amber-600'
            }`}>
              Your Academic Intelligence Companion
            </p>
          </div>
          
          <p className={`text-sm leading-relaxed max-w-md mx-auto font-light ${
            darkMode ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            Helping students learn, research, understand concepts, and prepare for exams.
          </p>

          {/* Connected Session Status Subtext */}
          <div className="text-[11px] font-mono tracking-normal leading-normal opacity-80 pt-1">
            {status === 'connecting' && (
              <span className="text-neutral-400 animate-pulse">Initializing ElevenLabs style direct connection...</span>
            )}
            {status === 'ready' && (
              <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Session live. Tap mic below or start speaking to prompt.
              </span>
            )}
            {status === 'listening' && (
              <span className="text-green-500 font-medium">Listening to your voice...</span>
            )}
            {status === 'speaking' && (
              <span className="text-amber-500 italic font-serif">IRA speaking. Speak or tap interrupt to pause her.</span>
            )}
            {status === 'error' && (
              <span className="text-red-500 flex justify-center items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Error: {errorMessage || "Voice pipeline error. Please restart."}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Controls Container at the Bottom */}
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        
        {/* Trio of spaced circular controls */}
        <div className="flex items-center gap-8 md:gap-12">
          
          {/* Mute Mic Button (Left) */}
          <button
            onClick={toggleClientMute}
            disabled={status === 'connecting' || status === 'error'}
            className={`flex items-center justify-center w-12 h-12 rounded-full border shadow-sm transition-all duration-300 disabled:opacity-30 ${
              isClientMuted 
                ? 'bg-red-500/15 border-red-500/40 text-red-500 hover:bg-red-500/25' 
                : (darkMode 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700' 
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300')
            }`}
            title={isClientMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isClientMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Center Main Voice Action / Interrupt Button (Middle) */}
          <button
            onClick={status === 'speaking' ? handleManualInterrupt : () => {}}
            disabled={status === 'connecting' || status === 'error'}
            className={`group flex items-center justify-center w-16 h-16 rounded-full border shadow-md transition-all duration-300 relative ${
              status === 'speaking'
                ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600 hover:scale-105'
                : status === 'listening'
                ? 'bg-green-500 border-green-400 text-white hover:bg-green-600 hover:scale-105 animate-pulse'
                : (darkMode 
                    ? 'bg-[#1c1b18] border-neutral-800 text-[#faf9f5] hover:border-neutral-700' 
                    : 'bg-white border-neutral-200 text-[#141413] hover:border-[#141413]/25')
            }`}
            title={status === 'speaking' ? "Interrupt IRA AI" : "Microphone active"}
          >
            {status === 'speaking' ? (
              <Square className="w-5 h-5 fill-current" />
            ) : isClientMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            
            {/* Visual pulse rings when assistant is speaking */}
            {status === 'speaking' && (
              <span className="absolute inset-[-6px] rounded-full border border-amber-400/40 animate-ping opacity-75" />
            )}
          </button>

          {/* Reset Connection Button (Right) */}
          <button
            onClick={handleResetSession}
            className={`flex items-center justify-center w-12 h-12 rounded-full border shadow-sm transition-all duration-300 ${
              darkMode 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700' 
                : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
            }`}
            title="Reset Voice Connection"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
          </button>

        </div>

        {/* Small informative sub-footer instruction */}
        <p className={`text-[10px] font-mono tracking-wider uppercase font-light opacity-60 text-center ${
          darkMode ? 'text-neutral-400' : 'text-neutral-500'
        }`}>
          Dual-duplex Voice Mode • Powered by Gemini Live API
        </p>

      </div>

    </div>
  );
}
