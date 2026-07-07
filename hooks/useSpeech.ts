"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WORD_RATE = 0.68;
const PHRASE_RATE = 0.72;
const SENTENCE_RATE = 0.76;
const WORD_PITCH = 0.98;
const PHRASE_PITCH = 1;
const SENTENCE_PITCH = 1.01;
const RAPID_REPEAT_WINDOW = 160;
const RESTART_DELAY_MS = 90;
const QUALITY_VOICE_PATTERN = /google|microsoft|samantha|jenny|aria|ava|zira|guy|davis/i;

export type SpeechKind = "word" | "phrase" | "sentence";
export type SpeechSource = "vocabulary" | "conversation" | "quiz";
export type SpeechMode = "manual" | "autoplay";
export type InterruptMode = "all" | "same-source" | "none";

export type SpeakOptions = {
  text: string;
  kind?: SpeechKind;
  rate?: number;
  pitch?: number;
  source?: SpeechSource;
  mode?: SpeechMode;
  interrupt?: InterruptMode;
  sessionId?: number | null;
  onStart?: () => void;
  onEnd?: () => void;
};

export type StopOptions = {
  source?: SpeechSource;
  sessionId?: number | null;
};

type BrokerState = {
  requestId: number;
  source: SpeechSource;
  sessionId: number | null;
};

let brokerRequestId = 0;
let brokerSessionCounter = 0;
let brokerCurrent: BrokerState | null = null;
let brokerPendingTimer: number | null = null;

const clearBrokerTimer = () => {
  if (brokerPendingTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(brokerPendingTimer);
  }

  brokerPendingTimer = null;
};

const normalizeSpeechText = (text: string, kind: SpeechKind) => {
  const trimmed = text.replace(/\s+/g, " ").trim();

  if (!trimmed) {
    return "";
  }

  if (kind === "word" || kind === "phrase") {
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  }

  return trimmed;
};

