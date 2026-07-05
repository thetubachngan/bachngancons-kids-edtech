"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const isBrowser = typeof window !== "undefined";

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

  const loadVoices = useCallback(() => {
    if (!isBrowser || !window.speechSynthesis) {
      return;
    }

    const allVoices = window.speechSynthesis.getVoices();
    setVoices(allVoices);

    const englishVoice =
      allVoices.find((voice) => voice.lang === "en-US" && /google|microsoft|samantha/i.test(voice.name)) ??
      allVoices.find((voice) => voice.lang === "en-US") ??
      allVoices.find((voice) => voice.lang === "en-GB") ??
      allVoices.find((voice) => voice.lang.startsWith("en")) ??
      null;

    setPreferredVoice(englishVoice);
  }, []);

  useEffect(() => {
    if (!isBrowser || !window.speechSynthesis) {
      return;
    }

    const frame = window.requestAnimationFrame(loadVoices);
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.cancelAnimationFrame(frame);
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [loadVoices]);

  const speak = useCallback(
    (text: string, rate = 0.85) => {
      if (!isBrowser || !window.speechSynthesis || !text) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferredVoice?.lang ?? "en-US";
      utterance.rate = rate;
      utterance.pitch = 1.08;

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    },
    [preferredVoice],
  );

  const canSpeak = useMemo(() => isBrowser && "speechSynthesis" in window, []);

  return {
    voices,
    preferredVoice,
    canSpeak,
    speak,
  };
};
