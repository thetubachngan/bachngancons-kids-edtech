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

### 2. GIAO DIỆN BẢN ĐỒ HỌC TẬP ZICZAC SÂN CHƠI 3D (`LearningMap.tsx`)

Bản đồ bài học thể hiện tiến trình tuyến tính ziczac (Snake Path) rực rỡ với các Node nút tròn 3D tương tác theo các trạng thái:

- **`completed`**: Mở khóa, nút tròn màu xanh emerald 3D viền nổi, hiển thị biểu tượng Check `✓` và số sao tích lũy.
- **`current`**: Node hiện tại màu vàng 3D với hiệu ứng nhịp đập Pulse `animate-pulse` kích thích bé chạm vào mở bài.
- **`locked`**: Khóa mờ, màu xám dịu `bg-slate-200`, hiển thị biểu tượng khóa an toàn.

```tsx
// Minh họa cấu trúc Node tròn 3D ziczac trên bản đồ Snake Path
export const SnakeLessonNode = ({ status, title, rewardStars, onClick }) => {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={status === "locked"}
      className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-b-8 shadow-xl transition-all ${
        isCompleted
          ? "border-emerald-400 border-b-emerald-600 bg-emerald-500 text-white"
          : isCurrent
            ? "border-amber-300 border-b-amber-500 bg-amber-400 text-slate-900 ring-8 ring-amber-200/70"
            : "border-slate-300 border-b-slate-400 bg-slate-200 text-slate-400 cursor-not-allowed"
      }`}
    >
      {isCompleted ? "✓" : isCurrent ? "▶" : "🔒"}
    </motion.button>
  );
};
```

---

### 3. CHẾ ĐỘ HỌC TẬP TRUNG ZERO-SCROLL ("MOBILE 100DVH FOCUS SHELL")

Màn hình `FocusLessonShell` tạo không gian học tập di động tuyệt đối cho trẻ:
- **Zero-Scroll Viewport**: Cố định `h-[100dvh]` với `overflow-hidden`. Loại bỏ hoàn toàn thanh cuộn dọc (scrollbar).
- **Top Bar Tinh gọn**: Nút thoát `[X]` + Thanh tiến trình (Progress Bar) chạy mịn từ 0% đến 100% + Đếm số sao tích lũy.
- **Bottom Sheet Feedback**: Khi trẻ bấm chọn đáp án, thanh phản hồi trượt mượt từ dưới lên (slide-up) kèm âm thanh và nút "Tiếp tục" 3D rực rỡ.

```tsx
export const FocusLessonShell = ({ title, stars, progress, onExit, children }) => (
  <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#fffaf0] select-none">
    <header className="flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-amber-200/60 bg-white/90 px-4 backdrop-blur-md">
      <button onClick={onExit} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        ✕
      </button>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 p-0.5">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-700">
        ★ +{stars}
      </div>
    </header>
    <main className="relative flex flex-1 flex-col overflow-hidden">{children}</main>
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

---

### 7. KIẾN TRÚC & QUY TẮC PHÁT ÂM THANH TRIỆT ĐỂ (PURE STATIC AUDIO ENGINE)

Tài liệu này quy định kiến trúc và quy tắc xử lý âm thanh bắt buộc nhằm giải quyết dứt điểm các lỗi **"Nuốt âm đầu"** và **"Độ trễ khi chuyển từ"**:

1. **Sử dụng 100% Tệp MP3 Static (`data/audioManifest.ts`)**:
   - Sử dụng các tệp MP3 đã sinh sẵn trong `/audio/generated/words/*.mp3`, `/audio/generated/examples/*.mp3` và `/audio/generated/conversations/*.mp3`.
   - Tuyệt đối loại bỏ Web Speech API (`speechSynthesis`, `SpeechSynthesisUtterance`) ra khỏi luồng phát âm thanh chính.

2. **Chống Nuốt Âm Đầu (No Initial Consonant Truncation)**:
   - Không gọi `speechSynthesis.cancel()` khi phát MP3 để tránh can thiệp làm gián đoạn kênh âm thanh trình duyệt.
   - Không dùng lại 1 instance `HTMLAudioElement` bị dính lệnh `currentTime = 0` bất đồng bộ.
   - Sử dụng Web Audio API (`AudioContext` + `AudioBufferSourceNode`) hoặc phát luồng Audio riêng cho mỗi lần bấm để giữ trọn vẹn 100% phụ âm khởi đầu từ giây `0.00s`.

3. **Phát Ngay Lập Tức (Zero-Latency 0ms)**:
   - Loại bỏ toàn bộ các khoảng delay/timeout nhân tạo (`setTimeout` delay 180ms).
   - Tự động preload và decode dữ liệu MP3 của Bài học (`Lesson`) vào bộ nhớ RAM ngay khi giao diện bài học được mount.

