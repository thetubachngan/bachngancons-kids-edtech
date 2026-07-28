export type Skill = "listening" | "speaking" | "reading" | "writing";
export type NodeState = "locked" | "current" | "completed";
export type QuizType = "mcq" | "drag-drop" | "voice" | "tap-match";

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
