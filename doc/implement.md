# KẾ HOẠCH TRIỂN KHAI VÀ THIẾT KẾ CHI TIẾT
## ỨNG DỤNG WEB HỌC TIẾNG ANH LỚP 2 (KIDS EDTECH APP)

Tài liệu này mô tả chi tiết các phân tích kỹ thuật, cấu trúc thư mục, các cải tiến về mặt UI/UX tối ưu cho trẻ em lớp 2 (7-8 tuổi) và lộ trình xây dựng ứng dụng.

---

### I. CÁC ĐIỂM CẢI TIẾN VÀ BỔ SUNG CHO PROMPT GỐC
Để tạo nên một ứng dụng EdTech thực sự thành công, lôi cuốn trẻ nhỏ và giúp các bé tự học một cách độc lập, chúng tôi đề xuất bổ sung các thành phần sau:

#### 1. Gamification (Hệ thống phần thưởng trực quan)
- **Tích điểm Sao Vàng ⭐**: Mỗi khi bé trả lời đúng 1 câu Quiz hoặc hoàn thành học 1 từ mới, bé sẽ được thưởng 1 đến 3 Sao. Số lượng Sao này sẽ hiển thị sinh động ở góc trên màn hình kèm hiệu ứng bay (flying animation).
- **Mascot tương tác (Linh vật "Bee" & "Cat")**:
  - Mascot không chỉ xuất hiện trong hội thoại mà còn xuất hiện ở góc màn hình.
  - Khi bé trả lời đúng, Mascot nhảy múa phấn khích và tung hoa.
  - Khi bé chọn sai, Mascot có biểu cảm suy nghĩ nhẹ nhàng (để bé không cảm thấy bị áp lực hay thất bại).

#### 2. UI/UX thân thiện với Trẻ em (Child-Friendly Design)
- **Nút bấm 3D cỡ lớn**: Tất cả các nút tương tác (Nghe, Lật thẻ, Chọn đáp án) có thiết kế 3D nổi bật, màu sắc tươi sáng, với chiều cao touch target tối thiểu là `56px` để dễ dàng chạm trên iPad/điện thoại.
- **Phông chữ Bo Tròn (Friendly Rounded Fonts)**: Sử dụng font chữ **Fredoka** hoặc **Quicksand** từ Google Fonts. Đây là font chữ không chân, nét đậm, bo tròn góc, tạo cảm giác vô cùng đáng yêu và dễ đọc với trẻ tập đọc lớp 2.
- **Màu sắc Pastel năng động**: Dùng các mã màu pastel có độ tương phản cao nhưng không gây mỏi mắt (Xanh lá Mint, Vàng mật ong, Xanh dương da trời, Hồng đào).

#### 3. Âm thanh sinh động (Audio & Sound FX)
- **Hiệu ứng âm thanh (Sound Effects)**: Tích hợp âm thanh chúc mừng "Ting-ting! 🎉" khi chọn đúng và tiếng động nhẹ "Oh-oh! 💡" khi chọn sai.
- **Tối ưu Web Speech API**: Xử lý việc tải bất đồng bộ danh sách giọng phát âm của thiết bị, ưu tiên chọn giọng `en-US` hoặc `en-GB` chất lượng cao với tốc độ nói vừa phải (rate = 0.85).

#### 4. Lưu trạng thái học tập (State Persistence)
- Tự động lưu tiến trình học, số sao, và những chủ đề bé đã học xong vào `localStorage`. Khi bé quay lại app vào hôm sau, các sao vàng của bé vẫn được giữ nguyên để tạo động lực.

---

