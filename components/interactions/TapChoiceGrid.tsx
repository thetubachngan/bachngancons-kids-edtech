"use client";

import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import type { LessonChoice } from "@/data/learningSchema";

export const TapChoiceGrid = ({
  choices,
  selectedId,
  onSelect,
  onPreviewChoice,
  disabled,
  mode = "label",
}: {
  choices: LessonChoice[];
  selectedId?: string | null;
  onSelect: (choice: LessonChoice) => void;
  onPreviewChoice?: (choice: LessonChoice) => void;
  disabled?: boolean;
  mode?: "label" | "emoji";
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {choices.map((choice) => {
        const isActive = selectedId === choice.id;

        return (
          <div key={choice.id} className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(choice)}
              disabled={disabled}
              className={`w-full rounded-[1.75rem] border-2 bg-white p-4 text-center shadow-lg transition ${
                isActive ? "border-yellow-400 ring-4 ring-yellow-100" : "border-slate-200"
              } ${disabled ? "opacity-80" : "hover:-translate-y-1"}`}
            >
              <div className="flex min-h-24 items-center justify-center">
                {mode === "emoji" ? (
                  <div className="text-5xl">{choice.emoji ?? "🎯"}</div>
                ) : (
                  <div className="text-2xl font-black text-slate-900">{choice.label}</div>
                )}
              </div>
              {mode === "label" ? <div className="mt-2 text-sm font-bold text-slate-500">{choice.hint ?? choice.emoji ?? ""}</div> : null}
            </motion.button>
            {onPreviewChoice ? (
              <button
                type="button"
                onClick={() => onPreviewChoice(choice)}
                disabled={disabled}
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-[1.5rem] border-b-4 border-sky-600 bg-sky-300 px-4 py-3 text-base font-black text-sky-950 shadow-lg transition active:translate-y-[4px] active:border-b-0 sm:min-h-14"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm">
                  <Volume2 className="h-5 w-5" />
                </div>
                <span className="leading-none">Nghe từ</span>
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
