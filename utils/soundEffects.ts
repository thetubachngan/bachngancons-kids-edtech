"use client";

type AudioContextConstructor = typeof AudioContext & {
  prototype: AudioContext;
};

declare global {
  interface Window {
    webkitAudioContext?: AudioContextConstructor;
  }
}

const createAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const Context = window.AudioContext ?? window.webkitAudioContext;

  if (!Context) {
    return null;
  }

  return new Context();
};

export const playSuccessSound = async () => {
  const ctx = createAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const playNote = (frequency: number, startOffset: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startOffset + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + startOffset);
    oscillator.stop(ctx.currentTime + startOffset + duration);
  };

  playNote(523.25, 0, 0.18);
  playNote(659.25, 0.12, 0.28);

  window.setTimeout(() => {
    void ctx.close();
  }, 500);
};

export const playErrorSound = async () => {
  const ctx = createAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(220, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.24);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.28);

  window.setTimeout(() => {
    void ctx.close();
  }, 400);
};
