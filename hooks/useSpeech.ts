"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WORD_RATE = 0.42;
const PHRASE_RATE = 0.5;
const SENTENCE_RATE = 0.58;
const WORD_PITCH = 0.96;
const PHRASE_PITCH = 0.98;
const SENTENCE_PITCH = 1;
const RESTART_DELAY_MS = 180;
const QUALITY_VOICE_PATTERN = /google|microsoft|samantha|jenny|aria|ava|zira|guy|davis/i;

export type SpeechKind = "word" | "phrase" | "sentence";
export type SpeechSource = "vocabulary" | "conversation" | "quiz" | "lesson";
export type SpeechMode = "manual" | "autoplay";
export type InterruptMode = "all" | "same-source" | "none";

export type SpeakOptions = {
  text: string;
  audioSrc?: string;
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
  const [lastFallbackReason, setLastFallbackReason] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const pendingTimerRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionCounterRef = useRef(0);
  const voicePrimedRef = useRef(false);
  const lastSpeechAtRef = useRef(0);

  const clearPendingTimer = useCallback(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const stopCurrentAudio = useCallback(() => {
    if (!currentAudioRef.current) {
      return;
    }

    currentAudioRef.current.pause();
    currentAudioRef.current.currentTime = 0;
    currentAudioRef.current.onended = null;
    currentAudioRef.current.onerror = null;
    currentAudioRef.current = null;
  }, []);

  const getSpeechSynthesis = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    return window.speechSynthesis;
  }, []);

  const createSession = useCallback((source: SpeechSource) => {
    void source;
    sessionCounterRef.current += 1;

    return sessionCounterRef.current;
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
      clearPendingTimer();
      stopCurrentAudio();
      speechSynthesis.cancel();
    };
  }, [clearPendingTimer, getSpeechSynthesis, loadVoices, stopCurrentAudio]);

  const stop = useCallback(
    (options?: StopOptions) => {
      void options;
      const speechSynthesis = getSpeechSynthesis();
      if (!speechSynthesis) {
        return;
      }

      requestIdRef.current += 1;
      clearPendingTimer();
      stopCurrentAudio();
      setIsSpeaking(false);
      speechSynthesis.cancel();
    },
    [clearPendingTimer, getSpeechSynthesis, stopCurrentAudio],
  );

  const speak = useCallback(
    (options: SpeakOptions) => {
      const speechSynthesis = getSpeechSynthesis();
      if (!speechSynthesis) {
        return;
      }

      const kind = options.kind ?? "sentence";
      const interrupt = options.interrupt ?? "all";
      const normalizedText = normalizeSpeechText(options.text, kind);

      if (!normalizedText) {
        return;
      }

      const availableVoices = voices.length ? voices : loadVoices();
      const voice = preferredVoice ?? pickPreferredVoice(availableVoices);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      clearPendingTimer();

      const finalize = (callback?: () => void) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        stopCurrentAudio();
        setIsSpeaking(false);
        callback?.();
      };

      const startSpeech = (skipPrime = false) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        }

        const needsPrime = !skipPrime && (!voicePrimedRef.current || Date.now() - lastSpeechAtRef.current > 12000);
        if (needsPrime) {
          const primer = new SpeechSynthesisUtterance(".");

          if (voice) {
            primer.voice = voice;
            primer.lang = voice.lang;
          } else {
            primer.lang = "en-US";
          }

          primer.rate = 0.3;
          primer.pitch = 1;
          primer.volume = 0.01;
          primer.onend = () => {
            if (requestIdRef.current !== requestId) {
              return;
            }

            voicePrimedRef.current = true;
            lastSpeechAtRef.current = Date.now();
            pendingTimerRef.current = window.setTimeout(() => {
              startSpeech(true);
            }, 60);
          };
          primer.onerror = () => {
            if (requestIdRef.current !== requestId) {
              return;
            }

            voicePrimedRef.current = true;
            startSpeech(true);
          };

          speechSynthesis.speak(primer);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(normalizedText);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = "en-US";
        }

        utterance.rate = options.rate ?? getDefaultRate(kind);
        utterance.pitch = options.pitch ?? getDefaultPitch(kind);
        utterance.volume = 1;

        utterance.onstart = () => {
          if (requestIdRef.current !== requestId) {
            return;
          }

          voicePrimedRef.current = true;
          lastSpeechAtRef.current = Date.now();
          setIsSpeaking(true);
          setLastFallbackReason(options.audioSrc ? "audio-fallback-speech" : null);
          options.onStart?.();
        };

        utterance.onend = () => finalize(options.onEnd);
        utterance.onerror = () => finalize();

        speechSynthesis.speak(utterance);
      };

      const tryAudioThenSpeech = () => {
        if (!options.audioSrc || requestIdRef.current !== requestId) {
          startSpeech();
          return;
        }

        const audio = new Audio(options.audioSrc);
        audio.preload = "auto";
        currentAudioRef.current = audio;

        const cleanupAudio = () => {
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          audio.onended = null;
          audio.onerror = null;
        };

        audio.onended = () => {
          cleanupAudio();
          finalize(options.onEnd);
        };

        audio.onerror = () => {
          cleanupAudio();
          setLastFallbackReason("audio-error");
          startSpeech();
        };

        audio
          .play()
          .then(() => {
            if (requestIdRef.current !== requestId) {
              audio.pause();
              cleanupAudio();
              return;
            }

            voicePrimedRef.current = true;
            lastSpeechAtRef.current = Date.now();
            setIsSpeaking(true);
            setLastFallbackReason(null);
            options.onStart?.();
          })
          .catch(() => {
            cleanupAudio();
            setLastFallbackReason("audio-play-failed");
            startSpeech();
          });
      };

      const hasActivePlayback = speechSynthesis.speaking || speechSynthesis.pending || currentAudioRef.current !== null;

      if (interrupt !== "none" && hasActivePlayback) {
        stopCurrentAudio();
        speechSynthesis.cancel();
        pendingTimerRef.current = window.setTimeout(() => {
          tryAudioThenSpeech();
        }, RESTART_DELAY_MS);
        return;
      }

      tryAudioThenSpeech();
    },
    [clearPendingTimer, getSpeechSynthesis, loadVoices, preferredVoice, stopCurrentAudio, voices],
  );

  const canSpeak = hydrated && Boolean(getSpeechSynthesis());
  const isReady = hydrated;

  return {
    voices,
    preferredVoice: isReady ? preferredVoice : null,
    canSpeak,
    isReady,
    isSpeaking,
    lastFallbackReason,
    createSession,
    speak,
    stop,
  };
};
