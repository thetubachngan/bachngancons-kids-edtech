"use client";

import { type MouseEvent, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Volume2 } from "lucide-react";

import type { TopicTheme, VocabularyWord } from "@/data/englishData";

type FlashcardProps = {
  word: VocabularyWord;
  theme: TopicTheme;
  practiceCount: number;
  isLearned: boolean;
  onHearWord: () => void;
  onHearExample: () => void;
};

export const Flashcard = ({
  word,
  theme,
  practiceCount,
  isLearned,
  onHearWord,
  onHearExample,
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const stopCardFlip = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="perspective-1000 h-[27rem] w-full cursor-pointer" onClick={() => setIsFlipped((prev) => !prev)}>
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="backface-hidden absolute inset-0 flex h-full flex-col rounded-[2rem] border-4 border-yellow-200 bg-white p-5 shadow-[0_18px_0_rgba(250,204,21,0.22)]">
          <div className="flex items-start justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.badgeClass}`}>{word.translation}</span>
            {isLearned ? (
              <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-yellow-950">Thuộc rồi ⭐</span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Nghe {Math.min(practiceCount, 3)}/3</span>
            )}
          </div>

          <div className="my-auto flex flex-col items-center justify-center text-center">
            <div className="mb-4 text-7xl drop-shadow-sm sm:text-8xl">{word.emoji}</div>
            <h3 className="text-3xl font-extrabold tracking-wide text-slate-800">{word.word}</h3>
            <p className="mt-2 text-base font-semibold text-slate-500">{word.phonetic}</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">Bấm vào thẻ để lật mặt sau và xem câu ví dụ dễ nhớ nhé.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={(event) => {
                stopCardFlip(event);
                onHearWord();
              }}
              className={`kid-button ${theme.buttonClass}`}
            >
              <Volume2 className="h-4 w-4" />
              Nghe từ
            </button>
            <button
              type="button"
              onClick={(event) => {
                stopCardFlip(event);
                setIsFlipped(true);
              }}
              className="kid-button border-cyan-600 bg-cyan-300 text-cyan-950"
            >
              <RotateCcw className="h-4 w-4" />
              Lật thẻ
            </button>
          </div>
        </div>

        <div className="backface-hidden rotate-y-180 absolute inset-0 flex h-full flex-col rounded-[2rem] border-4 border-yellow-200 bg-yellow-100 p-5 shadow-[0_18px_0_rgba(250,204,21,0.22)]">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600">Ví dụ đơn giản</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.badgeClass}`}>{word.word}</span>
          </div>

          <div className="my-auto space-y-5 text-center">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-5xl shadow-sm">{word.emoji}</div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">English</p>
              <h4 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">{word.example}</h4>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Tiếng Việt</p>
              <p className="mt-2 text-lg font-semibold text-slate-700 sm:text-xl">{word.exampleTranslation}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={(event) => {
                stopCardFlip(event);
                onHearExample();
              }}
              className={`kid-button ${theme.buttonClass}`}
            >
              <Volume2 className="h-4 w-4" />
              Nghe ví dụ
            </button>
            <button
              type="button"
              onClick={(event) => {
                stopCardFlip(event);
                setIsFlipped(false);
              }}
              className="kid-button border-violet-600 bg-violet-300 text-violet-950"
            >
              <Sparkles className="h-4 w-4" />
              Lật lại
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
