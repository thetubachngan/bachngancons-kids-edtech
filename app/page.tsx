"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star, Trophy } from "lucide-react";

import { LearningMap } from "@/components/LearningMap";
import { CoreQuizEngine } from "@/components/CoreQuizEngine";
import { FocusLessonShell } from "@/components/lesson/FocusLessonShell";
import { Mascot } from "@/components/gamification/Mascot";
import { RewardOverlay } from "@/components/gamification/RewardOverlay";
import { StreakBanner } from "@/components/gamification/StreakBanner";
import { curriculum, getLessonById, getNextLessonId } from "@/data/curriculum";
import { LearningStoreProvider, totalLessonCount, useLearningStore } from "@/store/learningStore";
import { preloadAudio } from "@/utils/preloadAudio";

function AppShell() {
  const { state, dispatch } = useLearningStore();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewardStars, setRewardStars] = useState(0);
  const [isPreparingLesson, setIsPreparingLesson] = useState(false);

  const activeLesson = useMemo(() => (activeLessonId ? getLessonById(activeLessonId) : null), [activeLessonId]);

  const collectLessonAudioSources = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return [] as string[];
    }

    return lesson.steps
      .flatMap((lessonStep) => [
        lessonStep.visual.audioSrc,
        "questionAudioSrc" in lessonStep ? lessonStep.questionAudioSrc : undefined,
        ...(lessonStep.type === "mcq" || lessonStep.type === "tap-match" ? lessonStep.choices.flatMap((choice) => [choice.audioSrc]) : []),
      ])
      .filter(Boolean) as string[];
  };

  useEffect(() => {
    const warmLessons = curriculum.units.flatMap((unit) => unit.lessons).slice(0, 3);
    void preloadAudio(warmLessons.flatMap((lesson) => collectLessonAudioSources(lesson.id)));
  }, []);

  useEffect(() => {
    if (!activeLesson) {
      return;
    }

    preloadAudio(
      activeLesson.steps.flatMap((lessonStep) => [
        lessonStep.visual.audioSrc,
        "questionAudioSrc" in lessonStep ? lessonStep.questionAudioSrc : undefined,
        ...(lessonStep.type === "mcq" || lessonStep.type === "tap-match" ? lessonStep.choices.flatMap((choice) => [choice.audioSrc]) : []),
      ]).filter(Boolean) as string[],
    );
  }, [activeLesson]);


  const completedLessonCount = state.completedLessonIds.length;
  const unlockedLessonCount = state.unlockedLessonIds.length;

  const startLesson = async (lessonId: string) => {
    if (isPreparingLesson) {
      return;
    }

    setIsPreparingLesson(true);
    try {
      await preloadAudio(collectLessonAudioSources(lessonId));
      dispatch({ type: "START_LESSON", lessonId });
      setActiveLessonId(lessonId);
      setLessonProgress(0);
    } finally {
      setIsPreparingLesson(false);
    }
  };

  const exitLesson = () => {
    dispatch({ type: "EXIT_LESSON" });
    setActiveLessonId(null);
    setLessonProgress(0);
  };

  const completeLesson = (lessonId: string, starsEarned: number) => {
    const nextLessonId = getNextLessonId(lessonId);
    if (nextLessonId) {
      void preloadAudio(collectLessonAudioSources(nextLessonId));
    }
    dispatch({ type: "COMPLETE_LESSON", lessonId, starsEarned, nextLessonId });
    setRewardStars(starsEarned);
    setRewardOpen(true);
    setActiveLessonId(null);
    setLessonProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-pink-50 to-sky-50 text-slate-900">
      {!activeLesson ? (
        <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
          <section className="rounded-[2rem] bg-white/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-700">
                  <Sparkles className="h-4 w-4" />
                  Bee & Cat English
                </p>
                <h1 className="text-3xl font-black leading-tight sm:text-5xl">Học tiếng Anh cùng Bee & Cat</h1>
                <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  Chọn một bài học trên bản đồ, bấm nghe từ và để bé học theo từng bước thật rõ ràng, vui nhộn.
                </p>

                <div className="grid gap-3 sm:flex sm:flex-wrap">
                  <div className="stat-chip bg-yellow-200 text-yellow-950">
                    <Star className="h-4 w-4" />
                    {state.stars} sao
                  </div>
                  {isPreparingLesson ? (
                    <div className="stat-chip bg-violet-200 text-violet-950">
                      Đang tải bài học...
                    </div>
                  ) : null}
                  <div className="stat-chip bg-emerald-200 text-emerald-950">
                    <Trophy className="h-4 w-4" />
                    {completedLessonCount}/{totalLessonCount} lessons
                  </div>
                  <div className="stat-chip bg-sky-200 text-sky-950">
                    <Star className="h-4 w-4" />
                    {unlockedLessonCount} unlocked
                  </div>
                  <StreakBanner streak={state.streakDays} />
                </div>
              </div>

              <div className="flex justify-center">
                <Mascot mood={state.currentLessonId ? "encouraging" : "happy"} />
              </div>
            </div>
          </section>

          <LearningMap
            curriculum={curriculum}
            completedLessonIds={state.completedLessonIds}
            currentLessonId={state.currentLessonId}
            unlockedLessonIds={state.unlockedLessonIds}
            onStartLesson={startLesson}
          />
        </main>
      ) : (
        <FocusLessonShell title={activeLesson.title} subtitle={activeLesson.description} stars={activeLesson.rewardStars} progress={lessonProgress} onExit={exitLesson}>
          <CoreQuizEngine
            key={activeLesson.id}
            lesson={activeLesson}
            onCompleteLesson={completeLesson}
            onExit={exitLesson}
            onProgress={setLessonProgress}
          />
        </FocusLessonShell>
      )}

      <RewardOverlay open={rewardOpen} stars={rewardStars} streak={state.streakDays} onClose={() => setRewardOpen(false)} />
    </div>
  );
}

export default function Page() {
  return (
    <LearningStoreProvider>
      <AppShell />
    </LearningStoreProvider>
  );
}
