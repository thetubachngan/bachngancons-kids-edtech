export type AppTabKey = "vocabulary" | "conversation" | "quiz";
export type AgeLevel = "explorer" | "builder" | "challenger";
export type QuizMode = "emoji" | "meaning" | "spelling";

export type TopicTheme = {
  surfaceClass: string;
  accentClass: string;
  badgeClass: string;
  buttonClass: string;
};

export type VocabularyWord = {
  id: string;
  level: AgeLevel;
  word: string;
  phonetic: string;
  translation: string;
  emoji: string;
  example: string;
  exampleTranslation: string;
  speechText?: string;
  exampleSpeechText?: string;
  audioSrc?: string;
  exampleAudioSrc?: string;
};

export type Topic = {
  id: string;
  level: AgeLevel;
  title: string;
  subtitle: string;
  icon: string;
  theme: TopicTheme;
  words: VocabularyWord[];
};

export type ConversationLine = {
  speaker: "bee" | "cat";
  english: string;
  vietnamese: string;
  emoji: string;
  audioSrc?: string;
};

export type ConversationScenario = {
  id: string;
  level: Exclude<AgeLevel, "explorer">;
  title: string;
  summary: string;
  place: string;
  lines: ConversationLine[];
};

export type LevelConfig = {
  id: AgeLevel;
  label: string;
  ageRange: string;
  shortDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  availableTabs: AppTabKey[];
  quizMode: QuizMode;
  vocabularyHint: string;
  conversationTitle?: string;
  conversationDescription?: string;
};

export const levels: LevelConfig[] = [
  {
    id: "explorer",
    label: "Explorer",
    ageRange: "5-6 tuổi",
    shortDescription: "Làm quen mặt chữ, âm cơ bản và nhận biết đồ vật qua emoji sinh động.",
    heroBadge: "Khởi động nhẹ nhàng cùng phonics và emoji",
    heroTitle: "Explorer - Bé 5-6 tuổi bắt đầu yêu tiếng Anh",
    heroDescription:
      "Cấp độ này tập trung vào nhìn - nghe - chọn đúng. Bé làm quen chữ cái, trái cây, con vật và màu sắc qua các thẻ to rõ và trò chơi chọn emoji vui nhộn.",
    availableTabs: ["vocabulary", "quiz"],
    quizMode: "emoji",
    vocabularyHint: "Ưu tiên nghe thật rõ, nhìn emoji lớn và nhớ nhanh mặt chữ đầu tiên.",
  },
  {
    id: "builder",
    label: "Builder",
    ageRange: "7-8 tuổi",
    shortDescription: "Mở rộng từ vựng, học phiên âm và luyện hội thoại ngắn cùng Bee & Cat.",
    heroBadge: "Flashcard 3D + hội thoại + quiz 4 đáp án",
    heroTitle: "Builder - Học chắc từ vựng và giao tiếp cơ bản",
    heroDescription:
      "Đây là cấp độ gần nhất với app hiện tại: bé học qua flashcard lật 3D, nghe phát âm chuẩn, xem ví dụ và luyện phản xạ với quiz chọn nghĩa tiếng Việt.",
    availableTabs: ["vocabulary", "conversation", "quiz"],
    quizMode: "meaning",
    vocabularyHint: "Mỗi từ nên nghe ít nhất 3 lần, lật thẻ để xem ví dụ và ghi nhớ ngữ cảnh đơn giản.",
    conversationTitle: "Hội thoại cùng Bee & Cat",
    conversationDescription: "Nghe và luyện nói theo những đoạn hội thoại ngắn, gần gũi với bé lớp 2-3.",
  },
  {
    id: "challenger",
    label: "Challenger",
    ageRange: "9+ tuổi",
    shortDescription: "Mở rộng chủ đề, tăng phản xạ nghe - viết - ghép chữ và giao tiếp tự tin hơn.",
    heroBadge: "Thử thách chính tả và chủ đề mở rộng",
    heroTitle: "Challenger - Sẵn sàng chinh phục những thử thách khó hơn",
    heroDescription:
      "Cấp độ này hướng tới phản xạ cao hơn: bé nghe, đọc, ghép chữ đúng chính tả và làm quen những chủ đề như thời tiết, nghề nghiệp, thói quen hằng ngày.",
    availableTabs: ["vocabulary", "conversation", "quiz"],
    quizMode: "spelling",
    vocabularyHint: "Ngoài nghĩa từ, bé cần chú ý thứ tự chữ cái và cách dùng từ trong câu hoàn chỉnh.",
    conversationTitle: "Thử thách hội thoại",
    conversationDescription: "Luyện nghe các tình huống dài hơn để chuẩn bị cho phản xạ giao tiếp và mô tả ý tưởng rõ ràng hơn.",
  },
];

const explorerThemes = {
  alphabet: {
    surfaceClass: "bg-emerald-100",
    accentClass: "text-emerald-700",
    badgeClass: "bg-emerald-200 text-emerald-800",
    buttonClass: "bg-emerald-400 text-emerald-950 border-emerald-600",
  },
  fruits: {
    surfaceClass: "bg-pink-100",
    accentClass: "text-pink-700",
    badgeClass: "bg-pink-200 text-pink-800",
    buttonClass: "bg-pink-400 text-pink-950 border-pink-600",
  },
  zoo: {
    surfaceClass: "bg-sky-100",
    accentClass: "text-sky-700",
    badgeClass: "bg-sky-200 text-sky-800",
    buttonClass: "bg-sky-400 text-sky-950 border-sky-600",
  },
  colors: {
    surfaceClass: "bg-purple-100",
    accentClass: "text-purple-700",
    badgeClass: "bg-purple-200 text-purple-800",
    buttonClass: "bg-purple-400 text-purple-950 border-purple-600",
  },
} satisfies Record<string, TopicTheme>;

const builderThemes = {
  family: {
    surfaceClass: "bg-pink-100",
    accentClass: "text-pink-700",
    badgeClass: "bg-pink-200 text-pink-800",
    buttonClass: "bg-pink-400 text-pink-950 border-pink-600",
  },
  classroom: {
    surfaceClass: "bg-sky-100",
    accentClass: "text-sky-700",
    badgeClass: "bg-sky-200 text-sky-800",
    buttonClass: "bg-sky-400 text-sky-950 border-sky-600",
  },
  body: {
    surfaceClass: "bg-emerald-100",
    accentClass: "text-emerald-700",
    badgeClass: "bg-emerald-200 text-emerald-800",
    buttonClass: "bg-emerald-400 text-emerald-950 border-emerald-600",
  },
  food: {
    surfaceClass: "bg-amber-100",
    accentClass: "text-amber-700",
    badgeClass: "bg-amber-200 text-amber-800",
    buttonClass: "bg-amber-400 text-amber-950 border-amber-600",
  },
} satisfies Record<string, TopicTheme>;

