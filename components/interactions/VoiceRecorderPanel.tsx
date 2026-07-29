"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Play, Square, Volume2 } from "lucide-react";
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
  MediaRecorder?: typeof MediaRecorder;
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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [mockValue, setMockValue] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const RecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const anyWindow = window as RecognitionWindow;
    return anyWindow.SpeechRecognition ?? anyWindow.webkitSpeechRecognition ?? null;
  }, []);

  const hasMediaRecorder = useMemo(() => {
    if (typeof window === "undefined") return false;
    const anyWindow = window as RecognitionWindow;
    return Boolean(anyWindow.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  }, []);

  useEffect(() => {
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setError("Thiết bị này không thể nhận diện giọng nói lúc này. Bé có thể dùng chế độ ghi âm dự phòng bên dưới.");
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

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const startRecognition = () => {
    setError(null);
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Thiết bị này chưa hỗ trợ nhận diện giọng nói. Bé hãy dùng chế độ ghi âm dự phòng.");
      return;
    }

    try {
      recognition.start();
    } catch {
      setError("Không thể bắt đầu nhận diện giọng nói. Hãy thử lại.");
    }
  };

  const startRecording = async () => {
    if (!hasMediaRecorder) {
      setError("Thiết bị này chưa hỗ trợ ghi âm micro.");
      return;
    }

    setError(null);
    setTranscript("");
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => setIsRecording(true);
      recorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const nextUrl = URL.createObjectURL(blob);
        setRecordedUrl(nextUrl);
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };

      recorder.start();
    } catch {
      setError("Không thể mở micro trên thiết bị này. Hãy cấp quyền micro cho ứng dụng rồi thử lại.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
  };

  const useFallbackRecording = !RecognitionCtor && hasMediaRecorder;

  return (
    <div className="space-y-4 rounded-[2rem] bg-white p-5 shadow-xl">
      <div className="text-center">
        <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Speak</div>
        <h3 className="mt-1 text-3xl font-black text-slate-900">{expectedText}</h3>
        {hint ? <p className="mt-2 text-sm font-semibold text-slate-600">{hint}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          onClick={startRecognition}
          className={`kid-button justify-center ${RecognitionCtor ? "border-emerald-600 bg-emerald-300 text-emerald-950" : "border-slate-300 bg-slate-100 text-slate-400"}`}
          disabled={!RecognitionCtor || isRecording}
        >
          {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          Nói & kiểm tra
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          animate={isRecording ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`kid-button justify-center ${useFallbackRecording ? "border-sky-600 bg-sky-300 text-sky-950" : "border-slate-300 bg-slate-100 text-slate-400"}`}
          disabled={!hasMediaRecorder || isListening}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {isRecording ? "Dừng ghi âm" : "Ghi âm dự phòng"}
        </motion.button>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-700">
        {transcript || (isRecording ? "Đang ghi âm giọng của bé..." : "Bé hãy bấm micro và nói theo mẫu.")}
      </div>

      {recordedUrl ? (
        <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm font-bold text-sky-700">Bé đã ghi âm xong, hãy nghe lại rồi hoàn thành.</p>
          <audio controls className="w-full" src={recordedUrl} />
          <button type="button" onClick={onComplete} className="kid-button w-full border-emerald-600 bg-emerald-300 text-emerald-950">
            <Play className="h-4 w-4" />
            Tôi đã nói xong
          </button>
        </div>
      ) : null}

      {!RecognitionCtor && !hasMediaRecorder ? (
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
