# CHỈ DẪN KỸ THUẬT, QUẢN LÝ LOGIC & TỐI ƯU HÓA (TỪ GEMINI)
## ỨNG DỤNG WEB HỌC TIẾNG ANH CHO TRẺ EM (KIDS EDTECH APP)

Tài liệu này tập trung vào thiết kế logic nghiệp vụ, sơ đồ dữ liệu Type-Safe, quản lý trạng thái tập trung (State Reducer & Persistence), xử lý âm thanh/phát âm (Web Speech & Web Audio API) và tối ưu hóa hiệu suất ứng dụng Next.js.

---

### 1. KIẾN TRÚC DỮ LIỆU & GENERATOR BÀI HỌC (`learningSchema.ts` & `curriculum.ts`)

Ứng dụng định nghĩa cấu trúc dữ liệu Type-Safe 4 cấp phân nhánh bài hập tập trung:

```typescript
// data/learningSchema.ts
export type Skill = "listening" | "speaking" | "reading" | "writing";
export type QuizType = "mcq" | "drag-drop" | "voice" | "tap-match";

export type LessonStep =
  | { id: string; type: "mcq"; prompt: string; skill: Skill; visual: LessonVisual; choices: LessonChoice[]; answerId: string }
  | { id: string; type: "tap-match"; prompt: string; skill: Skill; visual: LessonVisual; choices: LessonChoice[]; answerId: string }
  | { id: string; type: "drag-drop"; prompt: string; skill: Skill; visual: LessonVisual; targetWord: string; answer: string; letterBank: string[] }
  | { id: string; type: "voice"; prompt: string; skill: Skill; visual: LessonVisual; expectedText: string; helperText?: string };

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  description: string;
  level: number;
  rewardStars: number;
  steps: LessonStep[];
};

export type Unit = { id: string; level: number; title: string; mascotMood: string; lessons: Lesson[] };
export type Curriculum = { units: Unit[] };
```

- **Generator `curriculum.ts`**: Tự động chia nhóm từ vựng thành các chunk 4 từ (`chunkWords`), tạo ngân hàng chữ cái xáo trộn (`buildLetterBank`), tự động xây dựng chuỗi bài học theo 3 Path (Explorer, Builder, Challenger) và kịch bản hội thoại.

---

### 2. QUẢN LÝ TRẠNG THÁI TẬP TRUNG & PERSISTENCE (`store/learningStore.tsx`)

Sử dụng React Context + `useReducer` quản lý toàn bộ trạng thái tiến trình học tập của trẻ:

```typescript
type LearningState = {
  unlockedLessonIds: string[];
  completedLessonIds: string[];
  currentLessonId: string | null;
  streakDays: number;
  rewards: number;
  stars: number;
  lastVisitDate: string | null;
  lessonStats: Record<string, { attempts: number; starsEarned: number; completed: boolean }>;
};
```

- **Tính toán Chuỗi ngày học (`streakDays`)**: Tự động kiểm tra `lastVisitDate` với ngày hôm qua để tăng streak hoặc reset về 1 khi qua ngày mới.
- **Lưu trữ & Chuyển đổi dữ liệu (`localStorage`)**:
  - Dữ liệu lưu dưới key `learning-progress-v2`.
  - Tự động kiểm tra và chuyển đổi (migration) dữ liệu từ phiên bản cũ (`kids-english-progress`) giúp bé giữ nguyên số sao tích lũy.

---

### 3. TỐI ƯU HÓA PHÁT ÂM CHUẨN MỸ (`hooks/useSpeech.ts`)

`window.speechSynthesis` trên các thiết bị hoạt động khác nhau. Hook `useSpeech` xử lý tối ưu giọng phát âm cho bé:

```typescript
// hooks/useSpeech.ts
import { useCallback, useEffect, useState } from "react";

export const useSpeech = () => {
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

  const loadVoices = useCallback(() => {
    if (typeof window === "undefined") return;
    const allVoices = window.speechSynthesis.getVoices();
    
    // Ưu tiên giọng tiếng Anh Mỹ chuẩn (e.g., Google US English)
    const englishVoice =
      allVoices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
      allVoices.find((v) => v.lang === "en-US") ||
      allVoices.find((v) => v.lang.startsWith("en")) || null;

    setPreferredVoice(englishVoice);
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  const speak = useCallback(({ text, rate = 0.85, pitch = 1.1 }) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Hủy các câu đọc dở dang

    const utterance = new SpeechSynthesisUtterance(text);
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = "en-US";
    utterance.rate = rate; // Tốc độ 0.85 chậm rãi cho trẻ em
    utterance.pitch = pitch; // Cao độ 1.1 trong trẻo, vui tươi

    window.speechSynthesis.speak(utterance);
  }, [preferredVoice]);

  return { speak };
};
```

---

### 4. THU ÂM & NHẬN DIỆN GIỌNG NÓI (`VoiceRecorderPanel.tsx`)

Tích hợp Web Speech Recognition API (`webkitSpeechRecognition` / `SpeechRecognition`) để nhận diện phát âm của bé:
- Khi bé nhấn nút micro, hệ thống lắng nghe giọng nói và so sánh với từ vựng kỳ vọng (`expectedText`).
- **Chế độ Giả lập (Simulation Fallback)**: Nếu thiết bị không có micro hoặc trình duyệt không hỗ trợ Web Speech Recognition, hệ thống tự động cung cấp nút *Mô phỏng phát âm thành công* giúp bé tiếp tục trải nghiệm bài học mà không bị nghẽn.

---

### 5. SINH ÂM THANH TRỰC TIẾP BẰNG WEB AUDIO API (`utils/soundEffects.ts`)

Thay vì tải các tệp audio mp3 nặng nề, ứng dụng tự động tổng hợp âm thanh phản hồi trực tiếp qua Web Audio API:

```typescript
// utils/soundEffects.ts
export const playSuccessSound = () => {
  if (typeof window === "undefined") return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Nốt C5 (523.25Hz) & Nốt E5 (659.25Hz) vang lên vui tươi
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  gain1.gain.setValueAtTime(0.1, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc1.start();
  osc1.stop(ctx.currentTime + 0.15);
};
```

---

### 6. SEO, HIỆU NĂNG & KÍCH THƯỚC TRANG (PERFORMANCE)

- **Tải phông chữ Fredoka tối ưu**: Cấu hình Next.js `next/font/google` nạp phông chữ không gây giật màn hình khi tải (Zero Layout Shift).
- **Emoji Graphics & Dynamic SVG**: Thay vì dùng hàng trăm ảnh PNG/JPG gây tốn dung lượng băng thông, ứng dụng kết hợp Emoji vẽ lớn với CSS shadow 3D cho đồ họa sắc nét ở mọi độ phân giải thiết bị.
