"use client";

import { motion } from "framer-motion";
import type { LessonChoice } from "@/data/learningSchema";

export const TapChoiceGrid = ({
  choices,
  selectedId,
  onSelect,
  disabled,
  mode = "label",
}: {
  choices: LessonChoice[];
  selectedId?: string | null;
  onSelect: (choice: LessonChoice) => void;
  disabled?: boolean;
  mode?: "label" | "emoji";
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {choices.map((choice) => {
        const isActive = selectedId === choice.id;

        return (
          <motion.button
            key={choice.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            className={`rounded-[1.75rem] border-2 bg-white p-4 text-center shadow-lg transition ${
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
        );
      })}
    </div>
  );
};
