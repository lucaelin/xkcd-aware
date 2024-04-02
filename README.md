# xkcd aware

There is a xkcd for everything. Especially during your next teams meeting. Press
the button and let the app search for the most relevant comic from your past
minute of audio.

This app runs entirely locally. No data is sent to any server, but this means
that it requires quite a bit of CPU, and will download almost half a gigabyte of
ML-Models.

## Future

This project started out with the idea to display contextually relevant
information on something like a smart-screen. As models improve, I hope to take
this project beyond showing comics and show contextually relevant news, facts or
tips, but let's first get this

## Powered by:

- intfloat/multilingual-e5-small
- snakers4/silero-vad
- openai/whisper
- xenova/transformers.js
- microsoft/onnxruntime
- svelte
- vite
