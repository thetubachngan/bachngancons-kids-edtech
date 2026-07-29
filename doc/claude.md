# THIẾT KẾ GIAO DIỆN, UI/UX & HOẠT ẢNH MƯỢT MÀ (TỪ CLAUDE)
## ỨNG DỤNG WEB HỌC TIẾNG ANH CHO TRẺ EM (KIDS EDTECH APP)

Tài liệu này tập trung vào thiết kế thẩm mỹ UI/UX EdTech cao cấp, hệ màu sắc Pastel vui nhộn, phím bấm & Node 3D, các kịch bản chuyển động (Framer Motion, CSS Animation) và trải nghiệm giao diện người dùng theo mô hình Learning Path & Focus Shell mới nhất.

---

### 1. NGUYÊN TẮC THIẾT KẾ UI/UX EDTECH & HỆ MÀU SẮC PASTEL

Ứng dụng hướng tới trẻ em từ 5-9+ tuổi, do đó giao diện cần loại bỏ phong cách xám xịt của doanh nghiệp, thay vào đó là hệ màu tươi sáng, ấm áp và chống mỏi mắt lấy cảm hứng từ các nền tảng edtech lớn (Duolingo ABC, Lingokids):

- **Màu nền ứng dụng**: `bg-gradient-to-b from-amber-50 via-pink-50 to-sky-50` (Vàng kem chuyển sắc mượt mà, thân thiện, dịu mắt).
- **Màu sắc 3 Cấp độ (Unit Paths)**:
  - **Explorer Path (5-6 tuổi)**: `bg-amber-100 border-amber-300 text-amber-900` (Vàng tươi ngộ nghĩnh).
  - **Builder Trail (7-8 tuổi)**: `bg-emerald-100 border-emerald-300 text-emerald-900` (Xanh Mint dịu mát).
  - **Challenger Run (9+ tuổi)**: `bg-sky-100 border-sky-300 text-sky-900` (Xanh da trời năng động).
- **Thiết kế Nút bấm 3D dạng Phím Đồ chơi Nhựa**:
  Sử dụng shadow dày phía dưới cùng hiệu ứng `active:translate-y-[4px]` để giả lập nút bấm nhựa ngoài đời thật:
  ```html
  <button class="px-6 py-3.5 bg-yellow-400 text-yellow-950 font-black rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-[4px] transition-all text-lg shadow-lg hover:bg-yellow-300">
    Bắt đầu học ngay 🚀
  </button>
  ```

---

### 2. GIAO DIỆN BẢN ĐỒ HỌC TẬP ZICZAC (`LearningMap.tsx`)

Bản đồ bài học thể hiện tiến trình tuyến tính sinh động với các Node bài học tương tác theo các trạng thái:

- **`completed`**: Mở khóa, viền vàng rực rỡ, hiển thị sao vàng `★` tích lũy.
- **`current`**: Node hiện tại với hiệu ứng nảy/phát sáng nhịp nhàng thu hút bé bấm vào.
- **`locked`**: Khóa mờ, màu xám dịu `bg-slate-200`, hiển thị biểu tượng khóa.

