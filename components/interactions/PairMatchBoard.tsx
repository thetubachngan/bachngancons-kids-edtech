"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { PairItem } from "@/data/learningSchema";
import { useSpeech } from "@/hooks/useSpeech";

type CardOption = {
  id: string; // unique card id
  pairId: string;
  type: "english" | "vietnamese";
  text: string;
  emoji?: string;
  audioSrc?: string;
};

export const PairMatchBoard = ({
  pairs,
  onComplete,
  onWrong,
}: {
  pairs: PairItem[];
  onComplete: () => void;
  onWrong?: () => void;
}) => {
  const { speak } = useSpeech();
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [shakingCardId, setShakingCardId] = useState<string | null>(null);

  // Shuffle cards deterministically
  const cards = useMemo(() => {
    const list: CardOption[] = [];
    pairs.forEach((pair) => {
      list.push({
        id: `en-${pair.id}`,
        pairId: pair.id,
        type: "english",
        text: pair.english,
        emoji: pair.emoji,
        audioSrc: pair.audioSrc,
      });
      list.push({
        id: `vi-${pair.id}`,
        pairId: pair.id,
        type: "vietnamese",
        text: pair.vietnamese,
        emoji: pair.emoji,
      });
    });

    // Interleave shuffle
    const englishCards = list.filter((c) => c.type === "english");
    const vietnameseCards = [...list.filter((c) => c.type === "vietnamese")].reverse();
    const result: CardOption[] = [];
    for (let i = 0; i < englishCards.length; i += 1) {
      if (englishCards[i]) result.push(englishCards[i]);
      if (vietnameseCards[i]) result.push(vietnameseCards[i]);
    }
    return result;
  }, [pairs]);

  const handleCardClick = (card: CardOption) => {
    if (matchedPairIds.includes(card.pairId)) return;

    if (card.audioSrc) {
      speak({
        text: card.text,
        audioSrc: card.audioSrc,
        kind: "word",
        rate: 0.4,
        source: "lesson",
        mode: "manual",
        interrupt: "all",
      });
    }

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Check if correct match (same pairId, different type)
    if (selectedCard.pairId === card.pairId && selectedCard.type !== card.type) {
      const nextMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatched);
      setSelectedCard(null);

      if (nextMatched.length === pairs.length) {
        window.setTimeout(() => {
          onComplete();
        }, 400);
      }
    } else {
      // Wrong match
      setShakingCardId(card.id);
      onWrong?.();
      window.setTimeout(() => {
        setShakingCardId(null);
        setSelectedCard(null);
      }, 500);
    }
  };

  return (
    <div className="space-y-4 rounded-[2.5rem] bg-gradient-to-b from-sky-50/80 to-indigo-50/50 p-5 shadow-2xl border-4 border-white">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" /> Match Madness
        </div>
        <h3 className="text-xl font-black text-slate-800">Chạm cặp từ và nghĩa tương ứng!</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <AnimatePresence>
          {cards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isSelected = selectedCard?.id === card.id;
            const isShaking = shakingCardId === card.id;

            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ scale: isMatched ? 1 : 1.03 }}
                whileTap={{ scale: isMatched ? 1 : 0.95 }}
                animate={
                  isShaking
                    ? { x: [-8, 8, -8, 8, 0] }
                    : isMatched
                      ? { scale: 0.96, opacity: 0.4 }
                      : isSelected
                        ? { scale: 1.05 }
                        : { scale: 1 }
                }
                onClick={() => handleCardClick(card)}
                disabled={isMatched}
                className={`relative flex min-h-[76px] items-center justify-between gap-2 rounded-2xl border-b-4 px-4 py-3 text-left transition-all ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-inner"
                    : isSelected
                      ? "border-sky-500 bg-sky-400 text-sky-950 ring-4 ring-sky-200 shadow-lg"
                      : "border-slate-200 bg-white text-slate-800 shadow-md hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {card.emoji && <span className="text-2xl shrink-0">{card.emoji}</span>}
                  <span className="text-base font-black tracking-wide leading-tight truncate">
                    {card.text}
                  </span>
                </div>

                {isMatched && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
