"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles, ArrowRight, RotateCw } from "lucide-react";
import type { FlashcardItem } from "@/data/learningSchema";
import { useSpeech } from "@/hooks/useSpeech";

export const FlashcardPreview = ({
  items,
  onComplete,
}: {
  items: FlashcardItem[];
  onComplete: () => void;
}) => {
  const { speak } = useSpeech();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentItem = items[currentIndex] ?? items[0];

  const playAudio = () => {
    if (!currentItem) return;
    speak({
      text: currentItem.word,
      audioSrc: currentItem.audioSrc,
      kind: "word",
      rate: 0.4,
      source: "lesson",
      mode: "manual",
      interrupt: "all",
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const toggleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    playAudio();
  };

  if (!currentItem) return null;

  return (
    <div className="space-y-3 sm:space-y-5 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-white to-sky-50/50 p-3.5 sm:p-6 shadow-2xl border-4 border-white text-center">
      <div className="space-y-0.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-0.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-sky-800">
          <Sparkles className="h-3.5 w-3.5" /> Khám phá từ mới ({currentIndex + 1}/{items.length})
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-600">Chạm vào thẻ 3D để lật xem nghĩa & nghe phát âm nhé! 🐝</p>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 flex justify-center py-1 sm:py-2">
        <motion.div
          key={currentItem.id}
          onClick={toggleFlip}
          className="relative h-52 sm:h-64 w-full max-w-sm cursor-pointer rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-2xl"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border-4 border-sky-200 bg-gradient-to-b from-white to-sky-50 p-4 sm:p-6 shadow-md backface-hidden">
            <span className="text-5xl sm:text-6xl">{currentItem.emoji ?? "🌟"}</span>
            <div className="space-y-0.5">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900">{currentItem.word}</h3>
              {currentItem.phonetic && <p className="text-sm sm:text-base font-semibold text-slate-500">{currentItem.phonetic}</p>}
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black text-sky-700">
              <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Chạm để lật mặt sau
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100 p-4 sm:p-6 shadow-md backface-hidden rotate-y-180">
            <span className="text-3xl sm:text-4xl">💡</span>
            <div className="space-y-1.5">
              <h4 className="text-2xl sm:text-3xl font-black text-amber-950">{currentItem.translation}</h4>
              {currentItem.example && (
                <p className="text-xs sm:text-sm font-bold text-amber-900 bg-white/60 rounded-xl p-2 border border-amber-200">
                  "{currentItem.example}"
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black text-amber-800">
              <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Chạm để quay lại mặt trước
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={playAudio}
          className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border-b-4 border-sky-600 bg-sky-400 px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black text-sky-950 shadow-md active:translate-y-[2px]"
        >
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> 🔊 Nghe mẫu
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-md active:translate-y-[2px]"
        >
          {currentIndex < items.length - 1 ? (
            <>Từ tiếp theo <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" /></>
          ) : (
            <>Bắt đầu Quiz 🚀</>
          )}
        </button>
      </div>
    </div>
  );
};
