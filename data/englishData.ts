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

export const topics: Topic[] = [
  {
    id: "alphabet-fun",
    level: "explorer",
    title: "Alphabet Fun",
    subtitle: "Nhìn chữ cái và từ quen thuộc",
    icon: "🔤",
    theme: explorerThemes.alphabet,
    words: [
      {
        id: "explorer-apple",
        level: "explorer",
        word: "Apple",
        phonetic: "/ˈæp.əl/",
        translation: "Quả táo",
        emoji: "🍎",
        example: "Apple is red.",
        exampleTranslation: "Quả táo màu đỏ.",
      },
      {
        id: "explorer-bee",
        level: "explorer",
        word: "Bee",
        phonetic: "/biː/",
        translation: "Con ong",
        emoji: "🐝",
        example: "The bee can fly.",
        exampleTranslation: "Con ong có thể bay.",
      },
      {
        id: "explorer-cat",
        level: "explorer",
        word: "Cat",
        phonetic: "/kæt/",
        translation: "Con mèo",
        emoji: "🐱",
        example: "The cat is cute.",
        exampleTranslation: "Con mèo rất dễ thương.",
      },
      {
        id: "explorer-dog",
        level: "explorer",
        word: "Dog",
        phonetic: "/dɔːɡ/",
        translation: "Con chó",
        emoji: "🐶",
        example: "The dog can run.",
        exampleTranslation: "Con chó có thể chạy.",
      },
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
      {
        id: "explorer-banana",
        level: "explorer",
        word: "Banana",
        phonetic: "/bəˈnɑː.nə/",
        translation: "Quả chuối",
        emoji: "🍌",
        example: "The banana is yellow.",
        exampleTranslation: "Quả chuối màu vàng.",
      },
      {
        id: "explorer-mango",
        level: "explorer",
        word: "Mango",
        phonetic: "/ˈmæŋ.ɡəʊ/",
        translation: "Quả xoài",
        emoji: "🥭",
        example: "I like mango.",
        exampleTranslation: "Em thích quả xoài.",
      },
      {
        id: "explorer-watermelon",
        level: "explorer",
        word: "Watermelon",
        phonetic: "/ˈwɔː.təˌmel.ən/",
        translation: "Quả dưa hấu",
        emoji: "🍉",
        example: "Watermelon is big.",
        exampleTranslation: "Quả dưa hấu rất to.",
      },
      {
        id: "explorer-strawberry",
        level: "explorer",
        word: "Strawberry",
        phonetic: "/ˈstrɔː.bər.i/",
        translation: "Quả dâu tây",
        emoji: "🍓",
        example: "The strawberry is sweet.",
        exampleTranslation: "Quả dâu tây ngọt.",
      },
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
      {
        id: "explorer-lion",
        level: "explorer",
        word: "Lion",
        phonetic: "/ˈlaɪ.ən/",
        translation: "Sư tử",
        emoji: "🦁",
        example: "The lion is strong.",
        exampleTranslation: "Sư tử rất khỏe.",
      },
      {
        id: "explorer-elephant",
        level: "explorer",
        word: "Elephant",
        phonetic: "/ˈel.ɪ.fənt/",
        translation: "Con voi",
        emoji: "🐘",
        example: "The elephant is big.",
        exampleTranslation: "Con voi rất to.",
      },
      {
        id: "explorer-monkey",
        level: "explorer",
        word: "Monkey",
        phonetic: "/ˈmʌŋ.ki/",
        translation: "Con khỉ",
        emoji: "🐵",
        example: "The monkey can jump.",
        exampleTranslation: "Con khỉ có thể nhảy.",
      },
      {
        id: "explorer-panda",
        level: "explorer",
        word: "Panda",
        phonetic: "/ˈpæn.də/",
        translation: "Gấu trúc",
        emoji: "🐼",
        example: "The panda is black and white.",
        exampleTranslation: "Gấu trúc màu đen và trắng.",
      },
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
      {
        id: "explorer-red",
        level: "explorer",
        word: "Red",
        phonetic: "/red/",
        translation: "Màu đỏ",
        emoji: "🔴",
        example: "The apple is red.",
        exampleTranslation: "Quả táo màu đỏ.",
      },
      {
        id: "explorer-blue",
        level: "explorer",
        word: "Blue",
        phonetic: "/bluː/",
        translation: "Màu xanh dương",
        emoji: "🔵",
        example: "The sky is blue.",
        exampleTranslation: "Bầu trời màu xanh.",
      },
      {
        id: "explorer-circle",
        level: "explorer",
        word: "Circle",
        phonetic: "/ˈsɜː.kəl/",
        translation: "Hình tròn",
        emoji: "⭕",
        example: "The circle is round.",
        exampleTranslation: "Hình tròn tròn đều.",
      },
      {
        id: "explorer-star",
        level: "explorer",
        word: "Star",
        phonetic: "/stɑːr/",
        translation: "Ngôi sao",
        emoji: "⭐",
        example: "The star is bright.",
        exampleTranslation: "Ngôi sao sáng lấp lánh.",
      },
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
      {
        id: "builder-mother",
        level: "builder",
        word: "Mother",
        phonetic: "/ˈmʌð.ər/",
        translation: "Mẹ",
        emoji: "👩",
        example: "My mother is kind.",
        exampleTranslation: "Mẹ của em rất tốt bụng.",
      },
      {
        id: "builder-father",
        level: "builder",
        word: "Father",
        phonetic: "/ˈfɑː.ðər/",
        translation: "Bố",
        emoji: "👨",
        example: "My father is tall.",
        exampleTranslation: "Bố của em cao.",
      },
      {
        id: "builder-bedroom",
        level: "builder",
        word: "Bedroom",
        phonetic: "/ˈbed.ruːm/",
        translation: "Phòng ngủ",
        emoji: "🛏️",
        example: "My bedroom is tidy.",
        exampleTranslation: "Phòng ngủ của em gọn gàng.",
      },
      {
        id: "builder-garden",
        level: "builder",
        word: "Garden",
        phonetic: "/ˈɡɑː.dən/",
        translation: "Khu vườn",
        emoji: "🌷",
        example: "The garden has flowers.",
        exampleTranslation: "Khu vườn có nhiều hoa.",
      },
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
      {
        id: "builder-book",
        level: "builder",
        word: "Book",
        phonetic: "/bʊk/",
        translation: "Quyển sách",
        emoji: "📘",
        example: "This book is new.",
        exampleTranslation: "Quyển sách này mới.",
      },
      {
        id: "builder-pencil",
        level: "builder",
        word: "Pencil",
        phonetic: "/ˈpen.səl/",
        translation: "Bút chì",
        emoji: "✏️",
        example: "I have a yellow pencil.",
        exampleTranslation: "Em có một cây bút chì màu vàng.",
      },
      {
        id: "builder-desk",
        level: "builder",
        word: "Desk",
        phonetic: "/desk/",
        translation: "Bàn học",
        emoji: "🪑",
        example: "The desk is clean.",
        exampleTranslation: "Bàn học sạch sẽ.",
      },
      {
        id: "builder-backpack",
        level: "builder",
        word: "Backpack",
        phonetic: "/ˈbæk.pæk/",
        translation: "Cặp sách",
        emoji: "🎒",
        example: "My backpack is blue.",
        exampleTranslation: "Cặp sách của em màu xanh.",
      },
    ],
  },
  {
    id: "my-body",
    level: "builder",
    title: "My Body",
    subtitle: "Các bộ phận cơ thể quen thuộc",
    icon: "🙌",
    theme: builderThemes.body,
    words: [
      {
        id: "builder-eye",
        level: "builder",
        word: "Eye",
        phonetic: "/aɪ/",
        translation: "Mắt",
        emoji: "👁️",
        example: "I have two eyes.",
        exampleTranslation: "Em có hai con mắt.",
      },
      {
        id: "builder-hand",
        level: "builder",
        word: "Hand",
        phonetic: "/hænd/",
        translation: "Bàn tay",
        emoji: "✋",
        example: "Wash your hands.",
        exampleTranslation: "Hãy rửa tay nhé.",
      },
      {
        id: "builder-leg",
        level: "builder",
        word: "Leg",
        phonetic: "/leɡ/",
        translation: "Chân",
        emoji: "🦵",
        example: "My legs can run.",
        exampleTranslation: "Đôi chân của em có thể chạy.",
      },
      {
        id: "builder-hair",
        level: "builder",
        word: "Hair",
        phonetic: "/heər/",
        translation: "Tóc",
        emoji: "💇",
        example: "Her hair is long.",
        exampleTranslation: "Tóc của bạn ấy dài.",
      },
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
      {
        id: "builder-milk",
        level: "builder",
        word: "Milk",
        phonetic: "/mɪlk/",
        translation: "Sữa",
        emoji: "🥛",
        example: "I drink milk every day.",
        exampleTranslation: "Em uống sữa mỗi ngày.",
      },
      {
        id: "builder-cake",
        level: "builder",
        word: "Cake",
        phonetic: "/keɪk/",
        translation: "Bánh ngọt",
        emoji: "🍰",
        example: "The cake is sweet.",
        exampleTranslation: "Bánh ngọt rất ngọt.",
      },
      {
        id: "builder-ball",
        level: "builder",
        word: "Ball",
        phonetic: "/bɔːl/",
        translation: "Quả bóng",
        emoji: "⚽",
        example: "The ball is round.",
        exampleTranslation: "Quả bóng tròn.",
      },
      {
        id: "builder-robot",
        level: "builder",
        word: "Robot",
        phonetic: "/ˈrəʊ.bɒt/",
        translation: "Người máy",
        emoji: "🤖",
        example: "My robot can dance.",
        exampleTranslation: "Người máy của em có thể nhảy.",
      },
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
      {
        id: "challenger-wake-up",
        level: "challenger",
        word: "Wake up",
        phonetic: "/weɪk ʌp/",
        translation: "Thức dậy",
        emoji: "🌅",
        example: "I wake up at six o'clock.",
        exampleTranslation: "Em thức dậy lúc sáu giờ.",
        speechText: "Wake up.",
      },
      {
        id: "challenger-homework",
        level: "challenger",
        word: "Do homework",
        phonetic: "/duː ˈhəʊm.wɜːk/",
        translation: "Làm bài tập",
        emoji: "✍️",
        example: "I do homework after school.",
        exampleTranslation: "Em làm bài tập sau giờ học.",
        speechText: "Do homework.",
      },
      {
        id: "challenger-read-books",
        level: "challenger",
        word: "Read books",
        phonetic: "/riːd bʊks/",
        translation: "Đọc sách",
        emoji: "📚",
        example: "I read books before bed.",
        exampleTranslation: "Em đọc sách trước khi đi ngủ.",
        speechText: "Read books.",
      },
      {
        id: "challenger-ride-bike",
        level: "challenger",
        word: "Ride a bike",
        phonetic: "/raɪd ə baɪk/",
        translation: "Đi xe đạp",
        emoji: "🚲",
        example: "I ride a bike in the park.",
        exampleTranslation: "Em đi xe đạp trong công viên.",
        speechText: "Ride a bike.",
      },
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
      {
        id: "challenger-sunny",
        level: "challenger",
        word: "Sunny",
        phonetic: "/ˈsʌn.i/",
        translation: "Trời nắng",
        emoji: "☀️",
        example: "It is sunny today.",
        exampleTranslation: "Hôm nay trời nắng.",
      },
      {
        id: "challenger-rainy",
        level: "challenger",
        word: "Rainy",
        phonetic: "/ˈreɪ.ni/",
        translation: "Trời mưa",
        emoji: "🌧️",
        example: "The weather is rainy.",
        exampleTranslation: "Thời tiết đang mưa.",
      },
      {
        id: "challenger-winter",
        level: "challenger",
        word: "Winter",
        phonetic: "/ˈwɪn.tər/",
        translation: "Mùa đông",
        emoji: "❄️",
        example: "Winter is cold.",
        exampleTranslation: "Mùa đông rất lạnh.",
      },
      {
        id: "challenger-rainbow",
        level: "challenger",
        word: "Rainbow",
        phonetic: "/ˈreɪn.bəʊ/",
        translation: "Cầu vồng",
        emoji: "🌈",
        example: "I can see a rainbow.",
        exampleTranslation: "Em có thể nhìn thấy cầu vồng.",
      },
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
      {
        id: "challenger-doctor",
        level: "challenger",
        word: "Doctor",
        phonetic: "/ˈdɒk.tər/",
        translation: "Bác sĩ",
        emoji: "🧑‍⚕️",
        example: "The doctor helps sick people.",
        exampleTranslation: "Bác sĩ giúp những người bị bệnh.",
      },
      {
        id: "challenger-teacher",
        level: "challenger",
        word: "Teacher",
        phonetic: "/ˈtiː.tʃər/",
        translation: "Giáo viên",
        emoji: "🧑‍🏫",
        example: "My teacher is friendly.",
        exampleTranslation: "Giáo viên của em rất thân thiện.",
      },
      {
        id: "challenger-astronaut",
        level: "challenger",
        word: "Astronaut",
        phonetic: "/ˈæs.trə.nɔːt/",
        translation: "Phi hành gia",
        emoji: "👨‍🚀",
        example: "The astronaut travels to space.",
        exampleTranslation: "Phi hành gia du hành vào không gian.",
      },
      {
        id: "challenger-chef",
        level: "challenger",
        word: "Chef",
        phonetic: "/ʃef/",
        translation: "Đầu bếp",
        emoji: "🧑‍🍳",
        example: "The chef cooks dinner.",
        exampleTranslation: "Đầu bếp nấu bữa tối.",
      },
    ],
  },
  {
    id: "hobbies-transport",
    level: "challenger",
    title: "Hobbies & Transport",
    subtitle: "Sở thích và phương tiện",
    icon: "🎹",
    theme: challengerThemes.hobbies,
    words: [
      {
        id: "challenger-swimming",
        level: "challenger",
        word: "Swimming",
        phonetic: "/ˈswɪm.ɪŋ/",
        translation: "Bơi lội",
        emoji: "🏊",
        example: "Swimming is good exercise.",
        exampleTranslation: "Bơi lội là một bài tập tốt.",
      },
      {
        id: "challenger-drawing",
        level: "challenger",
        word: "Drawing",
        phonetic: "/ˈdrɔː.ɪŋ/",
        translation: "Vẽ tranh",
        emoji: "🎨",
        example: "Drawing is my hobby.",
        exampleTranslation: "Vẽ tranh là sở thích của em.",
      },
      {
        id: "challenger-train",
        level: "challenger",
        word: "Train",
        phonetic: "/treɪn/",
        translation: "Tàu hỏa",
        emoji: "🚆",
        example: "The train is fast.",
        exampleTranslation: "Tàu hỏa rất nhanh.",
      },
      {
        id: "challenger-plane",
        level: "challenger",
        word: "Plane",
        phonetic: "/pleɪn/",
        translation: "Máy bay",
        emoji: "✈️",
        example: "The plane can fly high.",
        exampleTranslation: "Máy bay có thể bay cao.",
      },
    ],
  },
];

