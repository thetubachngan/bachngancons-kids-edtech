"use client";

import { useState } from "react";
import { BrainCircuit, RotateCcw, Star, Trophy, Volume2 } from "lucide-react";

import type { VocabularyWord } from "@/data/englishData";
import { useSpeech } from "@/hooks/useSpeech";
import { triggerQuizSuccess } from "@/utils/confetti";
import { playErrorSound, playSuccessSound } from "@/utils/soundEffects";

type QuizSectionProps = {
  words: VocabularyWord[];
  highScore: number;
  onEarnStars: (amount: number) => void;
  onSaveHighScore: (score: number) => void;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  speechText: string;
  emoji: string;
  correctAnswer: string;
  options: string[];
};

const shuffleArray = <T,>(items: T[]) => {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }

  return cloned;
};

const createQuestions = (words: VocabularyWord[]) => {
  const selectedWords = shuffleArray(words).slice(0, 5);

  return selectedWords.map<QuizQuestion>((word) => {
    const distractors = shuffleArray(
      words.filter((candidate) => candidate.id !== word.id).map((candidate) => candidate.translation),
    ).slice(0, 3);

    return {
      id: word.id,
      prompt: word.word,
      speechText: word.speechText ?? word.word,
      emoji: word.emoji,
      correctAnswer: word.translation,
      options: shuffleArray([word.translation, ...distractors]),
    };
  });
};

export const QuizSection = ({ words, highScore, onEarnStars, onSaveHighScore }: QuizSectionProps) => {
  const { speak } = useSpeech();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => createQuestions(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = questions[currentIndex];

  const resetQuiz = () => {
    setQuestions(createQuestions(words));
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowSummary(false);
  };

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || selectedOption) {
      return;
    }

    const isCorrect = option === currentQuestion.correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;

    setSelectedOption(option);

    if (isCorrect) {
      setScore(nextScore);
      onEarnStars(2);
      triggerQuizSuccess();
      void playSuccessSound();
    } else {
      void playErrorSound();
    }

    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        setShowSummary(true);
        onSaveHighScore(nextScore);
        return;
      }

      setCurrentIndex((current) => current + 1);
      setSelectedOption(null);
    }, 900);
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <section className="section-shell mt-8 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-200 p-3 text-sky-900">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Mini Quiz</h2>
              <p className="text-sm text-slate-500">Nghe từ tiếng Anh, chọn nghĩa đúng và thu thập thật nhiều sao vàng.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-yellow-100 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-yellow-950">
                <Star className="h-4 w-4" />
                Mỗi câu đúng = +2 sao vàng
              </div>
              <p className="mt-2 text-sm text-slate-600">Nếu phá kỷ lục hiện tại, hệ thống sẽ lưu ngay vào tiến trình học của bé.</p>
            </div>

            <div className="rounded-[1.5rem] bg-sky-100 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-sky-950">
                <Trophy className="h-4 w-4" />
                Kỷ lục hiện tại: {highScore}/{questions.length}
              </div>
              <p className="mt-2 text-sm text-slate-600">Bé có thể chơi lại nhiều lần vì bộ câu hỏi sẽ đảo đáp án mỗi lượt.</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6">
          {showSummary ? (
            <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-yellow-100 via-white to-pink-100 p-6 text-center">
              <div className="text-6xl">🏆</div>
              <h3 className="mt-4 text-3xl font-extrabold text-slate-800">Bé làm rất tốt!</h3>
              <p className="mt-2 text-lg font-semibold text-slate-600">
                Điểm của bé là <span className="text-amber-600">{score}/{questions.length}</span>
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Hãy bấm chơi lại để luyện phản xạ nhanh hơn và tiếp tục sưu tầm thêm nhiều sao vàng nhé.
              </p>
              <button type="button" onClick={resetQuiz} className="kid-button mt-6 border-pink-600 bg-pink-300 text-pink-950">
                <RotateCcw className="h-4 w-4" />
                Chơi lại
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-yellow-100 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">Câu hỏi</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                      {currentIndex + 1}/{questions.length}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speak({
                        text: currentQuestion.speechText,
                        kind: "word",
                      })
                    }
                    className="kid-button border-sky-600 bg-sky-300 text-sky-950"
                  >
                    <Volume2 className="h-4 w-4" />
                    Nghe từ
                  </button>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-all"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="rounded-[1.8rem] bg-white p-6 text-center shadow-sm">
                  <div className="text-6xl">{currentQuestion.emoji}</div>
                  <h4 className="mt-4 text-3xl font-extrabold text-slate-800">{currentQuestion.prompt}</h4>
                  <p className="mt-2 text-sm text-slate-500">Từ này có nghĩa là gì trong tiếng Việt?</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const isSelected = option === selectedOption;

                  let stateClass = "border-white bg-white hover:-translate-y-1 hover:shadow-[0_14px_0_rgba(255,255,255,0.55)]";

                  if (selectedOption) {
                    if (isCorrectOption) {
                      stateClass = "border-emerald-300 bg-emerald-100 text-emerald-950";
                    } else if (isSelected) {
                      stateClass = "border-rose-300 bg-rose-100 text-rose-950";
                    } else {
                      stateClass = "border-white/70 bg-white/80 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`min-h-28 rounded-[1.8rem] border-2 px-5 py-4 text-left text-lg font-extrabold transition ${stateClass}`}
                      disabled={Boolean(selectedOption)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
