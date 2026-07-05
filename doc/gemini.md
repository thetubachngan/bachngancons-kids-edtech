# CHỈ DẪN KỸ THUẬT & TỐI ƯU HOÁ LOGIC (TỪ GEMINI)
## ỨNG DỤNG WEB HỌC TIẾNG ANH LỚP 2

Tài liệu này tập trung vào thiết kế logic nghiệp vụ, quản lý trạng thái phát âm (Web Speech API) và tối ưu hóa hiệu suất ứng dụng Next.js.

---

### 1. TỐI ƯU HÓA PHÁT ÂM (WEB SPEECH API)
Web Speech API (`window.speechSynthesis`) trên mỗi thiết bị và trình duyệt hoạt động rất khác nhau. Để đảm bảo ứng dụng phát âm chuẩn Mỹ/Anh và chậm rãi cho bé lớp 2, chúng ta cần cài đặt Hook `useSpeech` một cách cẩn thận:

```typescript
// hooks/useSpeech.ts
import { useCallback, useEffect, useState } from 'react';

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined') return;
    const allVoices = window.speechSynthesis.getVoices();
    setVoices(allVoices);

    // Ưu tiên giọng tiếng Anh (Mỹ hoặc Anh) chất lượng cao
    const englishVoice = 
      allVoices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
      allVoices.find(v => v.lang === 'en-US') ||
      allVoices.find(v => v.lang.startsWith('en')) ||
      null;
    
    setPreferredVoice(englishVoice);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  const speak = useCallback((text: string, rate: number = 0.85) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Hủy các giọng đọc đang dang dở để không bị xếp hàng quá lâu
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.lang = 'en-US';
    utterance.rate = rate; // Tốc độ hơi chậm cho trẻ em dễ nghe (0.85)
    utterance.pitch = 1.1; // Cao độ hơi cao một chút để giọng nói thêm phần trong trẻo, vui tươi

    window.speechSynthesis.speak(utterance);
  }, [preferredVoice]);

  return { speak, voices };
};
```

---

### 2. QUẢN LÝ TIẾN TRÌNH HỌC (STATE PERSISTENCE)
Để giữ chân bé học tập mỗi ngày, số Sao vàng thu thập được và các bài học đã hoàn thành sẽ được lưu vào `localStorage`. Ta sẽ thiết lập State này ở trang chủ và truyền xuống các component:

- **Sao Tích Lũy (`stars`)**: Lưu tổng số lượng sao vàng.
- **Từ đã thuộc (`learnedWords`)**: Một mảng lưu các ID từ vựng bé đã bấm lật thẻ và nghe tối thiểu 3 lần.
- **Tiến trình Quiz (`quizProgress`)**: Điểm số kỷ lục của trò chơi Quiz.

---

### 3. SINH HIỆU ỨNG ÂM THANH TRỰC TIẾP (WEB AUDIO API)
Thay vì tải các tệp mp3 nặng nề làm chậm trang web, ta có thể viết code tạo ra các tiếng động vui tai trực tiếp bằng âm thanh tổng hợp của trình duyệt:

```typescript
// utils/soundEffects.ts
export const playSuccessSound = () => {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Nốt 1 (Vui tươi)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  gain1.gain.setValueAtTime(0.1, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  osc1.start();
  osc1.stop(ctx.currentTime + 0.15);

  // Nốt 2 (Cao hơn, tạo cảm giác hoàn thành)
  setTimeout(() => {
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc2.start();
    osc2.stop(ctx.currentTime + 0.3);
  }, 100);
};

export const playErrorSound = () => {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 (Trầm và rè nhẹ)
  osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
};
```

---

### 4. SEO & KÍCH THƯỚC TRANG (PERFORMANCE)
- **Tải phông chữ Fredoka tối ưu**: Cấu hình Next.js `next/font/google` để nạp font chữ không gây giật màn hình khi tải (Layout Shift).
- **Emoji-based graphics**: Thay vì dùng ảnh JPG/PNG dung lượng lớn gây tải chậm trên thiết bị di động, ta dùng Emoji vẽ lớn kết hợp CSS shadow để tạo đồ họa bắt mắt, nhanh và sắc nét ở mọi độ phân giải.
