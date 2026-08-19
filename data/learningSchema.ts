export type Skill = "listening" | "speaking" | "reading" | "writing";
export type NodeState = "locked" | "current" | "completed";
export type QuizType =
  | "mcq"
  | "drag-drop"
  | "voice"
  | "tap-match"
  | "pair-match"
  | "sentence-builder"
  | "flashcard-preview";

export type LessonChoice = {
  id: string;
  label: string;
  emoji?: string;
  audioSrc?: string;
  imageSrc?: string;
  hint?: string;
};

export type LessonVisual = {
  title: string;
  subtitle?: string;
  emoji?: string;
  imageSrc?: string;
  audioSrc?: string;
};

export type PairItem = {
  id: string;
  english: string;
  vietnamese: string;
  emoji?: string;
  audioSrc?: string;
};

export type PhonemeDetail = {
  ipa: string;
  audioSrc?: string;
};

export type FlashcardItem = {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  phonemes?: string[];
  emoji?: string;
  audioSrc?: string;
  example?: string;
};

export type LessonStep =
  | {
      id: string;
      type: "mcq";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      questionAudioText?: string;
      questionAudioSrc?: string;
      choices: LessonChoice[];
      answerId: string;
    }
  | {
      id: string;
      type: "tap-match";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      questionAudioText?: string;
      questionAudioSrc?: string;
      choices: LessonChoice[];
      answerId: string;
    }
  | {
      id: string;
      type: "drag-drop";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      targetWord: string;
      answer: string;
      letterBank: string[];
      revealWord?: boolean;
    }
  | {
      id: string;
      type: "voice";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      expectedText: string;
      expectedAudioText?: string;
      expectedAudioSrc?: string;
      helperText?: string;
    }
  | {
      id: string;
      type: "pair-match";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      pairs: PairItem[];
    }
  | {
      id: string;
      type: "sentence-builder";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      sentence: string;
      translation: string;
      scrambledWords: string[];
      questionAudioSrc?: string;
    }
  | {
      id: string;
      type: "flashcard-preview";
      prompt: string;
      skill: Skill;
      visual: LessonVisual;
      items: FlashcardItem[];
    };

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  description: string;
  level: number;
  skill: Skill;
  rewardStars: number;
  targetWordIds: string[];
  steps: LessonStep[];
};

export type Unit = {
  id: string;
  level: number;
  title: string;
  description: string;
  mascotMood: "happy" | "encouraging" | "celebrating";
  lessons: Lesson[];
};

export type Curriculum = {
  units: Unit[];
};
