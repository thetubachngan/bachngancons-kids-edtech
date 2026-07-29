import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as googleTTS from "google-tts-api";

import { conversations, topics } from "@/data/englishData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "public", "audio", "generated");
const manifestPath = path.join(projectRoot, "data", "audioManifest.ts");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const normalizeKey = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();

const safeFile = (value: string) => slugify(value || "item") || "item";

const writeAudioFile = async (text: string, targetPath: string) => {
  const url = googleTTS.getAudioUrl(text, {
    lang: "en",
    slow: true,
    host: "https://translate.google.com",
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch TTS audio for \"${text}\": ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer);
};

const main = async () => {
  const wordAudioSrcById: Record<string, string> = {};
  const exampleAudioSrcById: Record<string, string> = {};
  const conversationAudioSrcByText: Record<string, string> = {};

  await fs.mkdir(outputRoot, { recursive: true });

  for (const topic of topics) {
    for (const word of topic.words) {
      const wordFile = path.join(outputRoot, "words", `${safeFile(word.id)}.mp3`);
      const exampleFile = path.join(outputRoot, "examples", `${safeFile(word.id)}.mp3`);

      await writeAudioFile(word.word, wordFile);
      await writeAudioFile(word.example, exampleFile);

      wordAudioSrcById[word.id] = `/audio/generated/words/${safeFile(word.id)}.mp3`;
      exampleAudioSrcById[word.id] = `/audio/generated/examples/${safeFile(word.id)}.mp3`;
    }
  }

  for (const scenario of conversations) {
    for (const [index, line] of scenario.lines.entries()) {
      const key = normalizeKey(line.english);
      const fileName = `${safeFile(scenario.id)}-${index + 1}.mp3`;
      const target = path.join(outputRoot, "conversations", safeFile(scenario.level), fileName);

      await writeAudioFile(line.english, target);
      conversationAudioSrcByText[key] = `/audio/generated/conversations/${safeFile(scenario.level)}/${fileName}`;
    }
  }

  const manifestContent = `const normalize = (value: string) => value.replace(/\\s+/g, " ").trim().toLowerCase();

export const wordAudioSrcById: Record<string, string> = ${JSON.stringify(wordAudioSrcById, null, 2)};
export const exampleAudioSrcById: Record<string, string> = ${JSON.stringify(exampleAudioSrcById, null, 2)};
export const conversationAudioSrcByText: Record<string, string> = ${JSON.stringify(conversationAudioSrcByText, null, 2)};

export const getWordAudioSrc = (id: string) => wordAudioSrcById[id];
export const getExampleAudioSrc = (id: string) => exampleAudioSrcById[id];
export const getConversationAudioSrc = (text: string) => conversationAudioSrcByText[normalize(text)];
`;

  await fs.writeFile(manifestPath, manifestContent, "utf8");

  console.log(`Generated ${Object.keys(wordAudioSrcById).length} word audio files.`);
  console.log(`Generated ${Object.keys(exampleAudioSrcById).length} example audio files.`);
  console.log(`Generated ${Object.keys(conversationAudioSrcByText).length} conversation line audio files.`);
  console.log(`Manifest written to ${path.relative(projectRoot, manifestPath)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
