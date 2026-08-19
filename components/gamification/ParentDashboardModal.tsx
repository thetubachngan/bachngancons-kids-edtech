"use client";

import { useMemo, useState } from "react";
import { X, Trophy, Star, Flame, CheckCircle2, Lock, Play, RotateCcw, AlertTriangle, BookOpen, UserCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { curriculum } from "@/data/curriculum";
import type { Lesson } from "@/data/learningSchema";
import { getNodeState, totalLessonCount } from "@/store/learningStore";

type LevelFilter = "all" | "explorer" | "builder" | "challenger";

export const ParentDashboardModal = ({
  open,
  onClose,
  completedLessonIds,
  unlockedLessonIds,
  currentLessonId,
  stars,
  streakDays,
  lessonStats,
  onStartLesson,
  onResetProgress,
}: {
  open: boolean;
  onClose: () => void;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  currentLessonId: string | null;
  stars: number;
  streakDays: number;
  lessonStats: Record<string, { attempts: number; starsEarned: number; completed: boolean }>;
  onStartLesson: (lessonId: string) => void;
  onResetProgress: () => void;
}) => {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / (totalLessonCount || 1)) * 100);

  const filteredUnits = useMemo(() => {
    if (levelFilter === "explorer") return curriculum.units.filter((u) => u.level === 1);
    if (levelFilter === "builder") return curriculum.units.filter((u) => u.level === 2);
    if (levelFilter === "challenger") return curriculum.units.filter((u) => u.level === 3);
    return curriculum.units;
  }, [levelFilter]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex flex-col w-full max-w-3xl h-[90dvh] max-h-[750px] rounded-3xl bg-white shadow-2xl border-4 border-amber-200 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 border-b border-amber-300 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 shadow-sm text-amber-700">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wide">Góc Phụ Huynh & Báo Cáo Học Tập 📊</h2>
                <p className="text-xs font-bold text-amber-900/80">Theo dõi chi tiết tiến trình và bài tập bé đã hoàn thành</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/90 p-2 text-amber-900 hover:bg-white active:scale-95 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Overview Dashboard Cards */}
          <div className="p-4 bg-amber-50/60 border-b border-amber-100 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-emerald-200">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Hoàn thành</p>
                <p className="text-base font-black text-emerald-700">{completedCount} / {totalLessonCount} bài ({progressPercent}%)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-amber-200">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng Sao ⭐</p>
                <p className="text-base font-black text-amber-700">{stars} Sao tích lũy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-rose-200">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Chuỗi ngày</p>
                <p className="text-base font-black text-rose-700">{streakDays} ngày liên tiếp</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm border border-sky-200">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Đã mở khóa</p>
                <p className="text-base font-black text-sky-700">{unlockedLessonIds.length} bài học</p>
              </div>
            </div>
          </div>

          {/* Level Filter Tabs & Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0 gap-2 overflow-x-auto">
            <div className="flex gap-1.5 shrink-0">
              {(
                [
                  { id: "all", label: "Tất cả bài" },
                  { id: "explorer", label: "🟢 Explorer (5-6t)" },
                  { id: "builder", label: "🔵 Builder (7-8t)" },
                  { id: "challenger", label: "🟠 Challenger (9t+)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLevelFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    levelFilter === tab.id
                      ? "bg-amber-400 text-amber-950 shadow-sm border-b-2 border-amber-600"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Đặt lại tiến trình
            </button>
          </div>

          {/* Main Scrollable Lesson Reports List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {filteredUnits.map((unit) => (
              <div key={unit.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase">
                    {unit.title}
                  </span>
                  <p className="text-xs font-bold text-slate-600">{unit.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {unit.lessons.map((lesson: Lesson) => {
                    const nodeState = getNodeState(lesson.id, unlockedLessonIds, completedLessonIds, currentLessonId);
                    const stats = lessonStats[lesson.id];
                    const isDone = nodeState === "completed";
                    const isCurrent = nodeState === "current";
                    const isLocked = nodeState === "locked";

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-emerald-50/80 border-emerald-200 shadow-2xs"
                            : isCurrent
                              ? "bg-sky-50/80 border-sky-300 shadow-sm ring-2 ring-sky-200"
                              : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="space-y-1 pr-2 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                            ) : (
                              <Play className="h-4 w-4 text-sky-600 shrink-0" />
                            )}
                            <h4 className="text-sm font-black text-slate-900 truncate">{lesson.title}</h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            {isDone ? (
                              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                {stats?.starsEarned ?? lesson.rewardStars} / {lesson.rewardStars} sao
                              </span>
                            ) : isCurrent ? (
                              <span className="text-sky-700 font-extrabold">Đang mở bài</span>
                            ) : (
                              <span>Chưa mở</span>
                            )}

                            {stats?.attempts ? <span>• Đã thử {stats.attempts} lần</span> : null}
                          </div>
                        </div>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onStartLesson(lesson.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs shrink-0 active:scale-95 transition ${
                              isDone
                                ? "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                                : "bg-sky-500 text-white border-b-2 border-sky-700 hover:bg-sky-600"
                            }`}
                          >
                            {isDone ? "Học lại 🔄" : "Vào học 🚀"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Reset Confirmation Overlay */}
          {showResetConfirm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-rose-300 text-center space-y-3"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-black text-slate-900">Xác nhận đặt lại tiến trình?</h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  Hành động này sẽ xóa danh sách các bài học đã xong và đưa bé về bài 1. Bạn có chắc chắn muốn thực hiện?
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      onResetProgress();
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-2xl border-b-3 border-rose-700 bg-rose-600 text-xs font-black text-white shadow-md active:translate-y-[1px]"
                  >
                    Đồng ý Đặt lại 🗑️
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
