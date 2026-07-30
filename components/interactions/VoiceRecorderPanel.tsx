"use client";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import { evaluateSpeechMatch, type SpeechDifficulty } from "@/utils/speechMatch";

type RecognitionAlternative = { transcript?: string; confidence?: number };
type RecognitionResultLike = { 0?: RecognitionAlternative; isFinal?: boolean };
type RecognitionEventLike = { results: ArrayLike<RecognitionResultLike> };
type SpeechRecognitionErrorEventLike = { error?: string; message?: string };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
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

const nativePlatform = Capacitor.isNativePlatform();

const extractNativeTranscript = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const maybeMatches = payload as { matches?: string[]; value?: string; transcript?: string };

  if (Array.isArray(maybeMatches.matches)) {
    return maybeMatches.matches.join(" ").trim();
  }

  return maybeMatches.value ?? maybeMatches.transcript ?? "";
};

const getDifficulty = (level?: number): SpeechDifficulty => {
  if (!level || level <= 1) return 1;
  if (level >= 3) return 3;
  return 2;
};

export const VoiceRecorderPanel = ({
  expectedText,
  onComplete,
  hint,
  level,
}: {
  expectedText: string;
  onComplete: () => void;
  hint?: string;
  level?: number;
}) => {
  const [engine, setEngine] = useState<Engine>("unsupported");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "correct" | "almost-correct" | "wrong">("idle");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const nativeListenerRef = useRef<PluginListenerHandle | null>(null);
  const completedRef = useRef(false);
  const transcriptRef = useRef("");
  const expectedTextRef = useRef(expectedText);
  const onCompleteRef = useRef(onComplete);
  const difficulty = getDifficulty(level);

  useEffect(() => {
    expectedTextRef.current = expectedText;
    onCompleteRef.current = onComplete;
    const timer = window.setTimeout(() => {
      transcriptRef.current = "";
      setTranscript("");
      setStatus("idle");
      setError(null);
      setIsListening(false);
      completedRef.current = false;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [expectedText, onComplete]);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

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
          const text = extractNativeTranscript(payload);
          transcriptRef.current = text;
          setTranscript(text);

          if (!text) {
            setStatus("processing");
            return;
          }

          const result = evaluateSpeechMatch(expectedTextRef.current, text, difficulty);
          if (result.status === "correct") {
            completedRef.current = true;
            setStatus("correct");
            setIsListening(false);
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

        recognition.onstart = () => {
          completedRef.current = false;
          setError(null);
          setStatus("listening");
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (completedRef.current) {
            return;
          }

          const normalizedTranscript = transcriptRef.current;
          if (!normalizedTranscript) {
            setStatus("idle");
            return;
          }

          const result = evaluateSpeechMatch(expectedTextRef.current, normalizedTranscript, difficulty);
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
          const text = resultsArray
            .map((result) => result[0]?.transcript ?? "")
            .join(" ")
            .trim();

          transcriptRef.current = text;
          setTranscript(text);

          const finalResult = resultsArray.some((result) => result.isFinal);
          if (!finalResult) {
            setStatus("processing");
            return;
          }

          const result = evaluateSpeechMatch(expectedTextRef.current, text, difficulty);
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

  const toggleListening = async () => {
    setError(null);

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
        await SpeechRecognition.stop();
        return;
      }

      const granted = await ensureNativePermission();
      if (!granted) {
        setStatus("wrong");
        setError("Ứng dụng chưa được cấp quyền micro trên điện thoại.");
        return;
      }

      completedRef.current = false;
      transcriptRef.current = "";
      setTranscript("");
      setStatus("listening");
      setIsListening(true);

      try {
        await SpeechRecognition.start({
          language: "en-US",
          maxResults: 1,
          partialResults: true,
          popup: false,
        });
      } catch {
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
      try {
        recognition.stop();
      } catch {
        // noop
      }
      return;
    }

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
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

    try {
      recognition.start();
    } catch {
      setError("Không thể bắt đầu ghi âm. Hãy thử bấm lại lần nữa.");
    }
  };

  const buttonLabel = isListening ? "Dừng ghi âm" : "Bấm để nói";
  const helperText =
    status === "correct"
      ? "Tuyệt vời! Bé đã đọc đúng rồi."
      : status === "almost-correct"
        ? "Con nói gần đúng rồi, thử nói rõ hơn một chút nhé."
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

      <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-700">
        {transcript || (isListening ? "Bé hãy đọc theo mẫu ngay bây giờ..." : "Bé hãy bấm nút để bắt đầu nói.")}
      </div>

      {error ? <div className="text-center text-sm font-bold text-rose-600">{error}</div> : null}
      <div className="flex justify-center text-slate-500">
        <Volume2 className="h-4 w-4" />
      </div>
    </div>
  );
};
