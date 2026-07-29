declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type PlaybackHandle = {
  stop: () => void;
};

type PlayOptions = {
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
};

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer>>();
const MAX_CONCURRENT_PREFETCH = 4;

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) {
    return null;
  }

  if (!audioContext) {
    audioContext = new Context();
  }

  return audioContext;
};

const decodeAudioData = async (context: AudioContext, arrayBuffer: ArrayBuffer) => {
  const cloned = arrayBuffer.slice(0);

  try {
    return await context.decodeAudioData(cloned);
  } catch {
    return await new Promise<AudioBuffer>((resolve, reject) => {
      context.decodeAudioData(cloned, resolve, reject);
    });
  }
};

const loadAudioBuffer = async (src: string) => {
  const context = getAudioContext();
  if (!context) {
    throw new Error("AudioContext is not available");
  }

  const response = await fetch(src, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return decodeAudioData(context, arrayBuffer);
};

const ensureAudioBuffer = (src: string) => {
  const cached = bufferCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = loadAudioBuffer(src).catch((error) => {
    bufferCache.delete(src);
    throw error;
  });

  bufferCache.set(src, promise);
  return promise;
};

export const preloadAudio = async (sources: Array<string | undefined | null>) => {
  const uniqueSources = [...new Set(sources.filter((value): value is string => Boolean(value)))];

  for (let index = 0; index < uniqueSources.length; index += MAX_CONCURRENT_PREFETCH) {
    const batch = uniqueSources.slice(index, index + MAX_CONCURRENT_PREFETCH);
    await Promise.all(
      batch.map((src) =>
        ensureAudioBuffer(src).catch(() => {
          // Ignore preload errors. Playback can report failures later.
        }),
      ),
    );
  }
};

export const playBufferedAudio = (src: string, options: PlayOptions = {}): PlaybackHandle => {
  const context = getAudioContext();
  let stopped = false;
  let sourceNode: AudioBufferSourceNode | null = null;
  let gainNode: GainNode | null = null;

  const stop = () => {
    if (stopped) {
      return;
    }

    stopped = true;

    if (sourceNode) {
      try {
        sourceNode.stop();
      } catch {
        // Ignore stop errors when node already ended.
      }

      sourceNode.disconnect();
      sourceNode = null;
    }

    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  };

  if (!context) {
    queueMicrotask(() => options.onError?.(new Error("AudioContext unavailable")));
    return { stop };
  }

  void (async () => {
    try {
      const buffer = await ensureAudioBuffer(src);
      if (stopped) {
        return;
      }

      if (context.state === "suspended") {
        await context.resume();
      }

      if (stopped) {
        return;
      }

      sourceNode = context.createBufferSource();
      gainNode = context.createGain();
      gainNode.gain.value = options.volume ?? 1;
      sourceNode.buffer = buffer;
      sourceNode.connect(gainNode);
      gainNode.connect(context.destination);

      sourceNode.onended = () => {
        if (stopped) {
          return;
        }

        stop();
        options.onEnd?.();
      };

      options.onStart?.();
      sourceNode.start(context.currentTime);
    } catch (error) {
      if (!stopped) {
        stop();
        options.onError?.(error);
      }
    }
  })();

  return { stop };
};

export const resetCachedAudio = (src: string) => {
  bufferCache.delete(src);
};