const challengerThemes = {
  routine: {
    surfaceClass: "bg-violet-100",
    accentClass: "text-violet-700",
    badgeClass: "bg-violet-200 text-violet-800",
    buttonClass: "bg-violet-400 text-violet-950 border-violet-600",
  },
  weather: {
    surfaceClass: "bg-cyan-100",
    accentClass: "text-cyan-700",
    badgeClass: "bg-cyan-200 text-cyan-800",
    buttonClass: "bg-cyan-400 text-cyan-950 border-cyan-600",
  },
  jobs: {
    surfaceClass: "bg-rose-100",
    accentClass: "text-rose-700",
    badgeClass: "bg-rose-200 text-rose-800",
    buttonClass: "bg-rose-400 text-rose-950 border-rose-600",
  },
  hobbies: {
    surfaceClass: "bg-lime-100",
    accentClass: "text-lime-700",
    badgeClass: "bg-lime-200 text-lime-800",
    buttonClass: "bg-lime-400 text-lime-950 border-lime-600",
  },
} satisfies Record<string, TopicTheme>;

type WordOverrides = Pick<VocabularyWord, "speechText" | "exampleSpeechText" | "audioSrc" | "exampleAudioSrc">;

const createWord = (
  level: AgeLevel,
  id: string,
  word: string,
  phonetic: string,
  translation: string,
  emoji: string,
  example: string,
  exampleTranslation: string,
  overrides: WordOverrides = {},
): VocabularyWord => ({
  id,
  level,
  word,
  phonetic,
  translation,
  emoji,
  example,
  exampleTranslation,
  speechText: overrides.speechText ?? (word.includes(" ") ? `${word}.` : undefined),
  exampleSpeechText: overrides.exampleSpeechText,
  audioSrc: overrides.audioSrc,
  exampleAudioSrc: overrides.exampleAudioSrc,
  ...overrides,
});

const createLine = (
  speaker: "bee" | "cat",
  english: string,
  vietnamese: string,
  emoji: string,
  audioSrc?: string,
): ConversationLine => ({
  speaker,
  english,
  vietnamese,
  emoji,
  audioSrc,
});

