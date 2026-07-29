"use client";

import {
  playCelebrationFanfare,
  playCelebrationStinger,
  playErrorSound,
  playSuccessSound,
  stopCelebrationMusic,
} from "@/utils/soundEffects";

const playHtml5Audio = async (src: string) => {
  try {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.currentTime = 0;
    await audio.play();
    return true;
  } catch {
    return false;
  }
};

export const playFeedbackSound = async (kind: "correct" | "wrong") => {
  const src = kind === "correct" ? "/audio/sfx/correct.mp3" : "/audio/sfx/wrong.mp3";
  const played = await playHtml5Audio(src);

  if (played) {
    return;
  }

  if (kind === "correct") {
    await playSuccessSound();
    return;
  }

  await playErrorSound();
};

export const playCelebrationMusic = async (type: "step" | "lessonComplete") => {
  if (type === "lessonComplete") {
    await playCelebrationFanfare();
    return;
  }

  await playCelebrationStinger();
};

export { stopCelebrationMusic };
