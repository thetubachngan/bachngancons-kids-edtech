export type SpeechMatchStatus = "correct" | "almost-correct" | "wrong";

export type WordMatchStatus = "perfect" | "close" | "missing";

export type WordDetail = {
  word: string;
  status: WordMatchStatus;
  score: number;
};

export type SpeechMatchResult = {
  status: SpeechMatchStatus;
  score: number;
  stars: 1 | 2 | 3;
  expected: string;
  actual: string;
  feedbackText: string;
  wordDetails: WordDetail[];
};

export type SpeechDifficulty = 1 | 2 | 3;

const NUMBER_MAP: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
};

const PHONETIC_EQUIVALENTS: Record<string, string[]> = {
  cat: ["kat", "cut", "katt", "cap", "can", "cot", "ket", "cæt"],
  dog: ["dok", "dock", "duck", "dark", "daug", "doggy", "doggie", "dôg"],
  apple: ["aple", "able", "apo", "epple", "appol", "ap-pou", "ep-pole"],
  red: ["rad", "rat", "read", "led", "rhed", "ret"],
  blue: ["blu", "bloo", "blow", "blew"],
  green: ["grin", "grene", "grean"],
  yellow: ["yelo", "yello", "yellowish"],
  pink: ["pin", "ping", "pinc"],
  three: ["tree", "free", "tri", "thri", "trii"],
  four: ["for", "fore", "foor"],
  five: ["fiv", "faiv", "fife"],
  six: ["siks", "sic", "sics"],
  seven: ["sevin", "sevan"],
  eight: ["ate", "ait", "eyt"],
  nine: ["nain", "nine"],
  ten: ["tin", "tan"],
  one: ["won", "wan"],
  two: ["to", "too"],
  ball: ["bol", "bawl", "bo", "bal"],
  fish: ["feesh", "fishy", "fich", "pish"],
  duck: ["dak", "duk", "doc", "ducc"],
  car: ["kar", "ca", "carr"],
  bus: ["bas", "buss", "bos"],
  hat: ["het", "hut", "hatt"],
  star: ["sta", "staar", "starr"],
  sun: ["son", "san", "sunn"],
  milk: ["miu", "mik", "milck"],
  egg: ["eg", "ag", "egg"],
  book: ["buc", "buk", "booc"],
  pen: ["pan", "pin", "penn"],
  boy: ["boi"],
  girl: ["gurl", "gerl", "gal"],
  bird: ["berd", "burd"],
  tree: ["tri", "tre"],
  house: ["haus", "hause"],
  monkey: ["munkey", "monki"],
  lion: ["liun", "liom"],
  bear: ["bare", "bair"],
  banana: ["bu-na-na", "banan", "bana", "bunana"],
  elephant: ["elifant", "aliphant", "elefant"],
  frog: ["frok", "froc", "frawg"],
  rabbit: ["rabit", "rabite", "rabit"],
  tiger: ["taiger", "tiga", "tige"],
  zebra: ["zibra", "sebra"],
  water: ["wata", "wate", "woter"],
  orange: ["orenge", "orinj"],
  purple: ["perpul", "perple"],
  white: ["wait", "wite"],
  black: ["blek", "blak"],
};

export const normalizeSpeechText = (text: string) => {
  const cleaned = text
    .replace(/[^a-z0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return cleaned
    .split(" ")
    .map((word) => NUMBER_MAP[word] ?? word)
    .join(" ");
};

const tokenize = (text: string) => normalizeSpeechText(text).split(" ").filter(Boolean);

const levenshteinDistance = (left: string, right: string) => {
  const a = left.toLowerCase();
  const b = right.toLowerCase();

  if (a === b) {
    return 0;
  }

  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0]![j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j] + 1,
        matrix[i]![j - 1] + 1,
        matrix[i - 1]![j - 1] + cost,
      );
    }
  }

  return matrix[a.length]![b.length]!;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isPhoneticallyEquivalent = (left: string, right: string) => {
  if (left === right) return true;
  const leftVariants = PHONETIC_EQUIVALENTS[left];
  if (leftVariants?.includes(right)) return true;
  const rightVariants = PHONETIC_EQUIVALENTS[right];
  if (rightVariants?.includes(left)) return true;
  return false;
};