```tsx
// Minh họa cấu trúc Node bài học trên bản đồ
export const LessonNode = ({ status, title, stars, onClick }) => {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  
  return (
    <button
      onClick={onClick}
      disabled={status === "locked"}
      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-b-4 font-black transition-all shadow-xl ${
        isCompleted
          ? "bg-amber-400 border-amber-600 text-amber-950 hover:scale-105"
          : isCurrent
            ? "animate-bounce bg-emerald-400 border-emerald-600 text-emerald-950 ring-4 ring-emerald-200"
            : "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
      }`}
    >
      <span className="text-xl">{isCompleted ? "★" : isCurrent ? "▶" : "🔒"}</span>
    </button>
  );
};
```

---

### 3. CHẾ ĐỘ HỌC TẬP TRUNG ("ONE SCREEN, ONE TASK - FOCUS SHELL")

Màn hình `FocusLessonShell` tạo không gian học tập tuyệt đối cho trẻ:
- An toàn, loại bỏ hoàn toàn menu rườm rà.
- Thanh tiến trình bài học (Progress Bar) chạy mịn từ 0% đến 100%.
- Nút đóng (`X`) tròn nổi bật giúp dừng phiên học dễ dàng.

```tsx
export const FocusLessonShell = ({ title, progress, onExit, children }) => (
  <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-md">
    <header className="flex items-center justify-between bg-white/90 px-6 py-4 shadow-md">
      <button onClick={onExit} className="rounded-full p-2 hover:bg-slate-100 text-slate-700">
        ✕
      </button>
      <div className="h-4 w-1/2 overflow-hidden rounded-full bg-slate-200">
        <div 
          className="h-full bg-amber-400 transition-all duration-300 ease-out" 
          style={{ width: `${progress * 100}%` }} 
        />
      </div>
      <span className="font-bold text-amber-700">{title}</span>
    </header>
    <main className="flex-1 overflow-y-auto p-4">{children}</main>
  </div>
);
```

---

### 4. ANIMATION MASCOT & 4 TRẠNG THÁI CẢM XÚC (`Mascot.tsx`)

Chú Ong Bee linh vật sẽ thay đổi biểu cảm và hoạt ảnh bồng bềnh theo kết quả tương tác của bé:

- **`happy`**: Biểu cảm vui tươi khi bé chọn đúng.
- **`encouraging`**: Biểu cảm cổ vũ khi bắt đầu hoặc chuyển câu.
- **`celebrating`**: Biểu cảm ăn mừng nhảy vọt khi hoàn thành bài học.
- **`oops`**: Biểu cảm ngơ ngác nhẹ nhàng khi bé chọn sai để bé không bị áp lực.

```tsx
// Transition bồng bềnh (Floating Animation)
const floatAnimation = {
  y: ["0px", "-10px", "0px"],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const Mascot = ({ mood = "happy" }) => {
  const emojiMap = {
    happy: "🐝",
    encouraging: "🐝✨",
    celebrating: "🐝🎉",
    oops: "🐝😅",
  };

  return (
    <motion.div animate={floatAnimation} className="flex flex-col items-center">
      <div className="text-8xl drop-shadow-md select-none">{emojiMap[mood]}</div>
      <div className="mt-2 rounded-full bg-amber-400 px-4 py-1 font-black text-amber-950 shadow-md">
        Bee nè! 🚀
      </div>
    </motion.div>
  );
};
```

---

### 5. HIỆU ỨNG TƯƠNG TÁC VISUAL (FLASHCARD, LETTERBOARD, VOICE PANEL)

1. **Hiệu ứng Lật Thẻ 3D (`Flashcard.tsx`)**:
   Sử dụng Framer Motion lật 180 độ theo trục Y cho cảm giác như lật thẻ giấy thật ngoài đời:
   ```tsx
   <motion.div
     animate={{ rotateY: isFlipped ? 180 : 0 }}
     transition={{ duration: 0.5, ease: "easeInOut" }}
     className="preserve-3d relative h-80 w-64 cursor-pointer"
   >
     {/* Mặt trước tiếng Anh & Mặt sau tiếng Việt */}
   </motion.div>
   ```

2. **Bảng Ghép Chữ Cái (`LetterBoard.tsx`)**:
   Các ô chữ cái nổi 3D màu sắc sinh động, tự động nảy khi chạm vào để ghép từ vựng hoàn chỉnh.

3. **Giao diện Thu âm Giọng nói (`VoiceRecorderPanel.tsx`)**:
   Micro cỡ lớn với vòng tròn phát sáng hiệu ứng gợn sóng (pulse ring animation) kích thích bé tự tin nói to vào micro.

---

### 6. HIỆU ỨNG THƯỞNG DOPAMINE & POPUP ĂN MỪNG (`RewardOverlay.tsx`)

Khi bé hoàn thành bài học, Popup Popup thưởng `RewardOverlay` hiện ra rực rỡ kết hợp bắn pháo hoa `canvas-confetti` tràn màn hình:

```typescript
import confetti from "canvas-confetti";

export const triggerCelebrationConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.2, y: 0.5 },
    colors: ["#FCD34D", "#34D399", "#60A5FA", "#F472B6"],
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.8, y: 0.5 },
    colors: ["#FCD34D", "#34D399", "#60A5FA", "#F472B6"],
  });
};
```
