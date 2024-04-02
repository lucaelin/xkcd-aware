import VoiceToText from "voice2text";
type VoiceEvent = CustomEvent<{
  text: string;
  type: "PARTIAL" | "FINAL" | "STATUS";
  id: string;
}>;

export type Language =
  | "en"
  | "zh"
  | "ru"
  | "fr"
  | "de"
  | "es"
  | "pt"
  | "tr"
  | "vi"
  | "it"
  | "nl"
  | "ca"
  | "ar"
  | "fa"
  | "uk"
  | "kk"
  | "ja"
  | "eo"
  | "hi"
  | "cs"
  | "pl"
  | "uz"
  | "ko"
  | "br";

export async function* transcribeMicrophone(
  language?: Language,
): AsyncGenerator<
  {
    transcript: { text: string; timestamp: string }[];
    preview: string;
    status: string;
  },
  void,
  unknown
> {
  // Start the speech recognition
  const voice2text = new VoiceToText({
    converter: "vosk",
    modelUrl:
      new URL("../assets/vosk-model-small-en-us-0.15.zip", import.meta.url)
        .href,
    source: "microphone", // The source of the audio
  });
  if (language) voice2text.setLanguage({ language });
  console.log("Starting transcription with language", language || "en");

  let resolve: (value: VoiceEvent["detail"]) => void;
  let promise = new Promise((res) => (resolve = res));

  const transcript: { timestamp: string; text: string }[] = [];
  let preview = "";
  let status = "";

  const callback = (e: VoiceEvent) => {
    resolve(e.detail);
    if (e.detail.type === "PARTIAL") {
      console.log("partial result: ", e.detail.text);
      preview = e.detail.text;
    } else if (e.detail.type === "FINAL") {
      console.log("final result: ", e.detail.text);
      transcript.push({
        text: e.detail.text,
        timestamp: new Date().toISOString(),
      });
      preview = "";
    } else if (e.detail.type === "STATUS") {
      console.log("status: ", e.detail.text);
      status = e.detail.text;
    }
  };
  // Listen to the result event
  window.addEventListener(
    "voice",
    callback as any,
  );

  try {
    await voice2text.start();
    while (true) {
      await promise;
      promise = new Promise((res) => (resolve = res));
      yield {
        transcript,
        preview,
        status,
      };
    }
  } finally {
    voice2text.stop();
    window.removeEventListener(
      "voice",
      callback as any,
    );
  }
}