export const topics: Topic[] = [
  {
    id: "alphabet-fun",
    level: "explorer",
    title: "Alphabet Fun",
    subtitle: "Nhìn chữ cái và từ quen thuộc",
    icon: "🔤",
    theme: explorerThemes.alphabet,
    words: [
      createWord("explorer", "explorer-apple", "Apple", "/ˈæp.əl/", "Quả táo", "🍎", "Apple is red.", "Quả táo màu đỏ."),
      createWord("explorer", "explorer-bee", "Bee", "/biː/", "Con ong", "🐝", "The bee can fly.", "Con ong có thể bay."),
      createWord("explorer", "explorer-cat", "Cat", "/kæt/", "Con mèo", "🐱", "The cat is cute.", "Con mèo dễ thương."),
      createWord("explorer", "explorer-dog", "Dog", "/dɔːɡ/", "Con chó", "🐶", "The dog can run.", "Con chó có thể chạy."),
      createWord("explorer", "explorer-egg", "Egg", "/eɡ/", "Quả trứng", "🥚", "This is an egg.", "Đây là một quả trứng."),
      createWord("explorer", "explorer-fish", "Fish", "/fɪʃ/", "Con cá", "🐟", "The fish can swim.", "Con cá có thể bơi."),
      createWord("explorer", "explorer-grape", "Grape", "/ɡreɪp/", "Quả nho", "🍇", "Grapes are sweet.", "Nho rất ngọt."),
      createWord("explorer", "explorer-hat", "Hat", "/hæt/", "Cái mũ", "🎩", "I have a hat.", "Em có một cái mũ."),
      createWord("explorer", "explorer-ice-cream", "Ice cream", "/ˈaɪs ˌkriːm/", "Kem", "🍦", "Ice cream is cold.", "Kem rất lạnh.", {
        speechText: "Ice cream.",
      }),
      createWord("explorer", "explorer-jellyfish", "Jellyfish", "/ˈdʒel.i.fɪʃ/", "Con sứa", "🪼", "The jellyfish is blue.", "Con sứa màu xanh."),
      createWord("explorer", "explorer-kite", "Kite", "/kaɪt/", "Cái diều", "🪁", "The kite flies high.", "Diều bay cao."),
      createWord("explorer", "explorer-lion", "Lion", "/ˈlaɪ.ən/", "Sư tử", "🦁", "The lion is big.", "Sư tử rất to."),
      createWord("explorer", "explorer-monkey", "Monkey", "/ˈmʌŋ.ki/", "Con khỉ", "🐵", "The monkey is funny.", "Con khỉ ngộ nghĩnh."),
      createWord("explorer", "explorer-nest", "Nest", "/nest/", "Tổ chim", "🪹", "The bird has a nest.", "Con chim có tổ."),
      createWord("explorer", "explorer-orange-fruit", "Orange", "/ˈɒr.ɪndʒ/", "Quả cam", "🍊", "The orange is juicy.", "Quả cam mọng nước."),
    ],
  },
  {
    id: "fruits",
    level: "explorer",
    title: "Fruits",
    subtitle: "Hoa quả thơm ngon quanh bé",
    icon: "🍓",
    theme: explorerThemes.fruits,
    words: [
      createWord("explorer", "explorer-banana", "Banana", "/bəˈnɑː.nə/", "Quả chuối", "🍌", "The banana is yellow.", "Quả chuối màu vàng."),
      createWord("explorer", "explorer-mango", "Mango", "/ˈmæŋ.ɡəʊ/", "Quả xoài", "🥭", "I like mango.", "Em thích quả xoài."),
      createWord("explorer", "explorer-watermelon", "Watermelon", "/ˈwɔː.təˌmel.ən/", "Quả dưa hấu", "🍉", "Watermelon is big.", "Quả dưa hấu rất to."),
      createWord("explorer", "explorer-strawberry", "Strawberry", "/ˈstrɔː.bər.i/", "Quả dâu tây", "🍓", "The strawberry is sweet.", "Quả dâu tây ngọt."),
      createWord("explorer", "explorer-coconut", "Coconut", "/ˈkəʊ.kə.nʌt/", "Quả dừa", "🥥", "The coconut is hard.", "Quả dừa rất cứng."),
      createWord("explorer", "explorer-pear", "Pear", "/peər/", "Quả lê", "🍐", "The pear is sweet.", "Quả lê rất ngọt."),
      createWord("explorer", "explorer-peach", "Peach", "/piːtʃ/", "Quả đào", "🍑", "The peach is pink.", "Quả đào màu hồng."),
      createWord("explorer", "explorer-pineapple", "Pineapple", "/ˈpaɪnˌæp.əl/", "Quả dứa", "🍍", "Pineapple is yellow.", "Quả dứa màu vàng."),
      createWord("explorer", "explorer-lemon", "Lemon", "/ˈlem.ən/", "Quả chanh vàng", "🍋", "The lemon is sour.", "Quả chanh rất chua."),
      createWord("explorer", "explorer-cherry", "Cherry", "/ˈtʃer.i/", "Quả anh đào", "🍒", "The cherry is red.", "Quả anh đào màu đỏ."),
    ],
  },
  {
    id: "zoo-animals",
    level: "explorer",
    title: "Zoo Animals",
    subtitle: "Thế giới sở thú thật vui",
    icon: "🦁",
    theme: explorerThemes.zoo,
    words: [
      createWord("explorer", "explorer-zoo-lion", "Lion", "/ˈlaɪ.ən/", "Sư tử", "🦁", "The lion is strong.", "Sư tử rất khỏe."),
      createWord("explorer", "explorer-tiger", "Tiger", "/ˈtaɪ.ɡər/", "Con hổ", "🐯", "The tiger has stripes.", "Con hổ có vằn."),
      createWord("explorer", "explorer-elephant", "Elephant", "/ˈel.ɪ.fənt/", "Con voi", "🐘", "The elephant is big.", "Con voi rất to."),
      createWord("explorer", "explorer-zoo-monkey", "Monkey", "/ˈmʌŋ.ki/", "Con khỉ", "🐵", "The monkey can jump.", "Con khỉ có thể nhảy."),
      createWord("explorer", "explorer-zebra", "Zebra", "/ˈzeb.rə/", "Ngựa vằn", "🦓", "The zebra has stripes.", "Ngựa vằn có sọc."),
      createWord("explorer", "explorer-giraffe", "Giraffe", "/dʒɪˈrɑːf/", "Hươu cao cổ", "🦒", "The giraffe is tall.", "Hươu cao cổ rất cao."),
      createWord("explorer", "explorer-bear", "Bear", "/beər/", "Con gấu", "🐻", "The bear likes honey.", "Con gấu thích mật ong."),
      createWord("explorer", "explorer-hippo", "Hippo", "/ˈhɪp.əʊ/", "Hà mã", "🦛", "The hippo is fat.", "Hà mã rất béo."),
      createWord("explorer", "explorer-kangaroo", "Kangaroo", "/ˌkæŋ.ɡərˈuː/", "Chuột túi", "🦘", "The kangaroo can jump.", "Chuột túi biết nhảy."),
      createWord("explorer", "explorer-crocodile", "Crocodile", "/ˈkrɒk.ə.daɪl/", "Cá sấu", "🐊", "The crocodile has sharp teeth.", "Cá sấu có răng sắc."),
      createWord("explorer", "explorer-panda", "Panda", "/ˈpæn.də/", "Gấu trúc", "🐼", "The panda eats bamboo.", "Gấu trúc ăn tre."),
      createWord("explorer", "explorer-penguin", "Penguin", "/ˈpeŋ.ɡwɪn/", "Chim cánh cụt", "🐧", "The penguin can swim.", "Chim cánh cụt biết bơi."),
    ],
  },
  {
    id: "colors-shapes",
    level: "explorer",
    title: "Colors & Shapes",
    subtitle: "Màu sắc và hình khối cơ bản",
    icon: "🌈",
    theme: explorerThemes.colors,
    words: [
      createWord("explorer", "explorer-red", "Red", "/red/", "Màu đỏ", "🔴", "Red is my favorite.", "Màu đỏ là màu em thích."),
      createWord("explorer", "explorer-blue", "Blue", "/bluː/", "Màu xanh dương", "🔵", "The sky is blue.", "Bầu trời màu xanh."),
      createWord("explorer", "explorer-yellow", "Yellow", "/ˈjel.əʊ/", "Màu vàng", "🟡", "The sun is yellow.", "Mặt trời màu vàng."),
      createWord("explorer", "explorer-green", "Green", "/ɡriːn/", "Màu xanh lá", "🟢", "The leaf is green.", "Chiếc lá màu xanh lá."),
      createWord("explorer", "explorer-pink", "Pink", "/pɪŋk/", "Màu hồng", "🌸", "She likes pink.", "Bạn ấy thích màu hồng."),
      createWord("explorer", "explorer-orange-color", "Orange", "/ˈɒr.ɪndʒ/", "Màu cam", "🟠", "The box is orange.", "Cái hộp màu cam."),
      createWord("explorer", "explorer-purple", "Purple", "/ˈpɜː.pəl/", "Màu tím", "🟣", "The flower is purple.", "Bông hoa màu tím."),
      createWord("explorer", "explorer-brown", "Brown", "/braʊn/", "Màu nâu", "🟤", "The dog is brown.", "Con chó màu nâu."),
      createWord("explorer", "explorer-black", "Black", "/blæk/", "Màu đen", "⚫", "The cat is black.", "Con mèo màu đen."),
      createWord("explorer", "explorer-white", "White", "/waɪt/", "Màu trắng", "⚪", "The cloud is white.", "Đám mây màu trắng."),
      createWord("explorer", "explorer-circle", "Circle", "/ˈsɜː.kəl/", "Hình tròn", "⭕", "The circle is round.", "Hình tròn tròn đều."),
      createWord("explorer", "explorer-square", "Square", "/skweər/", "Hình vuông", "⬛", "The block is square.", "Khối đồ chơi hình vuông."),
      createWord("explorer", "explorer-triangle", "Triangle", "/ˈtraɪ.æŋ.ɡəl/", "Hình tam giác", "🔺", "The roof is a triangle.", "Mái nhà hình tam giác."),
      createWord("explorer", "explorer-rectangle", "Rectangle", "/ˈrek.tæŋ.ɡəl/", "Hình chữ nhật", "▮", "The door is a rectangle.", "Cánh cửa hình chữ nhật."),
      createWord("explorer", "explorer-star", "Star", "/stɑːr/", "Hình ngôi sao", "⭐", "The star is yellow.", "Ngôi sao màu vàng."),
    ],
  },
  {
    id: "family-house",
    level: "builder",
    title: "Family & House",
    subtitle: "Gia đình và ngôi nhà thân quen",
    icon: "👨‍👩‍👧",
    theme: builderThemes.family,
    words: [
      createWord("builder", "builder-mother", "Mother", "/ˈmʌð.ər/", "Mẹ", "👩", "My mother is kind.", "Mẹ của em rất tốt bụng."),
      createWord("builder", "builder-father", "Father", "/ˈfɑː.ðər/", "Bố", "👨", "My father is strong.", "Bố của em rất khỏe mạnh."),
      createWord("builder", "builder-brother", "Brother", "/ˈbrʌð.ər/", "Anh/em trai", "👦", "My brother plays games.", "Em trai em chơi trò chơi."),
      createWord("builder", "builder-sister", "Sister", "/ˈsɪs.tər/", "Chị/em gái", "👧", "My sister is cute.", "Em gái em rất đáng yêu."),
      createWord("builder", "builder-grandmother", "Grandmother", "/ˈɡræn.mʌð.ər/", "Bà", "👵", "My grandmother tells stories.", "Bà em kể chuyện."),
      createWord("builder", "builder-grandfather", "Grandfather", "/ˈɡræn.fɑː.ðər/", "Ông", "👴", "My grandfather is wise.", "Ông của em rất hiền từ."),
      createWord("builder", "builder-baby", "Baby", "/ˈbeɪ.bi/", "Em bé", "👶", "The baby is sleeping.", "Em bé đang ngủ."),
      createWord("builder", "builder-uncle", "Uncle", "/ˈʌŋ.kəl/", "Bác/Chú/Cậu", "🧔", "My uncle is funny.", "Chú em rất hài hước."),
      createWord("builder", "builder-aunt", "Aunt", "/ɑːnt/", "Cô/Dì/Mợ", "👩", "My aunt cooks well.", "Dì em nấu ăn ngon."),
      createWord("builder", "builder-house", "House", "/haʊs/", "Ngôi nhà", "🏠", "Our house is warm.", "Ngôi nhà của chúng em rất ấm áp."),
      createWord("builder", "builder-living-room", "Living room", "/ˈlɪv.ɪŋ ˌruːm/", "Phòng khách", "🛋️", "We watch TV in the living room.", "Chúng em xem tivi ở phòng khách.", {
        speechText: "Living room.",
      }),
      createWord("builder", "builder-bedroom", "Bedroom", "/ˈbed.ruːm/", "Phòng ngủ", "🛏️", "I sleep in my bedroom.", "Em ngủ trong phòng ngủ."),
      createWord("builder", "builder-kitchen", "Kitchen", "/ˈkɪtʃ.ən/", "Phòng bếp", "🍳", "Mother is in the kitchen.", "Mẹ đang ở trong bếp."),
      createWord("builder", "builder-bathroom", "Bathroom", "/ˈbɑːθ.ruːm/", "Phòng tắm", "🚿", "The bathroom is clean.", "Phòng tắm rất sạch sẽ."),
      createWord("builder", "builder-garden", "Garden", "/ˈɡɑː.dən/", "Khu vườn", "🏡", "Flowers grow in the garden.", "Hoa nở trong vườn."),
    ],
  },
  {
    id: "classroom-school",
    level: "builder",
    title: "Classroom & School",
    subtitle: "Đồ vật và không gian học tập",
    icon: "🏫",
    theme: builderThemes.classroom,
    words: [
      createWord("builder", "builder-school", "School", "/skuːl/", "Trường học", "🏫", "I go to school.", "Em đi học."),
      createWord("builder", "builder-classroom", "Classroom", "/ˈklɑːs.ruːm/", "Lớp học", "🎒", "Our classroom is big.", "Lớp học của chúng em rất to."),
      createWord("builder", "builder-teacher", "Teacher", "/ˈtiː.tʃər/", "Giáo viên", "👩‍🏫", "My teacher is nice.", "Cô giáo của em rất tốt."),
      createWord("builder", "builder-student", "Student", "/ˈstjuː.dənt/", "Học sinh", "🧑‍🎓", "I am a student.", "Em là một học sinh."),
      createWord("builder", "builder-book", "Book", "/bʊk/", "Quyển sách", "📘", "Read a good book.", "Hãy đọc một quyển sách hay."),
      createWord("builder", "builder-pen", "Pen", "/pen/", "Cây bút mực", "🖊️", "The pen is blue.", "Cây bút mực màu xanh."),
      createWord("builder", "builder-pencil", "Pencil", "/ˈpen.səl/", "Bút chì", "✏️", "I write with a pencil.", "Em viết bằng bút chì."),
      createWord("builder", "builder-ruler", "Ruler", "/ˈruː.lər/", "Thước kẻ", "📏", "The ruler is long.", "Thước kẻ rất dài."),
      createWord("builder", "builder-eraser", "Eraser", "/ɪˈreɪ.zər/", "Cục tẩy", "🧼", "I use an eraser.", "Em dùng cục tẩy."),
      createWord("builder", "builder-desk", "Desk", "/desk/", "Bàn học", "🪑", "Keep your desk tidy.", "Hãy giữ bàn học ngăn nắp."),
      createWord("builder", "builder-board", "Board", "/bɔːd/", "Bảng viết", "📋", "Look at the board.", "Hãy nhìn lên bảng."),
      createWord("builder", "builder-notebook", "Notebook", "/ˈnəʊt.bʊk/", "Vở ghi bài", "📓", "Write in your notebook.", "Hãy viết vào vở."),
      createWord("builder", "builder-scissors", "Scissors", "/ˈsɪz.əz/", "Cái kéo", "✂️", "Use scissors carefully.", "Hãy dùng kéo cẩn thận."),
      createWord("builder", "builder-crayons", "Crayons", "/ˈkreɪ.ɒnz/", "Bút màu", "🖍️", "I draw with crayons.", "Em vẽ bằng bút màu."),
      createWord("builder", "builder-backpack", "Backpack", "/ˈbæk.pæk/", "Cặp sách", "🎒", "My backpack is heavy.", "Cặp sách của em nặng."),
    ],
  },
  {
    id: "my-body",
    level: "builder",
    title: "My Body & Face",
    subtitle: "Các bộ phận cơ thể quen thuộc",
    icon: "🙌",
    theme: builderThemes.body,
    words: [
      createWord("builder", "builder-head", "Head", "/hed/", "Đầu", "👤", "Nod your head.", "Hãy gật đầu của em nào."),
      createWord("builder", "builder-face", "Face", "/feɪs/", "Khuôn mặt", "🙂", "Wash your face.", "Hãy rửa mặt của em đi."),
      createWord("builder", "builder-eye", "Eye", "/aɪ/", "Mắt", "👁️", "I see with my eyes.", "Em nhìn bằng đôi mắt."),
      createWord("builder", "builder-ear", "Ear", "/ɪər/", "Tai", "👂", "I hear with my ears.", "Em nghe bằng đôi tai."),
      createWord("builder", "builder-nose", "Nose", "/nəʊz/", "Mũi", "👃", "Smell flowers with your nose.", "Ngửi hoa bằng mũi của em."),
      createWord("builder", "builder-mouth", "Mouth", "/maʊθ/", "Miệng", "👄", "Smile with your mouth.", "Hãy cười bằng miệng của em."),
      createWord("builder", "builder-hand", "Hand", "/hænd/", "Bàn tay", "✋", "Clap your hands.", "Hãy vỗ tay của em nào."),
      createWord("builder", "builder-arm", "Arm", "/ɑːm/", "Cánh tay", "💪", "I swing my arms.", "Em vung tay của mình."),
      createWord("builder", "builder-leg", "Leg", "/leɡ/", "Chân", "🦵", "Run fast with your legs.", "Chạy nhanh bằng đôi chân của em."),
      createWord("builder", "builder-foot", "Foot", "/fʊt/", "Bàn chân", "🦶", "Kick the ball with your foot.", "Đá bóng bằng bàn chân của em."),
      createWord("builder", "builder-hair", "Hair", "/heər/", "Tóc", "💇", "Her hair is brown.", "Tóc bạn ấy màu nâu."),
      createWord("builder", "builder-tooth", "Tooth", "/tuːθ/", "Răng", "🦷", "Brush your teeth.", "Hãy đánh răng của em."),
    ],
  },
  {
    id: "food-toys",
    level: "builder",
    title: "Food & Toys",
    subtitle: "Món ăn, thức uống và đồ chơi",
    icon: "🧸",
    theme: builderThemes.food,
    words: [
      createWord("builder", "builder-rice", "Rice", "/raɪs/", "Cơm", "🍚", "I eat rice for dinner.", "Em ăn cơm vào bữa tối."),
      createWord("builder", "builder-bread", "Bread", "/bred/", "Bánh mì", "🍞", "Bread is warm and soft.", "Bánh mì ấm và mềm."),
      createWord("builder", "builder-milk", "Milk", "/mɪlk/", "Sữa", "🥛", "Milk is good for you.", "Sữa rất tốt cho em."),
      createWord("builder", "builder-water", "Water", "/ˈwɔː.tər/", "Nước", "💧", "Drink plenty of water.", "Hãy uống nhiều nước nhé."),
      createWord("builder", "builder-chicken", "Chicken", "/ˈtʃɪk.ɪn/", "Thịt gà", "🍗", "Fried chicken is delicious.", "Thịt gà rán rất ngon."),
      createWord("builder", "builder-fish-food", "Fish", "/fɪʃ/", "Cá", "🐟", "We eat fish today.", "Hôm nay chúng em ăn cá."),
      createWord("builder", "builder-egg-food", "Egg", "/eɡ/", "Trứng", "🍳", "I like boiled eggs.", "Em thích trứng luộc."),
      createWord("builder", "builder-soup", "Soup", "/suːp/", "Súp/Canh", "🍲", "The soup is hot.", "Món súp/canh rất nóng."),
      createWord("builder", "builder-cake", "Cake", "/keɪk/", "Bánh ngọt", "🍰", "I want a chocolate cake.", "Em muốn một chiếc bánh ngọt socola."),
      createWord("builder", "builder-juice", "Juice", "/dʒuːs/", "Nước ép quả", "🧃", "Apple juice is sweet.", "Nước ép táo rất ngọt."),
      createWord("builder", "builder-toy", "Toy", "/tɔɪ/", "Đồ chơi", "🧸", "Share your toys.", "Hãy chia sẻ đồ chơi của em."),
      createWord("builder", "builder-doll", "Doll", "/dɒl/", "Búp bê", "🪆", "She plays with a doll.", "Bạn ấy chơi với búp bê."),
      createWord("builder", "builder-ball", "Ball", "/bɔːl/", "Quả bóng", "⚽", "Pass the ball to me.", "Hãy chuyền quả bóng cho em."),
      createWord("builder", "builder-robot", "Robot", "/ˈrəʊ.bɒt/", "Người máy", "🤖", "The robot can talk.", "Chú người máy có thể nói chuyện."),
      createWord("builder", "builder-car-toy", "Car", "/kɑːr/", "Ô tô đồ chơi", "🚗", "The toy car is fast.", "Chiếc ô tô đồ chơi chạy nhanh."),
    ],
  },
  {
    id: "daily-routine",
    level: "challenger",
    title: "Daily Routine",
    subtitle: "Những hoạt động hằng ngày",
    icon: "⏰",
    theme: challengerThemes.routine,
    words: [
      createWord("challenger", "challenger-wake-up", "Wake up", "/weɪk ʌp/", "Thức dậy", "🌅", "I wake up early.", "Em thức dậy sớm.", {
        speechText: "Wake up.",
      }),
      createWord("challenger", "challenger-wash-face", "Wash face", "/wɒʃ feɪs/", "Rửa mặt", "🧼", "I wash my face every morning.", "Em rửa mặt mỗi sáng.", {
        speechText: "Wash face.",
      }),
      createWord("challenger", "challenger-brush-teeth", "Brush teeth", "/brʌʃ tiːθ/", "Đánh răng", "🪥", "Brush your teeth twice a day.", "Hãy đánh răng hai lần một ngày.", {
        speechText: "Brush teeth.",
      }),
      createWord("challenger", "challenger-have-breakfast", "Have breakfast", "/hæv ˈbrek.fəst/", "Ăn sáng", "🍳", "I have breakfast at seven.", "Em ăn sáng lúc bảy giờ.", {
        speechText: "Have breakfast.",
      }),
      createWord("challenger", "challenger-go-to-school", "Go to school", "/ɡəʊ tuː skuːl/", "Đi học", "🏫", "We walk to school.", "Chúng em đi bộ đến trường.", {
        speechText: "Go to school.",
      }),
      createWord("challenger", "challenger-do-homework", "Do homework", "/duː ˈhəʊm.wɜːk/", "Làm bài tập", "✍️", "Finish your homework first.", "Hãy làm xong bài tập trước đã.", {
        speechText: "Do homework.",
      }),
      createWord("challenger", "challenger-play-sports", "Play sports", "/pleɪ spɔːts/", "Chơi thể thao", "⚽", "I play sports on Saturday.", "Em chơi thể thao vào thứ Bảy.", {
        speechText: "Play sports.",
      }),
      createWord("challenger", "challenger-take-a-shower", "Take a shower", "/teɪk ə ʃaʊ.ər/", "Tắm rửa", "🚿", "I take a shower after playing.", "Em đi tắm sau khi chơi.", {
        speechText: "Take a shower.",
      }),
      createWord("challenger", "challenger-go-to-bed", "Go to bed", "/ɡəʊ tuː bed/", "Đi ngủ", "🛌", "It is time to go to bed.", "Đã đến giờ đi ngủ rồi.", {
        speechText: "Go to bed.",
      }),
      createWord("challenger", "challenger-read-books", "Read books", "/riːd bʊks/", "Đọc sách", "📚", "Reading books helps you learn.", "Đọc sách giúp em học hỏi thêm.", {
        speechText: "Read books.",
      }),
      createWord("challenger", "challenger-clean-house", "Clean the house", "/kliːn ðə haʊs/", "Dọn dẹp nhà cửa", "🧹", "We clean the house together.", "Chúng em cùng nhau dọn dẹp nhà cửa.", {
        speechText: "Clean the house.",
      }),
      createWord("challenger", "challenger-watch-tv", "Watch TV", "/wɒtʃ ˌtiːˈviː/", "Xem tivi", "📺", "Don't watch TV too close.", "Đừng xem tivi quá gần nhé.", {
        speechText: "Watch TV.",
      }),
      createWord("challenger", "challenger-listen-music", "Listen to music", "/ˈlɪs.ən tuː ˈmjuː.zɪk/", "Nghe nhạc", "🎧", "I listen to music to relax.", "Em nghe nhạc để thư giãn.", {
        speechText: "Listen to music.",
      }),
      createWord("challenger", "challenger-cook-dinner", "Cook dinner", "/kʊk ˈdɪn.ər/", "Nấu bữa tối", "🧑‍🍳", "My mother cooks delicious dinner.", "Mẹ nấu bữa tối rất ngon.", {
        speechText: "Cook dinner.",
      }),
      createWord("challenger", "challenger-ride-bike", "Ride a bike", "/raɪd ə baɪk/", "Đi xe đạp", "🚲", "He rides a bike to the park.", "Bạn ấy đi xe đạp tới công viên.", {
        speechText: "Ride a bike.",
      }),
    ],
  },
  {
    id: "weather-seasons",
    level: "challenger",
    title: "Weather & Seasons",
    subtitle: "Mô tả thời tiết và mùa",
    icon: "🌦️",
    theme: challengerThemes.weather,
    words: [
      createWord("challenger", "challenger-spring", "Spring", "/sprɪŋ/", "Mùa xuân", "🌸", "Spring has many flowers.", "Mùa xuân có rất nhiều hoa."),
      createWord("challenger", "challenger-summer", "Summer", "/ˈsʌm.ər/", "Mùa hè", "🏖️", "We go swimming in summer.", "Chúng em đi bơi vào mùa hè."),
      createWord("challenger", "challenger-autumn", "Autumn", "/ˈɔː.təm/", "Mùa thu", "🍂", "Leaves fall in autumn.", "Lá rơi vào mùa thu."),
      createWord("challenger", "challenger-winter", "Winter", "/ˈwɪn.tər/", "Mùa đông", "❄️", "Winter is very cold.", "Mùa đông rất lạnh."),
      createWord("challenger", "challenger-sunny", "Sunny", "/ˈsʌn.i/", "Trời nắng", "☀️", "It is a sunny day.", "Hôm nay là một ngày nắng."),
      createWord("challenger", "challenger-rainy", "Rainy", "/ˈreɪ.ni/", "Trời mưa", "🌧️", "Bring an umbrella when it is rainy.", "Hãy mang ô khi trời mưa."),
      createWord("challenger", "challenger-windy", "Windy", "/ˈwɪn.di/", "Trời gió", "💨", "The windy weather is cool.", "Thời tiết lộng gió thật mát mẻ."),
      createWord("challenger", "challenger-cloudy", "Cloudy", "/ˈklaʊ.di/", "Nhiều mây", "☁️", "The sky is dark and cloudy.", "Bầu trời âm u và nhiều mây."),
      createWord("challenger", "challenger-snowy", "Snowy", "/ˈsnəʊ.i/", "Có tuyết", "☃️", "Children play in snowy weather.", "Trẻ em chơi đùa khi trời có tuyết."),
      createWord("challenger", "challenger-stormy", "Stormy", "/ˈstɔː.mi/", "Có bão", "⛈️", "Stay inside during stormy nights.", "Hãy ở trong nhà vào những đêm bão."),
      createWord("challenger", "challenger-rainbow", "Rainbow", "/ˈreɪn.bəʊ/", "Cầu vồng", "🌈", "A beautiful rainbow appeared.", "Một chiếc cầu vồng tuyệt đẹp xuất hiện."),
      createWord("challenger", "challenger-temperature", "Temperature", "/ˈtem.prə.tʃər/", "Nhiệt độ", "🌡️", "The temperature is rising.", "Nhiệt độ đang tăng lên."),
    ],
  },
  {
    id: "jobs-occupations",
    level: "challenger",
    title: "Jobs & Occupations",
    subtitle: "Những nghề nghiệp mơ ước",
    icon: "🧑‍🚀",
    theme: challengerThemes.jobs,
    words: [
      createWord("challenger", "challenger-doctor", "Doctor", "/ˈdɒk.tər/", "Bác sĩ", "🧑‍⚕️", "The doctor heals patients.", "Bác sĩ chữa trị cho bệnh nhân."),
      createWord("challenger", "challenger-nurse", "Nurse", "/nɜːs/", "Y tá", "🧑‍⚕️", "The nurse cares for children.", "Y tá chăm sóc trẻ em."),
      createWord("challenger", "challenger-teacher-job", "Teacher", "/ˈtiː.tʃər/", "Giáo viên", "🧑‍🏫", "The teacher guides the students.", "Giáo viên chỉ dạy cho học sinh."),
      createWord("challenger", "challenger-police-officer", "Police officer", "/pəˈliːs ˌɒf.ɪ.sər/", "Cảnh sát", "👮", "The police officer keeps us safe.", "Cảnh sát giữ an toàn cho chúng ta.", {
        speechText: "Police officer.",
      }),
      createWord("challenger", "challenger-firefighter", "Firefighter", "/ˈfaɪəˌfaɪ.tər/", "Lính cứu hỏa", "👨‍🚒", "Firefighters put out fires.", "Lính cứu hỏa dập tắt đám cháy."),
      createWord("challenger", "challenger-chef", "Chef", "/ʃef/", "Đầu bếp", "🧑‍🍳", "The chef creates new dishes.", "Đầu bếp sáng tạo các món ăn mới."),
      createWord("challenger", "challenger-pilot", "Pilot", "/ˈpaɪ.lət/", "Phi công", "🧑‍✈️", "The pilot flies airplanes.", "Phi công lái máy bay."),
      createWord("challenger", "challenger-singer", "Singer", "/ˈsɪŋ.ər/", "Ca sĩ", "🎤", "The singer has a sweet voice.", "Ca sĩ có giọng hát ngọt ngào."),
      createWord("challenger", "challenger-artist", "Artist", "/ˈɑː.tɪst/", "Họa sĩ", "🎨", "The artist paints a picture.", "Họa sĩ vẽ một bức tranh."),
      createWord("challenger", "challenger-farmer", "Farmer", "/ˈfɑː.mər/", "Nông dân", "🧑‍🌾", "The farmer grows crops.", "Nông dân trồng trọt cây cối."),
      createWord("challenger", "challenger-dentist", "Dentist", "/ˈden.tɪst/", "Nha sĩ", "🦷", "Visit the dentist regularly.", "Hãy đi khám nha sĩ thường xuyên."),
      createWord("challenger", "challenger-astronaut", "Astronaut", "/ˈæs.trə.nɔːt/", "Phi hành gia", "👨‍🚀", "The astronaut lands on the moon.", "Phi hành gia đổ bộ lên mặt trăng."),
      createWord("challenger", "challenger-writer", "Writer", "/ˈraɪ.tər/", "Nhà văn", "✍️", "The writer writes stories.", "Nhà văn viết những câu chuyện."),
      createWord("challenger", "challenger-actor", "Actor", "/ˈæk.tər/", "Diễn viên", "🎭", "The actor plays a hero.", "Diễn viên đóng vai người hùng."),
      createWord("challenger", "challenger-vet", "Vet", "/vet/", "Bác sĩ thú y", "🐶", "The vet treats sick animals.", "Bác sĩ thú y chữa cho động vật bị bệnh."),
    ],
  },
  {
    id: "hobbies-transport",
    level: "challenger",
    title: "Hobbies & Transport",
    subtitle: "Sở thích, thể thao và phương tiện",
    icon: "🎹",
    theme: challengerThemes.hobbies,
    words: [
      createWord("challenger", "challenger-soccer", "Soccer", "/ˈsɒk.ər/", "Bóng đá", "⚽", "Boys play soccer at school.", "Các bạn nam chơi bóng đá ở trường."),
      createWord("challenger", "challenger-swimming", "Swimming", "/ˈswɪm.ɪŋ/", "Bơi lội", "🏊", "Swimming keeps you fit.", "Bơi lội giúp em giữ dáng."),
      createWord("challenger", "challenger-running", "Running", "/ˈrʌn.ɪŋ/", "Chạy bộ", "🏃", "Running is fun and healthy.", "Chạy bộ rất vui và khỏe mạnh."),
      createWord("challenger", "challenger-drawing", "Drawing", "/ˈdrɔː.ɪŋ/", "Vẽ tranh", "🎨", "She loves drawing landscapes.", "Bạn ấy thích vẽ tranh phong cảnh."),
      createWord("challenger", "challenger-singing", "Singing", "/ˈsɪŋ.ɪŋ/", "Hát", "🎤", "Singing brings joy.", "Ca hát mang lại niềm vui."),
      createWord("challenger", "challenger-dancing", "Dancing", "/ˈdɑːn.sɪŋ/", "Nhảy múa", "💃", "They learn dancing on Sundays.", "Họ học nhảy múa vào các ngày Chủ nhật."),
      createWord("challenger", "challenger-cooking", "Cooking", "/ˈkʊk.ɪŋ/", "Nấu ăn", "🍳", "Cooking is a useful skill.", "Nấu ăn là một kỹ năng hữu ích."),
      createWord("challenger", "challenger-playing-piano", "Playing piano", "/ˈpleɪ.ɪŋ piˈæn.əʊ/", "Chơi đàn piano", "🎹", "She practices playing piano.", "Bạn ấy luyện tập chơi đàn piano.", {
        speechText: "Playing piano.",
      }),
      createWord("challenger", "challenger-photography", "Photography", "/fəˈtɒɡ.rə.fi/", "Chụp ảnh", "📷", "Photography is his passion.", "Chụp ảnh là niềm đam mê của anh ấy."),
      createWord("challenger", "challenger-bus", "Bus", "/bʌs/", "Xe buýt", "🚌", "I take the school bus.", "Em đi xe buýt của trường."),
      createWord("challenger", "challenger-train", "Train", "/treɪn/", "Tàu hỏa", "🚆", "The train runs on rails.", "Tàu hỏa chạy trên đường ray."),
      createWord("challenger", "challenger-plane", "Plane", "/pleɪn/", "Máy bay", "✈️", "The plane flies through clouds.", "Máy bay bay xuyên qua những đám mây."),
      createWord("challenger", "challenger-bicycle", "Bicycle", "/ˈbaɪ.sɪ.kəl/", "Xe đạp", "🚲", "Ride your bicycle safely.", "Hãy đạp xe đạp an toàn nhé."),
      createWord("challenger", "challenger-boat", "Boat", "/bəʊt/", "Thuyền", "⛵", "The boat sails on water.", "Chiếc thuyền trôi trên mặt nước."),
      createWord("challenger", "challenger-car", "Car", "/kɑːr/", "Xe ô tô", "🚗", "He drives a blue car.", "Chú ấy lái một chiếc xe ô tô màu xanh."),
    ],
  },
];

