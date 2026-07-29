"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

import { playCelebrationMusic, stopCelebrationMusic } from "@/utils/html5Audio";
import { triggerLessonComplete } from "@/utils/confetti";

export const RewardOverlay = ({
  open,
  stars,
  streak,
  onClose,
}: {
  open: boolean;
  stars: number;
  streak: number;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!open) {
      stopCelebrationMusic();
      return;
    }

    triggerLessonComplete();
    void playCelebrationMusic("lessonComplete");

    return () => {
      stopCelebrationMusic();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 16 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-10 w-10 fill-yellow-400 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">Bé hoàn thành rồi!</h3>
            <p className="mt-2 text-base font-semibold text-slate-600">Nhận được {stars} sao vàng mới ✨</p>
            <p className="mt-1 text-sm font-bold text-orange-600">Chuỗi học hiện tại: {streak} ngày 🔥</p>
            <button type="button" onClick={onClose} className="kid-button mt-6 border-emerald-600 bg-emerald-400 text-emerald-950">
              Tiếp tục nào
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
