# KẾ HOẠCH TRIỂN KHAI VÀ THIẾT KẾ CHI TIẾT (NÂNG CẤP MÔ HÌNH DUOLINGO LEARNING PATH & ENRICHED LESSON ENGINE) [UID: IMP-TITLE]
## ỨNG DỤNG WEB HỌC TIẾNG ANH CHO TRẺ EM (BACH NGAN CONS KIDS EDTECH APP) [UID: IMP-SUBTITLE]

---

### 🗺️ BẢN ĐỒ QUẢN LÝ NỘI DUNG & DANH SÁCH UNIVERSAL ID (MASTER UID INDEX MAP)

| UniversalID | Hạng mục / Nội dung chính | Loại Hạng Mục |
| :--- | :--- | :--- |
| `[UID: IMP-SEC-I]` | **I. Mô hình Kiến trúc mới (Duolingo ABC & Lingokids Style)** | Mục lớn |
| ├── `[UID: IMP-SEC-I-1]` | ├── 1. Bản đồ Học tập Đường mòn Ziczac SVG (`LearningMap`) | Tiểu mục |
| ├── `[UID: IMP-SEC-I-2]` | ├── 2. Chế độ Học tập Trung ("Mobile Zero-Scroll Focus Shell") | Tiểu mục |
| └── `[UID: IMP-SEC-I-3]` | └── 3. Luồng Học tập Phong phú 7 Kỹ năng (`CoreQuizEngine`) | Tiểu mục |
| `[UID: IMP-SEC-II]` | **II. Phân chia Lộ trình & 7 Dạng Bài Học Tương Tác** | Mục lớn |
| ├── `[UID: IMP-SEC-II-1]` | ├── 1. Cấp độ 1: Explorer Path (5-6 tuổi - Mầm non & Lớp 1) | Tiểu mục |
| ├── `[UID: IMP-SEC-II-2]` | ├── 2. Cấp độ 2: Builder Trail (7-8 tuổi - Lớp 2 & Lớp 3) | Tiểu mục |
| ├── `[UID: IMP-SEC-II-3]` | ├── 3. Cấp độ 3: Challenger Run (9 tuổi trở lên - Lớp 4+) | Tiểu mục |
| └── `[UID: IMP-SEC-II-4]` | └── 4. Chi tiết 7 Dạng Bài học Tương tác Phong phú (Duolingo Style) | Tiểu mục |
| `[UID: IMP-SEC-III]` | **III. Sơ đồ Dữ liệu & Quản lý Trạng thái (Data Schema & Store)** | Mục lớn |
| ├── `[UID: IMP-SEC-III-1]` | ├── 1. Schema Dữ liệu Học tập (`data/learningSchema.ts`) | Tiểu mục |
| └── `[UID: IMP-SEC-III-2]` | └── 2. Quản lý Trạng thái Tập trung (`store/learningStore.tsx`) | Tiểu mục |
| `[UID: IMP-SEC-IV]` | **IV. Bộ Dữ liệu Chuẩn hóa (166 Từ vựng & 10+ Hội thoại)** | Mục lớn |
| ├── `[UID: IMP-SEC-IV-1]` | ├── 1. Bộ dữ liệu Từ vựng (166 từ vựng chuẩn hóa) | Tiểu mục |
| └── `[UID: IMP-SEC-IV-2]` | └── 2. Kịch bản Hội thoại Tương tác (10+ Scenarios) | Tiểu mục |
| `[UID: IMP-SEC-V]` | **V. Quy tắc Âm thanh Tĩnh MP3 & Gamification chuẩn AGENTS.md** | Mục lớn |
| ├── `[UID: IMP-SEC-V-1]` | ├── 1. Engine Âm thanh Tĩnh 100% MP3 (`data/audioManifest.ts`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-2]` | ├── 2. Zero-Latency Response & Lesson Pre-decoding | Tiểu mục |
| ├── `[UID: IMP-SEC-V-3]` | ├── 3. Thu âm & Nhận diện Giọng nói (`VoiceRecorderPanel.tsx`) | Tiểu mục |
| └── `[UID: IMP-SEC-V-4]` | └── 4. Hệ thống Thưởng & Linh vật Ong Bee (`components/gamification/`) | Tiểu mục |
| `[UID: IMP-SEC-VI]` | **VI. Cấu trúc Thư mục & Kế hoạch Chi tiết Triển khai** | Mục lớn |

---

### I. MÔ HÌNH KIẾN TRÚC MỚI (DUOLINGO STYLE SNAKE PATH & FOCUS SHELL) [UID: IMP-SEC-I]

1. **Bản đồ Học tập Đường mòn Ziczac SVG (`LearningMap`)** [UID: IMP-SEC-I-1]:
   * Trực quan hóa tiến trình bằng đường nối cong SVG (`<svg>` curved dotted path) nối mượt giữa các Node tròn 3D.
   * **Linh vật Ong Bee 🐝 Dẫn đường**: Đặt chú Ong Bee đứng cạnh Nút bài học hiện tại (Current Node) với hoạt ảnh pulse và bóng thoại kích thích bé bấm chọn.
   * **Node Rương Kho Báu (Unit Chest Node)**: Cuối mỗi Cấp độ (Unit), bổ sung Nút Rương Kho Báu 🌟 để bé ôn tập tổng hợp toàn bộ từ vựng và nhận thưởng đặc biệt.
   * Các Node trạng thái 3D:
     * `completed`: Đã hoàn thành (màu vàng kim/xanh lá 3D, checkmark, 3 sao đạt được, cho phép đấu lại).
     * `current`: Bài học hiện tại (nút vàng nổi bật, vòng hào quang pulsing ring 3D, Ong Bee đứng đón).
     * `locked`: Chưa mở khóa (nút xám dịu, biểu tượng khóa an toàn).

2. **Chế độ Học tập Trung Cố định Viewport ("Mobile Zero-Scroll Focus Shell")** [UID: IMP-SEC-I-2]:
   * Cố định màn hình bài học `h-[100dvh]` với `overflow-hidden`, triệt tiêu thanh cuộn dọc.
   * Thanh trên (Top Bar) phong cách Duolingo: Nút thoát `[X]`, Thanh tiến trình mượt (animated progress bar) và Đếm số sao tích lũy.

3. **Luồng Học tập 7 Dạng Tương tác & Bottom Sheet Phản hồi (`CoreQuizEngine`)** [UID: IMP-SEC-I-3]:
   * Single Hero Card kết hợp Mascot Ong Bee 🐝 và các dạng bài tương tác 1-chạm.
   * Bottom Sheet phản hồi trượt mượt từ bên dưới (Slide-up drawer): Thanh màu xanh lá khi trả lời đúng kèm âm thanh chúc mừng; Thanh màu cam khi làm lại kèm lời giải thích thân thiện.

---

### II. PHÂN CHIA LỘ TRÌNH & 7 DẠNG BÀI HỌC TƯƠNG TÁC [UID: IMP-SEC-II]

#### Các Cấp độ Lộ trình (3 Learning Paths):
1. **Cấp độ 1: Explorer Path (5-6 tuổi - Mầm non & Lớp 1)** [UID: IMP-SEC-II-1]
2. **Cấp độ 2: Builder Trail (7-8 tuổi - Lớp 2 & Lớp 3)** [UID: IMP-SEC-II-2]
3. **Cấp độ 3: Challenger Run (9 tuổi trở lên - Lớp 4+)** [UID: IMP-SEC-II-3]

#### Chi tiết 7 Dạng Bài học Tương tác Phong phú (Duolingo Style) [UID: IMP-SEC-II-4]:
1. **`tap-match` (Nghe & Chạm Hình / Từ)**: Nghe âm thanh static MP3 -> Chạm hình hoặc từ tương ứng.
2. **`mcq` (Trắc nghiệm Nghĩa & Từ vựng)**: Câu hỏi nghe/đọc -> Chọn đáp án đúng trong lưới 2x2.
3. **`drag-drop` (Letter Board Speller - Ghép Chữ Cái)**: Kéo/chạm chữ cái phân mảnh để ghép thành từ hoàn chỉnh.
4. **`voice` (Voice Pronunciation Challenge - Luyện Phát Âm)**: Nghe mẫu static MP3 -> Nhấn micro nói theo -> Bee phản hồi.
5. **`pair-match` (Duolingo Match Madness - Ghép Thẻ Từ & Nghĩa)**: Bảng 6 thẻ (3 Tiếng Anh, 3 Tiếng Việt/Emoji), chạm ghép cặp đúng.
6. **`sentence-builder` (Ghép Cụm Từ / Câu)**: Thẻ từ vựng xếp bên dưới, bé chạm xếp đúng thứ tự câu.
7. **`flashcard-preview` (Thẻ Lật 3D Khám Phá)**: Thẻ 3D xem trước từ mới trước khi bắt đầu bài học.

---

### III. SƠ ĐỒ DỮ LIỆU & QUẢN LÝ TRẠNG THÁI (DATA SCHEMA & STORE) [UID: IMP-SEC-III]

#### 1. Schema Dữ liệu Học tập (`data/learningSchema.ts`) [UID: IMP-SEC-III-1]
Mở rộng `QuizType` và `LessonStep` để hỗ trợ cả 7 dạng tương tác (`mcq`, `tap-match`, `drag-drop`, `voice`, `pair-match`, `sentence-builder`, `flashcard-preview`).

#### 2. Quản lý Trạng thái Tập trung (`store/learningStore.tsx`) [UID: IMP-SEC-III-2]
Lưu trữ và đồng bộ tiến trình học tập bền vững qua `localStorage` (`learning-progress-v2`).

---

### IV. BỘ DỮ LIỆU CHUẨN HÓA (166 TỪ VỰNG & 10+ HỘI THOẠI) [UID: IMP-SEC-IV]
Bảo tồn 100% 166 từ vựng và 10+ scenario hội thoại tại `data/englishData.ts`.

---

### V. QUY TẮC ÂM THANH TĨNH MP3 & GAMIFICATION CHUẨN AGENTS.MD [UID: IMP-SEC-V]

1. **100% Static MP3 Audio Engine** [UID: IMP-SEC-V-1]: Sử dụng hoàn toàn tệp âm thanh MP3 thu sẵn trong `data/audioManifest.ts` (`/audio/generated/...`). Tuyệt đối KHÔNG dùng Web Speech API cho từ vựng/ví dụ.
2. **Zero Initial Consonant Truncation & Zero Latency** [UID: IMP-SEC-V-2]: Không dùng lại duy nhất một instance HTMLAudioElement bị dính `currentTime = 0`. Tự động nạp và pre-decode tệp âm thanh của Bài học vào RAM ngay khi vào màn hình.
3. **Mascot Ong Bee 🐝 Interaction**: Biểu cảm linh hoạt (`happy`, `encouraging`, `celebrating`, `oops`).

---

### VI. CẤU TRÚC THƯ MỤC & CÁC CẤU PHẦN CHÍNH TRONG MÃ NGUỒN [UID: IMP-SEC-VI]

```text
├── app/
│   ├── page.tsx                         # AppShell kết nối LearningMap, FocusLessonShell, CoreQuizEngine & Store
│   └── globals.css                      # Custom CSS utilities, animation, styling 3D buttons & node paths
├── components/
│   ├── LearningMap.tsx                  # Bản đồ bài học đường mòn ziczac SVG 3 Cấp độ + Mascot Bee + Unit Chest Node
│   ├── CoreQuizEngine.tsx               # Quiz Engine hỗ trợ 7 dạng bài học & Duolingo Bottom Sheet
│   ├── lesson/
│   │   └── FocusLessonShell.tsx         # Giao diện học tập trung "Mobile Zero-Scroll 100dvh"
│   ├── interactions/
│   │   ├── LetterBoard.tsx              # Ghép chữ cái chính tả
│   │   ├── TapChoiceGrid.tsx            # Lưới chọn đáp án 2x2
│   │   ├── PairMatchBoard.tsx           # [NEW] Ghép thẻ từ & nghĩa Duolingo Match Madness
│   │   ├── SentenceBuilderBoard.tsx     # [NEW] Ghép câu / cụm từ
│   │   ├── FlashcardPreview.tsx         # [NEW] Thẻ lật 3D khám phá từ vựng
│   │   └── VoiceRecorderPanel.tsx       # Panel thu âm & nhận diện giọng nói
│   └── gamification/
│       ├── Mascot.tsx                   # Mascot Ong Bee với 4 trạng thái cảm xúc
│       ├── RewardOverlay.tsx            # Popup bắn pháo hoa Confetti
│       └── StreakBanner.tsx             # Badge chuỗi ngày học
├── data/
│   ├── learningSchema.ts                # TypeScript interfaces mở rộng 7 step types
│   ├── curriculum.ts                    # Generator bài học phong phú đa dạng bài học
│   ├── audioManifest.ts                 # 100% Static MP3 audio manifest
│   └── englishData.ts                   # 166 từ vựng & kịch bản hội thoại chuẩn hóa
└── store/
    └── learningStore.tsx                # Quản lý tiến trình, sao, streak, localStorage
```
