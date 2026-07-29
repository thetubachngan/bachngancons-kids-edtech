"use client";

import { motion } from "framer-motion";
import { Lock, Star, Play, Check } from "lucide-react";

import type { Curriculum } from "@/data/learningSchema";
import { getNodeState } from "@/store/learningStore";

export const LearningMap = ({
  curriculum,
  completedLessonIds,
  currentLessonId,
  unlockedLessonIds,
  onStartLesson,
}: {
  curriculum: Curriculum;
  completedLessonIds: string[];
  currentLessonId: string | null;
  unlockedLessonIds: string[];
  onStartLesson: (lessonId: string) => void;
}) => {
  return (
    <div className="w-full max-w-lg mx-auto pb-24 px-4 select-none">
      {curriculum.units.map((unit) => (
        <section key={unit.id} className="mb-10 flex flex-col items-center">
          {/* Unit Header Banner */}
          <div className="mb-8 w-full rounded-3xl border-2 border-b-4 border-amber-300 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-center text-white shadow-lg">
            <span className="inline-block rounded-full bg-white/30 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-950">
              Level {unit.level}
            </span>
            <h2 className="mt-1 text-2xl font-black drop-shadow-sm text-slate-900">{unit.title}</h2>
            <p className="mt-0.5 text-xs font-bold text-amber-950/80">{unit.description}</p>
          </div>

          {/* Snake Path Container */}
          <div className="relative flex w-full flex-col items-center gap-8 py-2">
            {unit.lessons.map((lesson, index) => {
              const nodeState = getNodeState(lesson.id, unlockedLessonIds, completedLessonIds, currentLessonId);
              const isClickable = nodeState !== "locked";

              // Stagger offsets for snake path: [0, 48, 0, -48]
              const offsetPattern = [0, 48, 0, -48];
              const offsetX = offsetPattern[index % offsetPattern.length];

              return (
                <div
                  key={lesson.id}
                  className="flex flex-col items-center"
                  style={{ transform: `translateX(${offsetX}px)` }}
                >
                  {/* 3D Circular Lesson Button Node */}
                  <motion.button
                    whileTap={{ scale: isClickable ? 0.92 : 1 }}
                    animate={nodeState === "current" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ repeat: nodeState === "current" ? Infinity : 0, duration: 1.5 }}
                    onClick={() => isClickable && onStartLesson(lesson.id)}
                    disabled={!isClickable}
                    className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-b-8 shadow-xl transition-transform ${
                      nodeState === "completed"
                        ? "border-emerald-400 border-b-emerald-600 bg-emerald-500 text-white"
                        : nodeState === "current"
                          ? "border-amber-300 border-b-amber-500 bg-amber-400 text-slate-900 ring-8 ring-amber-200/70"
                          : "border-slate-300 border-b-slate-400 bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {nodeState === "completed" ? (
                      <Check className="h-10 w-10 stroke-[3]" />
                    ) : nodeState === "current" ? (
                      <Play className="h-10 w-10 fill-slate-900 stroke-none ml-1" />
                    ) : (
                      <Lock className="h-8 w-8 stroke-[2.5]" />
                    )}

                    {/* Stars Earned Badge */}
                    {nodeState === "completed" ? (
                      <div className="absolute -bottom-2 flex items-center gap-0.5 rounded-full bg-amber-300 px-2 py-0.5 shadow-md">
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <Star key={sIdx} className="h-3.5 w-3.5 fill-amber-600 text-amber-700" />
                        ))}
                      </div>
                    ) : (
                      <div className="absolute -bottom-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-sm border border-slate-200">
                        +{lesson.rewardStars}★
                      </div>
                    )}
                  </motion.button>

                  {/* Lesson Label */}
                  <div className="mt-3 text-center">
                    <p className="text-xs font-extrabold text-slate-800">{lesson.title}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{lesson.skill}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

