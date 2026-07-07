"use client";

import { BookOpen, BrainCircuit, MessageCircle, Star, Trophy } from "lucide-react";

import type { AgeLevel, AppTabKey, LevelConfig } from "@/data/englishData";

type NavbarProps = {
  activeLevel: AgeLevel;
  levels: LevelConfig[];
  activeTab: AppTabKey;
  availableTabs: AppTabKey[];
  onChangeLevel: (level: AgeLevel) => void;
  onChangeTab: (tab: AppTabKey) => void;
  stars: number;
  learnedWords: number;
  highScore: number;
};

const tabs: Record<
  AppTabKey,
  {
    label: string;
    icon: typeof BookOpen;
  }
> = {
  vocabulary: {
    label: "Từ vựng",
    icon: BookOpen,
  },
  conversation: {
    label: "Hội thoại",
    icon: MessageCircle,
  },
  quiz: {
    label: "Thử thách",
    icon: BrainCircuit,
  },
};

export const Navbar = ({
  activeLevel,
  levels,
  activeTab,
  availableTabs,
  onChangeLevel,
  onChangeTab,
  stars,
  learnedWords,
  highScore,
}: NavbarProps) => {
  const selectedLevel = levels.find((level) => level.id === activeLevel) ?? levels[0];

  return (
    <header className="section-shell sticky top-0 z-20 mt-4">
      <div className="glass-card flex flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-600">Kids English Adventure</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">Học tiếng Anh cho bé từ 5 tuổi trở lên cùng Bee & Cat</h1>
            <p className="mt-1 text-sm text-slate-500">
              {selectedLevel.label} · {selectedLevel.ageRange} · {selectedLevel.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="stat-chip bg-yellow-200 text-yellow-950">
              <Star className="h-4 w-4" />
              {stars} sao vàng
            </div>
            <div className="stat-chip bg-emerald-200 text-emerald-950">
              <BookOpen className="h-4 w-4" />
              {learnedWords} từ đã thuộc
            </div>
            <div className="stat-chip bg-sky-200 text-sky-950">
              <Trophy className="h-4 w-4" />
              Kỷ lục {highScore}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {levels.map((level) => {
            const isActive = level.id === activeLevel;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onChangeLevel(level.id)}
                className={isActive ? "tab-button tab-button-active" : "tab-button"}
              >
                <div className="text-left">
                  <div className="font-extrabold">{level.label}</div>
                  <div className="text-xs font-semibold opacity-75">{level.ageRange}</div>
                </div>
              </button>
            );
          })}
        </div>

        <nav className={`grid gap-3 ${availableTabs.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {availableTabs.map((tab) => {
            const Icon = tabs[tab].icon;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onChangeTab(tab)}
                className={isActive ? "tab-button tab-button-active" : "tab-button"}
              >
                <Icon className="h-5 w-5" />
                {tabs[tab].label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
