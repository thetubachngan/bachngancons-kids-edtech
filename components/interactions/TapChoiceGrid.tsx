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
    <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
      {choices.map((choice) => {
        const isActive = selectedId === choice.id;

        const handleTapCard = () => {
          if (disabled) return;
          if (onPreviewChoice) {
            onPreviewChoice(choice);
          }
          onSelect(choice);
        };

        const handleSpeakerOnly = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (disabled) return;
          if (onPreviewChoice) {
            onPreviewChoice(choice);
          }
        };

        return (
          <motion.div
            key={choice.id}
            whileTap={{ scale: 0.96 }}
            onClick={handleTapCard}
            className={`relative flex flex-col items-center justify-center min-h-[96px] sm:min-h-[110px] w-full cursor-pointer rounded-2xl border-2 border-b-4 p-3 text-center transition select-none ${
              isActive
                ? "border-amber-400 bg-amber-50 ring-4 ring-amber-200/60 border-b-amber-500"
                : "border-slate-200 bg-white hover:bg-slate-50 border-b-slate-300 active:border-b-2 active:translate-y-[2px]"
            } ${disabled ? "opacity-75 pointer-events-none" : ""}`}
          >
            {/* Small Audio Speaker Icon on Top Right */}
            {onPreviewChoice ? (
              <button
                type="button"
                onClick={handleSpeakerOnly}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm transition active:scale-90"
                aria-label={`Nghe phát âm ${choice.label}`}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            ) : null}

            {/* Visual Choice Content */}
            <div className="flex flex-col items-center justify-center gap-1 my-auto">
              {mode === "emoji" ? (
                <div className="text-4xl sm:text-5xl drop-shadow-sm">{choice.emoji ?? "🎯"}</div>
              ) : (
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{choice.label}</div>
              )}
              
              {choice.hint || (mode === "emoji" && choice.label) ? (
                <div className="text-xs font-bold text-slate-500 mt-0.5">
                  {choice.hint ?? choice.label}
                </div>
              ) : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

