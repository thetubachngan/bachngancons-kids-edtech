"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star, Sparkles, Trophy } from "lucide-react";

export const DailyStreakModal = ({
  open,
  streakDays,
  onClose,
}: {
  open: boolean;
  streakDays: number;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 p-6 text-center shadow-2xl text-slate-900 overflow-hidden"
        >
          {/* Flame Icon with Pulse Animation */}
          <div className="relative flex justify-center py-2">
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 shadow-xl border-4 border-white"
            >
              <Flame className="h-14 w-14 fill-amber-200 text-amber-100 drop-shadow-md" />
            </motion.div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/40 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-950">
              <Sparkles className="h-3.5 w-3.5" /> Chuỗi Ngày Học Đội Đỉnh!
            </div>
            <h3 className="text-3xl font-black text-amber-950 drop-shadow-sm">{streakDays} Ngày Liên Tiếp 🔥</h3>
            <p className="text-xs font-bold text-amber-950/80">
              Bé thật tuyệt vời! Học tiếng Anh mỗi ngày giúp bé giỏi hơn mỗi ngày! 🐝
            </p>
          </div>

          {/* Bonus Reward Badge */}
          <div className="my-4 flex items-center justify-center gap-2 rounded-2xl bg-white/90 p-3 shadow-md border border-white">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-black text-amber-950">Thưởng chuyên cần:</span>
            <span className="stat-chip bg-amber-300 text-amber-950 text-xs font-black py-1 px-2.5">
              +5 <Star className="h-3.5 w-3.5 fill-amber-600 text-amber-700 inline" />
            </span>
          </div>

          {/* Continue Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="kid-button w-full border-amber-800 bg-amber-900 text-amber-100 py-3 text-base shadow-xl active:translate-y-[2px]"
          >
            Vào Học Ngay 🚀
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
