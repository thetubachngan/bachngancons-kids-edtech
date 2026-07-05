export type TopicTheme = {
  surfaceClass: string;
  accentClass: string;
  badgeClass: string;
  buttonClass: string;
};

export type VocabularyWord = {
  id: string;
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
  title: string;
  summary: string;
  place: string;
  lines: ConversationLine[];
};

export const topics: Topic[] = [
  {
    id: "animals",
    title: "Animals",
    subtitle: "Con vật đáng yêu",
    icon: "🐻",
    theme: {
      surfaceClass: "bg-emerald-100",
      accentClass: "text-emerald-700",
      badgeClass: "bg-emerald-200 text-emerald-800",
      buttonClass: "bg-emerald-400 text-emerald-950 border-emerald-600",
    },
    words: [
      {
        id: "cat",
        word: "Cat",
        phonetic: "/kæt/",
        translation: "Con mèo",
        emoji: "🐱",
        example: "The cat is small.",
        exampleTranslation: "Con mèo nhỏ.",
      },
      {
        id: "dog",
        word: "Dog",
        phonetic: "/dɔːɡ/",
        translation: "Con chó",
        emoji: "🐶",
        example: "The dog can run.",
        exampleTranslation: "Con chó có thể chạy.",
      },
      {
        id: "bird",
        word: "Bird",
        phonetic: "/bɜːd/",
        translation: "Con chim",
        emoji: "🐦",
        example: "The bird can sing.",
        exampleTranslation: "Con chim có thể hót.",
      },
      {
        id: "fish",
        word: "Fish",
        phonetic: "/fɪʃ/",
        translation: "Con cá",
        emoji: "🐟",
        example: "I see a blue fish.",
        exampleTranslation: "Em thấy một con cá màu xanh.",
      },
    ],
  },
  {
    id: "family",
    title: "Family",
    subtitle: "Người thân quanh em",
    icon: "👨‍👩‍👧",
    theme: {
      surfaceClass: "bg-pink-100",
      accentClass: "text-pink-700",
      badgeClass: "bg-pink-200 text-pink-800",
      buttonClass: "bg-pink-400 text-pink-950 border-pink-600",
    },
    words: [
      {
        id: "mother",
        word: "Mother",
        phonetic: "/ˈmʌð.ər/",
        translation: "Mẹ",
        emoji: "👩",
        example: "My mother is kind.",
        exampleTranslation: "Mẹ của em rất tốt bụng.",
      },
      {
        id: "father",
        word: "Father",
        phonetic: "/ˈfɑː.ðər/",
        translation: "Bố",
        emoji: "👨",
        example: "My father is tall.",
        exampleTranslation: "Bố của em cao.",
      },
      {
        id: "sister",
        word: "Sister",
        phonetic: "/ˈsɪs.tər/",
        translation: "Chị / em gái",
        emoji: "👧",
        example: "My sister can draw.",
        exampleTranslation: "Chị/em gái của em biết vẽ.",
      },
      {
        id: "brother",
        word: "Brother",
        phonetic: "/ˈbrʌð.ər/",
        translation: "Anh / em trai",
        emoji: "👦",
        example: "My brother has a kite.",
        exampleTranslation: "Anh/em trai của em có một chiếc diều.",
      },
    ],
  },
  {
    id: "school",
    title: "School",
    subtitle: "Đồ vật ở trường",
    icon: "🏫",
    theme: {
      surfaceClass: "bg-sky-100",
      accentClass: "text-sky-700",
      badgeClass: "bg-sky-200 text-sky-800",
      buttonClass: "bg-sky-400 text-sky-950 border-sky-600",
    },
    words: [
      {
        id: "book",
        word: "Book",
        phonetic: "/bʊk/",
        translation: "Quyển sách",
        emoji: "📘",
        example: "This book is new.",
        exampleTranslation: "Quyển sách này mới.",
      },
      {
        id: "pen",
        word: "Pen",
        phonetic: "/pen/",
        translation: "Cây bút",
        emoji: "🖊️",
        example: "I have a red pen.",
        exampleTranslation: "Em có một cây bút màu đỏ.",
      },
      {
        id: "bag",
        word: "Bag",
        phonetic: "/bæɡ/",
        translation: "Cặp sách",
        emoji: "🎒",
        example: "My bag is big.",
        exampleTranslation: "Cặp của em rất to.",
      },
      {
        id: "desk",
        word: "Desk",
        phonetic: "/desk/",
        translation: "Bàn học",
        emoji: "🪑",
        example: "The desk is clean.",
        exampleTranslation: "Cái bàn sạch sẽ.",
      },
    ],
  },
  {
    id: "colors",
    title: "Colors",
    subtitle: "Màu sắc vui nhộn",
    icon: "🎨",
    theme: {
      surfaceClass: "bg-purple-100",
      accentClass: "text-purple-700",
      badgeClass: "bg-purple-200 text-purple-800",
      buttonClass: "bg-purple-400 text-purple-950 border-purple-600",
    },
    words: [
      {
        id: "red",
        word: "Red",
        phonetic: "/red/",
        translation: "Màu đỏ",
        emoji: "🔴",
        example: "The apple is red.",
        exampleTranslation: "Quả táo màu đỏ.",
      },
      {
        id: "blue",
        word: "Blue",
        phonetic: "/bluː/",
        translation: "Màu xanh dương",
        emoji: "🔵",
        example: "The sky is blue.",
        exampleTranslation: "Bầu trời màu xanh.",
      },
      {
        id: "yellow",
        word: "Yellow",
        phonetic: "/ˈjel.əʊ/",
        translation: "Màu vàng",
        emoji: "🟡",
        example: "The sun is yellow.",
        exampleTranslation: "Mặt trời màu vàng.",
      },
      {
        id: "green",
        word: "Green",
        phonetic: "/ɡriːn/",
        translation: "Màu xanh lá",
        emoji: "🟢",
        example: "The leaf is green.",
        exampleTranslation: "Chiếc lá màu xanh.",
      },
    ],
  },
];

export const conversations: ConversationScenario[] = [
  {
    id: "good-morning",
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
    id: "at-school",
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
    id: "asking-permission",
    title: "Asking for Permission",
    summary: "Xin phép lịch sự",
    place: "Trong sân chơi",
    lines: [
      {
        speaker: "bee",
        english: "May I use your pen?",
        vietnamese: "Mình có thể dùng bút của bạn không?",
        emoji: "🖊️",
      },
      {
        speaker: "cat",
        english: "Yes, you may.",
        vietnamese: "Được chứ, bạn dùng đi.",
        emoji: "👍",
      },
      {
        speaker: "bee",
        english: "Thank you, Cat!",
        vietnamese: "Cảm ơn bạn nhé, Cat!",
        emoji: "💫",
      },
      {
        speaker: "cat",
        english: "You are welcome!",
        vietnamese: "Không có gì đâu!",
        emoji: "🌟",
      },
    ],
  },
];

export const allWords = topics.flatMap((topic) => topic.words);
