Place curated pronunciation assets here.

Suggested structure:
- explorer/words/<word>.mp3
- explorer/examples/<word>.mp3
- builder/words/<word>.mp3
- builder/examples/<word>.mp3
- builder/conversations/<scenario>-<index>.mp3
- challenger/words/<word>.mp3
- challenger/examples/<word>.mp3
- challenger/conversations/<scenario>-<index>.mp3

The app will prefer local audio files when `audioSrc` is provided in data, and fall back to Web Speech API when no asset exists.
