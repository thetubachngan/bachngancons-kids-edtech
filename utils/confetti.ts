"use client";

import confetti from "canvas-confetti";

const celebrationColors = ["#FCD34D", "#34D399", "#60A5FA", "#F472B6"];

export const triggerStepSuccess = () => {
  confetti({
    particleCount: 50,
    spread: 52,
    origin: { x: 0.2, y: 0.65 },
    colors: celebrationColors,
  });

  confetti({
    particleCount: 50,
    spread: 52,
    origin: { x: 0.8, y: 0.65 },
    colors: celebrationColors,
  });
};

export const triggerLessonComplete = () => {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    colors: celebrationColors,
  });

  confetti({
    particleCount: 120,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
    colors: celebrationColors,
  });
};

export const triggerQuizSuccess = triggerStepSuccess;
