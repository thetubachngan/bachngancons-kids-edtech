"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

type RecognitionAlternative = { transcript?: string; confidence?: number };
type RecognitionResultLike = { 0?: RecognitionAlternative; isFinal?: boolean };
type RecognitionEventLike = { results: ArrayLike<RecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
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

const normalize = (text: string) => text.replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim().toLowerCase();

export const VoiceRecorderPanel = ({
  expectedText,
  onComplete,
  hint,
}: {
  expectedText: string;
  onComplete: () => void;
  hint?: string;
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "correct" | "wrong" | "unsupported">("idle");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const completedRef = useRef(false);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

  useEffect(() => {
    if (!RecognitionCtor) {
      setStatus("unsupported");
      return;
    }

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

      const normalizedTranscript = normalize(transcript);
      if (!normalizedTranscript) {
        setStatus("idle");
        return;
      }

      if (normalizedTranscript === normalize(expectedText)) {
        completedRef.current = true;
        setStatus("correct");
        onComplete();
        return;
      }

      setStatus("wrong");
      setError("Con nói chưa đúng lắm, thử lại nhé.");
    };

    recognition.onerror = () => {
      setError("Thiết bị này chưa hỗ trợ hoặc đang chặn micro tạm thời.");
      setStatus("unsupported");
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");
      setTranscript(text);

      if (normalize(text) === normalize(expectedText)) {
        completedRef.current = true;
        setStatus("correct");
        recognition.stop();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [RecognitionCtor, expectedText, onComplete, transcript]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("unsupported");
      setError("Thiết bị này chưa hỗ trợ micro. Hãy thử trên trình duyệt khác hoặc cấp quyền micro.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    setTranscript("");
    setError(null);
    setStatus("idle");

    try {
      recognition.start();
    } catch {
      setError("Không thể bắt đầu ghi âm. Hãy thử lại.");
    }
  };

  const buttonLabel = isListening ? "Dừng ghi âm" : "Bấm để nói";
  const helperText =
    status === "correct"
      ? "Tuyệt vời! Bé đã đọc đúng rồi."
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
          onClick={toggleListening}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-xl ${
            isListening ? "bg-pink-500 text-white" : status === "unsupported" ? "bg-slate-200 text-slate-400" : "bg-emerald-500 text-white"
          }`}
          aria-label={buttonLabel}
          disabled={status === "unsupported" && !RecognitionCtor}
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
