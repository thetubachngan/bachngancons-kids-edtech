"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Star, Trophy } from "lucide-react";

import { ConversationSection } from "@/components/ConversationSection";
import { FloatingMascot } from "@/components/FloatingMascot";
import { Navbar } from "@/components/Navbar";
import { QuizSection } from "@/components/QuizSection";
import { VocabularySection } from "@/components/VocabularySection";
import {
  type AgeLevel,
  type AppTabKey,
  allWords,
  getConversationsByLevel,
  getLevelConfig,
  getTopicsByLevel,
  getWordsByLevel,
  levels,
} from "@/data/englishData";

type LevelProgress = {
  learnedWords: string[];
  quizHighScore: number;
  wordPracticeCounts: Record<string, number>;
};

type StoredProgress = {
  stars: number;
  activeLevel: AgeLevel;
  levels: Record<AgeLevel, LevelProgress>;
};

type LegacyProgress = {
  stars?: number;
  learnedWords?: string[];
  quizHighScore?: number;
  wordPracticeCounts?: Record<string, number>;
};

const STORAGE_KEY = "kids-english-progress";

const createEmptyLevelProgress = (): LevelProgress => ({
  learnedWords: [],
  quizHighScore: 0,
  wordPracticeCounts: {},
});

const defaultProgress: StoredProgress = {
  stars: 0,
  activeLevel: "explorer",
  levels: {
    explorer: createEmptyLevelProgress(),
    builder: createEmptyLevelProgress(),
    challenger: createEmptyLevelProgress(),
  },
};

const normalizeLevelProgress = (value?: Partial<LevelProgress>): LevelProgress => ({
  learnedWords: value?.learnedWords ?? [],
  quizHighScore: value?.quizHighScore ?? 0,
  wordPracticeCounts: value?.wordPracticeCounts ?? {},
});

