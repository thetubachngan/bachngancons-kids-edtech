# THIẾT KẾ GIAO DIỆN & HOẠT ẢNH MƯỢT MÀ (TỪ CLAUDE)
## ỨNG DỤNG WEB HỌC TIẾNG ANH LỚP 2

Tài liệu này tập trung vào thẩm mỹ UI/UX EdTech, hệ màu sắc Pastel vui nhộn, phím bấm 3D và các kịch bản chuyển động bằng Framer Motion.

---

### 1. HỆ MÀU SẮC PASTEL DÀNH CHO TRẺ EM (COLOR PALETTE)
Tránh sử dụng các màu quá chói hoặc các màu xám xịt của doanh nghiệp. Ta sử dụng hệ màu tươi sáng mang tính giáo dục, lấy cảm hứng từ các hãng đồ chơi thông minh:

- **Màu nền chủ đạo**: `bg-amber-50` (Vàng kem sữa ấm áp, thân thiện, chống mỏi mắt tốt hơn màu trắng tinh).
- **Màu chủ đề Animals**: `bg-emerald-100 text-emerald-700` (Xanh ngọc Mint).
- **Màu chủ đề Family**: `bg-pink-100 text-pink-700` (Hồng đào).
- **Màu chủ đề School**: `bg-sky-100 text-sky-700` (Xanh da trời).
- **Màu chủ đề Colors**: `bg-purple-100 text-purple-700` (Tím oải hương).
- **Màu nút nhấn 3D**: Sử dụng shadow dày phía dưới cùng tông màu để giả lập phím nhựa đồ chơi:
  ```html
  <button class="px-8 py-4 bg-yellow-400 text-yellow-900 font-bold rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-[4px] transition-all text-xl shadow-lg">
    Bắt đầu học 🚀
  </button>
  ```

---

### 2. HIỆU ỨNG LẬT THẺ 3D (FLASHCARD FLIP ANIMATION)
Sử dụng Framer Motion để tạo chuyển động lật thẻ giống như thẻ giấy thật ngoài đời:

```typescript
// components/Flashcard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export const Flashcard = ({ word, phonetic, translation, emoji }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-64 h-80 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* MẶT TRƯỚC (TIẾNG ANH) */}
        <div className="absolute inset-0 backface-hidden bg-white border-4 border-yellow-300 rounded-3xl p-6 flex flex-col justify-between items-center shadow-xl">
          <div className="text-8xl my-auto select-none">{emoji}</div>
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-800 tracking-wide">{word}</h3>
            <p className="text-gray-500 font-medium text-sm mt-1">{phonetic}</p>
          </div>
        </div>

        {/* MẶT SAU (TIẾNG VIỆT) */}
        <div 
          className="absolute inset-0 backface-hidden bg-yellow-100 border-4 border-yellow-300 rounded-3xl p-6 flex flex-col justify-center items-center shadow-xl rotate-y-180"
        >
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Ý nghĩa là:</p>
          <h4 className="text-4xl font-extrabold text-yellow-900">{translation}</h4>
          <span className="text-sm text-gray-400 mt-6 select-none">(Bấm để lật lại)</span>
        </div>
      </motion.div>
    </div>
  );
};
```

---

### 3. LINH VẬT TƯƠNG TÁC (INTERACTIVE MASCOT ANIMATIONS)
Mascot (ví dụ: Chú Ong vàng "Bee") sẽ có hiệu ứng bồng bềnh (floating) để giao diện trông sinh động và "sống" hơn:

```typescript
// Hiệu ứng bồng bềnh nhẹ nhàng liên tục
const floatTransition = {
  y: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

export const FloatingMascot = () => {
  return (
    <motion.div
      animate={{ y: ["0px", "-12px", "0px"] }}
      transition={floatTransition}
      className="relative flex flex-col items-center"
    >
      <span className="text-7xl drop-shadow-md select-none">🐝</span>
      <div className="mt-2 bg-yellow-400 text-yellow-950 font-bold px-3 py-1 rounded-full text-xs shadow-sm border border-yellow-500">
        Hi, tớ là Bee!
      </div>
    </motion.div>
  );
};
```

---

### 4. HIỆU ỨNG TUNG CONFETTI & ĂN MỪNG
Khi bé vượt qua một câu Quiz đúng, chúng ta dùng thư viện `canvas-confetti` để tung pháo hoa tràn màn hình. Điều này kích thích hormone dopamine giúp bé thích thú học tiếp.

```typescript
import confetti from 'canvas-confetti';

export const triggerQuizSuccess = () => {
  // Bắn pháo hoa từ bên trái
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.1, y: 0.6 },
    colors: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6']
  });

  // Bắn pháo hoa từ bên phải
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.9, y: 0.6 },
    colors: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6']
  });
};
```
