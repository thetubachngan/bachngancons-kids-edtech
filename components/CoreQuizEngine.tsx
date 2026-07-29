"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Star, Volume2, X } from "lucide-react";

import { useSpeech } from "@/hooks/useSpeech";
import type { Lesson, LessonChoice, LessonStep } from "@/data/learningSchema";
import { playFeedbackSound } from "@/utils/html5Audio";
import { TapChoiceGrid } from "@/components/interactions/TapChoiceGrid";
import { LetterBoard } from "@/components/interactions/LetterBoard";
import { VoiceRecorderPanel } from "@/components/interactions/VoiceRecorderPanel";
import { Mascot } from "@/components/gamification/Mascot";

export const CoreQuizEngine = ({
  lesson,
  onCompleteLesson,
  onExit,
  onProgress,
}: {
  lesson: Lesson;
  onCompleteLesson: (lessonId: string, starsEarned: number) => void;
  onExit: () => void;
  onProgress?: (progress: number) => void;
}) => {
  const { speak, stop } = useSpeech();
  const [stepIndex, setStepIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [shake, setShake] = useState(false);
  const [isResolvingChoice, setIsResolvingChoice] = useState(false);
  const wrongTimeoutRef = useRef<number | null>(null);
  const nextTimeoutRef = useRef<number | null>(null);

  const step = lesson.steps[stepIndex];
  const progress = useMemo(() => (lesson.steps.length ? (stepIndex + 1) / lesson.steps.length : 1), [lesson.steps.length, stepIndex]);
  const mascotMood: "happy" | "encouraging" | "celebrating" | "oops" =
    feedback === "correct"
      ? "happy"
      : feedback === "wrong"
        ? "oops"
        : stepIndex === lesson.steps.length - 1
          ? "celebrating"
          : "encouraging";

  useEffect(() => {
    onProgress?.(progress);
  }, [onProgress, progress]);

  useEffect(() => {
    stop();

    if (wrongTimeoutRef.current) window.clearTimeout(wrongTimeoutRef.current);
    if (nextTimeoutRef.current) window.clearTimeout(nextTimeoutRef.current);

    return () => {
      stop();
    };
  }, [lesson.id, step, stop]);

  const goNext = () => {
    if (stepIndex >= lesson.steps.length - 1) {
      onCompleteLesson(lesson.id, lesson.rewardStars);
      return;
    }

    setAnswered(false);
    setFeedback("idle");
    setShake(false);
    setIsResolvingChoice(false);
    setStepIndex((current) => current + 1);
  };

  const handleCorrect = async () => {
    if (answered || isResolvingChoice) return;

    setAnswered(true);
    setFeedback("correct");
    setShake(false);
    setIsResolvingChoice(true);
    await playFeedbackSound("correct");

    nextTimeoutRef.current = window.setTimeout(() => {
      goNext();
    }, 420);
  };

  const handleWrong = async () => {
    if (answered || isResolvingChoice) return;

    setIsResolvingChoice(true);
    setFeedback("wrong");
    setShake(true);
    await playFeedbackSound("wrong");
    wrongTimeoutRef.current = window.setTimeout(() => {
      setShake(false);
      setFeedback("idle");
      setIsResolvingChoice(false);
    }, 320);
  };

  const playChoiceAudio = (choice: LessonChoice, afterSpeak?: () => void) => {
    const spokenText = choice.hint ?? choice.label;

    speak({
      text: spokenText,
      audioSrc: choice.audioSrc,
      kind: spokenText.includes(" ") ? "phrase" : "word",
      rate: spokenText.includes(" ") ? 0.48 : 0.4,
      source: "lesson",
      mode: "manual",
      interrupt: "all",
      onEnd: afterSpeak,
    });
  };

  const renderStep = (currentStep: LessonStep) => {
    if (currentStep.type === "mcq") {
      return (
        <TapChoiceGrid
          choices={currentStep.choices}
          selectedId={answered && feedback === "correct" ? currentStep.answerId : null}
          onSelect={(choice: LessonChoice) => {
            if (answered || isResolvingChoice) return;
            if (choice.id === currentStep.answerId) {
              handleCorrect();
              return;
            }
            handleWrong();
          }}
          onPreviewChoice={(choice) => {
            if (answered) return;
            playChoiceAudio(choice);
          }}
          disabled={answered || isResolvingChoice}
        />
      );
    }

    if (currentStep.type === "tap-match") {
      return (
        <TapChoiceGrid
          choices={currentStep.choices}
          selectedId={answered && feedback === "correct" ? currentStep.answerId : null}
          mode="emoji"
          onSelect={(choice) => {
            if (answered || isResolvingChoice) return;
            if (choice.id === currentStep.answerId) {
              handleCorrect();
              return;
            }
            handleWrong();
          }}
          onPreviewChoice={(choice) => {
            if (answered) return;
            playChoiceAudio(choice);
          }}
          disabled={answered || isResolvingChoice}
        />
      );
    }

    if (currentStep.type === "drag-drop") {
      return (
        <LetterBoard
          answer={currentStep.answer}
          letterBank={currentStep.letterBank}
          disabled={answered || isResolvingChoice}
          onComplete={handleCorrect}
          onWrong={handleWrong}
        />
      );
    }

    return (
      <VoiceRecorderPanel
        expectedText={currentStep.expectedText}
        hint={currentStep.helperText}
        onComplete={handleCorrect}
      />
    );
  };

  if (!step) {
    return null;
  }

  return (
    <div className={`mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 ${shake ? "animate-[shake_0.3s_ease-in-out_1]" : ""}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Core Quiz Engine</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">{lesson.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{lesson.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.08fr]">
        <div className="rounded-[2rem] bg-white p-5 shadow-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">{step.skill}</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">Một màn hình, một nhiệm vụ</h3>
            </div>
            <div className="rounded-full bg-yellow-100 px-3 py-2 text-sm font-black text-yellow-700">
              Step {stepIndex + 1}/{lesson.steps.length}
            </div>
          </div>

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-yellow-400" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-amber-50 via-pink-50 to-sky-50 p-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl sm:text-8xl">{step.visual.emoji ?? "🎯"}</div>
              <h4 className="text-3xl font-black text-slate-900">{step.visual.title}</h4>
              {step.visual.subtitle ? <p className="max-w-md text-sm font-semibold text-slate-600">{step.visual.subtitle}</p> : null}
              {step.visual.imageSrc ? (
                <div className="relative h-52 w-full overflow-hidden rounded-[1.5rem] shadow-md">
                  <Image src={step.visual.imageSrc} alt={step.visual.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="flex flex-col items-center gap-3 rounded-[1.25rem] bg-white px-4 py-4 text-center shadow-sm">
                <div className="flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-sky-700">
                  <Volume2 className="h-4 w-4 text-sky-500" />
                  {step.prompt}
                </div>
                {step.type === "tap-match" || step.type === "mcq" ? (
                  <p className="max-w-md text-sm font-semibold text-slate-500">
                    Bé hãy bấm nút <span className="font-black text-slate-900">Nghe từ</span> bên dưới từng đáp án để nghe chậm và rõ trước khi chọn.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Mascot mood={mascotMood} />
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
              <Star className="h-4 w-4 fill-emerald-400 text-emerald-500" />
              +{lesson.rewardStars}★
            </div>
          </div>

          <div className="mb-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
            {feedback === "correct"
              ? "Chính xác! Con làm rất tốt."
              : feedback === "wrong"
                ? "Chưa đúng, thử lại nhé!"
                : step.type === "tap-match"
                  ? "Bé có thể bấm vào từng icon để nghe phát âm rồi chọn đáp án."
                  : "Con hãy tập trung vào nhiệm vụ bên trái."}
          </div>

          <div className="rounded-[2rem] bg-gradient-to-b from-white to-slate-50 p-3">{renderStep(step)}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
        <CheckCircle2 className="h-4 w-4" />
        Hear • See • Touch • Speak
      </div>
    </div>
  );
};
