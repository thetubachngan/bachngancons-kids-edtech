"use client";

import { type DragEvent, useCallback, useEffect, useRef, useState } from "react";

const normalize = (value: string) => value.replace(/\s+/g, "").toUpperCase();

export const LetterBoard = ({
  answer,
  letterBank,
  onComplete,
  onWrong,
  disabled,
}: {
  answer: string;
  letterBank: string[];
  onComplete: () => void;
  onWrong: () => void;
  disabled?: boolean;
}) => {
  const normalizedAnswer = normalize(answer);
  const [slots, setSlots] = useState<string[]>(Array.from({ length: normalizedAnswer.length }, () => ""));
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const reset = useCallback(() => {
    submittedRef.current = false;
    setSlots(Array.from({ length: normalizedAnswer.length }, () => ""));
    setActiveLetter(null);
  }, [normalizedAnswer.length]);

  const placeLetter = (letter: string, targetIndex?: number) => {
    if (disabled) return;

    setSlots((current) => {
      const next = [...current];
      const indexToFill = typeof targetIndex === "number" ? targetIndex : next.findIndex((slot) => !slot);
      if (indexToFill < 0 || indexToFill >= next.length) {
        return current;
      }

      next[indexToFill] = letter;
      return next;
    });
  };

  const removeLast = () => {
    setSlots((current) => {
      const next = [...current];
      const filledIndexes = next.map((slot, index) => ({ slot, index })).filter((item) => Boolean(item.slot));
      const last = filledIndexes[filledIndexes.length - 1];
      if (!last) {
        return current;
      }
      next[last.index] = "";
      return next;
    });
  };

  useEffect(() => {
    if (disabled || submittedRef.current) {
      return;
    }

    const formed = slots.join("");
    if (slots.some((slot) => !slot)) {
      return;
    }

    submittedRef.current = true;
    const timer = window.setTimeout(() => {
      if (formed === normalizedAnswer) {
        onComplete();
        return;
      }

      onWrong();
      reset();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [disabled, normalizedAnswer, onComplete, onWrong, reset, slots]);

  useEffect(() => {
    if (!disabled) {
      submittedRef.current = false;
    }
  }, [disabled]);

  return (
    <div className="space-y-4 w-full max-w-md mx-auto select-none">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bấm hoặc kéo chữ cái vào ô</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from(normalizedAnswer).map((_, index) => (
            <div
              key={index}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const letter = e.dataTransfer.getData("text/plain");
                placeLetter(letter, index);
              }}
              onClick={() => activeLetter && placeLetter(activeLetter, index)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-xl font-black text-slate-800 shadow-inner cursor-pointer"
            >
              {slots[index] || ""}
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          <button type="button" onClick={removeLast} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition active:scale-95">
            Xóa ký tự cuối
          </button>
          <button type="button" onClick={reset} className="rounded-xl bg-pink-100 px-3 py-1.5 text-xs font-bold text-pink-700 transition active:scale-95">
            Làm lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {letterBank.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            draggable
            onDragStart={(e: DragEvent<HTMLButtonElement>) => {
              e.dataTransfer.setData("text/plain", letter);
              setActiveLetter(letter);
            }}
            onDragEnd={() => setActiveLetter(null)}
            onClick={() => placeLetter(letter)}
            className="flex h-12 items-center justify-center rounded-xl border-2 border-b-4 border-slate-200 bg-white text-xl font-black text-slate-800 shadow-sm transition active:translate-y-[2px] active:border-b-2"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};
