"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircleHeart, Play, Square, Volume2 } from "lucide-react";

import { FloatingMascot } from "@/components/FloatingMascot";
import type { ConversationScenario } from "@/data/englishData";
import { useSpeech } from "@/hooks/useSpeech";

type ConversationSectionProps = {
  conversations: ConversationScenario[];
};

const speakerStyle: Record<"bee" | "cat", string> = {
  bee: "bg-yellow-200 text-yellow-950 border-yellow-300",
  cat: "bg-pink-200 text-pink-950 border-pink-300",
};

const speakerName: Record<"bee" | "cat", string> = {
  bee: "Bee",
  cat: "Cat",
};

const speakerEmoji: Record<"bee" | "cat", string> = {
  bee: "🐝",
  cat: "🐱",
};

export const ConversationSection = ({ conversations }: ConversationSectionProps) => {
  const { speak } = useSpeech();
  const [activeScenarioId, setActiveScenarioId] = useState(conversations[0]?.id ?? "");
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeScenario = useMemo(
    () => conversations.find((scenario) => scenario.id === activeScenarioId) ?? conversations[0],
    [activeScenarioId, conversations],
  );

  useEffect(() => {
    if (!isPlaying || !activeScenario) {
      return;
    }

    const activeLine = activeScenario.lines[activeLineIndex];
    if (!activeLine) {
      return;
    }

    speak(activeLine.english, 0.8);

    const timer = window.setTimeout(() => {
      setActiveLineIndex((current) => {
        if (current >= activeScenario.lines.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [activeLineIndex, activeScenario, isPlaying, speak]);

  if (!activeScenario) {
    return null;
  }

  const activeLine = activeScenario.lines[activeLineIndex];

  return (
    <section className="section-shell mt-8 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-pink-200 p-3 text-pink-900">
              <MessageCircleHeart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Hội thoại cùng Bee & Cat</h2>
              <p className="text-sm text-slate-500">Bé có thể nghe từng câu hoặc bật tự động để luyện nói theo cả đoạn.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {conversations.map((scenario) => {
              const isActive = scenario.id === activeScenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioId(scenario.id);
                    setActiveLineIndex(0);
                    setIsPlaying(false);
                  }}
                  className={`rounded-[1.6rem] border-2 p-4 text-left transition ${
                    isActive
                      ? "border-white bg-pink-100 shadow-[0_16px_0_rgba(255,255,255,0.55)]"
                      : "border-white/70 bg-white/80 hover:-translate-y-1 hover:shadow-[0_14px_0_rgba(255,255,255,0.55)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-pink-700">{scenario.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{scenario.summary}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{scenario.place}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">Tình huống</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-800">{activeScenario.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{activeScenario.summary}</p>
              </div>
              <div className="flex items-center gap-4">
                <FloatingMascot name="Bee" emoji="🐝" speech={"Let's talk!"} className="items-center" />
                <FloatingMascot name="Cat" emoji="🐱" speech="Meow, say it with me!" className="items-center" />
              </div>
            </div>

            <div className="rounded-[1.8rem] bg-white/80 p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Câu hiện tại</p>
                  <h4 className="mt-1 text-xl font-extrabold text-slate-800">
                    {activeLineIndex + 1}/{activeScenario.lines.length} · {speakerName[activeLine.speaker]}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((current) => !current)}
                    className="kid-button border-yellow-600 bg-yellow-300 text-yellow-950"
                  >
                    {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Dừng" : "Tự động"}
                  </button>
                  <button
                    type="button"
                    onClick={() => speak(activeLine.english, 0.8)}
                    className="kid-button border-sky-600 bg-sky-300 text-sky-950"
                  >
                    <Volume2 className="h-4 w-4" />
                    Nghe lại
                  </button>
                </div>
              </div>

              <div className={`rounded-[1.8rem] border p-5 ${speakerStyle[activeLine.speaker]}`}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/70 px-3 py-2 text-2xl">{speakerEmoji[activeLine.speaker]}</div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] opacity-70">{speakerName[activeLine.speaker]}</p>
                    <h4 className="text-2xl font-extrabold">{activeLine.english}</h4>
                  </div>
                </div>
                <p className="mt-4 text-lg font-semibold opacity-80">{activeLine.vietnamese}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveLineIndex((current) => Math.max(current - 1, 0));
                  }}
                  className="kid-button border-violet-600 bg-violet-300 text-violet-950"
                  disabled={activeLineIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Câu trước
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveLineIndex((current) => Math.min(current + 1, activeScenario.lines.length - 1));
                  }}
                  className="kid-button border-emerald-600 bg-emerald-300 text-emerald-950"
                  disabled={activeLineIndex === activeScenario.lines.length - 1}
                >
                  Câu sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeScenario.lines.map((line, index) => (
                <button
                  key={`${line.english}-${index}`}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveLineIndex(index);
                    speak(line.english, 0.8);
                  }}
                  className={`rounded-[1.4rem] border p-4 text-left transition ${
                    index === activeLineIndex
                      ? "border-amber-200 bg-white shadow-sm"
                      : "border-white/80 bg-white/60 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{line.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-500">{speakerName[line.speaker]}</p>
                      <p className="mt-1 font-extrabold text-slate-800">{line.english}</p>
                      <p className="mt-1 text-sm text-slate-600">{line.vietnamese}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
