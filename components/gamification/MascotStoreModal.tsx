"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag, Check } from "lucide-react";
import { useLearningStore } from "@/store/learningStore";
import { Mascot } from "@/components/gamification/Mascot";

export type AccessoryItem = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
};

export const ACCESSORY_ITEMS: AccessoryItem[] = [
  {
    id: "crown",
    name: "Vương Miện Hoàng Gia",
    emoji: "👑",
    cost: 10,
    description: "Biến Ong Bee thành Vua tiếng Anh!",
  },
  {
    id: "sunglasses",
    name: "Kính Mát Ngầu",
    emoji: "🕶️",
    cost: 15,
    description: "Phong cách siêu ngầu cho Bee!",
  },
  {
    id: "grad-cap",
    name: "Mũ Cử Nhân",
    emoji: "🎓",
    cost: 20,
    description: "Mũ cử nhân thông thái!",
  },
  {
    id: "pink-bow",
    name: "Nơ Hồng Xinh",
    emoji: "🎀",
    cost: 10,
    description: "Nơ hồng ngọt ngào dễ thương!",
  },
  {
    id: "super-cape",
    name: "Áo Siêu Nhân",
    emoji: "🦸",
    cost: 25,
    description: "Anh hùng Ong Bee bay cao!",
  },
  {
    id: "headphones",
    name: "Tai Nghe DJ",
    emoji: "🎧",
    cost: 15,
    description: "Thưởng thức âm nhạc tiếng Anh!",
  },
];

export const MascotStoreModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { state, dispatch } = useLearningStore();

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-b from-white via-amber-50/50 to-sky-50 p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-md">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Tủ Đồ Ong Bee 🐝</h3>
                <p className="text-xs font-bold text-slate-500">Đổi Sao (⭐) lấy trang phục ngầu cho Bee!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Bee & Stars Display */}
          <div className="my-4 flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="scale-75 origin-left">
                <Mascot mood="happy" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-amber-700 tracking-wider">Trang phục hiện tại</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {ACCESSORY_ITEMS.find((a) => a.id === state.equippedAccessoryId)?.name ?? "Ong Bee Nguyên Bản 🐝"}
                </p>
              </div>
            </div>

            <div className="stat-chip bg-amber-300 text-amber-950 border-b-2 border-amber-500 shadow-md">
              <Star className="h-4 w-4 fill-amber-700 text-amber-800" />
              <span>{state.stars} Sao</span>
            </div>
          </div>

          {/* Grid of Accessories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
            {/* Unequip Default Option */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: "EQUIP_ACCESSORY", accessoryId: null })}
              className={`flex flex-col items-center justify-between rounded-2xl border-2 p-3 text-center transition-all ${
                state.equippedAccessoryId === null
                  ? "border-emerald-400 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span className="text-4xl my-1">🐝</span>
              <span className="text-xs font-black">Bee Nguyên Bản</span>
              <span className="mt-1 text-[10px] font-bold text-emerald-700">
                {state.equippedAccessoryId === null ? "✓ Đang mặc" : "Mặc định"}
              </span>
            </motion.button>

            {ACCESSORY_ITEMS.map((item) => {
              const isUnlocked = state.unlockedAccessories.includes(item.id);
              const isEquipped = state.equippedAccessoryId === item.id;
              const canAfford = state.stars >= item.cost;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isUnlocked) {
                      dispatch({ type: "EQUIP_ACCESSORY", accessoryId: item.id });
                    } else if (canAfford) {
                      dispatch({ type: "BUY_ACCESSORY", accessoryId: item.id, cost: item.cost });
                    }
                  }}
                  className={`relative flex flex-col items-center justify-between rounded-2xl border-2 p-3 text-center transition-all ${
                    isEquipped
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300"
                      : isUnlocked
                        ? "border-sky-300 bg-sky-50 text-sky-950"
                        : canAfford
                          ? "border-amber-300 bg-white hover:border-amber-400"
                          : "border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                  }`}
                >
                  <span className="text-4xl my-1 drop-shadow-sm">{item.emoji}</span>
                  <span className="text-xs font-black leading-tight line-clamp-1">{item.name}</span>

                  <div className="mt-1 flex items-center justify-center gap-1">
                    {isEquipped ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                        <Check className="h-3.5 w-3.5" /> Đang mặc
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] font-black text-sky-700">Dùng ngay</span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${canAfford ? "text-amber-700" : "text-slate-400"}`}>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> {item.cost}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Close Action */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="kid-button border-amber-600 bg-amber-400 text-amber-950 px-8 py-2.5 text-sm"
            >
              Hoàn tất ✨
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
