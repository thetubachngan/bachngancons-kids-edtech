"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const isBrowser = typeof window !== "undefined";
const WORD_RATE = 0.74;
const SENTENCE_RATE = 0.78;
const WORD_PITCH = 1;
const SENTENCE_PITCH = 1.02;
const RAPID_REPEAT_WINDOW = 160;
const QUALITY_VOICE_PATTERN = /google|microsoft|samantha|jenny|aria|ava|zira|guy|davis/i;

export type SpeechKind = "word" | "sentence";

export type SpeakOptions = {
  text: string;
  kind?: SpeechKind;
  rate?: number;
  pitch?: number;
  interrupt?: boolean;
  onEnd?: () => void;
};

const normalizeSpeechText = (text: string, kind: SpeechKind) => {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  if (kind === "word") {
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }

  return trimmed;
};

const scoreVoice = (voice: SpeechSynthesisVoice) => {
  let score = 0;

  if (voice.lang === "en-US") {
    score += 100;
  } else if (voice.lang === "en-GB") {
    score += 70;
  } else if (voice.lang.startsWith("en")) {
    score += 50;
  }

  if (QUALITY_VOICE_PATTERN.test(voice.name)) {
    score += 20;
  }

  if (voice.localService) {
    score += 5;
  }

  return score;
};

const pickPreferredVoice = (availableVoices: SpeechSynthesisVoice[]) => {
  const englishVoices = availableVoices.filter((voice) => voice.lang.startsWith("en"));

  if (!englishVoices.length) {
    return null;
  }

  return [...englishVoices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] ?? null;
};

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const requestIdRef = useRef(0);
  const lastRequestRef = useRef<{ text: string; at: number } | null>(null);

  const loadVoices = useCallback(() => {
    if (!isBrowser || !window.speechSynthesis) {
      return;
    }

    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    setPreferredVoice(pickPreferredVoice(availableVoices));
  }, []);

  useEffect(() => {
    if (!isBrowser || !window.speechSynthesis) {
      return;
    }

    const speechSynthesis = window.speechSynthesis;
    const frame = window.requestAnimationFrame(loadVoices);
    const handleVoicesChanged = () => loadVoices();

    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      window.cancelAnimationFrame(frame);
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      speechSynthesis.cancel();
    };
  }, [loadVoices]);

  const stop = useCallback(() => {
    if (!isBrowser || !window.speechSynthesis) {
      return;
    }

    requestIdRef.current += 1;
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (options: SpeakOptions) => {
      if (!isBrowser || !window.speechSynthesis) {
        return;
      }

      const kind = options.kind ?? "sentence";
      const normalizedText = normalizeSpeechText(options.text, kind);

      if (!normalizedText) {
        return;
      }

      const now = window.performance.now();
      if (
        lastRequestRef.current &&
        lastRequestRef.current.text === normalizedText &&
        now - lastRequestRef.current.at < RAPID_REPEAT_WINDOW
      ) {
        return;
      }

      lastRequestRef.current = {
        text: normalizedText,
        at: now,
      };

      const speechSynthesis = window.speechSynthesis;
      if (!voices.length) {
        loadVoices();
      }

      if ((options.interrupt ?? true) && (speechSynthesis.speaking || speechSynthesis.pending)) {
        speechSynthesis.cancel();
      }

      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(normalizedText);
      const voice = preferredVoice ?? pickPreferredVoice(speechSynthesis.getVoices());

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.rate = options.rate ?? (kind === "word" ? WORD_RATE : SENTENCE_RATE);
      utterance.pitch = options.pitch ?? (kind === "word" ? WORD_PITCH : SENTENCE_PITCH);

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      currentUtteranceRef.current = utterance;

      const finalize = (callback?: () => void) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (currentUtteranceRef.current === utterance) {
          currentUtteranceRef.current = null;
        }

        setIsSpeaking(false);
        callback?.();
      };

      utterance.onstart = () => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setIsSpeaking(true);
      };

      utterance.onend = () => finalize(options.onEnd);
      utterance.onerror = () => finalize();

      speechSynthesis.speak(utterance);
    },
    [loadVoices, preferredVoice, voices.length],
  );

  const canSpeak = isBrowser && "speechSynthesis" in window;

  return {
    voices,
    preferredVoice,
    canSpeak,
    isSpeaking,
    speak,
    stop,
  };
};