export const conversations: ConversationScenario[] = [
  {
    id: "builder-good-morning",
    level: "builder",
    title: "Good Morning",
    summary: "Chào hỏi thân thiện buổi sáng",
    place: "Ở cổng trường",
    lines: [
      {
        speaker: "bee",
        english: "Good morning, Cat!",
        vietnamese: "Chào buổi sáng, Cat!",
        emoji: "☀️",
      },
      {
        speaker: "cat",
        english: "Good morning, Bee!",
        vietnamese: "Chào buổi sáng, Bee!",
        emoji: "😺",
      },
      {
        speaker: "bee",
        english: "How are you today?",
        vietnamese: "Hôm nay bạn thế nào?",
        emoji: "💛",
      },
      {
        speaker: "cat",
        english: "I am happy. Thank you!",
        vietnamese: "Mình vui lắm. Cảm ơn bạn!",
        emoji: "🌈",
      },
    ],
  },
  {
    id: "builder-at-school",
    level: "builder",
    title: "At School",
    summary: "Hỏi đồ dùng học tập",
    place: "Trong lớp học",
    lines: [
      {
        speaker: "cat",
        english: "Bee, is this your book?",
        vietnamese: "Bee ơi, đây có phải sách của bạn không?",
        emoji: "📘",
      },
      {
        speaker: "bee",
        english: "Yes, it is my book.",
        vietnamese: "Đúng rồi, đó là sách của mình.",
        emoji: "🐝",
      },
      {
        speaker: "cat",
        english: "Here you are.",
        vietnamese: "Mình gửi bạn đây.",
        emoji: "🤝",
      },
      {
        speaker: "bee",
        english: "Thank you very much!",
        vietnamese: "Cảm ơn bạn rất nhiều!",
        emoji: "⭐",
      },
    ],
  },
  {
    id: "challenger-weather-talk",
    level: "challenger",
    title: "Talking About Weather",
    summary: "Mô tả thời tiết và kế hoạch trong ngày",
    place: "Ngoài sân trường",
    lines: [
      {
        speaker: "bee",
        english: "It is sunny today. Shall we play outside?",
        vietnamese: "Hôm nay trời nắng. Chúng mình ra ngoài chơi nhé?",
        emoji: "☀️",
      },
      {
        speaker: "cat",
        english: "Great idea! I want to ride my bike in the park.",
        vietnamese: "Ý hay đấy! Mình muốn đi xe đạp trong công viên.",
        emoji: "🚲",
      },
      {
        speaker: "bee",
        english: "Let's bring water because the weather is hot.",
        vietnamese: "Hãy mang theo nước vì thời tiết khá nóng.",
        emoji: "💧",
      },
      {
        speaker: "cat",
        english: "Sure! We can rest under a tree after that.",
        vietnamese: "Chắc chắn rồi! Sau đó chúng mình có thể nghỉ dưới gốc cây.",
        emoji: "🌳",
      },
    ],
  },
  {
    id: "challenger-dream-jobs",
    level: "challenger",
    title: "Dream Jobs",
    summary: "Chia sẻ nghề nghiệp mơ ước và lý do",
    place: "Trong câu lạc bộ tiếng Anh",
    lines: [
      {
        speaker: "cat",
        english: "Bee, what do you want to be in the future?",
        vietnamese: "Bee ơi, sau này bạn muốn làm nghề gì?",
        emoji: "💭",
      },
      {
        speaker: "bee",
        english: "I want to be a doctor because I like helping people.",
        vietnamese: "Mình muốn làm bác sĩ vì mình thích giúp đỡ mọi người.",
        emoji: "🧑‍⚕️",
      },
      {
        speaker: "cat",
        english: "That sounds kind. I want to be an astronaut.",
        vietnamese: "Nghe thật tốt bụng. Còn mình muốn làm phi hành gia.",
        emoji: "👨‍🚀",
      },
      {
        speaker: "bee",
        english: "Wow! You can explore space and see the Earth.",
        vietnamese: "Tuyệt quá! Bạn có thể khám phá không gian và ngắm Trái Đất.",
        emoji: "🌍",
      },
    ],
  },
];

export const allWords = topics.flatMap((topic) => topic.words);

export const getLevelConfig = (level: AgeLevel) => levels.find((item) => item.id === level) ?? levels[0];

export const getTopicsByLevel = (level: AgeLevel) => topics.filter((topic) => topic.level === level);

export const getWordsByLevel = (level: AgeLevel) => getTopicsByLevel(level).flatMap((topic) => topic.words);

export const getConversationsByLevel = (level: AgeLevel) =>
  conversations.filter((scenario) => scenario.level === level);
