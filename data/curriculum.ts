import { conversations, topics, type ConversationScenario, type VocabularyWord } from "@/data/englishData";
import type { Curriculum, Lesson, LessonChoice, LessonStep, Unit } from "@/data/learningSchema";

const chunkWords = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const sanitizeWord = (word: string) => word.replace(/\s+/g, "").toUpperCase();

const buildLetterBank = (answer: string) => {
  const baseLetters = sanitizeWord(answer).split("");
  const fillerPool = ["A", "E", "I", "O", "U", "R", "S", "T", "L", "N"];
  const fillerCount = Math.max(2, Math.min(4, 8 - baseLetters.length));
  const filler = fillerPool.slice(0, fillerCount);
  const combined = [...baseLetters, ...filler];
  const pivot = combined.length ? sanitizeWord(answer).length % combined.length : 0;

  return [...combined.slice(pivot), ...combined.slice(0, pivot)];
};

const buildChoices = (chunk: VocabularyWord[]): LessonChoice[] =>
  chunk.map((word) => ({
    id: word.id,
    label: word.translation,
    emoji: word.emoji,
    audioSrc: word.audioSrc,
    hint: word.word,
  }));

const buildExplorerWordLesson = (unitId: string, topicTitle: string, chunkIndex: number, chunk: VocabularyWord[]): Lesson => {
  const primary = chunk[0];
  const dragAnswer = sanitizeWord(primary.word);

  const steps: LessonStep[] = [
    {
      id: `${primary.id}-tap`,
      type: "tap-match",
      prompt: "Nghe từ và chạm vào hình đúng nhé!",
      skill: "listening",
      visual: {
        title: primary.word,
        subtitle: primary.translation,
        emoji: primary.emoji,
        audioSrc: primary.audioSrc,
      },
      questionAudioText: primary.speechText ?? primary.word,
      questionAudioSrc: primary.audioSrc,
      choices: buildChoices(chunk),
      answerId: primary.id,
    },
    {
      id: `${primary.id}-mcq`,
      type: "mcq",
      prompt: "Chọn nghĩa tiếng Việt đúng nào!",
      skill: "reading",
      visual: {
        title: primary.word,
        subtitle: primary.phonetic,
        emoji: primary.emoji,
      },
      questionAudioText: primary.speechText ?? primary.word,
      questionAudioSrc: primary.audioSrc,
      choices: buildChoices(chunk),
      answerId: primary.id,
    },
    {
      id: `${primary.id}-drag`,
      type: "drag-drop",
      prompt: "Kéo thả chữ cái để ghép từ hoàn chỉnh nhé!",
      skill: "writing",
      visual: {
        title: primary.word,
        subtitle: primary.example,
        emoji: primary.emoji,
      },
      targetWord: primary.word,
      answer: dragAnswer,
      letterBank: buildLetterBank(primary.word),
    },
  ];

  return {
    id: `${unitId}-${chunkIndex + 1}`,
    unitId,
    title: `${topicTitle} ${chunkIndex + 1}`,
    subtitle: "Nghe - Nhìn - Chạm",
    description: `Làm quen nhóm từ ${topicTitle.toLowerCase()} theo cách trực quan và vui nhộn.`,
    level: 1,
    skill: "listening",
    rewardStars: 3,
    targetWordIds: chunk.map((word) => word.id),
    steps,
  };
};

