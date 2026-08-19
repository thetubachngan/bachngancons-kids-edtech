"use client";

import { motion } from "framer-motion";
import { useLearningStore } from "@/store/learningStore";
import { ACCESSORY_ITEMS } from "@/components/gamification/MascotStoreModal";

type MascotMood = "happy" | "encouraging" | "celebrating" | "oops";

const moodMap: Record<MascotMood, { emoji: string; speech: string; bubble: string }> = {
  happy: {
    emoji: "🐝",
    speech: "Giỏi lắm!",
    bubble: "bg-yellow-300 text-yellow-950 border-yellow-400",
  },
  encouraging: {
    emoji: "🐝",
    speech: "Cùng Bee học nhé!",
    bubble: "bg-sky-300 text-sky-950 border-sky-400",
  },
  celebrating: {
    emoji: "🐝",
    speech: "Tuyệt vời quá!",
    bubble: "bg-pink-300 text-pink-950 border-pink-400",
  },
  oops: {
    emoji: "🐝",
    speech: "Thử lại nhé bé!",
    bubble: "bg-violet-300 text-violet-950 border-violet-400",
  },
};

export const Mascot = ({ mood = "happy", className }: { mood?: MascotMood; className?: string }) => {
  const { state } = useLearningStore();
  const config = moodMap[mood];
  const equippedAccessory = ACCESSORY_ITEMS.find((item) => item.id === state.equippedAccessoryId);

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className={className ?? "relative flex flex-col items-center"}
    >
      <div className="relative flex items-center justify-center">
        <span className="text-6xl drop-shadow-md sm:text-7xl">{config.emoji}</span>

        {/* Equipped Accessory Overlay */}
        {equippedAccessory && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl drop-shadow-lg"
          >
            {equippedAccessory.emoji}
          </motion.span>
        )}
      </div>

      <div className={`mt-2 rounded-full border px-4 py-1.5 text-xs font-black shadow-sm sm:text-sm ${config.bubble}`}>
        {config.speech}
      </div>
    </motion.div>
  );
};
