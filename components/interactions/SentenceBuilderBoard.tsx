"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw, Check, Sparkles } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

export const SentenceBuilderBoard = ({
  sentence,
  translation,
  scrambledWords,
  questionAudioSrc,
  onComplete,
  onWrong,
}: {
  sentence: string;
  translation: string;
  scrambledWords: string[];
  questionAudioSrc?: string;
  onComplete: () => void;
  onWrong?: () => void;
}) => {
  const { speak } = useSpeech();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  // Preserve available pool of words indexed to handle duplicate words cleanly
  const availablePool = useMemo(() => {
    return scrambledWords.map((word, idx) => ({ id: `${word}-${idx}`, word }));
  }, [scrambledWords]);

  const [poolState, setPoolState] = useState<{ id: string; word: string; used: boolean }[]>(() =>
    availablePool.map((item) => ({ ...item, used: false })),
  );

  const targetWordsCount = useMemo(() => sentence.trim().split(/\s+/).length, [sentence]);

  const playSentenceAudio = () => {
    speak({
      text: sentence,
      audioSrc: questionAudioSrc,
      kind: "sentence",
      rate: 1.0,
      source: "lesson",
      mode: "manual",
      interrupt: "all",
    });
  };

  const handleSelectWord = (item: { id: string; word: string }) => {
    setPoolState((prev) => prev.map((p) => (p.id === item.id ? { ...p, used: true } : p)));
    setSelectedWords((prev) => [...prev, item.word]);
  };

  const handleRemoveWord = (index: number) => {
    const wordToRemove = selectedWords[index];
    if (!wordToRemove) return;

    // Find first used match in pool and release it
    setPoolState((prev) => {
      let released = false;
      return prev.map((p) => {
        if (!released && p.word === wordToRemove && p.used) {
          released = true;
          return { ...p, used: false };
        }
        return p;
      });
    });

    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedWords([]);
    setPoolState((prev) => prev.map((p) => ({ ...p, used: false })));
  };

  const handleCheck = () => {
    const builtSentence = selectedWords.join(" ").trim().toLowerCase();
    const cleanExpected = sentence.trim().toLowerCase();

    if (builtSentence === cleanExpected) {
      playSentenceAudio();
      onComplete();
    } else {
      setShake(true);
      onWrong?.();
      window.setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="space-y-5 rounded-[2.5rem] bg-gradient-to-b from-white to-amber-50/50 p-6 shadow-2xl border-4 border-white">
      {/* Prompt & Translation */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-800">
          <Sparkles className="h-3.5 w-3.5" /> Sentence Builder
        </div>

        <div className="flex items-center justify-center gap-3">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{translation}</h3>
          <button
            type="button"
            onClick={playSentenceAudio}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-400 text-sky-950 shadow-md active:scale-95"
            aria-label="Nghe câu mẫu"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Target Word Slots Line */}
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        className="min-h-[72px] flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-slate-900/5 p-4 border-2 border-dashed border-amber-300 shadow-inner"
      >
        {selectedWords.length === 0 ? (
          <span className="text-sm font-bold text-slate-400">Chạm các mảnh từ bên dưới để ghép câu...</span>
        ) : (
          selectedWords.map((word, idx) => (
            <motion.button
              key={`${word}-${idx}`}
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => handleRemoveWord(idx)}
              className="rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-2.5 text-base font-black text-white shadow-md active:translate-y-[2px]"
            >
              {word}
            </motion.button>
          ))
        )}
      </motion.div>

      {/* Scrambled Word Pool Chips */}
      <div className="flex flex-wrap justify-center gap-2 py-2">
        {poolState.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: item.used ? 1 : 1.05 }}
            whileTap={{ scale: item.used ? 1 : 0.94 }}
            onClick={() => !item.used && handleSelectWord(item)}
            disabled={item.used}
            className={`rounded-2xl border-b-4 px-4 py-2.5 text-base font-black transition-all ${
              item.used
                ? "border-slate-200 bg-slate-100 text-slate-300 opacity-40"
                : "border-sky-300 bg-white text-slate-800 shadow-md hover:border-sky-400"
            }`}
          >
            {item.word}
          </motion.button>
        ))}
      </div>

      {/* Controls: Reset & Submit Check */}
      <div className="flex justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm active:scale-95"
        >
          <RotateCcw className="h-4 w-4" /> Đặt lại
        </button>

        <button
          type="button"
          onClick={handleCheck}
          disabled={selectedWords.length !== targetWordsCount}
          className={`flex items-center gap-2 rounded-2xl border-b-4 px-6 py-2.5 text-sm font-black shadow-md transition-all ${
            selectedWords.length === targetWordsCount
              ? "border-emerald-600 bg-emerald-500 text-white active:translate-y-[2px]"
              : "border-slate-300 bg-slate-200 text-slate-400"
          }`}
        >
          <Check className="h-5 w-5" /> Kiểm tra
        </button>
      </div>
    </div>
  );
};
