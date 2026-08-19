"use client";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, Sparkles, Star, Volume2, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSpeech } from "@/hooks/useSpeech";
import type { SpeechDifficulty, WordDetail, SpeechMatchResult } from "@/utils/speechMatch";
import { evaluateMultiCandidateMatch, evaluateWordDetails, normalizeSpeechText } from "@/utils/speechMatch";

type RecognitionAlternative = { transcript?: string; confidence?: number };
type RecognitionResultLike = {
  0?: RecognitionAlternative;
  1?: RecognitionAlternative;
  2?: RecognitionAlternative;
  3?: RecognitionAlternative;
  4?: RecognitionAlternative;
  length?: number;
  isFinal?: boolean;
};
type RecognitionEventLike = { results: ArrayLike<RecognitionResultLike> };
type SpeechRecognitionErrorEventLike = { error?: string; message?: string };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type RecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

type Engine = "native" | "browser" | "unsupported";
type SpeakingStatus = "idle" | "listening" | "processing" | "evaluated";

const nativePlatform = Capacitor.isNativePlatform();
const HINT_DELAY_MS = 4500;
const AUTO_STOP_SILENCE_MS = 1500;
const ANALYSER_BAR_COUNT = 7;

const getDifficulty = (level?: number): SpeechDifficulty => {
  if (!level || level <= 1) return 1;
  if (level >= 3) return 3;
  return 2;
};

const extractNativeCandidates = (payload: unknown): string[] => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const maybeMatches = payload as { matches?: string[]; value?: string; transcript?: string };

  if (Array.isArray(maybeMatches.matches) && maybeMatches.matches.length > 0) {
    return maybeMatches.matches.filter((item): item is string => Boolean(item && typeof item === "string"));
  }

  const single = maybeMatches.value ?? maybeMatches.transcript;
  return single ? [single] : [];
};

