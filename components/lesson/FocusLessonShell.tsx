"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const FocusLessonShell = ({
  title,
  subtitle,
  progress,
  onExit,
  children,
}: {
  title: string;
  subtitle: string;
  progress: number;
  onExit: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fffaf0]">
      <div className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
          <button type="button" onClick={onExit} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black uppercase tracking-[0.28em] text-slate-500">One screen, one task</p>
            <h1 className="truncate text-xl font-black text-slate-900 sm:text-2xl">{title}</h1>
            <p className="truncate text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="text-sm font-black text-slate-500">{Math.round(progress * 100)}%</div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 0.05) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};
