"use client";

import { X, Star } from "lucide-react";
import { motion } from "framer-motion";

export const FocusLessonShell = ({
  title,
  stars = 0,
  progress,
  onExit,
  children,
}: {
  title: string;
  subtitle?: string;
  stars?: number;
  progress: number;
  onExit: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#fffaf0] select-none" style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}>
      {/* Top Bar - Clean & Compact Mobile Header */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-amber-200/60 bg-white/90 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition active:scale-95 hover:bg-slate-200"
          aria-label={`Thoát bài học ${title}`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress Bar Container */}
        <div className="flex flex-1 items-center gap-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 shadow-sm"
              initial={{ width: "5%" }}
              animate={{ width: `${Math.max(progress, 0.05) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            />
          </div>
        </div>

        {/* Star Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-sm font-black text-amber-700 shadow-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          <span>+{stars}★</span>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

