import { writable } from "svelte/store";
import { findBestXKCD, initXKCD, type XKCD } from "../lib/xkcd.js";
import {
  type Language,
  transcribeMicrophone as vosk,
} from "../lib/voice2text.js";
//import { transcribeMicrophone as whisper } from "../whisper/transcribe.js";
//import { transcribeMicrophone as webSpeech } from "../lib/webspeech.js";
import { transcribeMicrophone as whisperVad } from "../lib/whisperVad.js";
import { initEmbedding } from "../lib/embed.js";
import { initWhisper } from "../whisper/whisper.js";

export function createXKCDStore() {
  const { subscribe, set } = writable({
    xkcd: undefined as XKCD | undefined,
    text: "",
    preview: "",
    status: "STOPPED",
  });
  let keepRunning = true;

  return {
    subscribe,
    start: async (language?: Language) => {
      keepRunning = true;
      console.log("Starting transcription");
      set({ xkcd: undefined, text: "", preview: "", status: "LOADING" });

      await initWhisper();
      await initXKCD();
      await initEmbedding();

      try {
        const generator = whisperVad(language);
        for await (const value of generator) {
          if (!keepRunning) break;
          const lastMinute = value.transcript.slice(
            value.transcript.findLastIndex((t) =>
              new Date(t.timestamp).getTime() < Date.now() - 60 * 1000
            ) + 1,
          );
          const text = lastMinute.map((t) => t.text).join("\n");
          const bestXkcd = await findBestXKCD(
            text,
          );
          set({
            xkcd: bestXkcd,
            text: text,
            preview: value.preview,
            status: value.status,
          });
        }
      } catch (e) {
        console.error(e);
        set({ xkcd: undefined, text: "", preview: "", status: "ERROR" });
      }
    },
    stop: () => {
      console.log("Stopping transcription");
      keepRunning = false;
      set({ xkcd: undefined, text: "", preview: "", status: "STOPPED" });
    },
  };
}
