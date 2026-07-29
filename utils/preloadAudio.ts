const audioCache = new Map<string, HTMLAudioElement>();

export const getPreloadedAudio = (src: string) => {
  let audio = audioCache.get(src);

  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    audio.load();
    audioCache.set(src, audio);
  }

  return audio;
};

export const preloadAudio = (sources: Array<string | undefined | null>) => {
  sources.forEach((src) => {
    if (!src) return;
    getPreloadedAudio(src);
  });
};

export const resetCachedAudio = (src: string) => {
  const audio = audioCache.get(src);
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
};
