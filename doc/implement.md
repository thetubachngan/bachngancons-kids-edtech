Created At: 2026-07-29T00:46:18Z
Completed At: 2026-07-29T00:46:18Z
File Path: `file:///c:/CODE/bachngancons-app%20tieng%20anh/doc/implement.md`

# KẾ HOẠCH TRIỂN KHAI VÀ THIẾT KẾ CHI TIẾT (BẢN CẬP NHẬT MÔ HÌNH LEARNING PATH & FOCUS LESSON) [UID: IMP-TITLE]
## ỨNG DỤNG WEB HỌC TIẾNG ANH CHO TRẺ EM (KIDS EDTECH APP) [UID: IMP-SUBTITLE]

---

### 🗺️ BẢN ĐỒ QUẢN LÝ NỘI DUNG & DANH SÁCH UNIVERSAL ID (MASTER UID INDEX MAP)

Tài liệu được phân mã **UniversalID (UID)** hệ thống nhằm phục vụ quản lý, tra cứu và kiểm tra nhanh từng hạng mục trong dự án:

| UniversalID | Hạng mục / Nội dung chính | Loại Hạng Mục |
| :--- | :--- | :--- |
| `[UID: IMP-SEC-I]` | **I. Mô hình Kiến trúc mới (Duolingo ABC & Lingokids Style)** | Mục lớn |
| ├── `[UID: IMP-SEC-I-1]` | ├── 1. Bản đồ Học tập Tuyến tính (`LearningMap`) | Tiểu mục |
| ├── `[UID: IMP-SEC-I-2]` | ├── 2. Chế độ Học tập Trung ("One Screen Focus Shell") | Tiểu mục |
| └── `[UID: IMP-SEC-I-3]` | └── 3. Luồng Học tập Liên hoàn 4 Kỹ năng (`CoreQuizEngine`) | Tiểu mục |
| `[UID: IMP-SEC-II]` | **II. Phân chia Lộ trình & Cấp độ Học tập (3 Learning Paths)** | Mục lớn |
| ├── `[UID: IMP-SEC-II-1]` | ├── 1. Cấp độ 1: Explorer Path (5-6 tuổi - Mầm non & Lớp 1) | Tiểu mục |
| ├── `[UID: IMP-SEC-II-2]` | ├── 2. Cấp độ 2: Builder Trail (7-8 tuổi - Lớp 2 & Lớp 3) | Tiểu mục |
| └── `[UID: IMP-SEC-II-3]` | └── 3. Cấp độ 3: Challenger Run (9 tuổi trở lên - Lớp 4+) | Tiểu mục |
| `[UID: IMP-SEC-III]` | **III. Sơ đồ Dữ liệu & Quản lý Trạng thái (Data Schema & Store)** | Mục lớn |
| ├── `[UID: IMP-SEC-III-1]` | ├── 1. Schema Dữ liệu Học tập (`data/learningSchema.ts`) | Tiểu mục |
| └── `[UID: IMP-SEC-III-2]` | └── 2. Quản lý Trạng thái Tập trung (`store/learningStore.tsx`) | Tiểu mục |
| `[UID: IMP-SEC-IV]` | **IV. Bộ Dữ liệu Chuẩn hóa (166 Từ vựng & 10+ Hội thoại)** | Mục lớn |
| ├── `[UID: IMP-SEC-IV-1]` | ├── 1. Bộ dữ liệu Từ vựng (166 từ vựng chuẩn hóa) | Tiểu mục |
| └── `[UID: IMP-SEC-IV-2]` | └── 2. Kịch bản Hội thoại Tương tác (10+ Scenarios) | Tiểu mục |
| `[UID: IMP-SEC-V]` | **V. Tương tác Âm thanh, Giọng nói & Gamification** | Mục lớn |
| ├── `[UID: IMP-SEC-V-1]` | ├── 1. Hệ thống Phát âm chuẩn Mỹ (`hooks/useSpeech.ts`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-2]` | ├── 2. Thu âm & Nhận diện Giọng nói (`VoiceRecorderPanel.tsx`) | Tiểu mục |
| ├── `[UID: IMP-SEC-V-3]` | ├── 3. Tạo Âm thanh Trực tiếp (`utils/soundEffects.ts`) | Tiểu mục |
| └── `[UID: IMP-SEC-V-4]` | └── 4. Hệ thống Thưởng & Động lực Gamification (`components/gamification/`) | Tiểu mục |
| `[UID: IMP-SEC-VI]` | **VI. Cấu trúc Thư mục & Các Cấu phần chính trong Mã nguồn** | Mục lớn |
| ├── `[UID: IMP-DIR-*]` | ├── Danh sách các Thư mục chính trong dự án (`app/`, `components/`, `data/`, `store/`, ...) | Thư mục mã nguồn |
| └── `[UID: IMP-FILE-*]` | └── Danh sách các File Mã nguồn chi tiết (`page.tsx`, `LearningMap.tsx`, `curriculum.ts`, ...) | File mã nguồn |

---

Tài liệu này mô tả chi tiết toàn bộ kiến trúc mô hình mới, sơ đồ dữ liệu, lộ trình học tập game hóa (Learning Path), các dạng tương tác học tập tập trung (Focus Lesson Shell & Core Quiz Engine), quản lý trạng thái tập trung và hệ thống gamification edtech cao cấp đang được triển khai trong dự án.

---

### I. MÔ HÌNH KIẾN TRÚC MỚI (DUOLINGO ABC & LINGOKIDS STYLE LEARNING PATH) [UID: IMP-SEC-I]

Ứng dụng được thiết kế và triển khai theo mô hình **Game hóa Lộ trình Học tập (Node-based Learning Map)** kết hợp với **Chế độ Học tập Trung (One Screen Focus Engine)**:

1. **Bản đồ Học tập Tuyến tính (`LearningMap`)** [UID: IMP-SEC-I-1]:
   * Trực quan hóa tiến trình học bằng các đường dẫn ziczac sinh động chia thành 3 Cấp độ (Unit Paths).
   * Mỗi bài học được biểu diễn bằng một Node tương tác nổi bật với các trạng thái rõ ràng:
     * `completed`: Đã hoàn thành (nổi bật sao vàng và biểu tượng hoàn thành).
     * `current`: Bài học hiện tại (hiệu ứng nảy/phát sáng kích thích bé bấm vào học).
     * `locked`: Chưa mở khóa (màu xám nhạt, khóa lại cho đến khi hoàn thành các bài học trước).

2. **Chế độ Học tập Trung ("One Screen, One Task - Focus Shell")** [UID: IMP-SEC-I-2]:
   * Khi bé bắt đầu một bài học, ứng dụng chuyển sang giao diện `FocusLessonShell`, ẩn hoàn toàn các thanh điều hướng rườm rà để bé không bị phân tâm.
   * Thanh tiến trình (Progress Bar) phía trên hiển thị trực quan phần trăm (%) hoàn thành bài học.
   * Nút thoát an toàn giúp bé hoặc phụ huynh có thể dừng phiên học bất cứ lúc nào.

3. **Luồng Học tập Liên hoàn 4 Kỹ năng (`CoreQuizEngine`)** [UID: IMP-SEC-I-3]:
   * Mỗi Bài học (`Lesson`) bao gồm chuỗi các bước bài tập (`LessonStep`) đa dạng kỹ năng:
     * **Nghe (Listening)**: Chạm đáp án đúng qua phát âm/âm thanh.
     * **Đọc/Hiểu (Reading)**: Trắc nghiệm hình ảnh, từ vựng hoặc câu ví dụ.
     * **Viết/Ghép từ (Writing)**: Ghép chính tả bằng bảng chữ cái tương tác `LetterBoard`.
     * **Nói (Speaking)**: Thu âm và luyện phát âm với `VoiceRecorderPanel`.

---

### II. PHÂN CHIA LỘ TRÌNH & CẤP ĐỘ HỌC TẬP (3 LEARNING PATHS) [UID: IMP-SEC-II]

Chương trình học được phân cấp thành 3 Cấp độ (Unit Paths) bài bản, thích ứng với độ tuổi và sự phát triển tư duy của trẻ từ 5 đến 9+ tuổi:

1. **Cấp độ 1: Explorer Path (5-6 tuổi - Mầm non & Lớp 1)** [UID: IMP-SEC-II-1]
   * **Mục tiêu**: Nghe - Nhìn - Chạm. Làm quen với mặt chữ, âm cơ bản (phonics), nhận biết con vật, trái cây, màu sắc & hình khối.
   * **Phương pháp UI/UX**: Chữ to rõ, tự động phát âm giọng Mỹ/Anh (Auto-Speech), sử dụng Emoji/Hình ảnh cỡ lớn làm trọng tâm trực quan.
   * **Các dạng tương tác**: `tap-match` (chạm chọn hình hoặc từ), `mcq` (trắc nghiệm cơ bản), `drag-drop` (ghép chữ cái ngắn).

2. **Cấp độ 2: Builder Trail (7-8 tuổi - Lớp 2 & Lớp 3)** [UID: IMP-SEC-II-2]
   * **Mục tiêu**: Nghe - Hiểu - Nói. Học từ vựng, phiên âm chuẩn IPA, cấu trúc câu ví dụ và các đoạn hội thoại ngắn giữa Mascot Bee 🐝 & Cat 🐱.
   * **Phương pháp UI/UX**: Flashcard lật 3D linh hoạt, bài học tích hợp thu âm giọng nói phản xạ.
   * **Các dạng tương tác**: `mcq` (chọn nghĩa hoặc từ phù hợp), `tap-match` (ghép câu ví dụ), `voice` (luyện phát âm theo giọng mẫu).

3. **Cấp độ 3: Challenger Run (9 tuổi trở lên - Lớp 4 trở lên)** [UID: IMP-SEC-II-3]
   * **Mục tiêu**: Nghe - Ghép - Nói. Thử thách ghép chính tả từ vựng hoàn chỉnh, đọc to nguyên câu/cụm từ và thực hành hội thoại nâng cao.
   * **Phương pháp UI/UX**: Bảng chữ cái phân mảnh `LetterBoard` xáo trộn, Mascot đánh giá và khích lệ giọng đọc to rõ.
   * **Các dạng tương tác**: `drag-drop` (ghép chính tả chuẩn xác), `voice` (thu âm cụm từ/câu), bài học hội thoại đa tình huống.

---

### III. SƠ ĐỒ DỮ LIỆU & QUẢN LÝ TRẠNG THÁI (DATA SCHEMA & STORE) [UID: IMP-SEC-III]

#### 1. Schema Dữ liệu Học tập (`data/learningSchema.ts`) [UID: IMP-SEC-III-1]
* **`Curriculum`**: Cấu trúc tổng thể chứa danh sách các `Unit`.
* **`Unit`**: Đại diện cho 1 Cấp độ / Path (`level`, `title`, `description`, `mascotMood`, `lessons`).
* **`Lesson`**: Đại diện cho 1 Bài học Node trên bản đồ (`id`, `unitId`, `level`, `skill`, `rewardStars`, `targetWordIds`, `steps`).
* **`LessonStep`**: Định nghĩa một bước học trong Lesson với các dạng `mcq`, `tap-match`, `drag-drop`, hoặc `voice`, đi kèm câu hỏi, visual, audio, và đáp án.

#### 2. Quản lý Trạng thái Tập trung (`store/learningStore.tsx`) [UID: IMP-SEC-III-2]
* Triển khai React Context + `useReducer` giúp toàn bộ ứng dụng quản lý trạng thái học tập tập trung và nhất quán:
  * `unlockedLessonIds`: Danh sách ID các bài học đã được mở khóa.
  * `completedLessonIds`: Danh sách ID các bài học đã hoàn thành.
  * `currentLessonId`: Bài học bé đang mở.
  * `streakDays`: Chuỗi ngày học liên tục (tự động tính dựa trên ngày truy cập `lastVisitDate`).
  * `stars` / `rewards`: Tổng số sao tích lũy bé đạt được.
  * `lessonStats`: Thống kê số lần làm bài và số sao cao nhất của từng bài học.
* **Đồng bộ & Lưu trữ (`localStorage`)**:
  * Tự động lưu tiến trình bền vững dưới key `learning-progress-v2`.
  * Hỗ trợ tự động chuyển đổi dữ liệu tiến trình từ các phiên bản cũ (`kids-english-progress`).

---

### IV. BỘ DỮ LIỆU CHUẨN HÓA (166 TỪ VỰNG & 10+ HỘI THOẠI) [UID: IMP-SEC-IV]

Toàn bộ từ vựng và hội thoại được quản lý tại `data/englishData.ts` và tự động chuyển hóa thành các bài học qua `data/curriculum.ts`:

1. **Bộ dữ liệu Từ vựng (166 từ vựng chuẩn hóa)** [UID: IMP-SEC-IV-1]:
   * **Explorer (52 từ)**: Chữ cái Phonics (15 từ), Trái cây (10 từ), Thế giới Sở thú (12 từ), Màu sắc & Hình khối (15 từ).
   * **Builder (57 từ)**: Gia đình & Nhà cửa (15 từ), Lớp học của em (15 từ), Cơ thể của em (12 từ), Món ăn & Đồ chơi (15 từ).
   * **Challenger (57 từ)**: Hoạt động hàng ngày (15 từ), Thời tiết & Mùa (12 từ), Nghề nghiệp (15 từ), Sở thích & Phương tiện (15 từ).
   * Mỗi từ vựng được đóng gói đầy đủ: `id`, `word`, `phonetic`, `translation`, `example`, `exampleTranslation`, `emoji`, `audioSrc`, `speechText`.

2. **Kịch bản Hội thoại Tương tác (10+ Scenarios)** [UID: IMP-SEC-IV-2]:
   * Tình huống giao tiếp sinh động giữa 2 Mascot Ong Bee 🐝 & Mèo Cat 🐱 (Chào hỏi, Gia đình, Đồ chơi, Thời tiết, Trường học...).
   * Tích hợp thành các bài học thực hành kỹ năng Nghe - Hiểu - Nói trực quan.

---

### V. TƯƠNG TÁC ÂM THANH, GIỌNG NÓI & GAMIFICATION [UID: IMP-SEC-V]

1. **Hệ thống Phát âm chuẩn Mỹ (`hooks/useSpeech.ts`)** [UID: IMP-SEC-V-1]:
   * Sử dụng `window.speechSynthesis` ưu tiên giọng tiếng Anh Mỹ chuẩn (`en-US`, e.g. `Google US English`).
   * Tốc độ phát âm được chuẩn hóa `rate = 0.85` (chậm rãi cho trẻ em dễ nghe), cao độ `pitch = 1.1` (trong trẻo, vui tươi).
   * Hỗ trợ fallback mượt mà sang `html5Audio.ts` khi tệp audio có sẵn.

2. **Hệ thống Thu âm & Nhận diện Giọng nói (`VoiceRecorderPanel.tsx`)** [UID: IMP-SEC-V-2]:
   * Tích hợp Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`).
   * Cung cấp chế độ Giả lập / Mô phỏng thu âm thông minh dành cho trình duyệt hoặc thiết bị không hỗ trợ micro, giúp bé hoàn thành bài học không bị gián đoạn.