const buildBuilderWordLesson = (unitId: string, topicTitle: string, chunkIndex: number, chunk: VocabularyWord[]): Lesson => {
  const primary = chunk[0];

  const steps: LessonStep[] = [
    {
      id: `${primary.id}-meaning`,
      type: "mcq",
      prompt: "Nghe từ rồi chọn nghĩa phù hợp nhất.",
      skill: "listening",
      visual: {
        title: primary.word,
        subtitle: primary.phonetic,
        emoji: primary.emoji,
      },
      questionAudioText: primary.speechText ?? primary.word,
      questionAudioSrc: primary.audioSrc,
      choices: buildChoices(chunk),
      answerId: primary.id,
    },
    {
      id: `${primary.id}-example`,
      type: "tap-match",
      prompt: "Câu ví dụ này nói về từ nào?",
      skill: "reading",
      visual: {
        title: primary.example,
        subtitle: primary.exampleTranslation,
        emoji: primary.emoji,
      },
      questionAudioText: primary.exampleSpeechText ?? primary.example,
      questionAudioSrc: primary.exampleAudioSrc,
      choices: chunk.map((word) => ({
        id: word.id,
        label: word.word,
        emoji: word.emoji,
      })),
      answerId: primary.id,
    },
    {
      id: `${primary.id}-voice`,
      type: "voice",
      prompt: "Nhấn micro và nói lại theo Bee nhé!",
      skill: "speaking",
      visual: {
        title: primary.word,
        subtitle: primary.translation,
        emoji: primary.emoji,
        audioSrc: primary.audioSrc,
      },
      expectedText: primary.word,
      expectedAudioText: primary.speechText ?? primary.word,
      expectedAudioSrc: primary.audioSrc,
      helperText: "Con chỉ cần nói gần giống từ tiếng Anh là được. Nếu thiết bị không hỗ trợ, có thể dùng chế độ giả lập.",
    },
  ];

  return {
    id: `${unitId}-${chunkIndex + 1}`,
    unitId,
    title: `${topicTitle} ${chunkIndex + 1}`,
    subtitle: "Nghe - Hiểu - Nói",
    description: `Luyện phản xạ với chủ đề ${topicTitle.toLowerCase()} qua từ, nghĩa và câu ví dụ.`,
    level: 2,
    skill: "speaking",
    rewardStars: 3,
    targetWordIds: chunk.map((word) => word.id),
    steps,
  };
};

const buildChallengerWordLesson = (unitId: string, topicTitle: string, chunkIndex: number, chunk: VocabularyWord[]): Lesson => {
  const primary = chunk[0];
  const dragAnswer = sanitizeWord(primary.word);

  const steps: LessonStep[] = [
    {
      id: `${primary.id}-tap`,
      type: "tap-match",
      prompt: "Nghe kỹ rồi chọn đúng từ tiếng Anh tương ứng.",
      skill: "listening",
      visual: {
        title: primary.translation,
        subtitle: primary.exampleTranslation,
        emoji: primary.emoji,
      },
      questionAudioText: primary.speechText ?? primary.word,
      questionAudioSrc: primary.audioSrc,
      choices: chunk.map((word) => ({
        id: word.id,
        label: word.word,
        emoji: word.emoji,
      })),
      answerId: primary.id,
    },
    {
      id: `${primary.id}-drag`,
      type: "drag-drop",
      prompt: "Ghép đúng chính tả của từ nhé!",
      skill: "writing",
      visual: {
        title: primary.word,
        subtitle: primary.translation,
        emoji: primary.emoji,
      },
      targetWord: primary.word,
      answer: dragAnswer,
      letterBank: buildLetterBank(primary.word),
    },
    {
      id: `${primary.id}-voice`,
      type: "voice",
      prompt: "Bây giờ hãy đọc to cả cụm/từ này thật rõ ràng.",
      skill: "speaking",
      visual: {
        title: primary.word,
        subtitle: primary.example,
        emoji: primary.emoji,
        audioSrc: primary.audioSrc,
      },
      expectedText: primary.word,
      expectedAudioText: primary.speechText ?? primary.word,
      expectedAudioSrc: primary.audioSrc,
      helperText: "Con hãy nói chậm và rõ từng âm. Mascot sẽ cổ vũ ngay khi con hoàn thành.",
    },
  ];

  return {
    id: `${unitId}-${chunkIndex + 1}`,
    unitId,
    title: `${topicTitle} ${chunkIndex + 1}`,
    subtitle: "Nghe - Ghép - Nói",
    description: `Thử thách chính tả và phản xạ nói với chủ đề ${topicTitle.toLowerCase()}.`,
    level: 3,
    skill: "writing",
    rewardStars: 3,
    targetWordIds: chunk.map((word) => word.id),
    steps,
  };
};

