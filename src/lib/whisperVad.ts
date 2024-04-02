import { MicVAD } from "@ricky0123/vad-web";
import { createTranscription, initWhisper } from "../whisper/whisper.js";

export async function* transcribeMicrophone(
  language?: string,
): AsyncGenerator<
  {
    transcript: { text: string; timestamp: string }[];
    preview: string;
    status: string;
  },
  void,
  unknown
> {
  let resolve: (value?: any) => void;
  let promise = new Promise((res) => (resolve = res));

  const transcript: { timestamp: string; text: string }[] = [];
  let preview = "";
  let status = "";
  status = "LOADING";
  yield {
    transcript,
    preview,
    status,
  };

  // Start the speech recognition
  const vad = await MicVAD.new({
    modelURL: "/node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
    workletURL:
      "/node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
    onSpeechEnd: async (audio) => {
      console.log("[VAD] Detected speech end");
      const result = await createTranscription({
        audio,
        options: { language: language },
      });
      transcript.push({
        text: result.text,
        timestamp: new Date().toISOString(),
      });
      resolve();
      promise = new Promise((res) => (resolve = res));
    },
  });
  await initWhisper();

  try {
    vad.start();
    status = "RUNNING";
    yield {
      transcript,
      preview,
      status,
    };

    while (true) {
      await promise;
      promise = new Promise((res) => (resolve = res));
      status = "RUNNING";

      yield {
        transcript,
        preview,
        status,
      };
    }
  } finally {
    vad.destroy();
    vad.options.stream?.getAudioTracks().forEach((track) => track.stop());
  }
}
