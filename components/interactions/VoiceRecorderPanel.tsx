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
  onSkip,
  hint,
  level,
  sampleAudioSrc,
  sampleText,
}: {
  expectedText: string;
  onComplete: () => void;
  onSkip?: () => void;
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

  const replaySample = (playbackRate: number = 1.0) => {
    stopChildAudioPlayback();
    const spokenText = sampleText ?? expectedText;
    speak({
      text: spokenText,
      audioSrc: sampleAudioSrc,
      kind: spokenText.includes(" ") ? "phrase" : "word",
      rate: playbackRate,
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
    <div className="w-full max-w-lg mx-auto space-y-2.5 sm:space-y-3.5 rounded-[1.75rem] sm:rounded-[2.5rem] bg-gradient-to-b from-white via-sky-50/40 to-sky-100/30 p-3.5 sm:p-5 shadow-xl border-2 sm:border-4 border-white/90 backdrop-blur-md max-h-[calc(100dvh-110px)] overflow-y-auto custom-scrollbar">
      {/* Header text & Expected sentence with Inline IPA Phonetics Directly Underneath */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-700 shadow-2xs">
          <Sparkles className="h-3 w-3" /> Speak & Learn
        </div>

        {/* Cohesive Sentence Display with Phonetics Under Words (No Separate Heavy Boxes) */}
        <div className="flex flex-wrap justify-center items-end gap-x-3 gap-y-1.5 py-1">
          {wordDetails.map((detail, idx) => {
            const isPerfect = detail.status === "perfect";
            const isClose = detail.status === "close";
            const isEvaluated = status === "evaluated";
            const phonemes = detail.phonemes ?? [];

            const wordColor = isEvaluated
              ? isPerfect
                ? "text-emerald-600 font-black"
                : isClose
                  ? "text-amber-600 font-black"
                  : "text-rose-600 font-black"
              : "text-slate-900 font-black";

            return (
              <div key={`${detail.word}-${idx}`} className="flex flex-col items-center">
                {/* Word Label */}
                <span className={`text-lg sm:text-2xl tracking-wide transition-colors ${wordColor}`}>
                  {detail.word}
                </span>

                {/* Inline IPA Phonemes Directly Underneath Word (Always Visible) */}
                {phonemes.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {phonemes.map((ph, pIdx) => {
                      const isPhPerfect = ph.accuracyScore >= 80 || ph.status === "perfect";
                      const isPhClose = ph.accuracyScore >= 60 || ph.status === "close";

                      const phClass = isEvaluated
                        ? isPhPerfect
                          ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-extrabold shadow-2xs"
                          : isPhClose
                            ? "bg-amber-100 text-amber-900 border-amber-400 font-extrabold"
                            : "bg-rose-100 text-rose-800 border-rose-400 font-extrabold animate-pulse"
                        : "bg-amber-100/90 text-amber-900 border-amber-300 font-black shadow-2xs";

                      return (
                        <span
                          key={pIdx}
                          className={`px-1.5 py-0.5 rounded-md text-[11px] sm:text-xs font-mono border transition-all ${phClass}`}
                          title={`Âm tiết IPA /${ph.phoneme}/: ${ph.accuracyScore}% độ chính xác`}
                        >
                          /{ph.phoneme}/
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-600 leading-snug">
          {evaluationResult?.feedbackText || hint || "Bé hãy nhấn micro, nghe âm mẫu rồi đọc to nhé! 🐝"}
        </p>
      </div>

      {/* Mobile Microphone & Wave Equalizer Station */}
      <div className="flex flex-col items-center justify-center py-1 gap-2">
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1.9], opacity: [0.6, 0.3, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                className="absolute h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-pink-400"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1.7], opacity: [0.8, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.3, ease: "easeOut" }}
                className="absolute h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-400"
              />
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            animate={isListening ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 0.9 }}
            onClick={() => {
              void toggleListening();
            }}
            className={`relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full shadow-xl border-4 transition-all duration-300 active:translate-y-[2px] ${
              isListening
                ? "bg-gradient-to-tr from-pink-500 to-rose-400 text-white border-pink-200 ring-4 ring-pink-300/40"
                : engine === "unsupported"
                  ? "bg-slate-200 text-slate-400 border-slate-300"
                  : "bg-gradient-to-tr from-emerald-400 to-teal-500 text-white border-emerald-200 shadow-emerald-200/40 ring-4 ring-emerald-100"
            }`}
            aria-label={buttonLabel}
          >
            {isListening ? (
              <Mic className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
            ) : (
              <MicOff className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-md" />
            )}
          </motion.button>
        </div>

        {/* Compact 7-bar Wave Visualizer */}
        <div className="flex items-end justify-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1.5 border border-slate-200/50 shadow-inner w-36 sm:w-44">
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
                animate={{ height: `${Math.max(10, levelValue * 36)}px` }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-2.5 sm:w-3 rounded-full shadow-2xs ${
                  isListening ? colors[index % colors.length] : "bg-slate-300"
                }`}
              />
            );
          })}
        </div>

        {/* Dual-Speed Sample Audio Control Buttons (Nghe Mẫu 1.0x & Nghe Chậm Con Rùa 0.80x) */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => replaySample(1.0)}
            className="flex items-center justify-center gap-1.5 rounded-xl border-b-3 border-sky-600 bg-sky-400 px-3 py-1.5 text-xs font-black text-sky-950 shadow-xs active:translate-y-[1px] active:border-b-1 transition hover:bg-sky-300"
          >
            <Volume2 className="h-3.5 w-3.5" />
            🔊 Nghe mẫu
          </button>
          <button
            type="button"
            onClick={() => replaySample(0.8)}
            className="flex items-center justify-center gap-1.5 rounded-xl border-b-3 border-amber-600 bg-amber-400 px-3 py-1.5 text-xs font-black text-amber-950 shadow-xs active:translate-y-[1px] active:border-b-1 transition hover:bg-amber-300"
          >
            🐢 Nghe chậm
          </button>
        </div>
      </div>

      {/* Real-Time Transcript Bar */}
      <div className="rounded-xl sm:rounded-2xl bg-white/90 p-2.5 text-center font-bold text-slate-700 shadow-2xs border border-slate-100/80 min-h-[42px] flex items-center justify-center">
        {transcript ? (
          <span className="text-sm sm:text-base text-sky-950 font-black">"{transcript}"</span>
        ) : isListening ? (
          <span className="text-xs sm:text-sm text-emerald-600 animate-pulse font-extrabold">🐝 Bé đọc theo mẫu nhé...</span>
        ) : (
          <span className="text-slate-400 text-xs sm:text-sm">Bấm nút micro để bắt đầu!</span>
        )}
      </div>



      {/* Always Visible Skip Button */}
      {onSkip && evaluationResult?.status !== "correct" && (
        <div className="flex justify-center pt-0.5">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/90 px-3 py-1.5 text-xs font-black text-amber-950 shadow-2xs transition hover:bg-amber-200 active:scale-95"
          >
            Bỏ qua tạm thời ⏩
          </button>
        </div>
      )}

      {/* Mobile-Optimized Evaluation Results Card */}
      <AnimatePresence>
        {status === "evaluated" && evaluationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50/95 p-3.5 shadow-md text-center"
          >
            {/* 3-Star Rating Badge */}
            <div className="flex justify-center items-center gap-1.5">
              {[1, 2, 3].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: starIdx <= starsCount ? 1.15 : 0.85, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, delay: starIdx * 0.12 }}
                >
                  <Star
                    className={`h-7 w-7 ${
                      starIdx <= starsCount
                        ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                        : "fill-slate-200 text-slate-300"
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <p className="text-xs sm:text-sm font-black text-amber-900 leading-tight">{evaluationResult.feedbackText}</p>

            {/* Commercial Feature: Dual-Speed Sound Controls (Normal, Slow 0.75x, Child Recording) */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => replaySample(1.0)}
                className="flex items-center justify-center gap-1 rounded-xl border-b-3 border-sky-600 bg-sky-400 px-2 py-2 text-xs font-black text-sky-950 shadow-xs active:translate-y-[2px] active:border-b-1"
              >
                <Volume2 className="h-3.5 w-3.5 shrink-0" />
                🔊 Nghe mẫu
              </button>

              <button
                type="button"
                onClick={() => replaySample(0.75)}
                className="flex items-center justify-center gap-1 rounded-xl border-b-3 border-amber-600 bg-amber-400 px-2 py-2 text-xs font-black text-amber-950 shadow-xs active:translate-y-[2px] active:border-b-1"
              >
                🐢 Nghe chậm
              </button>

              {recordedAudioUrl ? (
                <button
                  type="button"
                  onClick={playChildRecordedAudio}
                  className={`flex items-center justify-center gap-1 rounded-xl border-b-3 px-2 py-2 text-xs font-black shadow-xs active:translate-y-[2px] active:border-b-1 transition-all ${
                    isPlayingChildAudio
                      ? "bg-rose-500 text-white border-rose-700"
                      : "bg-emerald-400 text-emerald-950 border-emerald-600"
                  }`}
                >
                  {isPlayingChildAudio ? <Square className="h-3.5 w-3.5 fill-current shrink-0" /> : <Play className="h-3.5 w-3.5 fill-current shrink-0" />}
                  {isPlayingChildAudio ? "Đang phát..." : "🎧 Nghe lại"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-1 rounded-xl bg-slate-200 px-2 py-2 text-xs font-bold text-slate-400 border-b-3 border-slate-300"
                >
                  🎧 Nghe lại
                </button>
              )}
            </div>

            {/* Action Buttons: Retry, Skip & Continue */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  resetSessionVisuals();
                  void toggleListening();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Thử lại 🔄
              </button>

              {onSkip && evaluationResult.status !== "correct" && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900 shadow-2xs transition hover:bg-amber-200 active:scale-95"
                >
                  Bỏ qua ⏩
                </button>
              )}

              {evaluationResult.status === "correct" && (
                <button
                  type="button"
                  onClick={onComplete}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-b-3 border-emerald-600 bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-black text-white shadow-md active:translate-y-[2px] active:border-b-1"
                >
                  Tiếp tục 🚀
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint card */}
      {showHintCard && status !== "evaluated" && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-center shadow-2xs">
          <p className="text-xs font-black text-amber-800">Bé đọc to hơn một chút nhé! 🐝</p>
          <button type="button" onClick={() => replaySample(1.0)} className="kid-button w-full border-sky-600 bg-sky-300 text-sky-950 py-1.5 text-xs">
            <Volume2 className="h-3.5 w-3.5" />
            Nghe lại âm mẫu chuẩn
          </button>
        </div>
      )}

      {error && status !== "evaluated" && (
        <div className="text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-xl p-2 border border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
};
