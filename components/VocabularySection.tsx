"use client";

import { BookMarked, Sparkles, Volume2 } from "lucide-react";

import { Flashcard } from "@/components/Flashcard";
import type { AgeLevel, Topic } from "@/data/englishData";
import { useSpeech } from "@/hooks/useSpeech";

type VocabularySectionProps = {
  level: AgeLevel;
  levelLabel: string;
  vocabularyHint: string;
  topics: Topic[];
  selectedTopicId: string;
  learnedWords: string[];
  practiceCounts: Record<string, number>;
  onSelectTopic: (topicId: string) => void;
  onPracticeWord: (wordId: string) => void;
};

const headerCopy: Record<AgeLevel, { title: string; description: string }> = {
  explorer: {
    title: "Khám phá từ đầu tiên",
    description: "Nhìn emoji thật to, nghe phát âm rõ ràng và chọn chủ đề bé thích nhất.",
  },
  builder: {
    title: "Kho từ vựng",
    description: "Chọn chủ đề yêu thích, nghe phát âm và lật thẻ để ghi nhớ nhanh hơn.",
  },
  challenger: {
    title: "Từ vựng nâng cao",
    description: "Luyện nghe, đọc ví dụ và chuẩn bị cho thử thách ghép chữ ở cấp độ cao hơn.",
  },
};

export const VocabularySection = ({
  level,
  levelLabel,
  vocabularyHint,
  topics,
  selectedTopicId,
  learnedWords,
  practiceCounts,
  onSelectTopic,
  onPracticeWord,
}: VocabularySectionProps) => {
  const { canSpeak, isReady, speak, preferredVoice } = useSpeech();
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0];
  const learnedSet = new Set(learnedWords);
  const selectedLearnedCount = selectedTopic?.words.filter((word) => learnedSet.has(word.id)).length ?? 0;
  const copy = headerCopy[level];

  if (!selectedTopic) {
    return null;
  }

  return (
    <section className="section-shell mt-8 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-200 p-3 text-yellow-900">
              <BookMarked className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">{copy.title}</h2>
              <p className="text-sm text-slate-500">{copy.description}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-amber-50 p-4 text-sm leading-6 text-slate-600">
            <span className="font-extrabold text-amber-700">{levelLabel}:</span> {vocabularyHint}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => {
              const topicLearned = topic.words.filter((word) => learnedSet.has(word.id)).length;
              const isSelected = topic.id === selectedTopic.id;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onSelectTopic(topic.id)}
                  className={`rounded-[1.6rem] border-2 p-4 text-left transition duration-200 ${
                    isSelected
                      ? `${topic.theme.surfaceClass} border-white shadow-[0_18px_0_rgba(255,255,255,0.6)]`
                      : "border-white/70 bg-white/80 hover:-translate-y-1 hover:shadow-[0_14px_0_rgba(255,255,255,0.55)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-3xl">{topic.icon}</div>
                      <h3 className={`mt-3 text-xl font-extrabold ${topic.theme.accentClass}`}>{topic.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{topic.subtitle}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${topic.theme.badgeClass}`}>
                      {topicLearned}/{topic.words.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`glass-card p-5 sm:p-6 ${selectedTopic.theme.surfaceClass}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTopic.icon}</span>
                <div>
                  <h3 className={`text-2xl font-extrabold ${selectedTopic.theme.accentClass}`}>{selectedTopic.title}</h3>
                  <p className="text-sm text-slate-600">{selectedTopic.subtitle}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {level === "explorer"
                  ? "Bé chỉ cần nghe thật rõ và nhận ra emoji đúng là đã có thể bắt đầu làm quen tiếng Anh rồi."
                  : level === "builder"
                    ? "Bé chỉ cần nghe mỗi từ ít nhất 3 lần là hệ thống sẽ đánh dấu đã thuộc và thưởng sao tự động."
                    : "Hãy nghe kỹ, đọc ví dụ và chuẩn bị cho phần thử thách ghép chữ ở cấp độ khó hơn nhé."}
              </p>
            </div>

            <div className="space-y-2 rounded-[1.5rem] bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Tiến độ chủ đề
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all"
                  style={{ width: `${(selectedLearnedCount / selectedTopic.words.length) * 100}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {selectedLearnedCount}/{selectedTopic.words.length} từ đã thuộc
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
              <Volume2 className="h-4 w-4 text-sky-500" />
              {isReady ? (canSpeak ? "Có thể phát âm trực tiếp" : "Trình duyệt chưa hỗ trợ phát âm") : "Đang kiểm tra hỗ trợ phát âm..."}
            </span>
            {isReady && preferredVoice ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
                Giọng đang chọn: {preferredVoice.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {selectedTopic.words.map((word) => (
          <Flashcard
            key={word.id}
            word={word}
            theme={selectedTopic.theme}
            level={level}
            practiceCount={practiceCounts[word.id] ?? 0}
            isLearned={learnedSet.has(word.id)}
            onHearWord={() => {
              speak({
                text: word.speechText ?? word.word,
                kind: word.word.includes(" ") ? "phrase" : "word",
                source: "vocabulary",
                mode: "manual",
                interrupt: "all",
              });
              onPracticeWord(word.id);
            }}
            onHearExample={() => {
              speak({
                text: word.exampleSpeechText ?? word.example,
                kind: "sentence",
                rate: 0.76,
                source: "vocabulary",
                mode: "manual",
                interrupt: "all",
              });
              onPracticeWord(word.id);
            }}
          />
        ))}
      </div>
    </section>
  );
};
