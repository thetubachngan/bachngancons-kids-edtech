"use client";

import { motion } from "framer-motion";

type FloatingMascotProps = {
  name: string;
  emoji: string;
  speech: string;
  className?: string;
};

const floatTransition = {
  duration: 2.4,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
};

export const FloatingMascot = ({ name, emoji, speech, className }: FloatingMascotProps) => {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={floatTransition}
      className={className ?? "flex flex-col items-center"}
    >
      <span className="select-none text-6xl drop-shadow-md sm:text-7xl">{emoji}</span>
      <div className="mt-2 rounded-full border border-yellow-500 bg-yellow-300 px-3 py-1 text-center text-xs font-bold text-yellow-950 shadow-sm sm:text-sm">
        {name}: {speech}
      </div>
    </motion.div>
  );
};
