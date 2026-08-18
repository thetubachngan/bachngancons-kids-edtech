export type SpeechMatchStatus = "correct" | "almost-correct" | "wrong";

export type SpeechMatchResult = {
  status: SpeechMatchStatus;
  score: number;
  expected: string;
  actual: string;
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
  cat: ["kat", "cut", "katt", "cap", "can", "cot", "ket"],
  dog: ["dok", "dock", "duck", "dark", "daug", "doggy", "doggie"],
  apple: ["aple", "able", "apo", "epple", "appol"],
  red: ["rad", "rat", "read", "led", "rhed"],
  blue: ["blu", "bloo", "blow", "blew"],
  green: ["grin", "grene", "grean"],
  yellow: ["yelo", "yello", "yellowish"],
  pink: ["pin", "ping", "pinc"],
  three: ["tree", "free", "tri", "thri"],
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
  fish: ["feesh", "fishy", "fich"],
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
      ? { correct: 0.58, almost: 0.42 }
      : difficulty === 2
        ? { correct: 0.68, almost: 0.52 }
        : { correct: 0.78, almost: 0.62 };

  const tokenAdjustment = tokenCount <= 1 ? 0.0 : tokenCount >= 4 ? -0.04 : 0;

  return {
    correct: clamp(base.correct + tokenAdjustment, 0.5, 0.88),
    almost: clamp(base.almost + tokenAdjustment, 0.38, 0.75),
  };
};

export const evaluateSpeechMatch = (
  expectedText: string,
  actualText: string,
  difficulty: SpeechDifficulty = 2,
): SpeechMatchResult => {
  const expected = normalizeSpeechText(expectedText);
  const actual = normalizeSpeechText(actualText);

  if (!expected || !actual) {
    return { status: "wrong", score: 0, expected, actual };
  }

  if (expected === actual) {
    return { status: "correct", score: 1, expected, actual };
  }

  const expectedTokens = tokenize(expected);
  const actualTokens = tokenize(actual);

  // Exact word contained inside spoken sentence (e.g. kid says "it is a cat" for "cat")
  if (expectedTokens.length === 1 && expectedTokens[0] && actualTokens.includes(expectedTokens[0])) {
    return { status: "correct", score: 0.96, expected, actual };
  }

  // Exact phrase inclusion
  if (actual.includes(expected) && expected.length > 2) {
    return { status: "correct", score: 0.95, expected, actual };
  }

  const charDist = levenshteinDistance(expected, actual);
  const maxLen = Math.max(expected.length, actual.length, 1);
  let charScore = 1 - charDist / maxLen;

  // Single short word forgiveness (e.g., len <= 4 with 1 char distance like "cat" vs "kat")
  if (expectedTokens.length === 1 && expected.length <= 4 && charDist <= 1) {
    charScore = Math.max(charScore, 0.85);
  }

  const maxTokens = Math.max(expectedTokens.length, actualTokens.length, 1);
  let matched = 0;

  for (let index = 0; index < expectedTokens.length; index += 1) {
    const left = expectedTokens[index] ?? "";

    // Check direct or phonetic match anywhere in actualTokens
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

    // Check positional ratio / prefix match
    const positionalRight = actualTokens[index] ?? "";
    if (positionalRight && (left.startsWith(positionalRight) || positionalRight.startsWith(left))) {
      matched += 0.8;
      continue;
    }

    // Levenshtein on token pair
    let bestTokenScore = 0;
    for (const right of actualTokens) {
      const dist = levenshteinDistance(left, right);
      const tokenMax = Math.max(left.length, right.length, 1);
      const tokenSimilarity = 1 - dist / tokenMax;
      if (tokenSimilarity > bestTokenScore) {
        bestTokenScore = tokenSimilarity;
      }
    }

    if (bestTokenScore >= 0.6) {
      matched += bestTokenScore * 0.85;
    }
  }

  const tokenScore = matched / expectedTokens.length;
  const combinedScore = clamp(charScore * 0.45 + tokenScore * 0.55, 0, 1);
  const { correct, almost } = getThresholds(difficulty, expectedTokens.length || 1);

  if (combinedScore >= correct) {
    return { status: "correct", score: combinedScore, expected, actual };
  }

  if (combinedScore >= almost) {
    return { status: "almost-correct", score: combinedScore, expected, actual };
  }

  return { status: "wrong", score: combinedScore, expected, actual };
};

export const evaluateMultiCandidateMatch = (
  expectedText: string,
  candidates: string[],
  difficulty: SpeechDifficulty = 2,
): SpeechMatchResult => {
  const validCandidates = candidates.filter((c) => c && typeof c === "string" && c.trim().length > 0);
  if (!validCandidates.length) {
    return { status: "wrong", score: 0, expected: normalizeSpeechText(expectedText), actual: "" };
  }

  let bestResult: SpeechMatchResult = { status: "wrong", score: -1, expected: normalizeSpeechText(expectedText), actual: validCandidates[0] ?? "" };

  for (const candidate of validCandidates) {
    const result = evaluateSpeechMatch(expectedText, candidate, difficulty);
    if (result.status === "correct") {
      return result; // Early exit on correct match
    }
    if (result.score > bestResult.score) {
      bestResult = result;
    }
  }

  return bestResult;
};
