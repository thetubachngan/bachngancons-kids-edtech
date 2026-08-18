"use client";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import { useSpeech } from "@/hooks/useSpeech";
import type { SpeechDifficulty } from "@/utils/speechMatch";
import { evaluateMultiCandidateMatch, evaluateSpeechMatch, normalizeSpeechText } from "@/utils/speechMatch";

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
type SpeakingStatus = "idle" | "listening" | "processing" | "correct" | "almost-correct" | "wrong";

const nativePlatform = Capacitor.isNativePlatform();
const HINT_DELAY_MS = 5000;
const ANALYSER_BAR_COUNT = 5;
const FILLER_WORDS = new Set(["uh", "um", "ah", "er", "hmm"]);

const getDifficulty = (level?: number): SpeechDifficulty => {
  if (!level || level <= 1) return 1;
  if (level >= 3) return 3;
  return 2;
};

const cleanTranscript = (text: string) =>
  normalizeSpeechText(text)
    .split(" ")
    .filter((word) => word && !FILLER_WORDS.has(word));

const levenshteinDistance = (left: string, right: string) => {
  const a = left.toLowerCase();
  const b = right.toLowerCase();

  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0]![j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j] + 1,
        matrix[i]![j - 1] + 1,
        matrix[i - 1]![j - 1] + cost,
      );
    }
  }

  return matrix[a.length]![b.length]!;
};

const wordSimilarity = (expected: string, actual: string) => {
  if (!expected || !actual) return 0;
  if (expected === actual) return 1;
  if (expected.startsWith(actual) || actual.startsWith(expected)) return 0.82;
  const distance = levenshteinDistance(expected, actual);
  return Math.max(0, 1 - distance / Math.max(expected.length, actual.length));
};

