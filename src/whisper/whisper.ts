import type {
  AutomaticSpeechRecognitionConfig,
  AutomaticSpeechRecognitionOutput,
} from "@xenova/transformers";

export interface MessageEventHandler {
  (event: MessageEvent): void;
}

export async function initWhisper(): Promise<Worker> {
  if (worker) {
    return worker;
  }
  console.log("createWorker");
  const _worker = new Worker(new URL("./whisper-worker.ts", import.meta.url), {
    type: "module",
  });

  console.log("waiting for worker to start...");
  await new Promise<void>((resolve, reject) => {
    _worker.addEventListener("error", (event) => {
      console.error("worker ready", event);
      reject(event.error);
    });
    _worker.addEventListener("message", (event) => {
      console.log("worker ready", event.data);
      resolve();
    }, { once: true });
  });
  worker = _worker;
  return worker;
}

let worker: Worker | undefined;
export async function createTranscription({
  audio,
  options,
}: {
  audio: Blob | Float32Array;
  options: AutomaticSpeechRecognitionConfig | undefined;
}) {
  if (!worker) {
    worker = await initWhisper();
  }
  const id = crypto.randomUUID();

  if (audio instanceof Blob) {
    const audioCTX = new AudioContext({
      sampleRate: 16000,
    });
    const decoded = await audioCTX.decodeAudioData(await audio.arrayBuffer());
    audioCTX.close();
    worker.postMessage({
      audio: decoded.getChannelData(0),
      options,
      id,
    });
  } else {
    worker.postMessage({
      audio,
      options,
      id,
    });
  }

  return new Promise<AutomaticSpeechRecognitionOutput>((resolve) => {
    const listener = (event: MessageEvent) => {
      if (event.data.id === id) {
        resolve(event.data);
        worker!.removeEventListener("message", listener);
      }
    };
    worker!.addEventListener("message", listener);
  });
}
