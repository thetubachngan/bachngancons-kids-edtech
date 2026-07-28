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
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-5 shadow-xl">
        <div className="mb-4 text-center text-sm font-black uppercase tracking-[0.25em] text-slate-500">Kéo thả chữ cái để tạo thành từ</div>
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
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-2xl font-black text-slate-900"
            >
              {slots[index] || ""}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" onClick={removeLast} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            Xóa ký tự cuối
          </button>
          <button type="button" onClick={reset} className="rounded-2xl bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
            Làm lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
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
            className="rounded-2xl bg-white px-4 py-4 text-center text-2xl font-black shadow-md transition active:scale-[0.97]"
          >
            {letter}
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-semibold text-slate-500">Bé có thể kéo hoặc bấm từng chữ cái.</p>
    </div>
  );
};
