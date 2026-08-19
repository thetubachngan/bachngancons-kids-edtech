# KẾ HOẠCH TRIỂN KHAI VÀ THIẾT KẾ CHI TIẾT (NÂNG CẤP MÔ HÌNH DUOLINGO LEARNING PATH & GIÁO ÁN LỚP 2 CAMBRIDGE) [UID: IMP-TITLE]
## ỨNG DỤNG WEB HỌC TIẾNG ANH CHO TRẺ EM (BACH NGAN CONS KIDS EDTECH APP) [UID: IMP-SUBTITLE]

---

### 🗺️ BẢN ĐỒ QUẢN LÝ NỘI DUNG & DANH SÁCH UNIVERSAL ID (MASTER UID INDEX MAP)

| UniversalID | Hạng mục / Nội dung chính | Loại Hạng Mục |
| :--- | :--- | :--- |
| `[UID: IMP-SEC-I]` | **I. Mô hình Kiến trúc mới (Duolingo ABC & Lingokids Style)** | Mục lớn |
| ├── `[UID: IMP-SEC-I-1]` | ├── 1. Bản đồ Học tập Đường mòn Ziczac SVG (`LearningMap`) | Tiểu mục |
| ├── `[UID: IMP-SEC-I-2]` | ├── 2. Chế độ Học tập Trung ("Mobile Zero-Scroll Focus Shell") | Tiểu mục |
| ├── `[UID: IMP-SEC-I-3]` | ├── 3. Luồng Học tập Phong phú 7 Kỹ năng (`CoreQuizEngine`) | Tiểu mục |
| └── `[UID: IMP-SEC-I-4]` | └── 4. Thanh Chọn Độ Tuổi & Cấp Độ Linh Hoạt (`Age Level Selector Tabs`) | Tiểu mục |
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
| ├── `[UID: IMP-SEC-V-3]` | ├── 3. Thu âm & Nhận diện Giọng nói Commercial (`VoiceRecorderPanel.tsx`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-4]` | ├── 4. Hệ thống Thưởng & Linh vật Ong Bee (`components/gamification/`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-5]` | ├── 5. Cơ chế Bỏ qua Tạm thời & Hàng đợi Nhắc lại (`Smart Re-Queue Engine`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-6]` | ├── 6. Cửa hàng Trang phục Mascot Ong Bee (`MascotStoreModal.tsx`) | Tiểu mục |
| └── `[UID: IMP-SEC-V-7]` | └── 7. Popup Mở mừng Chuỗi Ngày Học & Thưởng Đăng Nhập (`DailyStreakModal.tsx`) | Tiểu mục |
| `[UID: IMP-SEC-VI]` | **VI. Kế hoạch Nâng cấp Giáo trình Lớp 2 (Cambridge Pre-A1 Starters)** | Mục lớn |
| ├── `[UID: IMP-SEC-VI-1]` | ├── 1. Đánh giá Chuyên môn & Tăng độ khó theo cấp độ Lớp 2 | Tiểu mục |
| ├── `[UID: IMP-SEC-VI-2]` | ├── 2. Bổ sung Bộ Cấu trúc Câu Giao tiếp & Phonics Đánh vần | Tiểu mục |
| └── `[UID: IMP-SEC-VI-3]` | └── 3. Luồng Tương tác Ghép Câu (`SentenceBuilderBoard.tsx`) | Tiểu mục |
| `[UID: IMP-SEC-VII]` | **VII. Cấu trúc Thư mục & Các Cấu phần Chính trong Mã nguồn** | Mục lớn |
| `[UID: IMP-SEC-VIII]` | **VIII. Kế hoạch Nâng cấp Mở rộng Từ vựng Chuẩn Commercial (+70 Từ vựng)** | Mục lớn |
| ├── `[UID: IMP-SEC-VIII-1]` | ├── 1. Chủ đề Phonics Đánh vần (`explorer-phonics`) | Tiểu mục |
| ├── `[UID: IMP-SEC-VIII-2]` | ├── 2. Chủ đề Trang phục & Phụ kiện (`builder-clothes`) | Tiểu mục |
| ├── `[UID: IMP-SEC-VIII-3]` | ├── 3. Chủ đề Động từ Hành động (`builder-action-verbs`) | Tiểu mục |
| ├── `[UID: IMP-SEC-VIII-4]` | ├── 4. Chủ đề Địa điểm & Thiên nhiên (`builder-places-nature`) | Tiểu mục |
| └── `[UID: IMP-SEC-VIII-5]` | └── 5. Chủ đề Cảm xúc & Tính từ Miêu tả (`builder-emotions-adjectives`) | Tiểu mục |

---

### I. MÔ HÌNH KIẾN TRÚC MỚI (DUOLINGO STYLE SNAKE PATH & FOCUS SHELL) [UID: IMP-SEC-I]

1. **Bản đồ Học tập Đường mòn Ziczac SVG (`LearningMap`)** [UID: IMP-SEC-I-1]:
   * Trực quan hóa tiến trình bằng đường nối cong SVG (`<svg>` curved dotted path) nối mượt giữa các Node tròn 3D.
   * **Linh vật Ong Bee 🐝 Dẫn đường**: Đặt chú Ong Bee đứng cạnh Nút bài học hiện tại (Current Node) với hoạt ảnh pulse và bóng thoại kích thích bé bấm chọn.
   * **Node Rương Kho Báu (Unit Chest Node)**: Cuối mỗi Cấp độ (Unit), bổ sung Nút Rương Kho Báu 🌟 (`unit-chest-[id]`) để bé ôn tập tổng hợp toàn bộ từ vựng và nhận thưởng đặc biệt.

2. **Chế độ Học tập Trung Cố định Viewport ("Mobile Zero-Scroll Focus Shell")** [UID: IMP-SEC-I-2]:
   * Cố định màn hình bài học `h-[100dvh]` với `overflow-hidden`, triệt tiêu thanh cuộn dọc.
   * Thanh trên (Top Bar) phong cách Duolingo: Nút thoát `[X]`, Thanh tiến trình mượt (animated progress bar) và Đếm số sao tích lũy.

3. **Luồng Học tập 7 Dạng Tương tác & Bottom Sheet Phản hồi (`CoreQuizEngine`)** [UID: IMP-SEC-I-3]:
   * Single Hero Card kết hợp Mascot Ong Bee 🐝 và các dạng bài tương tác 1-chạm.
   * Bottom Sheet phản hồi trượt mượt từ bên dưới (Slide-up drawer): Thanh màu xanh lá khi trả lời đúng kèm âm thanh chúc mừng; Thanh màu cam khi làm lại kèm lời giải thích thân thiện.

4. **Thanh Chọn Độ Tuổi & Cấp Độ Linh Hoạt (`Age Level Selector Tabs`)** [UID: IMP-SEC-I-4]:
   * Đặt 3 Tab chọn Cấp độ 3D nổi bật ở trên cùng Bản đồ Học tập:
     * 🟢 **Explorer (5-6 tuổi)** - Mầm non & Lớp 1
     * 🔵 **Builder (7-8 tuổi)** - Lớp 2 & Lớp 3
     * 🟠 **Challenger (9+ tuổi)** - Lớp 4 trở lên
   * **Tự động mở bài đầu tiên ở mỗi Độ tuổi**: Bé Lớp 2 khi chọn sang Tab Builder 7-8 tuổi sẽ có sẵn Bài 1 được mở khóa (`unlocked`), không cần phải cày hết bài mầm non 5 tuổi mới được mở bài Lớp 2!

---

### II. PHÂN CHIA LỘ TRÌNH & 7 DẠNG BÀI HỌC TƯƠNG TÁC [UID: IMP-SEC-II]

#### Các Cấp độ Lộ trình (3 Learning Paths):
1. **Cấp độ 1: Explorer Path (5-6 tuổi - Mầm non & Lớp 1)** [UID: IMP-SEC-II-1]
2. **Cấp độ 2: Builder Trail (7-8 tuổi - Lớp 2 & Lớp 3)** [UID: IMP-SEC-II-2]
3. **Cấp độ 3: Challenger Run (9 tuổi trở lên - Lớp 4+)** [UID: IMP-SEC-II-3]

#### Chi tiết 7 Dạng Bài học Tương tác Phong phú (Duolingo Style) [UID: IMP-SEC-II-4]:
1. **`tap-match` (Nghe & Chạm Hình / Từ)** [UID: IMP-SEC-II-4-1]: Nghe âm thanh static MP3 -> Chạm hình hoặc từ tương ứng.
2. **`mcq` (Trắc nghiệm Nghĩa & Từ vựng)** [UID: IMP-SEC-II-4-2]: Câu hỏi nghe/đọc -> Chọn đáp án đúng trong lưới 2x2.
3. **`drag-drop` (Letter Board Speller - Ghép Chữ Cái)** [UID: IMP-SEC-II-4-3]: Kéo/chạm chữ cái phân mảnh để ghép thành từ hoàn chỉnh.
4. **`voice` (Voice Pronunciation Challenge - Luyện Phát Âm Commercial)** [UID: IMP-SEC-II-4-4]: Đã nâng cấp engine Elsa Commercial: **Nghe lại giọng con 🎧** vs **Nghe mẫu chuẩn 🔊**, tự động dừng VAD 1.5s, chấm điểm 3 Sao ⭐⭐⭐ & tô màu từng từ.
5. **`pair-match` (Duolingo Match Madness - Ghép Thẻ Từ & Nghĩa)** [UID: IMP-SEC-II-4-5]: Bảng 6 thẻ (3 Tiếng Anh, 3 Tiếng Việt/Emoji), chạm ghép cặp đúng.
6. **`sentence-builder` (Ghép Cụm Từ / Câu Cambridge Lớp 2)** [UID: IMP-SEC-II-4-6]: Thẻ từ vựng xếp bên dưới, bé chạm xếp đúng thứ tự câu (*"It is a red apple."*, *"I can swim."*).
7. **`flashcard-preview` (Thẻ Lật 3D Khám Phá)** [UID: IMP-SEC-II-4-7]: Thẻ 3D xem trước từ mới trước khi bắt đầu bài học.

---

### III. SƠ ĐỒ DỮ LIỆU & QUẢN LÝ TRẠNG THÁI (DATA SCHEMA & STORE) [UID: IMP-SEC-III]

#### 1. Schema Dữ liệu Học tập (`data/learningSchema.ts`) [UID: IMP-SEC-III-1]
Mở rộng `QuizType` và `LessonStep` để hỗ trợ đủ cả 7 dạng tương tác (`mcq`, `tap-match`, `drag-drop`, `voice`, `pair-match`, `sentence-builder`, `flashcard-preview`).

#### 2. Quản lý Trạng thái Tập trung (`store/learningStore.tsx`) [UID: IMP-SEC-III-2]
Lưu trữ và đồng bộ tiến trình học tập bền vững qua `localStorage` (`learning-progress-v2`).

---

### IV. BỘ DỮ LIỆU CHUẨN HÓA (166 TỪ VỰNG & 10+ HỘI THOẠI) [UID: IMP-SEC-IV]

#### 1. Bộ dữ liệu Từ vựng (166 từ vựng chuẩn hóa) [UID: IMP-SEC-IV-1]
Bảo tồn 100% 166 từ vựng chuẩn hóa gắn ID dạng `word-[topic]-[index]`.

#### 2. Kịch bản Hội thoại Tương tác (10+ Scenarios) [UID: IMP-SEC-IV-2]
Bảo tồn 100% kịch bản hội thoại gắn ID dạng `scenario-[topic]-[index]`.

---

### V. QUY TẮC ÂM THANH TĨNH MP3 & GAMIFICATION CHUẨN AGENTS.MD [UID: IMP-SEC-V]

1. **100% Static MP3 Audio Engine** [UID: IMP-SEC-V-1]: Sử dụng hoàn toàn tệp âm thanh MP3 thu sẵn trong `data/audioManifest.ts` (`/audio/generated/...`). Tuyệt đối KHÔNG dùng Web Speech API cho từ vựng/ví dụ.
2. **Zero Initial Consonant Truncation & Zero Latency** [UID: IMP-SEC-V-2]: Không dùng lại duy nhất một instance HTMLAudioElement bị dính `currentTime = 0`. Tự động nạp và pre-decode tệp âm thanh của Bài học vào RAM ngay khi vào màn hình.
3. **Thu âm & Nhận diện Giọng nói Commercial (`VoiceRecorderPanel.tsx`)** [UID: IMP-SEC-V-3]: Hệ thống thu âm kép `MediaRecorder` + SpeechRecognition với VAD ngắt lời 1.5s, phát lại giọng bé 🎧, âm mẫu chuẩn 🔊 và chấm điểm 3 Sao ⭐⭐⭐.
4. **Mascot Ong Bee 🐝 Interaction & Gamification** [UID: IMP-SEC-V-4]: Biểu cảm linh hoạt (`happy`, `encouraging`, `celebrating`, `oops`). Popup pháo hoa Confetti và Streak đếm ngày học.

---

### VI. KẾ HOẠCH NÂNG CẤP GIÁO TRÌNH LỚP 2 (CAMBRIDGE PRE-A1 STARTERS) [UID: IMP-SEC-VI]

1. **Đánh giá Chuyên môn & Tăng độ khó Cấp độ Lớp 2 (`Builder Trail`)** [UID: IMP-SEC-VI-1]:
   * Chuyển trọng tâm từ nhận biết từ lẻ đơn giản (`Explorer`) sang **Cấu trúc câu hoàn chỉnh (Sentence Patterns)** và **Đánh vần Phonics chuẩn Cambridge**.
2. **Bổ sung Bộ Cấu trúc Câu Giao tiếp & Phonics** [UID: IMP-SEC-VI-2]:
   * Mẫu câu mô tả: *"What is this?"* ➔ *"It is a green apple."*
   * Mẫu câu hỏi đáp số lượng: *"How many cats?"* ➔ *"There are two cats."*
   * Mẫu câu sở thích & khả năng: *"I like milk"*, *"I can swim"*.
3. **Tương tác Ghép Câu & Luyện Nói Phản Xạ (`SentenceBuilderBoard.tsx & VoiceRecorderPanel.tsx`)** [UID: IMP-SEC-VI-3]:
   * Yêu cầu bé ghép mảng từ xáo trộn thành câu hoàn chỉnh và thu âm phát âm trọn câu.

---

### VII. CẤU TRÚC THƯ MỤC & CÁC CẤU PHẦN CHÍNH TRONG MÃ NGUỒN [UID: IMP-SEC-VII]

```text
├── app/
│   ├── page.tsx                         # AppShell Penguin English kết nối LearningMap, FocusLessonShell, CoreQuizEngine & Store
│   └── globals.css                      # Custom CSS utilities, animation, styling 3D buttons & node paths
├── components/
│   ├── LearningMap.tsx                  # Bản đồ bài học ziczac SVG + Age Level Selector Tabs + Mascot Bee + Unit Chest Node
│   ├── CoreQuizEngine.tsx               # Quiz Engine hỗ trợ 7 dạng bài học & Duolingo Bottom Sheet
│   ├── lesson/
│   │   └── FocusLessonShell.tsx         # Giao diện học tập trung "Mobile Zero-Scroll 100dvh"
│   ├── interactions/
│   │   ├── LetterBoard.tsx              # Ghép chữ cái chính tả
│   │   ├── TapChoiceGrid.tsx            # Lưới chọn đáp án 2x2
│   │   ├── PairMatchBoard.tsx           # Ghép thẻ từ & nghĩa Duolingo Match Madness [NEW]
│   │   ├── SentenceBuilderBoard.tsx     # Ghép câu / cụm từ Lớp 2 Cambridge [NEW]
│   │   ├── FlashcardPreview.tsx         # Thẻ lật 3D khám phá từ vựng [NEW]
│   │   └── VoiceRecorderPanel.tsx       # Panel thu âm commercial & nhận diện giọng nói
│   └── gamification/
│       ├── Mascot.tsx                   # Mascot Ong Bee với 4 trạng thái cảm xúc
│       ├── RewardOverlay.tsx            # Popup bắn pháo hoa Confetti
│       └── StreakBanner.tsx             # Badge chuỗi ngày học
├── data/
│   ├── learningSchema.ts                # TypeScript interfaces mở rộng 7 step types
│   ├── curriculum.ts                    # Generator bài học nâng cấp cho bé Lớp 2 & 3 Độ tuổi
│   ├── audioManifest.ts                 # 100% Static MP3 audio manifest
│   └── englishData.ts                   # 166 từ vựng & kịch bản hội thoại chuẩn hóa
└── store/
    └── learningStore.tsx                # Quản lý tiến trình, sao, streak, localStorage
