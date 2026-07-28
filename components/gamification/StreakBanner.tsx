"use client";

import { Flame } from "lucide-react";

export const StreakBanner = ({ streak }: { streak: number }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-700 shadow-sm">
      <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
      Chuỗi học {streak} ngày
    </div>
  );
};
