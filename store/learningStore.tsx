"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { curriculum, getNextLessonId } from "@/data/curriculum";

type LessonStat = {
  attempts: number;
  starsEarned: number;
  completed: boolean;
};

export type LevelTab = "explorer" | "builder" | "challenger";

type LearningState = {
  unlockedLessonIds: string[];
  completedLessonIds: string[];
  currentLessonId: string | null;
  activeLevelTab: LevelTab;
  streakDays: number;
  rewards: number;
  stars: number;
  lastVisitDate: string | null;
  lessonStats: Record<string, LessonStat>;
};

type Action =
  | { type: "HYDRATE"; payload: LearningState }
  | { type: "START_LESSON"; lessonId: string }
  | { type: "EXIT_LESSON" }
  | { type: "SET_ACTIVE_LEVEL"; level: LevelTab }
  | { type: "ANSWER_WRONG"; lessonId: string }
  | { type: "COMPLETE_LESSON"; lessonId: string; starsEarned: number; nextLessonId?: string | null }
  | { type: "UNLOCK_LESSON"; lessonId: string }
  | { type: "UPDATE_STREAK"; streakDays: number; lastVisitDate: string }
  | { type: "ADD_REWARD"; amount: number };

const STORAGE_KEY = "learning-progress-v2";
const LEGACY_KEY = "kids-english-progress";

const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const initialUnlockedLessons = [
  curriculum.units[0]?.lessons[0]?.id,
  curriculum.units[1]?.lessons[0]?.id,
  curriculum.units[2]?.lessons[0]?.id,
].filter(Boolean) as string[];

const initialState: LearningState = {
  unlockedLessonIds: initialUnlockedLessons,
  completedLessonIds: [],
  currentLessonId: null,
  activeLevelTab: "explorer",
  streakDays: 1,
  rewards: 0,
  stars: 0,
  lastVisitDate: null,
  lessonStats: {},
};

function reducer(state: LearningState, action: Action): LearningState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "START_LESSON":
      return { ...state, currentLessonId: action.lessonId, unlockedLessonIds: state.unlockedLessonIds.includes(action.lessonId) ? state.unlockedLessonIds : [...state.unlockedLessonIds, action.lessonId] };
    case "EXIT_LESSON":
      return { ...state, currentLessonId: null };
    case "SET_ACTIVE_LEVEL":
      return { ...state, activeLevelTab: action.level };
    case "ANSWER_WRONG": {
      const current = state.lessonStats[action.lessonId] ?? { attempts: 0, starsEarned: 0, completed: false };
      return {
        ...state,
        lessonStats: {
          ...state.lessonStats,
          [action.lessonId]: { ...current, attempts: current.attempts + 1 },
        },
      };
    }
    case "COMPLETE_LESSON": {
      const current = state.lessonStats[action.lessonId] ?? { attempts: 0, starsEarned: 0, completed: false };
      const nextLessonId = action.nextLessonId ?? getNextLessonId(action.lessonId);
      return {
        ...state,
        currentLessonId: nextLessonId ?? null,
        completedLessonIds: state.completedLessonIds.includes(action.lessonId)
          ? state.completedLessonIds
          : [...state.completedLessonIds, action.lessonId],
        unlockedLessonIds: nextLessonId && !state.unlockedLessonIds.includes(nextLessonId)
          ? [...state.unlockedLessonIds, nextLessonId]
          : state.unlockedLessonIds,
        rewards: state.rewards + action.starsEarned,
        stars: state.stars + action.starsEarned,
        lessonStats: {
          ...state.lessonStats,
          [action.lessonId]: {
            attempts: current.attempts + 1,
            starsEarned: Math.max(current.starsEarned, action.starsEarned),
            completed: true,
          },
        },
      };
    }
    case "UNLOCK_LESSON":
      return state.unlockedLessonIds.includes(action.lessonId)
        ? state
        : { ...state, unlockedLessonIds: [...state.unlockedLessonIds, action.lessonId] };
    case "UPDATE_STREAK":
      return { ...state, streakDays: action.streakDays, lastVisitDate: action.lastVisitDate };
    case "ADD_REWARD":
      return { ...state, rewards: state.rewards + action.amount, stars: state.stars + action.amount };
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: LearningState; dispatch: React.Dispatch<Action> } | null>(null);

const migrateLegacyProgress = (): Partial<LearningState> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as { stars?: number };
    return {
      stars: parsed.stars ?? 0,
      rewards: parsed.stars ?? 0,
    };
  } catch {
    return {};
  }
};

const readStoredState = (): LearningState => {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...initialState, ...migrateLegacyProgress() };
    }

    const parsed = JSON.parse(raw) as Partial<LearningState>;
    return {
      ...initialState,
      ...parsed,
      unlockedLessonIds: parsed.unlockedLessonIds?.length ? parsed.unlockedLessonIds : initialState.unlockedLessonIds,
      completedLessonIds: parsed.completedLessonIds ?? [],
      lessonStats: parsed.lessonStats ?? {},
    };
  } catch {
    return { ...initialState, ...migrateLegacyProgress() };
  }
};

export function LearningStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      dispatch({ type: "HYDRATE", payload: readStoredState() });
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const today = todayKey();
    const yesterday = yesterdayKey();

    if (state.lastVisitDate === today) {
      return;
    }

    const nextStreak = state.lastVisitDate === yesterday ? state.streakDays + 1 : 1;
    dispatch({ type: "UPDATE_STREAK", streakDays: nextStreak, lastVisitDate: today });
  }, [hydrated, state.lastVisitDate, state.streakDays]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearningStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useLearningStore must be used inside LearningStoreProvider");
  }

  return context;
}

export const getNodeState = (
  lessonId: string,
  unlockedLessonIds: string[],
  completedLessonIds: string[],
  currentLessonId: string | null,
) => {
  if (completedLessonIds.includes(lessonId)) {
    return "completed" as const;
  }

  if (currentLessonId === lessonId) {
    return "current" as const;
  }

  return unlockedLessonIds.includes(lessonId) ? "current" as const : "locked" as const;
};

export const totalLessonCount = curriculum.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