```

---

### VIII. KẾ HOẠCH NÂNG CẤP MỞ RỘNG TỪ VỰNG CHUẨN COMMERCIAL (+70 TỪ VỰNG Theo ID) [UID: IMP-SEC-VIII]

Để đạt độ phong phú ngang tầm Lingokids, Monkey Junior và bộ từ vựng chuẩn Cambridge Pre-A1 Starters, chúng ta sẽ mở rộng thêm 5 Chủ đề Từ vựng Mới (+70 từ vựng), được gán ID duy nhất và phân bổ trực tiếp vào 3 Lộ trình Học tập:

1. **Chủ đề Phonics Đánh vần Ghép Âm (`explorer-phonics`)** [UID: IMP-SEC-VIII-1]:
   * **Cấp độ**: Explorer (5-6 tuổi).
   * **Danh sách từ vựng (16 từ)**:
     - Các họ vần `-at`: `cat`, `hat`, `mat`, `rat` (ID: `word-phonics-at-cat`,...)
     - Các họ vần `-an`: `can`, `fan`, `man`, `pan` (ID: `word-phonics-an-can`,...)
     - Các họ vần `-ig` / `-og`: `pig`, `big`, `dog`, `log` (ID: `word-phonics-ig-pig`,...)
     - Các họ vần `-un` / `-up`: `sun`, `run`, `cup`, `pup` (ID: `word-phonics-un-sun`,...)

2. **Chủ đề Trang phục & Phụ kiện (`builder-clothes`)** [UID: IMP-SEC-VIII-2]:
   * **Cấp độ**: Builder (7-8 tuổi - Lớp 2 Cambridge).
   * **Danh sách từ vựng (12 từ)**:
     - `shirt` (Áo sơ mi), `t-shirt` (Áo phông), `dress` (Váy liền), `skirt` (Chân váy), `pants` (Quần dài), `shorts` (Quần đùi), `shoes` (Đôi giày), `socks` (Đôi tất), `jacket` (Áo khoác), `hat` (Cái mũ), `glasses` (Kính mắt), `watch` (Đồng hồ đeo tay).
     - ID dạng: `word-clothes-shirt`, `word-clothes-dress`,...

3. **Chủ đề Động từ Hành động (`builder-action-verbs`)** [UID: IMP-SEC-VIII-3]:
   * **Cấp độ**: Builder (7-8 tuổi - Lớp 2 Cambridge).
   * **Danh sách từ vựng (15 từ)**:
     - `run` (Chạy), `jump` (Nhảy cao), `swim` (Bơi), `fly` (Bay), `climb` (Leo trèo), `eat` (Ăn), `drink` (Uống), `sleep` (Ngủ), `wash` (Rửa/Gội), `draw` (Vẽ), `sing` (Hát), `dance` (Nhảy múa), `read` (Đọc), `write` (Viết), `clap` (Vỗ tay).
     - ID dạng: `word-verbs-run`, `word-verbs-jump`,...

4. **Chủ đề Địa điểm & Thiên nhiên (`builder-places-nature`)** [UID: IMP-SEC-VIII-4]:
   * **Cấp độ**: Builder (7-8 tuổi - Lớp 2 Cambridge).
   * **Danh sách từ vựng (12 từ)**:
     - `park` (Công viên), `beach` (Bãi biển), `farm` (Nông trại), `shop` (Cửa hàng), `hospital` (Bệnh viện), `street` (Đường phố), `river` (Dòng sông), `sea` (Biển), `tree` (Cây xanh), `flower` (Bông hoa), `sun` (Mặt trời), `moon` (Mặt trăng).
     - ID dạng: `word-places-park`, `word-places-beach`,...

5. **Chủ đề Cảm xúc & Tính từ Miêu tả (`builder-emotions-adjectives`)** [UID: IMP-SEC-VIII-5]:
   * **Cấp độ**: Builder (7-8 tuổi - Lớp 2 Cambridge).
   * **Danh sách từ vựng (12 từ)**:
     - `happy` (Vui vẻ), `sad` (Buồn ã), `angry` (Tức giận), `tired` (Mệt mỏi), `hungry` (Đói bụng), `thirsty` (Khát nước), `big` (To lớn), `small` (Nhỏ bé), `fast` (Nhanh), `slow` (Chậm), `hot` (Nóng), `cold` (Lạnh).
     - ID dạng: `word-emotions-happy`, `word-emotions-sad`,...
