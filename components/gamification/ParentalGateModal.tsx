"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, X, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type MathProblem = {
  num1: number;
  num2: number;
  op: "+" | "x";
  answer: number;
};

const generateMathProblem = (): MathProblem => {
  const isMult = Math.random() > 0.5;
  if (isMult) {
    const num1 = Math.floor(Math.random() * 7) + 2;
    const num2 = Math.floor(Math.random() * 7) + 2;
    return { num1, num2, op: "x", answer: num1 * num2 };
  } else {
    const num1 = Math.floor(Math.random() * 30) + 10;
    const num2 = Math.floor(Math.random() * 30) + 10;
    return { num1, num2, op: "+", answer: num1 + num2 };
  }
};

export const ParentalGateModal = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [problem, setProblem] = useState<MathProblem>(generateMathProblem);
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setProblem(generateMathProblem());
      setInputVal("");
      setError(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(inputVal.trim(), 10) === problem.answer) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setInputVal("");
      setProblem(generateMathProblem());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-200 text-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-3 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-black text-slate-900">Xác Nhận Phụ Huynh 👨‍👩‍👧</h3>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Nhập kết quả phép tính bên dưới để truy cập Góc Báo Cáo Học Tập:
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-3 text-2xl font-black text-slate-800 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner">
              <span>{problem.num1}</span>
              <span className="text-amber-600">{problem.op}</span>
              <span>{problem.num2}</span>
              <span>=</span>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="?"
                autoFocus
                className="w-16 rounded-xl border-2 border-amber-400 bg-white p-1 text-center text-2xl font-black text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 animate-bounce">
                Kết quả chưa đúng! Vui lòng thử lại phép tính mới.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setProblem(generateMathProblem());
                  setError(false);
                }}
                className="flex items-center justify-center p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                title="Đổi phép tính"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl border-b-4 border-amber-600 bg-amber-400 py-3 text-sm font-black text-amber-950 shadow-md active:translate-y-[2px] active:border-b-2"
              >
                Xác nhận Truy Cập 🔓
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
