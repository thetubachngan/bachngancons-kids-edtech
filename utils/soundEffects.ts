"use client";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let celebrationContext: AudioContext | null = null;
let celebrationCloseTimer: number | null = null;
let lastCelebrationAt = 0;
const STEP_COOLDOWN_MS = 900;

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

const closeCelebrationContext = () => {
  if (!celebrationContext) {
    return;
  }

  const context = celebrationContext;
  celebrationContext = null;
  void context.close();
};

const scheduleCelebrationClose = (delayMs: number) => {
  if (celebrationCloseTimer !== null) {
    window.clearTimeout(celebrationCloseTimer);
  }

  celebrationCloseTimer = window.setTimeout(() => {
    celebrationCloseTimer = null;
    closeCelebrationContext();
  }, delayMs);
};

const ensureCelebrationContext = async () => {
  if (!celebrationContext) {
    celebrationContext = createAudioContext();
  }

  if (!celebrationContext) {
    return null;
  }

  if (celebrationContext.state === "suspended") {
    await celebrationContext.resume();
  }

  return celebrationContext;
};

const playNote = (ctx: AudioContext, frequency: number, startOffset: number, duration: number, volume = 0.12) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startOffset + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startOffset + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startOffset);
  oscillator.stop(ctx.currentTime + startOffset + duration);
};

export const stopCelebrationMusic = () => {
  if (celebrationCloseTimer !== null) {
    window.clearTimeout(celebrationCloseTimer);
    celebrationCloseTimer = null;
  }

  closeCelebrationContext();
};

export const playSuccessSound = async () => {
  const ctx = createAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  playNote(ctx, 523.25, 0, 0.18);
  playNote(ctx, 659.25, 0.12, 0.28);

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

export const playCelebrationStinger = async () => {
  if (typeof window !== "undefined") {
    const now = window.performance.now();
    if (now - lastCelebrationAt < STEP_COOLDOWN_MS) {
      return;
    }
    lastCelebrationAt = now;
  }

  const ctx = await ensureCelebrationContext();
  if (!ctx) {
    return;
  }

  playNote(ctx, 523.25, 0, 0.16, 0.08);
  playNote(ctx, 659.25, 0.08, 0.18, 0.1);
  playNote(ctx, 783.99, 0.18, 0.22, 0.11);

  scheduleCelebrationClose(700);
};

export const playCelebrationFanfare = async () => {
  const ctx = await ensureCelebrationContext();
  if (!ctx) {
    return;
  }

  playNote(ctx, 523.25, 0, 0.2, 0.1);
  playNote(ctx, 659.25, 0.14, 0.22, 0.11);
  playNote(ctx, 783.99, 0.28, 0.24, 0.12);
  playNote(ctx, 1046.5, 0.44, 0.42, 0.14);
  playNote(ctx, 1318.51, 0.54, 0.48, 0.13);

  scheduleCelebrationClose(1400);
};
