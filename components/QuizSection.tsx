"use client";

import { useState } from "react";
import { BrainCircuit, RotateCcw, Star, Trophy, Volume2 } from "lucide-react";

import type { AgeLevel, QuizMode, VocabularyWord } from "@/data/englishData";
import { useSpeech } from "@/hooks/useSpeech";
import { triggerQuizSuccess } from "@/utils/confetti";
import { playErrorSound, playSuccessSound } from "@/utils/soundEffects";

type QuizSectionProps = {
  level: AgeLevel;
  levelLabel: string;
  mode: QuizMode;
  words: VocabularyWord[];
  highScore: number;
  onEarnStars: (amount: number) => void;
  onSaveHighScore: (score: number) => void;
};

type EmojiQuestion = {
  type: "emoji";
  id: string;
  prompt: string;
  speechText: string;
  audioSrc?: string;
  correctAnswer: string;
  options: string[];
};

type MeaningQuestion = {
  type: "meaning";
  id: string;
  prompt: string;
  speechText: string;
  audioSrc?: string;
  emoji: string;
  correctAnswer: string;
  options: string[];
};

type SpellingQuestion = {
  type: "spelling";
  id: string;
  prompt: string;
  speechText: string;
  audioSrc?: string;
  emoji: string;
  translation: string;
  answerText: string;
  letterBank: string[];
};

type QuizQuestion = EmojiQuestion | MeaningQuestion | SpellingQuestion;

const shuffleArray = <T,>(items: T[]) => {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }

  return cloned;
};

const buildLetterBank = (answer: string) => {
  const letters = answer.toUpperCase().split("");
  const filler = ["A", "E", "I", "O", "U", "R", "S", "T", "L", "N"];
  const needed = Math.min(4, Math.max(2, 8 - letters.length));

  return shuffleArray([...letters, ...shuffleArray(filler).slice(0, needed)]);
};

const createQuestions = (mode: QuizMode, words: VocabularyWord[]) => {
  const baseWords = mode === "spelling" ? words.filter((word) => !word.word.includes(" ")) : words;
  const selectedWords = shuffleArray(baseWords.length ? baseWords : words).slice(0, 5);

  return selectedWords.map<QuizQuestion>((word) => {
    if (mode === "emoji") {
      const options = shuffleArray(words.filter((candidate) => candidate.id !== word.id).map((candidate) => candidate.emoji)).slice(0, 3);

      return {
        type: "emoji",
        id: word.id,
        prompt: word.word,
        speechText: word.speechText ?? word.word,
        audioSrc: word.audioSrc,
        correctAnswer: word.emoji,
        options: shuffleArray([word.emoji, ...options]),
      };
    }

    if (mode === "spelling") {
      const answerText = word.word.replace(/\s+/g, "").toUpperCase();

      return {
        type: "spelling",
        id: word.id,
        prompt: word.word,
        speechText: word.speechText ?? word.word,
        audioSrc: word.audioSrc,
        emoji: word.emoji,
        translation: word.translation,
        answerText,
        letterBank: buildLetterBank(answerText),
      };
    }

    const distractors = shuffleArray(
      words.filter((candidate) => candidate.id !== word.id).map((candidate) => candidate.translation),
    ).slice(0, 3);

    return {
      type: "meaning",
      id: word.id,
      prompt: word.word,
      speechText: word.speechText ?? word.word,
      audioSrc: word.audioSrc,
      emoji: word.emoji,
      correctAnswer: word.translation,
      options: shuffleArray([word.translation, ...distractors]),
    };
  });
};

const copyByMode: Record<
  QuizMode,
  {
    title: string;
    description: string;
    reward: string;
    questionLabel: string;
  }
> = {
  emoji: {
    title: "Nghe & Chọn Emoji",
    description: "Bé nghe từ tiếng Anh rồi chọn emoji đúng thật nhanh.",
    reward: "Mỗi câu đúng = +2 sao vàng và thêm tự tin khi nhận diện hình ảnh.",
    questionLabel: "Hãy chọn emoji đúng với từ vừa nghe nhé.",
  },
  meaning: {
    title: "Mini Quiz 4 đáp án",
    description: "Nghe từ tiếng Anh, chọn nghĩa đúng và thu thập thật nhiều sao vàng.",
    reward: "Mỗi câu đúng = +2 sao vàng để luyện phản xạ dịch nghĩa.",
    questionLabel: "Từ này có nghĩa là gì trong tiếng Việt?",
  },
  spelling: {
    title: "Thử thách ghép chữ",
    description: "Nghe từ, nhìn gợi ý rồi bấm ghép chữ theo đúng thứ tự chính tả.",
    reward: "Mỗi câu đúng = +2 sao vàng và tăng phản xạ viết chính xác.",
    questionLabel: "Hãy ghép chữ cái đúng để hoàn thành từ tiếng Anh.",
  },
};

