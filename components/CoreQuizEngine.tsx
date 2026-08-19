"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Volume2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useSpeech } from "@/hooks/useSpeech";
import type { Lesson, LessonChoice, LessonStep } from "@/data/learningSchema";
import { playCelebrationMusic, playFeedbackSound } from "@/utils/html5Audio";
import { triggerStepSuccess } from "@/utils/confetti";
import { preloadAudio } from "@/utils/preloadAudio";
import { TapChoiceGrid } from "@/components/interactions/TapChoiceGrid";
import { LetterBoard } from "@/components/interactions/LetterBoard";
import { VoiceRecorderPanel } from "@/components/interactions/VoiceRecorderPanel";
import { PairMatchBoard } from "@/components/interactions/PairMatchBoard";
import { SentenceBuilderBoard } from "@/components/interactions/SentenceBuilderBoard";
import { FlashcardPreview } from "@/components/interactions/FlashcardPreview";
import { Mascot } from "@/components/gamification/Mascot";

export const CoreQuizEngine = ({
  lesson,
  onCompleteLesson,
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

  const lessonAudioSources = useMemo(
    () =>
      lesson.steps.flatMap((lessonStep) => [
        lessonStep.visual.audioSrc,
        "questionAudioSrc" in lessonStep ? lessonStep.questionAudioSrc : undefined,
        ...(lessonStep.type === "mcq" || lessonStep.type === "tap-match" ? lessonStep.choices.flatMap((choice) => [choice.audioSrc]) : []),
      ]).filter(Boolean) as string[],
    [lesson.steps],
  );

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
    preloadAudio(lessonAudioSources);
  }, [lessonAudioSources]);

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
    triggerStepSuccess();
    void playCelebrationMusic("step");
    await playFeedbackSound("correct");

    nextTimeoutRef.current = window.setTimeout(() => {
      goNext();
    }, 750);
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
    }, 650);
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

  const playQuestionAudio = () => {
    if (!step) return;
    const audioSrc = "questionAudioSrc" in step ? step.questionAudioSrc : step.visual.audioSrc;
    speak({
      text: step.prompt,
      audioSrc: audioSrc,
      kind: "phrase",
      rate: 0.48,
      source: "lesson",
      mode: "manual",
      interrupt: "all",
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
          onPreviewLetter={(letter) => {
            speak({
              text: letter,
              kind: "word",
              rate: 0.36,
              source: "lesson",
              mode: "manual",
              interrupt: "all",
            });
          }}
        />
      );
    }

    if (currentStep.type === "pair-match") {
      return (
        <PairMatchBoard
          pairs={currentStep.pairs}
          onComplete={handleCorrect}
          onWrong={handleWrong}
        />
      );
    }

    if (currentStep.type === "sentence-builder") {
      return (
        <SentenceBuilderBoard
          sentence={currentStep.sentence}
          translation={currentStep.translation}
          scrambledWords={currentStep.scrambledWords}
          questionAudioSrc={currentStep.questionAudioSrc}
          onComplete={handleCorrect}
          onWrong={handleWrong}
        />
      );
    }

    if (currentStep.type === "flashcard-preview") {
      return (
        <FlashcardPreview
          items={currentStep.items}
          onComplete={handleCorrect}
        />
      );
    }

    return (
      <VoiceRecorderPanel
        expectedText={currentStep.expectedText}
        hint={currentStep.helperText}
        level={lesson.level}
        sampleText={currentStep.expectedAudioText ?? currentStep.expectedText}
        sampleAudioSrc={currentStep.expectedAudioSrc}
        onComplete={handleCorrect}
      />
    );
  };

  if (!step) {
    return null;
  }

  return (
    <div className="relative flex h-full w-full max-w-lg mx-auto flex-col justify-between p-4 overflow-hidden select-none">
      {/* Question Hero & Mascot Header Card */}
      <div className={`flex flex-col items-center gap-3 transition-transform ${shake ? "animate-[shake_0.3s_ease-in-out_1]" : ""}`}>
        {/* Mascot + Speech Bubble */}
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="shrink-0 scale-90 sm:scale-100">
            <Mascot mood={mascotMood} />
          </div>
          
          {/* Prompt Bubble */}
          <div className="relative flex-1 rounded-2xl border-2 border-amber-200 bg-white p-3.5 shadow-md">
            <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-8 border-r-8 border-y-transparent border-r-white" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-base sm:text-lg font-black text-slate-800 leading-snug">{step.prompt}</p>
              <button
                type="button"
                onClick={playQuestionAudio}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm transition active:scale-95"
                aria-label="Nghe câu hỏi"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Hero Box (Emoji or Image) - Only rendered for MCQ, tap-match, drag-drop */}
        {step.type === "mcq" || step.type === "tap-match" || step.type === "drag-drop" ? (
          <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/70 to-pink-50/50 p-3 sm:p-4 shadow-sm">
            {step.visual.imageSrc ? (
              <div className="relative h-32 sm:h-44 w-full overflow-hidden rounded-xl shadow-inner">
                <Image src={step.visual.imageSrc} alt={step.visual.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="text-5xl sm:text-7xl my-1 drop-shadow-md animate-bounce-short">
                {step.visual.emoji ?? "🎯"}
              </div>
            )}

            {step.visual.title ? (
              <h3 className="mt-1 text-lg sm:text-2xl font-black text-slate-800">{step.visual.title}</h3>
            ) : null}
            {step.visual.subtitle ? (
              <p className="text-xs font-semibold text-slate-500">{step.visual.subtitle}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Answer Choice Interaction Area */}
      <div className="my-auto w-full pt-2">
        {renderStep(step)}
      </div>

      {/* Bottom Sheet Feedback Overlay */}
      <AnimatePresence>
        {feedback !== "idle" ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between rounded-t-3xl border-t-4 p-4 shadow-2xl ${
              feedback === "correct"
                ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                : "border-rose-500 bg-rose-100 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback === "correct" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="text-lg font-black leading-tight">
                  {feedback === "correct" ? "Chính xác! Giỏi quá!" : "Chưa đúng rồi!"}
                </p>
                <p className="text-xs font-semibold opacity-90">
                  {feedback === "correct" ? "Bé nhận được +10 sao ⭐" : "Bé hãy thử chọn lại xem nhé!"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              className={`rounded-2xl border-b-4 px-5 py-2.5 text-sm font-black text-white shadow-md transition active:translate-y-[2px] active:border-b-0 ${
                feedback === "correct" ? "border-emerald-700 bg-emerald-500" : "border-rose-700 bg-rose-500"
              }`}
            >
              Tiếp tục
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