const getThresholds = (difficulty: SpeechDifficulty, tokenCount: number) => {
  const base =
    difficulty === 1
      ? { correct: 0.55, almost: 0.40 }
      : difficulty === 2
        ? { correct: 0.65, almost: 0.48 }
        : { correct: 0.75, almost: 0.58 };

  const tokenAdjustment = tokenCount <= 1 ? 0.0 : tokenCount >= 4 ? -0.04 : 0;

  return {
    correct: clamp(base.correct + tokenAdjustment, 0.5, 0.88),
    almost: clamp(base.almost + tokenAdjustment, 0.38, 0.75),
  };
};

export const evaluateWordDetails = (
  expectedText: string,
  actualText: string,
  difficulty: SpeechDifficulty = 2,
): WordDetail[] => {
  const expectedTokens = tokenize(expectedText);
  const actualTokens = tokenize(actualText);

  if (!expectedTokens.length) {
    return [];
  }

  return expectedTokens.map((expectedWord, index) => {
    if (!actualTokens.length) {
      return { word: expectedWord, status: "missing", score: 0 };
    }

    if (actualTokens.includes(expectedWord)) {
      return { word: expectedWord, status: "perfect", score: 1 };
    }

    const phoneticMatch = actualTokens.some((act) => isPhoneticallyEquivalent(expectedWord, act));
    if (phoneticMatch) {
      return { word: expectedWord, status: "perfect", score: 0.92 };
    }

    const positionalSpoken = actualTokens[index] ?? actualTokens[0] ?? "";
    if (positionalSpoken && (expectedWord.startsWith(positionalSpoken) || positionalSpoken.startsWith(expectedWord))) {
      return { word: expectedWord, status: "close", score: 0.8 };
    }

    let maxSim = 0;
    for (const act of actualTokens) {
      const dist = levenshteinDistance(expectedWord, act);
      const sim = 1 - dist / Math.max(expectedWord.length, act.length, 1);
      if (sim > maxSim) maxSim = sim;
    }

    if (maxSim >= (difficulty === 1 ? 0.55 : 0.65)) {
      return { word: expectedWord, status: "close", score: maxSim };
    }

    return { word: expectedWord, status: "missing", score: maxSim };
  });
};