export const QuizSection = ({ level, levelLabel, mode, words, highScore, onEarnStars, onSaveHighScore }: QuizSectionProps) => {
  const { speak } = useSpeech();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => createQuestions(mode, words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [spellingAnswer, setSpellingAnswer] = useState<string[]>([]);
  const [usedLetterIndexes, setUsedLetterIndexes] = useState<number[]>([]);

  const copy = copyByMode[mode];
  const currentQuestion = questions[currentIndex];

  const resetRoundState = () => {
    setSelectedOption(null);
    setSpellingAnswer([]);
    setUsedLetterIndexes([]);
  };

  const resetQuiz = () => {
    setQuestions(createQuestions(mode, words));
    setCurrentIndex(0);
    setScore(0);
    setShowSummary(false);
    resetRoundState();
  };

  const moveNext = (nextScore: number) => {
    window.setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        setShowSummary(true);
        onSaveHighScore(nextScore);
        return;
      }

      setCurrentIndex((current) => current + 1);
      resetRoundState();
    }, 900);
  };

  const handleCorrectAnswer = (nextScore: number) => {
    setScore(nextScore);
    onEarnStars(2);
    triggerQuizSuccess();
    void playSuccessSound();
    moveNext(nextScore);
  };

  const handleWrongAnswer = (nextScore: number) => {
    void playErrorSound();
    moveNext(nextScore);
  };

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || currentQuestion.type === "spelling" || selectedOption) {
      return;
    }

    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = option === correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;

    setSelectedOption(option);

    if (isCorrect) {
      handleCorrectAnswer(nextScore);
      return;
    }

    handleWrongAnswer(nextScore);
  };

  const handlePickLetter = (letter: string, index: number) => {
    if (!currentQuestion || currentQuestion.type !== "spelling" || usedLetterIndexes.includes(index)) {
      return;
    }

    const nextAnswer = [...spellingAnswer, letter];
    const nextUsedIndexes = [...usedLetterIndexes, index];

    setSpellingAnswer(nextAnswer);
    setUsedLetterIndexes(nextUsedIndexes);

    if (nextAnswer.length !== currentQuestion.answerText.length) {
      return;
    }

    const formedWord = nextAnswer.join("");
    const isCorrect = formedWord === currentQuestion.answerText;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      handleCorrectAnswer(nextScore);
      return;
    }

    handleWrongAnswer(nextScore);
  };

  const handleRemoveLastLetter = () => {
    setSpellingAnswer((current) => current.slice(0, -1));
    setUsedLetterIndexes((current) => current.slice(0, -1));
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
              <h2 className="text-2xl font-extrabold text-slate-800">{copy.title}</h2>
              <p className="text-sm text-slate-500">{copy.description}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-amber-50 p-4 text-sm leading-6 text-slate-600">
            <span className="font-extrabold text-amber-700">{levelLabel}:</span> {copy.reward}
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-yellow-100 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-yellow-950">
                <Star className="h-4 w-4" />
                {mode === "spelling" ? "Hoàn thành đúng cả từ để nhận sao" : "Mỗi câu đúng = +2 sao vàng"}
              </div>
              <p className="mt-2 text-sm text-slate-600">{copy.questionLabel}</p>
            </div>

            <div className="rounded-[1.5rem] bg-sky-100 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-sky-950">
                <Trophy className="h-4 w-4" />
                Kỷ lục hiện tại: {highScore}/{questions.length}
              </div>
              <p className="mt-2 text-sm text-slate-600">{level === "explorer" ? "Bé chỉ cần nghe và chọn thật nhanh." : level === "builder" ? "Bé có thể chơi lại nhiều lần vì bộ câu hỏi sẽ đảo đáp án mỗi lượt." : "Bé nghe từ, nhìn gợi ý và ghép chữ thật chính xác."}</p>
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
                        audioSrc: currentQuestion.audioSrc,
                        kind: currentQuestion.prompt.includes(" ") ? "phrase" : "word",
                        rate: currentQuestion.prompt.includes(" ") ? 0.5 : 0.42,
                        source: "quiz",
                        mode: "manual",
                        interrupt: "all",
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
                  <div className="text-6xl">{currentQuestion.type === "emoji" ? "🎧" : currentQuestion.emoji}</div>
                  <h4 className="mt-4 text-3xl font-extrabold text-slate-800">{currentQuestion.prompt}</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {currentQuestion.type === "emoji"
                      ? "Nghe từ và chọn emoji đúng nhé."
                      : currentQuestion.type === "meaning"
                        ? "Từ này có nghĩa là gì trong tiếng Việt?"
                        : `Gợi ý: ${currentQuestion.translation}`}
                  </p>
                </div>
              </div>

              {currentQuestion.type === "spelling" ? (
                <div className="space-y-4">
                  <div className="rounded-[1.8rem] border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-500">Câu trả lời của bé</p>
                    <div className="mt-4 flex min-h-16 flex-wrap items-center justify-center gap-2">
                      {spellingAnswer.length ? (
                        spellingAnswer.map((letter, index) => (
                          <span key={`${letter}-${index}`} className="rounded-2xl bg-white px-4 py-3 text-2xl font-extrabold text-violet-700 shadow-sm">
                            {letter}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">Hãy bấm các chữ cái bên dưới để ghép từ.</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLastLetter}
                      className="kid-button mt-4 border-violet-600 bg-violet-300 text-violet-950"
                      disabled={!spellingAnswer.length}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Xóa chữ cuối
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    {currentQuestion.letterBank.map((letter, index) => (
                      <button
                        key={`${letter}-${index}`}
                        type="button"
                        onClick={() => handlePickLetter(letter, index)}
                        disabled={usedLetterIndexes.includes(index)}
                        className={usedLetterIndexes.includes(index) ? "kid-button border-slate-300 bg-slate-100 text-slate-400" : "kid-button border-lime-600 bg-lime-300 text-lime-950"}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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
                        className={`min-h-28 rounded-[1.8rem] border-2 px-5 py-4 text-center text-lg font-extrabold transition ${stateClass}`}
                        disabled={Boolean(selectedOption)}
                      >
                        {currentQuestion.type === "emoji" ? <span className="text-5xl">{option}</span> : option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
