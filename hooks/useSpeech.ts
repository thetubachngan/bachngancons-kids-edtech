"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { playBufferedAudio } from "@/utils/preloadAudio";

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

type PlaybackHandle = {
  stop: () => void;
};

export const useSpeech = () => {
  const [hydrated, setHydrated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastFallbackReason, setLastFallbackReason] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const sessionCounterRef = useRef(0);
  const currentPlaybackRef = useRef<PlaybackHandle | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const createSession = useCallback((source: SpeechSource) => {
    void source;
    sessionCounterRef.current += 1;
    return sessionCounterRef.current;
  }, []);

  const stop = useCallback((options?: StopOptions) => {
    void options;
    requestIdRef.current += 1;
    currentPlaybackRef.current?.stop();
    currentPlaybackRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((options: SpeakOptions) => {
    if (!options.audioSrc) {
      setLastFallbackReason("missing-audio");
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    currentPlaybackRef.current?.stop();
    currentPlaybackRef.current = null;
    setIsSpeaking(false);
    setLastFallbackReason(null);

    const playback = playBufferedAudio(options.audioSrc, {
      onStart: () => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setIsSpeaking(true);
        options.onStart?.();
      },
      onEnd: () => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        currentPlaybackRef.current = null;
        setIsSpeaking(false);
        options.onEnd?.();
      },
      onError: () => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        currentPlaybackRef.current = null;
        setIsSpeaking(false);
        setLastFallbackReason("audio-error");
      },
    });

    currentPlaybackRef.current = playback;
  }, []);

  return {
    voices: [] as SpeechSynthesisVoice[],
    preferredVoice: null as SpeechSynthesisVoice | null,
    canSpeak: hydrated,
    isReady: hydrated,
    isSpeaking,
    lastFallbackReason,
    createSession,
    speak,
    stop,
  };
};