const scoreVoice = (voice: SpeechSynthesisVoice) => {
  let score = 0;

  if (voice.lang === "en-US") {
    score += 100;
  } else if (voice.lang === "en-GB") {
    score += 75;
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

const getDefaultRate = (kind: SpeechKind) => {
  if (kind === "word") {
    return WORD_RATE;
  }

  if (kind === "phrase") {
    return PHRASE_RATE;
  }

  return SENTENCE_RATE;
};

const getDefaultPitch = (kind: SpeechKind) => {
  if (kind === "word") {
    return WORD_PITCH;
  }

  if (kind === "phrase") {
    return PHRASE_PITCH;
  }

  return SENTENCE_PITCH;
};

export const useSpeech = () => {
  const [hydrated, setHydrated] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastRequestRef = useRef<{ text: string; at: number; source: SpeechSource } | null>(null);

  const getSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    return window.speechSynthesis;
  }, []);

  const createSession = useCallback((source: SpeechSource) => {
    void source;
    brokerSessionCounter += 1;

    return brokerSessionCounter;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const loadVoices = useCallback(() => {
    const speechSynthesis = getSpeechSynthesis();
    if (!speechSynthesis) {
      return [] as SpeechSynthesisVoice[];
    }

    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    setPreferredVoice(pickPreferredVoice(availableVoices));

    return availableVoices;
  }, [getSpeechSynthesis]);

  const ensureVoicesReady = useCallback(() => {
    const availableVoices = loadVoices();

    if (availableVoices.length) {
      return availableVoices;
    }

    const speechSynthesis = getSpeechSynthesis();
    return speechSynthesis?.getVoices() ?? [];
  }, [getSpeechSynthesis, loadVoices]);

  useEffect(() => {
    const speechSynthesis = getSpeechSynthesis();
    if (!speechSynthesis) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      loadVoices();
    });
    const handleVoicesChanged = () => {
      loadVoices();
    };

    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      window.cancelAnimationFrame(frame);
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      clearBrokerTimer();
      speechSynthesis.cancel();
    };
  }, [getSpeechSynthesis, loadVoices]);

  const stop = useCallback(
    (options?: StopOptions) => {
      const speechSynthesis = getSpeechSynthesis();
      if (!speechSynthesis) {
        return;
      }

      if (options?.source && brokerCurrent?.source && brokerCurrent.source !== options.source) {
        return;
      }

      if (options?.sessionId !== undefined && brokerCurrent?.sessionId !== options.sessionId) {
        return;
      }

      brokerRequestId += 1;
      brokerCurrent = null;
      currentUtteranceRef.current = null;
      clearBrokerTimer();
      setIsSpeaking(false);
      speechSynthesis.cancel();
    },
    [getSpeechSynthesis],
  );

  const speak = useCallback(
    (options: SpeakOptions) => {
      const speechSynthesis = getSpeechSynthesis();
      if (!speechSynthesis) {
        return;
      }

      const kind = options.kind ?? "sentence";
      const source = options.source ?? "vocabulary";
      const mode = options.mode ?? "manual";
      const interrupt = options.interrupt ?? "all";
      const normalizedText = normalizeSpeechText(options.text, kind);

      if (!normalizedText) {
        return;
      }

      const now = window.performance.now();
      if (
        lastRequestRef.current &&
        lastRequestRef.current.text === normalizedText &&
        lastRequestRef.current.source === source &&
        now - lastRequestRef.current.at < RAPID_REPEAT_WINDOW
      ) {
        return;
      }

      lastRequestRef.current = {
        text: normalizedText,
        at: now,
        source,
      };

      const availableVoices = ensureVoicesReady();
      const voice = preferredVoice ?? pickPreferredVoice(availableVoices);
      const hasActiveSpeech = speechSynthesis.speaking || speechSynthesis.pending || brokerPendingTimer !== null;
      const shouldInterrupt =
        interrupt !== "none" &&
        hasActiveSpeech &&
        (interrupt === "all" || brokerCurrent?.source === source || mode === "manual");

      const requestId = brokerRequestId + 1;
      brokerRequestId = requestId;
      brokerCurrent = {
        requestId,
        source,
        sessionId: options.sessionId ?? null,
      };
      currentUtteranceRef.current = null;

      if (shouldInterrupt) {
        clearBrokerTimer();
        speechSynthesis.cancel();
      }

      const startSpeech = () => {
        if (!brokerCurrent || brokerCurrent.requestId !== requestId) {
          return;
        }

        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(normalizedText);
        currentUtteranceRef.current = utterance;

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = "en-US";
        }

        utterance.rate = options.rate ?? getDefaultRate(kind);
        utterance.pitch = options.pitch ?? getDefaultPitch(kind);
        utterance.volume = 1;

        const finalize = (callback?: () => void) => {
          if (!brokerCurrent || brokerCurrent.requestId !== requestId) {
            return;
          }

          brokerCurrent = null;
          currentUtteranceRef.current = null;
          setIsSpeaking(false);
          callback?.();
        };

        utterance.onstart = () => {
          if (!brokerCurrent || brokerCurrent.requestId !== requestId) {
            return;
          }

          setIsSpeaking(true);
          options.onStart?.();
        };

        utterance.onend = () => finalize(options.onEnd);
        utterance.onerror = () => finalize();

        speechSynthesis.speak(utterance);
      };

      if (shouldInterrupt) {
        brokerPendingTimer = window.setTimeout(() => {
          brokerPendingTimer = null;
          startSpeech();
        }, RESTART_DELAY_MS);
        return;
      }

      startSpeech();
    },
    [ensureVoicesReady, getSpeechSynthesis, preferredVoice],
  );

  const canSpeak = hydrated && Boolean(getSpeechSynthesis());
  const isReady = hydrated;

  return {
    voices,
    preferredVoice: isReady ? preferredVoice : null,
    canSpeak,
    isReady,
    isSpeaking,
    createSession,
    speak,
    stop,
  };
};
