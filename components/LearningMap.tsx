"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Lock, Star, Play, Check } from "lucide-react";

import type { Curriculum } from "@/data/learningSchema";
import { getNodeState, type LevelTab, useLearningStore } from "@/store/learningStore";


const levelMap: Record<LevelTab, number> = {
  explorer: 1,
  builder: 2,
  challenger: 3,
};

const tabStyles: Record<LevelTab, string> = {
  explorer: "bg-emerald-100 border-emerald-300 text-emerald-900",
  builder: "bg-sky-100 border-sky-300 text-sky-900",
  challenger: "bg-amber-100 border-amber-300 text-amber-900",
};

export const LearningMap = ({
  curriculum,
  completedLessonIds,
  currentLessonId,
  unlockedLessonIds,
  focusLessonId,
  onFocusConsumed,
  onStartLesson,
}: {
  curriculum: Curriculum;
  completedLessonIds: string[];
  currentLessonId: string | null;
  unlockedLessonIds: string[];
  focusLessonId?: string | null;
  onFocusConsumed?: () => void;
  onStartLesson: (lessonId: string) => void;
}) => {
  const { state, dispatch } = useLearningStore();
  const lastFocusedLessonRef = useRef<string | null>(null);
  const focusedLesson = useMemo(
    () => (focusLessonId ? curriculum.units.flatMap((unit) => unit.lessons).find((lesson) => lesson.id === focusLessonId) ?? null : null),
    [curriculum.units, focusLessonId],
  );
  const focusedLevelTab = focusedLesson
    ? ((Object.entries(levelMap).find(([, level]) => level === focusedLesson.level)?.[0] ?? "explorer") as LevelTab)
    : null;
  const activeLevelTab = focusedLevelTab ?? state.activeLevelTab;
  const filteredUnits = useMemo(() => curriculum.units.filter((unit) => unit.level === levelMap[activeLevelTab]), [activeLevelTab, curriculum.units]);

  useEffect(() => {
    if (!focusLessonId || focusLessonId === lastFocusedLessonRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      const lessonNode = document.getElementById(`lesson-node-${focusLessonId}`);
      if (!lessonNode) {
        return;
      }

      lastFocusedLessonRef.current = focusLessonId;
      lessonNode.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      onFocusConsumed?.();
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [focusLessonId, onFocusConsumed]);

  return (
    <div className="mx-auto w-full max-w-xl select-none px-3 pb-[calc(6rem+var(--safe-bottom))] sm:px-4">
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => dispatch({ type: "SET_ACTIVE_LEVEL", level: "explorer" })} className={`kid-button justify-center border-b-4 ${activeLevelTab === "explorer" ? tabStyles.explorer : "border-slate-200 bg-white text-slate-600"}`}>
          🟢 Explorer (5-6 tuổi)
        </button>
        <button type="button" onClick={() => dispatch({ type: "SET_ACTIVE_LEVEL", level: "builder" })} className={`kid-button justify-center border-b-4 ${activeLevelTab === "builder" ? tabStyles.builder : "border-slate-200 bg-white text-slate-600"}`}>
          🔵 Builder (7-8 tuổi)
        </button>
        <button type="button" onClick={() => dispatch({ type: "SET_ACTIVE_LEVEL", level: "challenger" })} className={`kid-button justify-center border-b-4 ${activeLevelTab === "challenger" ? tabStyles.challenger : "border-slate-200 bg-white text-slate-600"}`}>
          🟠 Challenger (9+ tuổi)
        </button>
      </div>
      {filteredUnits.map((unit) => (
        <section key={unit.id} className="mb-8 flex flex-col items-center sm:mb-10">
          {/* Unit Header Banner */}
          <div className="mb-6 w-full rounded-[1.75rem] border-2 border-b-4 border-amber-300 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 text-center text-white shadow-lg sm:mb-8 sm:rounded-3xl">
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
              const offsetPattern = [0, 26, 0, -26];
              const offsetX = offsetPattern[index % offsetPattern.length];

              return (
                <div
                  key={lesson.id}
                  id={`lesson-node-${lesson.id}`}
                  className="flex w-full flex-col items-center"
                  style={{ transform: `translateX(${offsetX}px)` }}
                >
                  {/* 3D Circular Lesson Button Node */}
                  <motion.button
                    whileTap={{ scale: isClickable ? 0.92 : 1 }}
                    animate={nodeState === "current" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ repeat: nodeState === "current" ? Infinity : 0, duration: 1.5 }}
                    onClick={() => isClickable && onStartLesson(lesson.id)}
                    disabled={!isClickable}
                    className={`touch-card relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-b-8 shadow-xl transition-transform ${
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

                  {nodeState === "current" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-left shadow-md"
                    >
                      <span className="text-2xl">🐝</span>
                      <span className="text-[11px] font-black leading-4 text-amber-700">Mở bài mới nào! 🎁</span>
                    </motion.div>
                  ) : null}

                  {/* Lesson Label */}
                  <div className="mt-3 max-w-[10rem] text-center sm:max-w-none">
                    <p className="text-xs font-extrabold leading-5 text-slate-800">{lesson.title}</p>
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