export const VoiceRecorderPanel = ({
  expectedText,
  onComplete,
  hint,
  level,
  sampleAudioSrc,
  sampleText,
}: {
  expectedText: string;
  onComplete: () => void;
  hint?: string;
  level?: number;
  sampleAudioSrc?: string;
  sampleText?: string;
}) => {
  const { speak } = useSpeech();
  const [engine, setEngine] = useState<Engine>("unsupported");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<SpeakingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [waveLevels, setWaveLevels] = useState<number[]>(Array.from({ length: ANALYSER_BAR_COUNT }, () => 0.15));
  const [showHintCard, setShowHintCard] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingChildAudio, setIsPlayingChildAudio] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<SpeechMatchResult | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const nativeListenerRef = useRef<PluginListenerHandle | null>(null);
  const completedRef = useRef(false);
  const transcriptRef = useRef("");
  const expectedTextRef = useRef(expectedText);
  const onCompleteRef = useRef(onComplete);
  const hintTimerRef = useRef<number | null>(null);
  
  // Audio analysis & recording refs
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const childAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Voice Activity Detection (VAD)
  const hasSpokenRef = useRef(false);
  const lastSpokenTimestampRef = useRef<number>(0);
  const autoStopCheckIntervalRef = useRef<number | null>(null);

  const difficulty = getDifficulty(level);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

  const wordDetails: WordDetail[] = useMemo(() => {
    if (evaluationResult?.wordDetails?.length) {
      return evaluationResult.wordDetails;
    }
    return evaluateWordDetails(expectedText, transcript, difficulty);
  }, [expectedText, transcript, evaluationResult, difficulty]);

  const clearHintTimer = () => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  };

  const clearAutoStopCheck = () => {
    if (autoStopCheckIntervalRef.current !== null) {
      window.clearInterval(autoStopCheckIntervalRef.current);
      autoStopCheckIntervalRef.current = null;
    }
  };

  const stopChildAudioPlayback = () => {
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      childAudioPlayerRef.current = null;
    }
    setIsPlayingChildAudio(false);
  };

  const stopVisualizerAndRecorder = () => {
    clearAutoStopCheck();

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    mediaRecorderRef.current = null;

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setWaveLevels(Array.from({ length: ANALYSER_BAR_COUNT }, () => 0.15));
  };

  const startVisualizerAndRecorder = async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. Setup MediaRecorder for child's voice playback
      recordedChunksRef.current = [];
      try {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
            if (recordedAudioUrl) {
              URL.revokeObjectURL(recordedAudioUrl);
            }
            const newUrl = URL.createObjectURL(blob);
            setRecordedAudioUrl(newUrl);
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch {
        // MediaRecorder fallback if unsupported
      }

      // 2. Setup Web Audio Analyser for VAD and live Equalizer wave
      const Context = window.AudioContext ?? window.webkitAudioContext;
      if (Context) {
        const audioContext = new Context();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        const sourceNode = audioContext.createMediaStreamSource(stream);
        sourceNodeRef.current = sourceNode;
        sourceNode.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        hasSpokenRef.current = false;
        lastSpokenTimestampRef.current = 0;

        const tick = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate RMS volume level for Voice Activity Detection
          let sum = 0;
          for (let i = 0; i < dataArray.length; i += 1) {
            sum += (dataArray[i] ?? 0) * (dataArray[i] ?? 0);
          }
          const rms = Math.sqrt(sum / (dataArray.length || 1)) / 255;

          if (rms > 0.035) {
            hasSpokenRef.current = true;
            lastSpokenTimestampRef.current = Date.now();
          }

          const sliceSize = Math.floor(dataArray.length / ANALYSER_BAR_COUNT) || 1;
          const nextBars = Array.from({ length: ANALYSER_BAR_COUNT }, (_, index) => {
            const slice = dataArray.slice(index * sliceSize, (index + 1) * sliceSize);
            const average = slice.reduce((s, v) => s + v, 0) / (slice.length || 1);
            return Math.min(1, Math.max(0.12, average / 255));
          });

          setWaveLevels(nextBars);
          rafRef.current = window.requestAnimationFrame(tick);
        };

        tick();

        // 3. VAD Auto-stop silence checker (auto finish 1.5s after kid stops speaking)
        clearAutoStopCheck();
        autoStopCheckIntervalRef.current = window.setInterval(() => {
          if (
            hasSpokenRef.current &&
            lastSpokenTimestampRef.current > 0 &&
            Date.now() - lastSpokenTimestampRef.current >= AUTO_STOP_SILENCE_MS
          ) {
            void handleAutoSilenceDetected();
          }
        }, 300);
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleAutoSilenceDetected = async () => {
    clearAutoStopCheck();
    if (!isListening && status !== "listening") return;

    if (engine === "native") {
      setIsListening(false);
      clearHintTimer();
      stopVisualizerAndRecorder();
      await SpeechRecognition.stop();
      processEvaluation([transcriptRef.current]);
    } else if (recognitionRef.current) {
      clearHintTimer();
      stopVisualizerAndRecorder();
      try {
        recognitionRef.current.stop();
      } catch {
        // noop
      }
    }
  };

  const resetSessionVisuals = () => {
    transcriptRef.current = "";
    setTranscript("");
    setError(null);
    setShowHintCard(false);
    setStatus("idle");
    setEvaluationResult(null);
    completedRef.current = false;
    stopChildAudioPlayback();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  };

  useEffect(() => {
    expectedTextRef.current = expectedText;
    onCompleteRef.current = onComplete;
    const timer = window.setTimeout(() => {
      resetSessionVisuals();
      setIsListening(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [expectedText, onComplete]);

  const processEvaluation = (candidates: string[]) => {
    clearHintTimer();
    stopVisualizerAndRecorder();

    const validCandidates = candidates.filter((c) => Boolean(c && c.trim()));
    if (!validCandidates.length && transcriptRef.current) {
      validCandidates.push(transcriptRef.current);
    }

    const matchResult = evaluateMultiCandidateMatch(expectedTextRef.current, validCandidates, difficulty);
    setEvaluationResult(matchResult);
    setStatus("evaluated");

    if (matchResult.status === "correct") {
      completedRef.current = true;
      setError(null);
      if (matchResult.stars === 3) {
        onCompleteRef.current();
      }
    } else if (matchResult.status === "almost-correct") {
      setError("Bé nói gần đúng rồi! Hãy nhấn 'Thử lại 🔄' để đạt 3 Sao ⭐ nhé.");
    } else {
      setError("Bé phát âm chưa chính xác lắm. Nghe lại mẫu và nhấn 'Thử lại 🔄' nhé!");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const setupNative = async () => {
      if (!nativePlatform) return false;

      try {
        const availableResult = (await SpeechRecognition.available()) as boolean | { available?: boolean };
        const available = typeof availableResult === "boolean" ? availableResult : Boolean(availableResult?.available);
        if (!available) return false;

        nativeListenerRef.current = await SpeechRecognition.addListener("partialResults", (payload) => {
          const candidates = extractNativeCandidates(payload);
          if (!candidates.length) {
            setStatus("processing");
            return;
          }

          const primaryText = candidates[0] ?? "";
          transcriptRef.current = primaryText;
          setTranscript(primaryText);

          clearHintTimer();
          const matchResult = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);
          
          if (matchResult.status === "correct" && matchResult.stars === 3) {
            completedRef.current = true;
            setEvaluationResult(matchResult);
            setStatus("evaluated");
            setIsListening(false);
            clearHintTimer();
            stopVisualizerAndRecorder();
            void SpeechRecognition.stop();
            onCompleteRef.current();
          }
        });

        if (!cancelled) setEngine("native");
        return true;
      } catch {
        return false;
      }
    };

    const setupBrowser = () => {
      if (!RecognitionCtor) return false;

      try {
        const recognition = new RecognitionCtor();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;
        if ("maxAlternatives" in recognition) {
          (recognition as unknown as { maxAlternatives: number }).maxAlternatives = 5;
        }

        recognition.onstart = () => {
          completedRef.current = false;
          setError(null);
          setStatus("listening");
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
          stopVisualizerAndRecorder();
          clearHintTimer();

          if (completedRef.current) return;

          const candidates = transcriptRef.current ? [transcriptRef.current] : [];
          processEvaluation(candidates);
        };

        recognition.onerror = (event) => {
          const errType = event?.error;
          if (errType === "aborted") return;

          clearHintTimer();
          stopVisualizerAndRecorder();
          setIsListening(false);

          if (errType === "no-speech") {
            setStatus("evaluated");
            setError("Bé chưa kịp phát âm. Hãy bấm nút micro và đọc to rõ nhé!");
          } else if (errType === "not-allowed" || errType === "service-not-allowed") {
            setStatus("evaluated");
            setError("Chưa được cấp quyền micro. Vui lòng bật quyền micro trong trình duyệt.");
          } else {
            setStatus("evaluated");
            setError("Chưa nhận diện được giọng nói. Bấm 'Thử lại 🔄' để phát âm lại.");
          }
        };

        recognition.onresult = (event) => {
          const resultsArray = Array.from(event.results);
          const candidates: string[] = [];

          for (const result of resultsArray) {
            const length = result.length || 1;
            for (let i = 0; i < length; i += 1) {
              const altKey = i as 0 | 1 | 2 | 3 | 4;
              const alt = result[altKey]?.transcript;
              if (alt && typeof alt === "string") {
                candidates.push(alt.trim());
              }
            }
          }

          const topText = resultsArray
            .map((result) => result[0]?.transcript ?? "")
            .join(" ")
            .trim();

          if (topText && !candidates.includes(topText)) {
            candidates.unshift(topText);
          }

          const primaryText = candidates[0] ?? topText;
          transcriptRef.current = primaryText;
          setTranscript(primaryText);

          const isFinal = resultsArray.some((result) => result.isFinal);
          const matchResult = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);

          if (matchResult.status === "correct" && matchResult.stars === 3) {
            completedRef.current = true;
            setEvaluationResult(matchResult);
            setStatus("evaluated");
            try {
              recognition.stop();
            } catch {
              // noop
            }
            onCompleteRef.current();
            return;
          }

          if (isFinal) {
            processEvaluation(candidates);
          }
        };

        recognitionRef.current = recognition;
        if (!cancelled) setEngine("browser");
        return true;
      } catch {
        return false;
      }
    };

    void (async () => {
      const nativeReady = await setupNative();
      if (nativeReady) return;

      const browserReady = setupBrowser();
      if (!browserReady && !cancelled) {
        setEngine("unsupported");
      }
    })();

    return () => {
      cancelled = true;
      clearHintTimer();
      stopVisualizerAndRecorder();
      stopChildAudioPlayback();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // noop
        }
        recognitionRef.current = null;
      }
      if (nativeListenerRef.current) {
        void nativeListenerRef.current.remove();
        nativeListenerRef.current = null;
      }
      if (nativePlatform) {
        void SpeechRecognition.stop();
      }
    };
  }, [RecognitionCtor, difficulty]);

  const ensureNativePermission = async () => {
    try {
      const permissions = (await SpeechRecognition.checkPermissions()) as { speechRecognition?: string; microphone?: string };
      const speechGranted = permissions?.speechRecognition === "granted" || permissions?.microphone === "granted";
      if (speechGranted) return true;

      const request = (await SpeechRecognition.requestPermissions()) as { speechRecognition?: string; microphone?: string };
      return request?.speechRecognition === "granted" || request?.microphone === "granted";
    } catch {
      return false;
    }
  };

  const replaySample = () => {
    stopChildAudioPlayback();
    const spokenText = sampleText ?? expectedText;
    speak({
      text: spokenText,
      audioSrc: sampleAudioSrc,
      kind: spokenText.includes(" ") ? "phrase" : "word",
      rate: spokenText.includes(" ") ? 0.48 : 0.4,
      source: "lesson",
      mode: "manual",
      interrupt: "all",
    });
  };

  const playChildRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingChildAudio) {
      stopChildAudioPlayback();
      return;
    }

    const audio = new Audio(recordedAudioUrl);
    childAudioPlayerRef.current = audio;
    setIsPlayingChildAudio(true);

    audio.onended = () => {
      setIsPlayingChildAudio(false);
      childAudioPlayerRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingChildAudio(false);
      childAudioPlayerRef.current = null;
    };
    void audio.play();
  };

  const startHintTimer = () => {
    clearHintTimer();
    hintTimerRef.current = window.setTimeout(() => {
      if (transcriptRef.current) return;
      setError("Bé thử đọc to lên một chút nhé! 🐝");
      setShowHintCard(true);
    }, HINT_DELAY_MS);
  };

  const toggleListening = async () => {
    stopChildAudioPlayback();
    setError(null);
    setShowHintCard(false);

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      !nativePlatform &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setStatus("evaluated");
      setError("Nhận diện giọng nói yêu cầu truy cập địa chỉ bảo mật HTTPS trên di động.");
      return;
    }

    if (engine === "unsupported") {
      setStatus("evaluated");
      setError("Thiết bị chưa sẵn sàng micro. Vui lòng mở Chrome hoặc cấp quyền micro.");
      return;
    }

    if (engine === "native") {
      if (isListening) {
        setIsListening(false);
        clearHintTimer();
        stopVisualizerAndRecorder();
        await SpeechRecognition.stop();
        processEvaluation([transcriptRef.current]);
        return;
      }

      const granted = await ensureNativePermission();
      if (!granted) {
        setStatus("evaluated");
        setError("Ứng dụng chưa được cấp quyền micro trên điện thoại.");
        return;
      }

      await startVisualizerAndRecorder();
      resetSessionVisuals();
      setStatus("listening");
      setIsListening(true);
      startHintTimer();

      try {
        await SpeechRecognition.start({
          language: "en-US",
          maxResults: 5,
          partialResults: true,
          popup: false,
        });
      } catch {
        clearHintTimer();
        stopVisualizerAndRecorder();
        setStatus("evaluated");
        setIsListening(false);
        setError("Không thể bắt đầu ghi âm. Vui lòng thử lại.");
      }
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("evaluated");
      setError("Thiết bị chưa sẵn sàng micro. Hãy thử lại.");
      return;
    }

    if (isListening) {
      clearHintTimer();
      stopVisualizerAndRecorder();
      try {
        recognition.stop();
      } catch {
        // noop
      }
      return;
    }

    const visStarted = await startVisualizerAndRecorder();
    if (!visStarted) {
      setStatus("evaluated");
      setError("Trình duyệt chưa được cấp quyền truy cập Micro.");
      return;
    }

    resetSessionVisuals();
    setStatus("listening");
    startHintTimer();

    try {
      recognition.start();
    } catch {
      clearHintTimer();
      stopVisualizerAndRecorder();
      setError("Không thể bắt đầu ghi âm. Hãy thử bấm lại lần nữa.");
    }
  };

  const buttonLabel = isListening ? "Dừng ghi âm" : "Bấm để nói";
  const starsCount = evaluationResult?.stars ?? 0;

  return (
    <div className="space-y-4 rounded-[2.5rem] bg-gradient-to-b from-white to-sky-50/50 p-6 shadow-2xl border-4 border-white/80 backdrop-blur-sm">
      {/* Header text & Expected sentence */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-700">
          <Sparkles className="h-3.5 w-3.5" /> Speak & Learn
        </div>
        <h3 className="text-3xl sm:text-4xl font-black tracking-wide text-slate-900 drop-shadow-sm">{expectedText}</h3>
        <p className="text-sm font-bold text-slate-600">
          {evaluationResult?.feedbackText || hint || "Bé hãy nhấn micro, nghe âm mẫu rồi đọc to từ/câu trên nhé! 🐝"}
        </p>
      </div>

      {/* Main Microphone Button with Commercial 3-Ring Ripple Pulse */}
      <div className="relative flex justify-center py-2">
        {isListening && (
          <>
            <motion.div
              animate={{ scale: [1, 1.6, 2], opacity: [0.6, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
              className="absolute h-20 w-20 rounded-full bg-pink-400"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: "easeOut" }}
              className="absolute h-20 w-20 rounded-full bg-emerald-400"
            />
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          animate={isListening ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
          onClick={() => {
            void toggleListening();
          }}
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl border-4 transition-all duration-300 ${
            isListening
              ? "bg-gradient-to-tr from-pink-500 to-rose-400 text-white border-pink-200 ring-4 ring-pink-300/50"
              : engine === "unsupported"
                ? "bg-slate-200 text-slate-400 border-slate-300"
                : "bg-gradient-to-tr from-emerald-400 to-teal-500 text-white border-emerald-200 shadow-emerald-200/50 ring-4 ring-emerald-100"
          }`}
          aria-label={buttonLabel}
        >
          {isListening ? (
            <Mic className="h-10 w-10 animate-pulse" />
          ) : (
            <MicOff className="h-10 w-10 drop-shadow-md" />
          )}
        </motion.button>
      </div>

      {/* Real-time 7-bar Audio Wave Equalizer */}
      <div className="flex items-end justify-center gap-2.5 rounded-2xl bg-slate-900/5 px-4 py-4 backdrop-blur-xs border border-slate-200/60 shadow-inner">
        {waveLevels.map((levelValue, index) => {
          const colors = [
            "bg-emerald-400",
            "bg-teal-400",
            "bg-cyan-400",
            "bg-sky-400",
            "bg-amber-400",
            "bg-rose-400",
            "bg-pink-400",
          ];
          return (
            <motion.div
              key={index}
              animate={{ height: `${Math.max(16, levelValue * 58)}px` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-3.5 rounded-full shadow-sm ${
                isListening ? colors[index % colors.length] : "bg-slate-300"
              }`}
            />
          );
        })}
      </div>

      {/* Real-Time Transcript or Prompt Box */}
      <div className="rounded-2xl bg-white p-3.5 text-center font-bold text-slate-700 shadow-sm border border-slate-100 min-h-[50px] flex items-center justify-center">
        {transcript ? (
          <span className="text-base text-sky-950 font-black">"{transcript}"</span>
        ) : isListening ? (
          <span className="text-emerald-600 animate-pulse font-extrabold">🐝 Bé hãy đọc theo mẫu ngay bây giờ...</span>
        ) : (
          <span className="text-slate-400 text-sm">Chưa có giọng nói. Bấm nút micro để bắt đầu!</span>
        )}
      </div>

      {/* Target Word Pills with Color-Coded Feedback (Emerald = Perfect, Amber = Close, Gray = Missing) */}
      <div className="flex flex-wrap justify-center gap-2 py-1">
        {wordDetails.map((detail, idx) => {
          const isPerfect = detail.status === "perfect";
          const isClose = detail.status === "close";

          return (
            <motion.span
              key={`${detail.word}-${idx}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`px-4 py-1.5 rounded-full text-base font-black tracking-wide border-b-4 shadow-sm transition-all ${
                isPerfect
                  ? "bg-emerald-500 text-white border-emerald-700 shadow-emerald-200"
                  : isClose
                    ? "bg-amber-400 text-amber-950 border-amber-600 shadow-amber-200"
                    : "bg-slate-100 text-slate-400 border-slate-300"
              }`}
            >
              {detail.word}
            </motion.span>
          );
        })}
      </div>

      {/* Evaluation Results Card: Stars + Dual Audio Playback ("Nghe mẫu chuẩn" vs "Nghe lại giọng con") */}
      <AnimatePresence>
        {status === "evaluated" && evaluationResult && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4 rounded-3xl border-2 border-amber-200 bg-amber-50/90 p-5 shadow-lg text-center"
          >
            {/* 3-Star Rating Badge */}
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: starIdx <= starsCount ? 1.25 : 0.9, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, delay: starIdx * 0.15 }}
                >
                  <Star
                    className={`h-9 w-9 ${
                      starIdx <= starsCount
                        ? "fill-amber-400 text-amber-500 drop-shadow-md"
                        : "fill-slate-200 text-slate-300"
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <p className="text-base font-black text-amber-900">{evaluationResult.feedbackText}</p>

            {/* Commercial Feature: Dual Sound Buttons (Native Sample vs Child Recording) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={replaySample}
                className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-600 bg-sky-400 px-4 py-3 text-sm font-black text-sky-950 shadow-md active:translate-y-[2px] active:border-b-2"
              >
                <Volume2 className="h-5 w-5" />
                🔊 Nghe mẫu chuẩn
              </button>

              {recordedAudioUrl ? (
                <button
                  type="button"
                  onClick={playChildRecordedAudio}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-3 text-sm font-black shadow-md active:translate-y-[2px] active:border-b-2 transition-all ${
                    isPlayingChildAudio
                      ? "bg-rose-500 text-white border-rose-700"
                      : "bg-emerald-400 text-emerald-950 border-emerald-600"
                  }`}
                >
                  {isPlayingChildAudio ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                  {isPlayingChildAudio ? "Đang phát..." : "🎧 Nghe lại giọng con"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400 border-b-4 border-slate-300"
                >
                  🎧 Nghe lại giọng con
                </button>
              )}
            </div>

            {/* Action Buttons: Retry & Continue */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetSessionVisuals();
                  void toggleListening();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Thử lại 🔄
              </button>

              {evaluationResult.status === "correct" && (
                <button
                  type="button"
                  onClick={onComplete}
                  className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-6 py-2.5 text-sm font-black text-white shadow-md active:translate-y-[2px] active:border-b-2"
                >
                  Tiếp tục ⏩
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint card for slow response */}
      {showHintCard && status !== "evaluated" && (
        <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center shadow-sm">
          <p className="text-sm font-black text-amber-800">Bé thử phát âm to hơn một chút nhé! 🐝</p>
          <button type="button" onClick={replaySample} className="kid-button w-full border-sky-600 bg-sky-300 text-sky-950">
            <Volume2 className="h-4 w-4" />
            Nghe lại âm mẫu chuẩn
          </button>
        </div>
      )}

      {error && status !== "evaluated" && (
        <div className="text-center text-sm font-bold text-rose-600 bg-rose-50 rounded-xl p-2.5 border border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
};