3. **Tạo Âm thanh Trực tiếp (`utils/soundEffects.ts`)** [UID: IMP-SEC-V-3]:
   * Sử dụng Web Audio API sinh âm thanh tổng hợp siêu nhẹ (Sound Synthesis):
     * **Âm đúng (Correct Sound)**: Nốt C5 & E5 vang lên mang cảm giác hoàn thành vui tươi.
     * **Âm sai (Wrong Sound)**: Nốt A3 trầm nhẹ khuyên bé thử chọn lại.

4. **Hệ thống Thưởng & Động lực Gamification (`components/gamification/`)** [UID: IMP-SEC-V-4]:
   * **`Mascot.tsx`**: Biểu cảm chú Ong Bee linh hoạt theo kết quả (`happy`, `encouraging`, `celebrating`, `oops`) kết hợp hoạt ảnh bồng bềnh (floating effect).
   * **`RewardOverlay.tsx`**: Màn hình Popup chúc mừng rực rỡ kèm hiệu ứng bắn pháo hoa `canvas-confetti` tràn màn hình khi hoàn thành lesson.
   * **`StreakBanner.tsx`**: Badge hiển thị chuỗi ngày học (Streak) thúc đẩy thói quen học tập hàng ngày.

---

### VI. CẤU TRÚC THƯ MỤC & CÁC CẤU PHẦN CHÍNH TRONG MÃ NGUỒN [UID: IMP-SEC-VI]

