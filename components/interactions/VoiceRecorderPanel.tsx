"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

type RecognitionAlternative = { transcript?: string };
type RecognitionResultLike = { 0?: RecognitionAlternative };
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
  const [error, setError] = useState<string | null>(null);
  const [mockValue, setMockValue] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

  useEffect(() => {
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setError("Thiết bị này không thể ghi âm tạm thời.");
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");
      setTranscript(text);
      if (normalize(text) === normalize(expectedText)) {
        onComplete();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [RecognitionCtor, expectedText, onComplete]);

  const startListening = () => {
    setError(null);
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Thiết bị này chưa hỗ trợ micro.");
      return;
    }

    try {
      recognition.start();
    } catch {
      setError("Không thể bắt đầu ghi âm. Hãy thử lại.");
    }
  };

  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-xl">
      <div className="text-center">
        <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Speak</div>
        <h3 className="mt-1 text-3xl font-black text-slate-900">{expectedText}</h3>
        {hint ? <p className="mt-2 text-sm font-semibold text-slate-600">{hint}</p> : null}
      </div>

      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.96 }}
          animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          onClick={startListening}
          className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${isListening ? "bg-pink-500 text-white" : "bg-emerald-500 text-white"} shadow-xl`}
        >
          {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
        </motion.button>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-700">
        {transcript || "Bé hãy bấm micro và nói theo mẫu."}
      </div>

      {!RecognitionCtor ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-700">Mock voice mode</p>
          <input
            value={mockValue}
            onChange={(e) => setMockValue(e.target.value)}
            placeholder="Gõ câu bé vừa nói"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (normalize(mockValue) === normalize(expectedText)) onComplete();
              else setError("Chưa khớp rồi, thử nói lại nhé!");
            }}
            className="kid-button w-full border-emerald-600 bg-emerald-300 text-emerald-950"
          >
            Tôi đã nói xong
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
