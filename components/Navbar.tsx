"use client";

import { BookOpen, BrainCircuit, MessageCircle, Star, Trophy } from "lucide-react";

export type TabKey = "vocabulary" | "conversation" | "quiz";

type NavbarProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  stars: number;
  learnedWords: number;
  highScore: number;
};

const tabs = [
  {
    id: "vocabulary" as const,
    label: "Từ vựng",
    icon: BookOpen,
  },
  {
    id: "conversation" as const,
    label: "Hội thoại",
    icon: MessageCircle,
  },
  {
    id: "quiz" as const,
    label: "Quiz",
    icon: BrainCircuit,
  },
];

export const Navbar = ({ activeTab, onChangeTab, stars, learnedWords, highScore }: NavbarProps) => {
  return (
    <header className="section-shell sticky top-0 z-20 mt-4">
      <div className="glass-card flex flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-600">Kids English App</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">Học tiếng Anh lớp 2 cùng Bee & Cat</h1>
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

        <nav className="grid gap-3 sm:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={isActive ? "tab-button tab-button-active" : "tab-button"}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