```text
├── app/                                 [UID: IMP-DIR-APP]
│   ├── page.tsx                         # AppShell kết nối LearningMap, FocusLessonShell, CoreQuizEngine & Store [UID: IMP-FILE-PAGE]
│   ├── globals.css                      # Custom CSS utilities, animation, styling 3D buttons & node paths [UID: IMP-FILE-GLOBALS-CSS]
│   └── layout.tsx                       # Root layout cấu hình Font Fredoka & Metadata SEO [UID: IMP-FILE-LAYOUT]
├── components/                          [UID: IMP-DIR-COMPONENTS]
│   ├── LearningMap.tsx                  # Bản đồ bài học ziczac 3 Cấp độ với các Node trạng thái [UID: IMP-FILE-LEARNING-MAP]
│   ├── CoreQuizEngine.tsx               # Engine điều hướng các bước quiz (mcq, tap-match, drag-drop, voice) [UID: IMP-FILE-QUIZ-ENGINE]
│   ├── lesson/                          [UID: IMP-DIR-LESSON]
│   │   └── FocusLessonShell.tsx         # Giao diện học tập trung "One screen, one task" [UID: IMP-FILE-FOCUS-SHELL]
│   ├── interactions/                    [UID: IMP-DIR-INTERACTIONS]
│   │   ├── LetterBoard.tsx              # Bảng chữ cái tương tác chạm / kéo thả ghép từ chính tả [UID: IMP-FILE-LETTER-BOARD]
│   │   ├── TapChoiceGrid.tsx            # Lưới chọn đáp án dạng thẻ chữ hoặc Emoji [UID: IMP-FILE-TAP-CHOICE-GRID]
│   │   └── VoiceRecorderPanel.tsx       # Panel thu âm & nhận diện giọng nói (thực & giả lập) [UID: IMP-FILE-VOICE-PANEL]
│   ├── gamification/                    [UID: IMP-DIR-GAMIFICATION]
│   │   ├── Mascot.tsx                   # Mascot chú Ong Bee với 4 trạng thái cảm xúc [UID: IMP-FILE-MASCOT]
│   │   ├── RewardOverlay.tsx            # Modal chúc mừng & bắn pháo hoa Confetti [UID: IMP-FILE-REWARD-OVERLAY]
│   │   └── StreakBanner.tsx             # Badge hiển thị chuỗi ngày học tập liên tục [UID: IMP-FILE-STREAK-BANNER]
│   ├── Flashcard.tsx                    # Component lật thẻ 3D linh hoạt [UID: IMP-FILE-FLASHCARD]
│   └── Navbar.tsx                       # Thanh điều hướng top bar [UID: IMP-FILE-NAVBAR]
├── data/                                [UID: IMP-DIR-DATA]
│   ├── learningSchema.ts                # TypeScript interfaces định nghĩa Curriculum, Unit, Lesson, LessonStep [UID: IMP-FILE-SCHEMA]
│   ├── curriculum.ts                    # Generator xây dựng lộ trình bài học chi tiết từ bộ từ vựng [UID: IMP-FILE-CURRICULUM]
│   └── englishData.ts                   # 166 từ vựng & kịch bản hội thoại chuẩn hóa [UID: IMP-FILE-ENGLISH-DATA]
├── store/                               [UID: IMP-DIR-STORE]
│   └── learningStore.tsx                # React Context & useReducer quản lý tiến trình, sao, streak, localStorage [UID: IMP-FILE-STORE]
├── hooks/                               [UID: IMP-DIR-HOOKS]
│   └── useSpeech.ts                     # Hook tối ưu Web Speech API & HTML5 Audio [UID: IMP-FILE-HOOK-SPEECH]
└── utils/                               [UID: IMP-DIR-UTILS]
    ├── confetti.ts                      # Thư viện kích hoạt pháo hoa chúc mừng [UID: IMP-FILE-CONFETTI]
    ├── html5Audio.ts                    # Helper phát file audio mp3 [UID: IMP-FILE-AUDIO]
    └── soundEffects.ts                  # Web Audio API synthesizer sinh âm thanh phản hồi [UID: IMP-FILE-SOUND]
```
