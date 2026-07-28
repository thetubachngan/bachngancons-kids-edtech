"use client";

import { motion } from "framer-motion";
import { Lock, Star, BookOpen } from "lucide-react";

import type { Curriculum } from "@/data/learningSchema";
import { getNodeState } from "@/store/learningStore";

const stateStyles = {
  locked: "border-slate-200 bg-slate-100 opacity-75",
  current: "border-yellow-300 bg-yellow-50 shadow-lg shadow-yellow-200/40",
  completed: "border-emerald-300 bg-emerald-50",
} as const;

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
    <div className="h-[calc(100vh-2rem)] overflow-auto rounded-[2rem] bg-gradient-to-b from-amber-50 via-pink-50 to-sky-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-24">
        {curriculum.units.map((unit) => (
          <section key={unit.id} className="relative rounded-[2rem] bg-white/60 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Level {unit.level}</p>
                <h2 className="text-3xl font-black text-slate-900">{unit.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">{unit.description}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                {unit.lessons.length} lessons
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-yellow-300 via-pink-300 to-sky-300" />
              <div className="flex flex-col gap-4">
                {unit.lessons.map((lesson, index) => {
                  const nodeState = getNodeState(lesson.id, unlockedLessonIds, completedLessonIds, currentLessonId);
                  const isClickable = nodeState !== "locked";

                  return (
                    <motion.button
                      key={lesson.id}
                      whileTap={{ scale: 0.99 }}
                      animate={nodeState === "current" ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                      transition={{ repeat: nodeState === "current" ? Infinity : 0, duration: 1.15 }}
                      onClick={() => isClickable && onStartLesson(lesson.id)}
                      className={`relative rounded-[1.8rem] border-2 p-4 text-left transition ${stateStyles[nodeState]}`}
                    >
                      <div className="absolute -left-11 top-6 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-white shadow-sm">
                        {nodeState === "completed" ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                        ) : nodeState === "current" ? (
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-400" />
                        )}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{lesson.skill}</p>
                          <h3 className="text-2xl font-black text-slate-900">{lesson.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {nodeState === "completed" ? (
                            Array.from({ length: 3 }).map((_, starIndex) => (
                              <Star key={starIndex} className="h-5 w-5 fill-yellow-400 text-yellow-500" />
                            ))
                          ) : (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">+{lesson.rewardStars}★</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>{index + 1}. lesson</span>
                        <span>{lesson.steps.length} tasks</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