export const conversations: ConversationScenario[] = [
  {
    id: "builder-self-introduction",
    level: "builder",
    title: "Self Introduction",
    summary: "Giới thiệu tên và cảm xúc đơn giản",
    place: "Trong câu lạc bộ tiếng Anh",
    lines: [
      createLine("bee", "Hello! My name is Bee.", "Xin chào! Tên của mình là Bee.", "👋"),
      createLine("cat", "Hi Bee! My name is Cat.", "Chào Bee! Tên của mình là Cat.", "😺"),
      createLine("bee", "Nice to meet you, Cat.", "Rất vui được gặp bạn, Cat.", "💛"),
      createLine("cat", "Nice to meet you too!", "Mình cũng rất vui được gặp bạn!", "⭐"),
    ],
  },
  {
    id: "builder-good-morning",
    level: "builder",
    title: "Good Morning",
    summary: "Chào hỏi thân thiện buổi sáng",
    place: "Ở cổng trường",
    lines: [
      createLine("bee", "Good morning, Cat!", "Chào buổi sáng, Cat!", "☀️"),
      createLine("cat", "Good morning, Bee!", "Chào buổi sáng, Bee!", "😺"),
      createLine("bee", "How are you today?", "Hôm nay bạn thế nào?", "💛"),
      createLine("cat", "I am happy. Thank you!", "Mình vui lắm. Cảm ơn bạn!", "🌈"),
    ],
  },
  {
    id: "builder-asking-name",
    level: "builder",
    title: "Asking a Name",
    summary: "Hỏi tên và trả lời lịch sự",
    place: "Trong lớp học",
    lines: [
      createLine("cat", "What is your name?", "Tên của bạn là gì?", "❓"),
      createLine("bee", "My name is Bee.", "Tên của mình là Bee.", "🐝"),
      createLine("cat", "How old are you?", "Bạn bao nhiêu tuổi?", "🎈"),
      createLine("bee", "I am seven years old.", "Mình bảy tuổi.", "7️⃣"),
    ],
  },
  {
    id: "builder-at-school",
    level: "builder",
    title: "At School",
    summary: "Hỏi đồ dùng học tập",
    place: "Trong lớp học",
    lines: [
      createLine("cat", "Bee, is this your book?", "Bee ơi, đây có phải sách của bạn không?", "📘"),
      createLine("bee", "Yes, it is my book.", "Đúng rồi, đó là sách của mình.", "🐝"),
      createLine("cat", "Here you are.", "Mình gửi bạn đây.", "🤝"),
      createLine("bee", "Thank you very much!", "Cảm ơn bạn rất nhiều!", "⭐"),
    ],
  },
  {
    id: "challenger-weather-talk",
    level: "challenger",
    title: "Talking About Weather",
    summary: "Mô tả thời tiết và kế hoạch trong ngày",
    place: "Ngoài sân trường",
    lines: [
      createLine("bee", "It is sunny today. Shall we play outside?", "Hôm nay trời nắng. Chúng mình ra ngoài chơi nhé?", "☀️"),
      createLine("cat", "Great idea! I want to ride my bike in the park.", "Ý hay đấy! Mình muốn đi xe đạp trong công viên.", "🚲"),
      createLine("bee", "Let's bring water because the weather is hot.", "Hãy mang theo nước vì thời tiết khá nóng.", "💧"),
      createLine("cat", "Sure! We can rest under a tree after that.", "Chắc chắn rồi! Sau đó chúng mình có thể nghỉ dưới gốc cây.", "🌳"),
    ],
  },
  {
    id: "challenger-dream-jobs",
    level: "challenger",
    title: "Dream Jobs",
    summary: "Chia sẻ nghề nghiệp mơ ước và lý do",
    place: "Trong câu lạc bộ tiếng Anh",
    lines: [
      createLine("cat", "Bee, what do you want to be in the future?", "Bee ơi, sau này bạn muốn làm nghề gì?", "💭"),
      createLine("bee", "I want to be a doctor because I like helping people.", "Mình muốn làm bác sĩ vì mình thích giúp đỡ mọi người.", "🧑‍⚕️"),
      createLine("cat", "That sounds kind. I want to be an astronaut.", "Nghe thật tốt bụng. Còn mình muốn làm phi hành gia.", "👨‍🚀"),
      createLine("bee", "Wow! You can explore space and see the Earth.", "Tuyệt quá! Bạn có thể khám phá không gian và ngắm Trái Đất.", "🌍"),
    ],
  },
  {
    id: "challenger-hobbies",
    level: "challenger",
    title: "After-school Hobbies",
    summary: "Chia sẻ sở thích sau giờ học",
    place: "Ở sân chơi sau giờ tan học",
    lines: [
      createLine("bee", "What do you do after school, Cat?", "Sau giờ học bạn thường làm gì, Cat?", "🎒"),
      createLine("cat", "I like playing piano and drawing pictures.", "Mình thích chơi đàn piano và vẽ tranh.", "🎹"),
      createLine("bee", "That is great! I enjoy swimming and reading books.", "Tuyệt đấy! Mình thích bơi lội và đọc sách.", "🏊"),
      createLine("cat", "We have many fun hobbies to share.", "Chúng mình có rất nhiều sở thích thú vị để chia sẻ.", "🌟"),
    ],
  },
  {
    id: "challenger-self-introduction",
    level: "challenger",
    title: "Introducing Yourself",
    summary: "Giới thiệu bản thân với nhiều thông tin hơn",
    place: "Trong buổi giao lưu tiếng Anh",
    lines: [
      createLine("bee", "Hello everyone. My name is Bee and I am nine years old.", "Xin chào mọi người. Tên mình là Bee và mình chín tuổi.", "👋"),
      createLine("cat", "Nice to meet you, Bee. I am Cat. I like music and science.", "Rất vui được gặp bạn, Bee. Mình là Cat. Mình thích âm nhạc và khoa học.", "🎵"),
      createLine("bee", "My favorite subject is English because I love new words.", "Môn học yêu thích của mình là tiếng Anh vì mình thích từ mới.", "📚"),
      createLine("cat", "Let's learn and speak English together.", "Hãy cùng nhau học và nói tiếng Anh nhé.", "🤝"),
    ],
  },
];

export const allWords = topics.flatMap((topic) => topic.words);

export const getLevelConfig = (level: AgeLevel) => levels.find((item) => item.id === level) ?? levels[0];

export const getTopicsByLevel = (level: AgeLevel) => topics.filter((topic) => topic.level === level);

export const getWordsByLevel = (level: AgeLevel) => getTopicsByLevel(level).flatMap((topic) => topic.words);

export const getConversationsByLevel = (level: AgeLevel) =>
  conversations.filter((scenario) => scenario.level === level);