export const evaluateSpeechMatch = (
  expectedText: string,
  actualText: string,
  difficulty: SpeechDifficulty = 2,
): SpeechMatchResult => {
  const expected = normalizeSpeechText(expectedText);
  const actual = normalizeSpeechText(actualText);
  const wordDetails = evaluateWordDetails(expectedText, actualText, difficulty);

  if (!expected || !actual) {
    return {
      status: "wrong",
      score: 0,
      stars: 1,
      expected,
      actual,
      feedbackText: "Con hãy bấm nút micro và phát âm to rõ nhé! 🐝",
      wordDetails: tokenize(expectedText).map((w) => ({ word: w, status: "missing", score: 0 })),
    };
  }

  if (expected === actual) {
    return {
      status: "correct",
      score: 1,
      stars: 3,
      expected,
      actual,
      feedbackText: "Xuất sắc! Bé phát âm chuẩn 100%! 🌟🌟🌟",
      wordDetails: wordDetails.map((d) => ({ ...d, status: "perfect", score: 1 })),
    };
  }

  const expectedTokens = tokenize(expected);
  const actualTokens = tokenize(actual);

  // Single word inclusion check
  if (expectedTokens.length === 1 && expectedTokens[0] && actualTokens.includes(expectedTokens[0])) {
    return {
      status: "correct",
      score: 0.96,
      stars: 3,
      expected,
      actual,
      feedbackText: "Tuyệt vời! Bé đọc chính xác từ này rồi! ⭐⭐⭐",
      wordDetails,
    };
  }

  // Exact phrase inclusion
  if (actual.includes(expected) && expected.length > 2) {
    return {
      status: "correct",
      score: 0.95,
      stars: 3,
      expected,
      actual,
      feedbackText: "Giỏi quá! Bé đọc đầy đủ và chuẩn xác! ⭐⭐⭐",
      wordDetails,
    };
  }

  const charDist = levenshteinDistance(expected, actual);
  const maxLen = Math.max(expected.length, actual.length, 1);
  let charScore = 1 - charDist / maxLen;

  if (expectedTokens.length === 1 && expected.length <= 4 && charDist <= 1) {
    charScore = Math.max(charScore, 0.85);
  }

  let matched = 0;
  for (let index = 0; index < expectedTokens.length; index += 1) {
    const left = expectedTokens[index] ?? "";

    const exactIndex = actualTokens.indexOf(left);
    if (exactIndex !== -1) {
      matched += 1;
      continue;
    }

    const phoneticMatch = actualTokens.some((right) => isPhoneticallyEquivalent(left, right));
    if (phoneticMatch) {
      matched += 0.9;
      continue;
    }

    const positionalRight = actualTokens[index] ?? "";
    if (positionalRight && (left.startsWith(positionalRight) || positionalRight.startsWith(left))) {
      matched += 0.8;
      continue;
    }

    let bestTokenScore = 0;
    for (const right of actualTokens) {
      const dist = levenshteinDistance(left, right);
      const tokenMax = Math.max(left.length, right.length, 1);
      const tokenSimilarity = 1 - dist / tokenMax;
      if (tokenSimilarity > bestTokenScore) {
        bestTokenScore = tokenSimilarity;
      }
    }

    if (bestTokenScore >= 0.55) {
      matched += bestTokenScore * 0.85;
    }
  }

  const tokenScore = matched / (expectedTokens.length || 1);
  const combinedScore = clamp(charScore * 0.4 + tokenScore * 0.6, 0, 1);
  const { correct, almost } = getThresholds(difficulty, expectedTokens.length || 1);

  let status: SpeechMatchStatus = "wrong";
  let stars: 1 | 2 | 3 = 1;
  let feedbackText = "Bé nói chưa rõ lắm, thử nhấn nghe mẫu và đọc lại nhé! 🐝";

  if (combinedScore >= correct) {
    status = "correct";
    stars = combinedScore >= 0.85 ? 3 : 2;
    feedbackText = stars === 3 ? "Xuất sắc! Bé phát âm rất chuẩn! 🌟🌟🌟" : "Rất tốt! Bé phát âm gần như chuẩn tuyệt đối! ⭐⭐";
  } else if (combinedScore >= almost) {
    status = "almost-correct";
    stars = 2;
    feedbackText = "Bé nói gần đúng rồi! Nghe lại mẫu và thử phát âm rõ hơn nhé! ⭐⭐";
  }

  return {
    status,
    score: combinedScore,
    stars,
    expected,
    actual,
    feedbackText,
    wordDetails,
  };
};

export const evaluateMultiCandidateMatch = (
  expectedText: string,
  candidates: string[],
  difficulty: SpeechDifficulty = 2,
): SpeechMatchResult => {
  const validCandidates = candidates.filter((c) => c && typeof c === "string" && c.trim().length > 0);
  if (!validCandidates.length) {
    const expected = normalizeSpeechText(expectedText);
    return {
      status: "wrong",
      score: 0,
      stars: 1,
      expected,
      actual: "",
      feedbackText: "Bé chưa phát âm, hãy bấm nút micro để bắt đầu nhé! 🐝",
      wordDetails: tokenize(expectedText).map((w) => ({ word: w, status: "missing", score: 0 })),
    };
  }

  let bestResult: SpeechMatchResult = {
    status: "wrong",
    score: -1,
    stars: 1,
    expected: normalizeSpeechText(expectedText),
    actual: validCandidates[0] ?? "",
    feedbackText: "",
    wordDetails: [],
  };

  for (const candidate of validCandidates) {
    const result = evaluateSpeechMatch(expectedText, candidate, difficulty);
    if (result.status === "correct" && result.stars === 3) {
      return result;
    }
    if (result.score > bestResult.score) {
      bestResult = result;
    }
  }

  return bestResult;
};

