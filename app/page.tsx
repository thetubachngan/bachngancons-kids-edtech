"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Star, Trophy } from "lucide-react";

import { ConversationSection } from "@/components/ConversationSection";
import { FloatingMascot } from "@/components/FloatingMascot";
import { Navbar, type TabKey } from "@/components/Navbar";
import { QuizSection } from "@/components/QuizSection";
import { VocabularySection } from "@/components/VocabularySection";
import { allWords, conversations, topics } from "@/data/englishData";

type StoredProgress = {
  stars: number;
  learnedWords: string[];
  quizHighScore: number;
  wordPracticeCounts: Record<string, number>;
};

const STORAGE_KEY = "kids-english-progress";

const defaultProgress: StoredProgress = {
  stars: 0,
  learnedWords: [],
  quizHighScore: 0,
  wordPracticeCounts: {},
};

const readStoredProgress = (): StoredProgress => {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return defaultProgress;
    }

    const parsed = JSON.parse(storedValue) as Partial<StoredProgress>;

    return {
      stars: parsed.stars ?? 0,
      learnedWords: parsed.learnedWords ?? [],
      quizHighScore: parsed.quizHighScore ?? 0,
      wordPracticeCounts: parsed.wordPracticeCounts ?? {},
    };
  } catch {
    return defaultProgress;
  }
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("vocabulary");
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id ?? "");
  const [progress, setProgress] = useState<StoredProgress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProgress(readStoredProgress());
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  const learnedWordSet = useMemo(() => new Set(progress.learnedWords), [progress.learnedWords]);

  const completedTopics = useMemo(
    () =>
      topics.filter((topic) => topic.words.every((word) => learnedWordSet.has(word.id))).map((topic) => topic.id),
    [learnedWordSet],
  );

  const totalWords = allWords.length;

  const addStars = (amount: number) => {
    setProgress((current) => ({
      ...current,
      stars: current.stars + amount,
    }));
  };

  const recordWordPractice = (wordId: string) => {
    setProgress((current) => {
      const nextCount = (current.wordPracticeCounts[wordId] ?? 0) + 1;
      const alreadyLearned = current.learnedWords.includes(wordId);
      const justLearned = !alreadyLearned && nextCount >= 3;

      return {
        ...current,
        stars: current.stars + (justLearned ? 1 : 0),
        learnedWords: justLearned ? [...current.learnedWords, wordId] : current.learnedWords,
        wordPracticeCounts: {
          ...current.wordPracticeCounts,
          [wordId]: nextCount,
        },
      };
    });
  };

  const saveHighScore = (score: number) => {
    setProgress((current) => {
      const isNewHighScore = score > current.quizHighScore;

      return {
        ...current,
        stars: current.stars + (isNewHighScore ? 3 : 0),
        quizHighScore: Math.max(current.quizHighScore, score),
      };
    });
  };

  return (
    <main className="pb-12">
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        stars={progress.stars}
        learnedWords={progress.learnedWords.length}
        highScore={progress.quizHighScore}
      />

      <section className="section-shell mt-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card overflow-hidden bg-gradient-to-br from-amber-100 via-pink-100 to-sky-100 p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Học vui - nhớ lâu - tự tin nói tiếng Anh mỗi ngày
              </p>
              <h2 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 sm:text-5xl">
                Hành trình tiếng Anh siêu vui dành cho bé lớp 2
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Mỗi hoạt động đều được thiết kế với màu pastel dịu mắt, nút bấm lớn dễ chạm và hiệu ứng thưởng sao để bé hứng thú học tập mỗi ngày.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setActiveTab("vocabulary")} className="kid-button border-yellow-600 bg-yellow-300 text-yellow-950">
                  Bắt đầu học 🚀
                </button>
                <button type="button" onClick={() => setActiveTab("quiz")} className="kid-button border-sky-600 bg-sky-300 text-sky-950">
                  Chơi quiz ngay
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="glass-card flex items-center justify-between gap-4 bg-yellow-100 p-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-yellow-700">Sao vàng</p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-800">{progress.stars}</h3>
                <p className="mt-1 text-sm text-slate-600">Bé nhận sao khi thuộc từ mới và trả lời quiz đúng.</p>
              </div>
              <FloatingMascot name="Bee" emoji="🐝" speech="Cố lên nào!" />
            </div>

            <div className="glass-card bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.6rem] bg-emerald-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    Từ đã thuộc
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">
                    {progress.learnedWords.length}/{totalWords}
                  </p>
                </div>
                <div className="rounded-[1.6rem] bg-sky-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-900">
                    <Trophy className="h-4 w-4" />
                    Kỷ lục quiz
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">{progress.quizHighScore}</p>
                </div>
                <div className="rounded-[1.6rem] bg-pink-100 p-4 sm:col-span-2 xl:col-span-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-pink-900">
                    <Star className="h-4 w-4" />
                    Chủ đề hoàn thành
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">{completedTopics.length}</p>
                  <p className="mt-1 text-sm text-slate-600">Hoàn thành đủ từ của một chủ đề để mở khóa cảm giác chinh phục.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeTab === "vocabulary" ? (
        <VocabularySection
          topics={topics}
          selectedTopicId={selectedTopicId}
          learnedWords={progress.learnedWords}
          practiceCounts={progress.wordPracticeCounts}
          onSelectTopic={setSelectedTopicId}
          onPracticeWord={recordWordPractice}
        />
      ) : null}

      {activeTab === "conversation" ? <ConversationSection conversations={conversations} /> : null}

      {activeTab === "quiz" ? (
        <QuizSection words={allWords} highScore={progress.quizHighScore} onEarnStars={addStars} onSaveHighScore={saveHighScore} />
      ) : null}

      {!hydrated ? (
        <section className="section-shell mt-8">
          <div className="glass-card p-5 text-sm font-semibold text-slate-500">Đang khôi phục tiến trình học đã lưu của bé...</div>
        </section>
      ) : null}
    </main>
  );
}
