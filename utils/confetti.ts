"use client";

import confetti from "canvas-confetti";

export const triggerQuizSuccess = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.1, y: 0.6 },
    colors: ["#FCD34D", "#34D399", "#60A5FA", "#F472B6"],
  });

  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.9, y: 0.6 },
    colors: ["#FCD34D", "#34D399", "#60A5FA", "#F472B6"],
  });
};
