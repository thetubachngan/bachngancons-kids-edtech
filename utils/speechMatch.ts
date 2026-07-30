export type SpeechMatchStatus = "correct" | "almost-correct" | "wrong";

export type SpeechMatchResult = {
  status: SpeechMatchStatus;
  score: number;
  expected: string;
  actual: string;
};

export type SpeechDifficulty = 1 | 2 | 3;

export const normalizeSpeechText = (text: string) =>
  text.replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim().toLowerCase();

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

const getThresholds = (difficulty: SpeechDifficulty, tokenCount: number) => {
  const base =
    difficulty === 1
      ? { correct: 0.72, almost: 0.58 }
      : difficulty === 2
        ? { correct: 0.82, almost: 0.68 }
        : { correct: 0.9, almost: 0.76 };

  const tokenAdjustment = tokenCount <= 1 ? 0.05 : tokenCount >= 4 ? -0.03 : 0;

  return {
    correct: clamp(base.correct + tokenAdjustment, 0.62, 0.94),
    almost: clamp(base.almost + tokenAdjustment, 0.44, 0.88),
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
  const charScore = 1 - levenshteinDistance(expected, actual) / Math.max(expected.length, actual.length, 1);

  const maxTokens = Math.max(expectedTokens.length, actualTokens.length, 1);
  let matched = 0;

  for (let index = 0; index < maxTokens; index += 1) {
    const left = expectedTokens[index] ?? "";
    const right = actualTokens[index] ?? "";

    if (!left || !right) {
      continue;
    }

    if (left === right) {
      matched += 1;
      continue;
    }

    if (left.startsWith(right) || right.startsWith(left)) {
      matched += 0.78;
      continue;
    }

    const shortest = Math.min(left.length, right.length);
    const longest = Math.max(left.length, right.length);
    const ratio = shortest / longest;
    if (ratio >= 0.72) {
      matched += 0.55;
    }
  }

  const tokenScore = matched / maxTokens;
  const combinedScore = clamp(charScore * 0.65 + tokenScore * 0.35, 0, 1);
  const { correct, almost } = getThresholds(difficulty, expectedTokens.length || 1);

  if (combinedScore >= correct) {
    return { status: "correct", score: combinedScore, expected, actual };
  }

  if (combinedScore >= almost) {
    return { status: "almost-correct", score: combinedScore, expected, actual };
  }

  return { status: "wrong", score: combinedScore, expected, actual };
};