const matchedWordIndexes = (expectedText: string, transcript: string, difficulty: SpeechDifficulty) => {
  const expectedWords = cleanTranscript(expectedText);
  const spokenWords = cleanTranscript(transcript);
  const threshold = difficulty === 1 ? 0.58 : difficulty === 2 ? 0.68 : 0.78;
  const matched: number[] = [];

  let spokenIndex = 0;
  for (let expectedIndex = 0; expectedIndex < expectedWords.length; expectedIndex += 1) {
    const expectedWord = expectedWords[expectedIndex] ?? "";
    const spokenWord = spokenWords[spokenIndex] ?? "";

    if (!expectedWord || !spokenWord) {
      break;
    }

    if (wordSimilarity(expectedWord, spokenWord) >= threshold) {
      matched.push(expectedIndex);
      spokenIndex += 1;
      continue;
    }

    if (spokenWords[spokenIndex + 1] && wordSimilarity(expectedWord, spokenWords[spokenIndex + 1] ?? "") >= threshold) {
      spokenIndex += 1;
      matched.push(expectedIndex);
      spokenIndex += 1;
      continue;
    }
  }

  return matched;
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
  const [waveLevels, setWaveLevels] = useState<number[]>(Array.from({ length: ANALYSER_BAR_COUNT }, () => 0.18));
  const [showHintCard, setShowHintCard] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const nativeListenerRef = useRef<PluginListenerHandle | null>(null);
  const completedRef = useRef(false);
  const transcriptRef = useRef("");
  const expectedTextRef = useRef(expectedText);
  const onCompleteRef = useRef(onComplete);
  const hintTimerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const difficulty = getDifficulty(level);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

  const expectedWords = useMemo(() => cleanTranscript(expectedText), [expectedText]);
  const matchedIndexes = useMemo(() => matchedWordIndexes(expectedText, transcript, difficulty), [difficulty, expectedText, transcript]);

  const clearHintTimer = () => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  };

  const stopVisualizer = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setWaveLevels(Array.from({ length: ANALYSER_BAR_COUNT }, () => 0.18));
  };

  const startVisualizer = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const Context = window.AudioContext ?? window.webkitAudioContext;
    if (!Context) {
      return true;
    }

    const audioContext = new Context();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;

    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNodeRef.current = sourceNode;
    sourceNode.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (!analyserRef.current) {
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);
      const sliceSize = Math.floor(dataArray.length / ANALYSER_BAR_COUNT) || 1;
      const nextBars = Array.from({ length: ANALYSER_BAR_COUNT }, (_, index) => {
        const slice = dataArray.slice(index * sliceSize, (index + 1) * sliceSize);
        const average = slice.reduce((sum, value) => sum + value, 0) / (slice.length || 1);
        return Math.min(1, Math.max(0.12, average / 255));
      });

      setWaveLevels(nextBars);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    tick();
    return true;
  };

  const resetSessionVisuals = () => {
    transcriptRef.current = "";
    setTranscript("");
    setError(null);
    setShowHintCard(false);
    setStatus("idle");
    completedRef.current = false;
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

  useEffect(() => {
    let cancelled = false;

    const setupNative = async () => {
      if (!nativePlatform) {
        return false;
      }

      try {
        const availableResult = (await SpeechRecognition.available()) as boolean | { available?: boolean };
        const available = typeof availableResult === "boolean" ? availableResult : Boolean(availableResult?.available);
        if (!available) {
          return false;
        }

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
          const result = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);
          if (result.status === "correct") {
            completedRef.current = true;
            setStatus("correct");
            setIsListening(false);
            clearHintTimer();
            stopVisualizer();
            void SpeechRecognition.stop();
            onCompleteRef.current();
            return;
          }

          if (result.status === "almost-correct") {
            setStatus("almost-correct");
            setError("Con nói gần đúng rồi, thử nói rõ hơn một chút nhé.");
            return;
          }

          setStatus("processing");
        });

        if (!cancelled) {
          setEngine("native");
        }

        return true;
      } catch {
        return false;
      }
    };

    const setupBrowser = () => {
      if (!RecognitionCtor) {
        return false;
      }

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
          stopVisualizer();
          clearHintTimer();

          if (completedRef.current) {
            return;
          }

          const normalizedTranscript = transcriptRef.current;
          if (!normalizedTranscript) {
            setStatus("idle");
            return;
          }

          const candidates = [normalizedTranscript];
          const result = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);
          if (result.status === "correct") {
            completedRef.current = true;
            setStatus("correct");
            onCompleteRef.current();
            return;
          }

          if (result.status === "almost-correct") {
            setStatus("almost-correct");
            setError("Con nói gần đúng rồi, thử nói rõ hơn một chút nhé.");
            return;
          }

          setStatus("wrong");
          setError("Con nói chưa đúng lắm, thử lại nhé.");
        };

        recognition.onerror = (event) => {
          const errType = event?.error;
          if (errType === "aborted") return;

          clearHintTimer();
          stopVisualizer();
          setIsListening(false);
          if (errType === "no-speech") {
            setStatus("wrong");
            setError("Bé chưa kịp nói gì, bấm nút và thử lại nhé.");
          } else if (errType === "not-allowed" || errType === "service-not-allowed") {
            setStatus("wrong");
            setError("Chưa được cấp quyền micro. Vui lòng cấp quyền trong cài đặt trình duyệt.");
          } else if (errType === "network") {
            setStatus("wrong");
            setError("Lỗi kết nối mạng nhận diện giọng nói. Kiểm tra Wifi/4G.");
          } else {
            setStatus("wrong");
            setError("Thiết bị này chưa hỗ trợ hoặc đang chặn micro tạm thời.");
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

          const finalResult = resultsArray.some((result) => result.isFinal);
          const result = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);

          if (result.status === "correct") {
            completedRef.current = true;
            setStatus("correct");
            try {
              recognition.stop();
            } catch {
              // noop
            }
            onCompleteRef.current();
            return;
          }

          if (!finalResult) {
            setStatus("processing");
            return;
          }

          clearHintTimer();
          if (result.status === "almost-correct") {
            setStatus("almost-correct");
            setError("Con nói gần đúng rồi, thử nói rõ hơn một chút nhé.");
            return;
          }

          setStatus("wrong");
          setError("Con nói chưa đúng lắm, thử lại nhé.");
        };

        recognitionRef.current = recognition;
        if (!cancelled) {
          setEngine("browser");
        }

        return true;
      } catch {
        return false;
      }
    };

    void (async () => {
      const nativeReady = await setupNative();
      if (nativeReady) {
        return;
      }

      const browserReady = setupBrowser();
      if (!browserReady && !cancelled) {
        setEngine("unsupported");
      }
    })();

    return () => {
      cancelled = true;
      clearHintTimer();
      stopVisualizer();
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
      if (speechGranted) {
        return true;
      }

      const request = (await SpeechRecognition.requestPermissions()) as { speechRecognition?: string; microphone?: string };
      return request?.speechRecognition === "granted" || request?.microphone === "granted";
    } catch {
      return false;
    }
  };

  const replaySample = () => {
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

  const startHintTimer = () => {
    clearHintTimer();
    hintTimerRef.current = window.setTimeout(() => {
      if (transcriptRef.current) {
        return;
      }

      setError("Bé thử đọc to lên một chút nhé!");
      setShowHintCard(true);
    }, HINT_DELAY_MS);
  };

  const toggleListening = async () => {
    setError(null);
    setShowHintCard(false);

    if (typeof window !== "undefined" && !window.isSecureContext && !nativePlatform && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setStatus("wrong");
      setError("Nhận diện giọng nói yêu cầu truy cập qua địa chỉ bảo mật HTTPS trên di động.");
      return;
    }

    if (engine === "unsupported") {
      setStatus("wrong");
      setError("Thiết bị chưa sẵn sàng micro. Hãy thử trên Chrome hoặc cấp quyền micro.");
      return;
    }

    if (engine === "native") {
      if (isListening) {
        setIsListening(false);
        clearHintTimer();
        stopVisualizer();
        await SpeechRecognition.stop();
        const candidates = transcriptRef.current ? [transcriptRef.current] : [];
        const result = evaluateMultiCandidateMatch(expectedTextRef.current, candidates, difficulty);
        if (result.status === "correct") {
          setStatus("correct");
          onCompleteRef.current();
          return;
        }
        if (result.status === "almost-correct") {
          setStatus("almost-correct");
          setError("Con nói gần đúng rồi, thử nói rõ hơn một chút nhé.");
          return;
        }
        setStatus("wrong");
        setError("Con nói chưa đúng lắm, thử lại nhé.");
        return;
      }

      const granted = await ensureNativePermission();
      if (!granted) {
        setStatus("wrong");
        setError("Ứng dụng chưa được cấp quyền micro trên điện thoại.");
        return;
      }

      try {
        await startVisualizer();
      } catch {
        setError("Không thể kích hoạt micro trên điện thoại. Hãy thử lại.");
      }

      completedRef.current = false;
      transcriptRef.current = "";
      setTranscript("");
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
        stopVisualizer();
        setStatus("wrong");
        setIsListening(false);
        setError("Không thể bắt đầu ghi âm trên điện thoại. Hãy thử lại.");
      }
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("wrong");
      setError("Thiết bị chưa sẵn sàng micro. Hãy thử lại.");
      return;
    }

    if (isListening) {
      clearHintTimer();
      stopVisualizer();
      try {
        recognition.stop();
      } catch {
        // noop
      }
      return;
    }

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      try {
        await startVisualizer();
      } catch {
        setStatus("wrong");
        setError("Trình duyệt chưa được cấp quyền dùng Micro.");
        return;
      }
    }

    transcriptRef.current = "";
    setTranscript("");
    setStatus("listening");
    completedRef.current = false;
    startHintTimer();

    try {
      recognition.start();
    } catch {
      clearHintTimer();
      stopVisualizer();
      setError("Không thể bắt đầu ghi âm. Hãy thử bấm lại lần nữa.");
    }
  };

  const buttonLabel = isListening ? "Dừng ghi âm" : "Bấm để nói";
  const helperText =
    status === "correct"
      ? "Tuyệt vời! Bé đã đọc đúng rồi."
      : status === "almost-correct"
        ? "Con nói gần đúng rồi, thử lại một chút nữa nhé."
        : status === "wrong"
          ? "Bé hãy nói lại chậm hơn một chút nhé."
          : hint ?? "Bé bấm nút rồi đọc to từ/câu mẫu. App sẽ tự kiểm tra.";

  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-xl">
      <div className="text-center">
        <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Speak</div>
        <h3 className="mt-1 text-3xl font-black text-slate-900">{expectedText}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">{helperText}</p>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.96 }}
          animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          onClick={() => {
            void toggleListening();
          }}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-colors ${
            isListening ? "bg-pink-500 text-white" : engine === "unsupported" ? "bg-slate-200 text-slate-400" : "bg-emerald-500 text-white"
          }`}
          aria-label={buttonLabel}
        >
          {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
        </motion.button>
      </div>

      <div className="flex items-end justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-5">
        {waveLevels.map((levelValue, index) => (
          <motion.div
            key={index}
            animate={{ height: `${Math.max(18, levelValue * 60)}px` }}
            className={`w-3 rounded-full ${isListening ? "bg-emerald-400" : "bg-slate-300"}`}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-700">
        {transcript || (isListening ? "Bé hãy đọc theo mẫu ngay bây giờ..." : "Bé hãy bấm nút để bắt đầu nói.")}
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-center text-sm font-black">
        {expectedWords.map((word, index) => {
          const matched = matchedIndexes.includes(index);
          return (
            <span
              key={`${word}-${index}`}
              className={matched ? "rounded-full bg-emerald-100 px-3 py-1 text-emerald-600" : "rounded-full bg-slate-100 px-3 py-1 text-slate-400"}
            >
              {word}
            </span>
          );
        })}
      </div>

      {showHintCard ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-sm font-black text-amber-700">Bé thử đọc to lên một chút nhé! 🐝</p>
          <button type="button" onClick={replaySample} className="kid-button w-full border-sky-600 bg-sky-300 text-sky-950">
            <Volume2 className="h-4 w-4" />
            Nghe lại mẫu
          </button>
        </div>
      ) : null}

      {error ? <div className="text-center text-sm font-bold text-rose-600">{error}</div> : null}
      <div className="flex justify-center text-slate-500">
        <Volume2 className="h-4 w-4" />
      </div>
    </div>
  );
};