const readStoredProgress = (): StoredProgress => {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return defaultProgress;
    }

    const parsed = JSON.parse(storedValue) as Partial<StoredProgress> & LegacyProgress;

    if (parsed.levels) {
      return {
        stars: parsed.stars ?? 0,
        activeLevel: parsed.activeLevel ?? "explorer",
        levels: {
          explorer: normalizeLevelProgress(parsed.levels.explorer),
          builder: normalizeLevelProgress(parsed.levels.builder),
          challenger: normalizeLevelProgress(parsed.levels.challenger),
        },
      };
    }

    return {
      stars: parsed.stars ?? 0,
      activeLevel: "builder",
      levels: {
        explorer: createEmptyLevelProgress(),
        builder: normalizeLevelProgress({
          learnedWords: parsed.learnedWords,
          quizHighScore: parsed.quizHighScore,
          wordPracticeCounts: parsed.wordPracticeCounts,
        }),
        challenger: createEmptyLevelProgress(),
      },
    };
  } catch {
    return defaultProgress;
  }
};

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<AgeLevel>("explorer");
  const [activeTab, setActiveTab] = useState<AppTabKey>("vocabulary");
  const [selectedTopicId, setSelectedTopicId] = useState(getTopicsByLevel("explorer")[0]?.id ?? "");
  const [progress, setProgress] = useState<StoredProgress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedProgress = readStoredProgress();
      setProgress(storedProgress);
      setSelectedLevel(storedProgress.activeLevel);
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const currentLevelConfig = useMemo(() => getLevelConfig(selectedLevel), [selectedLevel]);
  const currentTopics = useMemo(() => getTopicsByLevel(selectedLevel), [selectedLevel]);
  const currentWords = useMemo(() => getWordsByLevel(selectedLevel), [selectedLevel]);
  const currentConversations = useMemo(() => getConversationsByLevel(selectedLevel), [selectedLevel]);
  const resolvedActiveTab = currentLevelConfig.availableTabs.includes(activeTab) ? activeTab : currentLevelConfig.availableTabs[0];
  const resolvedSelectedTopicId = currentTopics.some((topic) => topic.id === selectedTopicId) ? selectedTopicId : (currentTopics[0]?.id ?? "");

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...progress,
        activeLevel: selectedLevel,
      }),
    );
  }, [hydrated, progress, selectedLevel]);

  const currentLevelProgress = progress.levels[selectedLevel];
  const learnedWordSet = useMemo(() => new Set(currentLevelProgress.learnedWords), [currentLevelProgress.learnedWords]);

  const handleChangeLevel = (level: AgeLevel) => {
    const nextLevelConfig = getLevelConfig(level);
    const nextTopics = getTopicsByLevel(level);

    setSelectedLevel(level);
    setActiveTab(nextLevelConfig.availableTabs[0]);
    setSelectedTopicId(nextTopics[0]?.id ?? "");
  };

  const completedTopics = useMemo(
    () =>
      currentTopics.filter((topic) => topic.words.every((word) => learnedWordSet.has(word.id))).map((topic) => topic.id),
    [currentTopics, learnedWordSet],
  );

  const totalWords = currentWords.length;

  const addStars = (amount: number) => {
    setProgress((current) => ({
      ...current,
      stars: current.stars + amount,
    }));
  };

  const recordWordPractice = (wordId: string) => {
    setProgress((current) => {
      const currentLevelState = current.levels[selectedLevel];
      const nextCount = (currentLevelState.wordPracticeCounts[wordId] ?? 0) + 1;
      const alreadyLearned = currentLevelState.learnedWords.includes(wordId);
      const justLearned = !alreadyLearned && nextCount >= 3;

      return {
        ...current,
        stars: current.stars + (justLearned ? 1 : 0),
        levels: {
          ...current.levels,
          [selectedLevel]: {
            ...currentLevelState,
            learnedWords: justLearned ? [...currentLevelState.learnedWords, wordId] : currentLevelState.learnedWords,
            wordPracticeCounts: {
              ...currentLevelState.wordPracticeCounts,
              [wordId]: nextCount,
            },
          },
        },
      };
    });
  };

  const saveHighScore = (score: number) => {
    setProgress((current) => {
      const currentLevelState = current.levels[selectedLevel];
      const isNewHighScore = score > currentLevelState.quizHighScore;

      return {
        ...current,
        stars: current.stars + (isNewHighScore ? 3 : 0),
        levels: {
          ...current.levels,
          [selectedLevel]: {
            ...currentLevelState,
            quizHighScore: Math.max(currentLevelState.quizHighScore, score),
          },
        },
      };
    });
  };

  return (
    <main className="pb-12">
      <Navbar
        activeLevel={selectedLevel}
        levels={levels}
        activeTab={resolvedActiveTab}
        availableTabs={currentLevelConfig.availableTabs}
        onChangeLevel={handleChangeLevel}
        onChangeTab={setActiveTab}
        stars={progress.stars}
        learnedWords={currentLevelProgress.learnedWords.length}
        highScore={currentLevelProgress.quizHighScore}
      />

      <section className="section-shell mt-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card overflow-hidden bg-gradient-to-br from-amber-100 via-pink-100 to-sky-100 p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {currentLevelConfig.heroBadge}
              </p>
              <h2 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 sm:text-5xl">{currentLevelConfig.heroTitle}</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{currentLevelConfig.heroDescription}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setActiveTab("vocabulary")} className="kid-button border-yellow-600 bg-yellow-300 text-yellow-950">
                  Khám phá từ vựng 🚀
                </button>
                <button type="button" onClick={() => setActiveTab(currentLevelConfig.availableTabs[currentLevelConfig.availableTabs.length - 1])} className="kid-button border-sky-600 bg-sky-300 text-sky-950">
                  Mở thử thách
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="glass-card flex items-center justify-between gap-4 bg-yellow-100 p-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-yellow-700">Sao vàng</p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-800">{progress.stars}</h3>
                <p className="mt-1 text-sm text-slate-600">Bé nhận sao khi thuộc từ mới và vượt qua thử thách ở mỗi cấp độ.</p>
              </div>
              <FloatingMascot name="Bee" emoji="🐝" speech={selectedLevel === "explorer" ? "Mình cùng bắt đầu nhé!" : selectedLevel === "builder" ? "Cố lên nào!" : "Sẵn sàng thử thách chưa?"} />
            </div>

            <div className="glass-card bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.6rem] bg-emerald-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" />
                    Từ đã thuộc
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">
                    {currentLevelProgress.learnedWords.length}/{totalWords}
                  </p>
                </div>
                <div className="rounded-[1.6rem] bg-sky-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-900">
                    <Trophy className="h-4 w-4" />
                    Kỷ lục thử thách
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">{currentLevelProgress.quizHighScore}</p>
                </div>
                <div className="rounded-[1.6rem] bg-pink-100 p-4 sm:col-span-2 xl:col-span-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-pink-900">
                    <Star className="h-4 w-4" />
                    Chủ đề hoàn thành
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">{completedTopics.length}</p>
                  <p className="mt-1 text-sm text-slate-600">{currentLevelConfig.shortDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {resolvedActiveTab === "vocabulary" ? (
        <VocabularySection
          level={selectedLevel}
          levelLabel={currentLevelConfig.label}
          vocabularyHint={currentLevelConfig.vocabularyHint}
          topics={currentTopics}
          selectedTopicId={resolvedSelectedTopicId}
          learnedWords={currentLevelProgress.learnedWords}
          practiceCounts={currentLevelProgress.wordPracticeCounts}
          onSelectTopic={setSelectedTopicId}
          onPracticeWord={recordWordPractice}
        />
      ) : null}

      {resolvedActiveTab === "conversation" && selectedLevel !== "explorer" ? (
        <ConversationSection
          level={selectedLevel}
          title={currentLevelConfig.conversationTitle ?? "Hội thoại cùng Bee & Cat"}
          description={currentLevelConfig.conversationDescription ?? "Luyện nghe và nói với Bee & Cat."}
          conversations={currentConversations}
        />
      ) : null}

      {resolvedActiveTab === "quiz" ? (
        <QuizSection
          level={selectedLevel}
          levelLabel={currentLevelConfig.label}
          mode={currentLevelConfig.quizMode}
          words={currentWords}
          highScore={currentLevelProgress.quizHighScore}
          onEarnStars={addStars}
          onSaveHighScore={saveHighScore}
        />
      ) : null}

      {!hydrated ? (
        <section className="section-shell mt-8">
          <div className="glass-card p-5 text-sm font-semibold text-slate-500">Đang khôi phục tiến trình học đã lưu của bé...</div>
        </section>
      ) : null}

      <section className="section-shell mt-8">
        <div className="glass-card p-5 text-sm leading-7 text-slate-600">
          <span className="font-extrabold text-slate-800">Tổng kho dữ liệu hiện tại:</span> {allWords.length} từ vựng mẫu trải đều cho 3 cấp độ Explorer, Builder và Challenger.
        </div>
      </section>
    </main>
  );
}