### II. CẤU TRÚC THƯ MỤC DỰ ÁN DỰ KIẾN (NEXT.JS APP ROUTER)
```text
bachngancons-app-tieng-anh/
├── app/
│   ├── layout.tsx         # Cấu hình font chữ Fredoka, HTML Head, Metadata SEO cho trẻ em
│   ├── page.tsx           # Dashboard chính, quản lý State chung (Sao, Điểm, Tab hoạt động)
│   └── globals.css        # Cấu hình Tailwind, CSS 3D Button, Confetti và Keyframes Animations
├── components/
│   ├── Navbar.tsx         # Thanh điều hướng sinh động, hiển thị số Sao tích lũy
│   ├── VocabularySection.tsx # Học từ vựng: Danh sách chủ đề, Flashcards 3D lật thẻ, TTS phát âm
│   ├── ConversationSection.tsx # Hội thoại: Hoạt cảnh Bee & Cat đối thoại bong bóng chat sinh động
│   └── QuizSection.tsx    # Ôn tập: Trò chơi nghe và chọn đáp án đúng, Confetti ăn mừng
├── data/
│   └── englishData.ts     # Bộ dữ liệu từ vựng & hội thoại lớp 2 phong phú
├── hooks/
│   └── useSpeech.ts       # Hook chuyên biệt điều khiển giọng nói tiếng Anh chuẩn, có tùy chỉnh tốc độ
├── package.json           # Cấu hình dependencies (framer-motion, lucide-react, canvas-confetti)
├── tailwind.config.ts     # Định nghĩa bảng màu Pastel Kid-Friendly và animations custom
└── tsconfig.json
```

---

### III. BỘ DỮ LIỆU TIẾNG ANH LỚP 2 (`data/englishData.ts`)
Dữ liệu sẽ được tổ chức như sau:
- **Chủ đề (Topics)**: Mỗi chủ đề có ID, tên tiếng Anh, tên tiếng Việt, Icon đại diện và danh sách từ vựng.
- **Từ vựng (Vocabulary)**: Gồm từ tiếng Anh, phiên âm quốc tế (phonetics), nghĩa tiếng Việt, emoji/hình vẽ minh họa, câu ví dụ đơn giản.
- **Hội thoại (Conversations)**: Gồm các tình huống như *Good Morning*, *At school*, *Asking for permission*. Mỗi tình huống gồm một mảng các lời thoại, có chỉ định nhân vật phát ngôn (`bee` hoặc `cat`), câu nói tiếng Anh và nghĩa tiếng Việt tương ứng.

---

### IV. KẾ HOẠCH PHÁT TRIỂN & XÁC MINH CHẤT LƯỢNG (VERIFICATION)
1. **Khởi tạo dự án & cấu hình styling**: Cài đặt Next.js, cấu hình Google Font Fredoka và viết CSS cho nút bấm 3D, hiệu ứng lật thẻ 3D.
2. **Xây dựng module phát âm (`useSpeech`)**: Viết helper/hook tự động dò tìm và lưu trữ cấu hình giọng đọc chuẩn Mỹ/Anh của trình duyệt.
3. **Phát triển các component chức năng**:
   - Hoàn thành giao diện Flashcard đẹp mắt với hiệu ứng lật mượt mà của Framer Motion.
   - Thiết kế giao diện bong bóng trò chuyện trực quan, có chế độ tự động chạy (autoplay) từng câu hội thoại.
   - Thiết kế game Quiz trắc nghiệm chọn đáp án với thanh tiến trình ngộ nghĩnh và hiệu ứng Confetti chúc mừng.
4. **Kiểm thử trên thiết bị thực tế**:
   - Trình duyệt Chrome/Edge trên PC/Laptop.
   - Safari/Chrome trên iPad và các thiết bị di động (kiểm tra độ nhạy cảm ứng của nút bấm lớn, hoạt động của tiếng nói speechSynthesis).

---

### V. CÁC BƯỚC KHỞI ĐẦU NHANH
Khi bạn sẵn sàng chạy dự án, hãy sử dụng các lệnh sau:
1. Tạo dự án Next.js mới trong thư mục này:
   ```bash
   npx create-next-app@latest ./ --typescript --tailwind --app --src-dir=false --eslint --import-alias="@/*"
   ```
2. Cài đặt các package đi kèm:
   ```bash
   npm install framer-motion lucide-react canvas-confetti @types/canvas-confetti
   ```
3. Sau đó chạy server phát triển:
   ```bash
   npm run dev
   ```
