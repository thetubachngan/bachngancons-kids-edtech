"use client";

import { motion } from "framer-motion";

type MascotMood = "happy" | "encouraging" | "celebrating" | "oops";

const moodMap: Record<MascotMood, { emoji: string; speech: string; bubble: string }> = {
  happy: {
    emoji: "🐝",
    speech: "Giỏi lắm!",
    bubble: "bg-yellow-300 text-yellow-950 border-yellow-400",
  },
  encouraging: {
    emoji: "🌟",
    speech: "Thử lại nhé!",
    bubble: "bg-sky-300 text-sky-950 border-sky-400",
  },
  celebrating: {
    emoji: "🎉",
    speech: "Hoàn thành rồi!",
    bubble: "bg-pink-300 text-pink-950 border-pink-400",
  },
  oops: {
    emoji: "😺",
    speech: "Không sao đâu!",
    bubble: "bg-violet-300 text-violet-950 border-violet-400",
  },
};

export const Mascot = ({ mood = "happy", className }: { mood?: MascotMood; className?: string }) => {
  const config = moodMap[mood];

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className={className ?? "flex flex-col items-center"}
    >
      <div className="text-6xl drop-shadow-md sm:text-7xl">{config.emoji}</div>
      <div className={`mt-2 rounded-full border px-4 py-2 text-xs font-black shadow-sm sm:text-sm ${config.bubble}`}>
        {config.speech}
      </div>
    </motion.div>
  );
};