const buildConversationLesson = (unitId: string, scenario: ConversationScenario, level: number): Lesson => {
  const firstLine = scenario.lines[0];
  const secondLine = scenario.lines[1] ?? scenario.lines[0];

  const steps: LessonStep[] = [
    {
      id: `${scenario.id}-listen`,
      type: "tap-match",
      prompt: "Nghe câu đầu và chọn đúng người đang nói nhé!",
      skill: "listening",
      visual: {
        title: firstLine.english,
        subtitle: firstLine.vietnamese,
        emoji: firstLine.emoji,
        audioSrc: firstLine.audioSrc,
      },
      questionAudioText: firstLine.english,
      questionAudioSrc: firstLine.audioSrc,
      choices: [
        { id: "bee", label: "Bee", emoji: "🐝" },
        { id: "cat", label: "Cat", emoji: "🐱" },
      ],
      answerId: firstLine.speaker,
    },
    {
      id: `${scenario.id}-reply`,
      type: "mcq",
      prompt: "Chọn câu trả lời tiếp theo phù hợp nhé!",
      skill: "reading",
      visual: {
        title: secondLine.english,
        subtitle: secondLine.vietnamese,
        emoji: secondLine.emoji,
        audioSrc: secondLine.audioSrc,
      },
      questionAudioText: secondLine.english,
      questionAudioSrc: secondLine.audioSrc,
      choices: scenario.lines.slice(0, Math.min(4, scenario.lines.length)).map((line, index) => ({
        id: `${scenario.id}-line-${index}`,
        label: line.english,
        emoji: line.emoji,
      })),
      answerId: `${scenario.id}-line-1`,
    },
    {
      id: `${scenario.id}-voice`,
      type: "voice",
      prompt: "Nhấn micro và nói lại câu ngắn này thật tự tin nhé!",
      skill: "speaking",
      visual: {
        title: firstLine.english,
        subtitle: firstLine.vietnamese,
        emoji: firstLine.emoji,
        audioSrc: firstLine.audioSrc,
      },
      expectedText: firstLine.english,
      expectedAudioText: firstLine.english,
      expectedAudioSrc: firstLine.audioSrc,
      helperText: "Con có thể nghe lại rồi nói theo Bee hoặc Cat.",
    },
  ];

  return {
    id: `${unitId}-${scenario.id}`,
    unitId,
    title: scenario.title,
    subtitle: scenario.place,
    description: scenario.summary,
    level,
    skill: "speaking",
    rewardStars: 4,
    targetWordIds: [],
    steps,
  };
};

const buildUnit = (unit: Omit<Unit, "lessons"> & { lessons: Lesson[] }): Unit => unit;

const explorerTopics = topics.filter((topic) => topic.level === "explorer");
const builderTopics = topics.filter((topic) => topic.level === "builder");
const challengerTopics = topics.filter((topic) => topic.level === "challenger");

const explorerLessons = explorerTopics.flatMap((topic) =>
  chunkWords(topic.words, 4).map((chunk, index) => buildExplorerWordLesson(`unit-explorer-${topic.id}`, topic.title, index, chunk)),
);

const builderLessons = builderTopics.flatMap((topic) =>
  chunkWords(topic.words, 4).map((chunk, index) => buildBuilderWordLesson(`unit-builder-${topic.id}`, topic.title, index, chunk)),
);

const challengerLessons = challengerTopics.flatMap((topic) =>
  chunkWords(topic.words, 4).map((chunk, index) => buildChallengerWordLesson(`unit-challenger-${topic.id}`, topic.title, index, chunk)),
);

const builderConversationLessons = conversations
  .filter((scenario) => scenario.level === "builder")
  .map((scenario) => buildConversationLesson("unit-builder-conversations", scenario, 2));

const challengerConversationLessons = conversations
  .filter((scenario) => scenario.level === "challenger")
  .map((scenario) => buildConversationLesson("unit-challenger-conversations", scenario, 3));

export const curriculum: Curriculum = {
  units: [
    buildUnit({
      id: "unit-explorer",
      level: 1,
      title: "Explorer Path",
      description: "Nghe - nhìn - chạm vào thế giới tiếng Anh đầu tiên.",
      mascotMood: "happy",
      lessons: explorerLessons,
    }),
    buildUnit({
      id: "unit-builder",
      level: 2,
      title: "Builder Trail",
      description: "Luyện từ vựng, hội thoại và phản xạ cơ bản mỗi ngày.",
      mascotMood: "encouraging",
      lessons: [...builderLessons, ...builderConversationLessons],
    }),
    buildUnit({
      id: "unit-challenger",
      level: 3,
      title: "Challenger Run",
      description: "Ghép chữ, nói to và chinh phục các thử thách nâng cao.",
      mascotMood: "celebrating",
      lessons: [...challengerLessons, ...challengerConversationLessons],
    }),
  ],
};

export const orderedLessons = curriculum.units.flatMap((unit) => unit.lessons);

export const lessonLookup = new Map(orderedLessons.map((lesson) => [lesson.id, lesson]));

export const getLessonById = (lessonId: string) => lessonLookup.get(lessonId) ?? null;

export const getNextLessonId = (lessonId: string) => {
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex < 0 || currentIndex === orderedLessons.length - 1) {
    return null;
  }

  return orderedLessons[currentIndex + 1]?.id ?? null;
};
